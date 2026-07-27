import prisma from '../utils/prisma';
import { walletService } from './walletService';
import { DepositStatus, TransactionType } from '@prisma/client';

export class PaymentService {
  /**
   * Initializes a Paystack transaction.
   * Converts amount from NGN to Kobo.
   */
  static async initializeTransaction(email: string, amount: number, reference: string) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    const callbackUrl = `${process.env.FRONTEND_URL}/deposit`;
    const amountInKobo = Math.round(amount * 100);

    const payload = {
      email,
      amount: amountInKobo,
      reference,
      callback_url: callbackUrl,
    };

    console.log(`[PaymentService] Initializing Paystack payment: ref=${reference}, amount=${amount} NGN (${amountInKobo} Kobo)`);

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: any = await response.json();

    if (!response.ok || !data.status) {
      console.error('[PaymentService] Paystack initialize failed:', data);
      throw new Error(data.message || 'Failed to initialize Paystack payment');
    }

    return {
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
      accessCode: data.data.access_code,
    };
  }

  /**
   * Verifies payment status with Paystack directly.
   */
  static async verifyTransaction(reference: string) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    console.log(`[PaymentService] Verifying transaction with Paystack: ref=${reference}`);

    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const data: any = await response.json();

    if (!response.ok || !data.status) {
      console.error('[PaymentService] Paystack verification failed:', data);
      const err = new Error(data.message || 'Failed to verify transaction with Paystack') as any;
      err.status = response.status;
      throw err;
    }

    return data.data; // contains status, amount, reference, customer, etc.
  }

  /**
   * Process a successful payment inside an atomic transaction.
   * Enforces IDEMPOTENCY.
   */
  static async processDepositSuccess(reference: string, paystackData: any) {
    // 1. Locate Deposit
    const deposit = await prisma.deposit.findUnique({
      where: { reference },
    });

    if (!deposit) {
      console.error(`[PaymentService] Deposit not found for reference: ${reference}`);
      throw new Error(`Deposit not found for reference: ${reference}`);
    }

    // 2. Idempotency Check: if already processed, return current deposit.
    if (deposit.status !== DepositStatus.PENDING) {
      console.log(`[PaymentService] Deposit ${reference} already processed. Status: ${deposit.status}`);
      return deposit;
    }

    // 3. Amount Validation: verify amount paid matches deposit request (Paystack returns in Kobo)
    const paidAmount = paystackData.amount / 100;
    const requestedAmount = Number(deposit.amount);

    if (Math.abs(paidAmount - requestedAmount) > 0.01) {
      console.warn(`[PaymentService] Amount mismatch for ref=${reference}: Paid=${paidAmount}, Requested=${requestedAmount}`);
      // Mark as failed if amounts do not match to prevent exploit attempts
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: {
          status: DepositStatus.REJECTED,
          rejectionReason: 'Payment amount mismatch',
        },
      });
      throw new Error('Payment amount mismatch');
    }

    console.log(`[PaymentService] Processing success for deposit ref=${reference} (Amount: ₦${requestedAmount})`);

    // 4. Run atomic database mutations inside a single Prisma transaction
    const result = await prisma.$transaction(async (tx) => {
      // Re-fetch with row-level locking or check status inside tx
      const currentDeposit = await tx.deposit.findUnique({
        where: { id: deposit.id },
      });

      if (!currentDeposit || currentDeposit.status !== DepositStatus.PENDING) {
        throw new Error('Deposit has already been processed or modified by another worker');
      }

      // a. Update Deposit status
      const updatedDeposit = await tx.deposit.update({
        where: { id: deposit.id },
        data: {
          status: DepositStatus.APPROVED,
        },
      });

      // b. Credit user wallet and record transaction ledger
      const formattedAmount = requestedAmount.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      await walletService.credit(
        deposit.userId,
        deposit.amount,
        TransactionType.DEPOSIT,
        `Deposit via Paystack (Ref: ${reference})`,
        reference,
        tx
      );

      // c. Trigger Notification within transaction
      await tx.notification.create({
        data: {
          userId: deposit.userId,
          title: 'Deposit Successful',
          message: `Your wallet has been credited with ₦${formattedAmount}. Your Paystack deposit has been successfully processed.`,
        },
      });

      return updatedDeposit;
    });

    console.log(`[PaymentService] Deposit ${reference} successfully processed and credited.`);
    return result;
  }

  /**
   * Periodically scans for PENDING Paystack deposits older than 30 minutes,
   * performs a final server-side status check with Paystack, and transition
   * them to either SUCCESS (if paid) or REJECTED with rejectionReason EXPIRED.
   */
  static async cleanupStaleDeposits() {
    try {
      const timeoutMinutes = 30;
      const thresholdTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);

      // Find all PENDING deposits with method PAYSTACK created before thresholdTime
      const staleDeposits = await prisma.deposit.findMany({
        where: {
          status: DepositStatus.PENDING,
          method: 'PAYSTACK',
          createdAt: {
            lt: thresholdTime,
          },
        },
      });

      if (staleDeposits.length === 0) {
        return;
      }

      console.log(`[PaymentService] Found ${staleDeposits.length} stale pending deposits for cleanup.`);

      for (const deposit of staleDeposits) {
        try {
          console.log(`[PaymentService] Verifying stale deposit ref=${deposit.reference} with Paystack before expiry...`);

          let paystackData: any = null;
          let isDefinitivelyNotFound = false;

          try {
            paystackData = await this.verifyTransaction(deposit.reference);
          } catch (verifyError: any) {
            // If Paystack returns a definitive 404 (or the message indicates transaction not found), we treat it as definitively unpaid
            if (verifyError.status === 404 || verifyError.message?.toLowerCase().includes('transaction not found')) {
              console.log(`[PaymentService] Paystack verified transaction does not exist for ref=${deposit.reference}`);
              isDefinitivelyNotFound = true;
            } else {
              // This is a transient error (e.g. rate limit, connection timeout, server 500 error, etc.)
              // Skip expiring this deposit on this run to allow subsequent retries.
              console.warn(`[PaymentService] Skipping stale deposit ref=${deposit.reference} due to transient verification error:`, verifyError.message);
              continue;
            }
          }

          if (paystackData && paystackData.status === 'success') {
            // Payment actually succeeded, process credit
            console.log(`[PaymentService] Stale deposit ref=${deposit.reference} was paid! Processing credit...`);
            await this.processDepositSuccess(deposit.reference, paystackData);
          } else if (paystackData || isDefinitivelyNotFound) {
            // We have a definitive response from Paystack (e.g., status is 'abandoned' or 'failed', or 404 not found)
            // Mark as REJECTED with rejectionReason 'EXPIRED' only if it's still in the PENDING state (prevents concurrent race conditions)
            console.log(`[PaymentService] Expiring stale pending deposit ref=${deposit.reference}`);
            await prisma.deposit.updateMany({
              where: {
                id: deposit.id,
                status: DepositStatus.PENDING,
              },
              data: {
                status: DepositStatus.REJECTED,
                rejectionReason: 'EXPIRED',
              },
            });
          }
        } catch (singleErr: any) {
          console.error(`[PaymentService] Error cleaning up stale deposit ${deposit.reference}:`, singleErr);
        }
      }
    } catch (error: any) {
      console.error('[PaymentService] Error running stale deposits cleanup:', error);
    }
  }
}
