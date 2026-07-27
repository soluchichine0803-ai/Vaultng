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
    const jobStartTime = new Date();
    console.log(`[StaleCleanupJob] Cycle started at ${jobStartTime.toISOString()}`);

    try {
      const timeoutMinutes = 30;
      const thresholdTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);

      // Find ALL pending deposits to be thorough and provide detailed logging of why any are skipped
      const allPendingDeposits = await prisma.deposit.findMany({
        where: {
          status: DepositStatus.PENDING,
        },
      });

      console.log(`[StaleCleanupJob] Found ${allPendingDeposits.length} total pending deposits in database.`);

      if (allPendingDeposits.length === 0) {
        console.log(`[StaleCleanupJob] No pending deposits found. Cycle finished.`);
        return;
      }

      let eligibleCount = 0;
      for (const deposit of allPendingDeposits) {
        const ageInMinutes = (Date.now() - new Date(deposit.createdAt).getTime()) / (60 * 1000);

        // Skip if not PAYSTACK
        if (deposit.method !== 'PAYSTACK') {
          console.log(`[StaleCleanupJob] Skipped deposit ref=${deposit.reference}: Method is '${deposit.method}', expected 'PAYSTACK'.`);
          continue;
        }

        // Skip if recent (age <= 30 minutes)
        if (ageInMinutes < timeoutMinutes) {
          const remainingMinutes = (timeoutMinutes - ageInMinutes).toFixed(1);
          console.log(`[StaleCleanupJob] Skipped deposit ref=${deposit.reference}: Too recent (Age: ${ageInMinutes.toFixed(1)} mins, requires ${timeoutMinutes} mins. Expires in ${remainingMinutes} mins).`);
          continue;
        }

        eligibleCount++;
        console.log(`[StaleCleanupJob] Processing eligible stale deposit: ref=${deposit.reference}, amount=₦${deposit.amount}, age=${ageInMinutes.toFixed(1)} mins`);

        try {
          let paystackData: any = null;
          let isDefinitivelyNotFound = false;

          try {
            paystackData = await this.verifyTransaction(deposit.reference);
          } catch (verifyError: any) {
            const errStatus = verifyError.status;
            const errMsg = verifyError.message || '';

            // Check if this error is transient
            const isTransient =
              errStatus === 429 ||
              errStatus >= 500 ||
              verifyError.code === 'ECONNRESET' ||
              verifyError.code === 'ETIMEDOUT' ||
              verifyError.code === 'ENOTFOUND' ||
              errMsg.toLowerCase().includes('timeout') ||
              errMsg.toLowerCase().includes('fetch failed') ||
              errMsg.toLowerCase().includes('network');

            if (isTransient) {
              console.warn(`[StaleCleanupJob] Skipped deposit ref=${deposit.reference} due to transient Paystack verification error (Status: ${errStatus}, Error: ${errMsg}). Will retry next cycle.`);
              continue;
            } else {
              console.log(`[StaleCleanupJob] Non-transient verification error for ref=${deposit.reference} (Status: ${errStatus}, Error: ${errMsg}). Proceeding to expire.`);
              isDefinitivelyNotFound = true;
            }
          }

          if (paystackData && paystackData.status === 'success') {
            console.log(`[StaleCleanupJob] Deposit ref=${deposit.reference} was found SUCCESSFUL on Paystack! Crediting user wallet...`);
            await this.processDepositSuccess(deposit.reference, paystackData);
          } else {
            const pStatus = paystackData ? paystackData.status : 'not_found_on_paystack';
            console.log(`[StaleCleanupJob] Expiring stale pending deposit ref=${deposit.reference}. Paystack status: '${pStatus}'`);

            const updateResult = await prisma.deposit.updateMany({
              where: {
                id: deposit.id,
                status: DepositStatus.PENDING,
              },
              data: {
                status: DepositStatus.REJECTED,
                rejectionReason: 'EXPIRED',
              },
            });

            if (updateResult.count > 0) {
              console.log(`[StaleCleanupJob] Successfully expired deposit ref=${deposit.reference}.`);
            } else {
              console.log(`[StaleCleanupJob] Skipped expiring deposit ref=${deposit.reference}: Already approved/processed concurrently.`);
            }
          }
        } catch (singleErr: any) {
          console.error(`[StaleCleanupJob] Error processing deposit ${deposit.reference}:`, singleErr);
        }
      }

      console.log(`[StaleCleanupJob] Cycle finished. Processed ${eligibleCount} stale eligible deposits.`);
    } catch (error: any) {
      console.error('[StaleCleanupJob] Critical error in cleanup cycle:', error);
    }
  }
}
