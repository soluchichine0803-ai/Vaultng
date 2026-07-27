import { Prisma, WithdrawalStatus, TransactionType } from '@prisma/client';
import prisma from '../utils/prisma';
import { walletService } from './walletService';

interface CachedBanks {
  banks: { name: string; code: string }[];
  fetchedAt: number;
}

let banksCache: CachedBanks | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export class WithdrawalService {
  /**
   * Fetches supported Nigerian banks from Paystack, using an in-memory cache.
   */
  static async getBanks() {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    if (banksCache && (Date.now() - banksCache.fetchedAt < CACHE_TTL_MS)) {
      console.log('[WithdrawalService] Returning cached banks');
      return banksCache.banks;
    }

    console.log('[WithdrawalService] Fetching banks from Paystack');
    const response = await fetch('https://api.paystack.co/bank?country=nigeria', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const data: any = await response.json();
    if (!response.ok || !data.status) {
      console.error('[WithdrawalService] Paystack bank fetch failed:', data);
      throw new Error(data.message || 'Failed to fetch banks from Paystack');
    }

    // Map to friendly names and codes
    const banks = data.data.map((b: any) => ({
      name: b.name,
      code: b.code,
    }));

    banksCache = {
      banks,
      fetchedAt: Date.now(),
    };

    return banks;
  }

  /**
   * Resolves a bank account number using Paystack's API.
   */
  static async resolveAccount(accountNumber: string, bankCode: string) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    console.log(`[WithdrawalService] Resolving account: num=${accountNumber}, bankCode=${bankCode}`);
    const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const data: any = await response.json();
    if (!response.ok || !data.status) {
      console.error('[WithdrawalService] Paystack account resolution failed:', data);
      throw new Error("We couldn't verify those bank account details. Please confirm the bank and account number and try again.");
    }

    return {
      accountNumber: data.data.account_number,
      accountName: data.data.account_name,
      bankId: data.data.bank_id,
    };
  }

  /**
   * Creates a Paystack transfer recipient.
   */
  static async createTransferRecipient(bankCode: string, accountNumber: string, accountName: string) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    console.log(`[WithdrawalService] Creating transfer recipient: name=${accountName}, bank=${bankCode}`);
    const response = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'nuban',
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN',
      }),
    });

    const data: any = await response.json();
    if (!response.ok || !data.status) {
      console.error('[WithdrawalService] Paystack transfer recipient creation failed:', data);
      throw new Error(data.message || 'Failed to create Paystack transfer recipient');
    }

    return data.data; // contains recipient_code, etc.
  }

  /**
   * Initiates a Paystack transfer.
   */
  static async initiateTransfer(amount: number, recipientCode: string, reference: string) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    const amountInKobo = Math.round(amount * 100);
    console.log(`[WithdrawalService] Initiating transfer: amount=${amount} NGN (${amountInKobo} Kobo), recipient=${recipientCode}`);

    const response = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount: amountInKobo,
        recipient: recipientCode,
        reason: `Withdrawal Ref: ${reference}`,
        reference: reference,
      }),
    });

    const data: any = await response.json();
    if (!response.ok || !data.status) {
      console.error('[WithdrawalService] Paystack transfer initiation failed:', data);
      throw new Error(data.message || 'Failed to initiate Paystack transfer');
    }

    return data.data; // contains transfer_code, status, etc.
  }

  /**
   * Creates a withdrawal request after validating business rules and executing Paystack transfer.
   */
  static async createWithdrawalRequest(
    userId: string,
    amount: number,
    bankCode: string,
    accountNumber: string
  ) {
    // 1. Validate Amount
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than zero');
    }

    // 2. Validate Time & Days (with development mode bypass support)
    const bypassActive = process.env.DEV_BYPASS_WITHDRAWAL_SCHEDULE === 'true';
    const now = new Date();
    const serverTime = now.toISOString();

    console.log(`[WithdrawalService] DIAGNOSTIC: Current Environment = '${process.env.NODE_ENV}'`);
    console.log(`[WithdrawalService] DIAGNOSTIC: Development Bypass Flag (DEV_BYPASS_WITHDRAWAL_SCHEDULE) = ${bypassActive}`);
    console.log(`[WithdrawalService] DIAGNOSTIC: Current Server Time = ${serverTime}`);
    console.log(`[WithdrawalService] DIAGNOSTIC: Amount = ₦${amount}`);

    if (bypassActive) {
      console.log('[WithdrawalService] DIAGNOSTIC: Schedule validation is SKIPPED (Bypass Active)');
      // In bypass mode, we must still enforce the minimum withdrawal amount of ₦3,000
      if (amount < 3000) {
        const rejectReason = `Amount ₦${amount} is less than minimum ₦3,000`;
        console.log(`[WithdrawalService] DIAGNOSTIC: Rejected because: ${rejectReason}`);
        throw new Error('Minimum withdrawal amount is ₦3,000');
      }
    } else {
      console.log('[WithdrawalService] DIAGNOSTIC: Schedule validation is ENFORCED (Bypass Inactive)');
      const lagosHourStr = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Lagos',
        hour: 'numeric',
        hour12: false,
      }).format(now);
      const currentHour = parseInt(lagosHourStr, 10);

      if (currentHour < 10 || currentHour >= 18) {
        const rejectReason = `Current Lagos Hour (${currentHour}) is outside the allowed window (10:00 AM - 6:00 PM WAT)`;
        console.log(`[WithdrawalService] DIAGNOSTIC: Rejected because: ${rejectReason}`);
        throw new Error('Withdrawals are only allowed between 10:00 AM and 6:00 PM WAT');
      }

      const dayOfWeek = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Lagos',
        weekday: 'long',
      }).format(now);

      if (amount >= 3000 && amount <= 50000) {
        if (dayOfWeek !== 'Tuesday') {
          const rejectReason = `Lagos Day (${dayOfWeek}) is not Tuesday for amount ₦${amount}`;
          console.log(`[WithdrawalService] DIAGNOSTIC: Rejected because: ${rejectReason}`);
          throw new Error('Withdrawals between ₦3,000 and ₦50,000 are only allowed on Tuesdays');
        }
      } else if (amount > 50000) {
        if (dayOfWeek !== 'Thursday') {
          const rejectReason = `Lagos Day (${dayOfWeek}) is not Thursday for amount ₦${amount}`;
          console.log(`[WithdrawalService] DIAGNOSTIC: Rejected because: ${rejectReason}`);
          throw new Error('Withdrawals above ₦50,000 are only allowed on Thursdays');
        }
      } else {
         const rejectReason = `Amount ₦${amount} is less than minimum ₦3,000`;
         console.log(`[WithdrawalService] DIAGNOSTIC: Rejected because: ${rejectReason}`);
         throw new Error('Minimum withdrawal amount is ₦3,000');
      }
    }

    // 3. Resolve the bank name from bank code
    let bankName = 'Unknown Bank';
    try {
      const banks = await this.getBanks();
      const matchedBank = banks.find((b: any) => b.code === bankCode);
      if (matchedBank) {
        bankName = matchedBank.name;
      }
    } catch (err) {
      console.warn('[WithdrawalService] Failed to match bank name from code', err);
    }

    // 4. Resolve the account number using Paystack API (Backend verification)
    console.log('[WithdrawalService] Backend independently verifying account name...');
    const resolvedAccount = await this.resolveAccount(accountNumber, bankCode);
    const verifiedAccountName = resolvedAccount.accountName;

    // 5. Create Paystack Transfer Recipient
    console.log('[WithdrawalService] Creating Paystack transfer recipient...');
    const recipient = await this.createTransferRecipient(bankCode, accountNumber, verifiedAccountName);
    const recipientCode = recipient.recipient_code;

    // 6. Generate a deterministic unique reference for the transfer
    const uniqueRef = `WTH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 7. Execute database changes and initiate transfer
    let withdrawalRecord;
    try {
      withdrawalRecord = await prisma.$transaction(async (tx) => {
        // Debit user wallet (checks for sufficient balance)
        try {
          await walletService.debit(
            userId,
            amount,
            TransactionType.WITHDRAWAL,
            `Withdrawal to ${bankName} (${accountNumber})`,
            uniqueRef,
            tx
          );
        } catch (error: any) {
          if (error.message === 'Insufficient available balance') {
            throw new Error('Insufficient balance for this withdrawal');
          }
          throw error;
        }

        // Create withdrawal record with PENDING status
        const isLargeWithdrawal = amount > 100000;
        const withdrawal = await tx.withdrawal.create({
          data: {
            userId,
            amount,
            bankName,
            bankCode,
            accountNumber,
            accountName: verifiedAccountName,
            status: WithdrawalStatus.PENDING,
            isLargeWithdrawal,
            recipientCode,
          },
        });

        return withdrawal;
      });
    } catch (dbError: any) {
      console.error('[WithdrawalService] DB Transaction failed during wallet debit / record creation:', dbError);
      throw dbError;
    }

    // 8. Initiate the Paystack Transfer
    try {
      console.log(`[WithdrawalService] Initiating transfer for withdrawal ID ${withdrawalRecord.id}...`);
      const transfer = await this.initiateTransfer(amount, recipientCode, uniqueRef);
      const transferCode = transfer.transfer_code;

      // Update the withdrawal record with the transfer code and final status if known immediately
      const updatedWithdrawal = await prisma.withdrawal.update({
        where: { id: withdrawalRecord.id },
        data: {
          transferCode,
        },
      });

      return updatedWithdrawal;
    } catch (paystackError: any) {
      console.error('[WithdrawalService] Paystack transfer initiation failed. Rolling back...', paystackError);

      // If Paystack fails, we must:
      // 1. Roll back the database changes (refund the user's wallet)
      // 2. Mark the withdrawal record status as REJECTED in the database so the user has a trace of the failure.
      try {
        await prisma.$transaction(async (tx) => {
          // Refund the wallet
          await walletService.credit(
            userId,
            amount,
            TransactionType.ADJUSTMENT,
            `Refund: Failed withdrawal to ${bankName} (${accountNumber})`,
            uniqueRef,
            tx
          );

          // Update withdrawal status to REJECTED
          await tx.withdrawal.update({
            where: { id: withdrawalRecord.id },
            data: {
              status: WithdrawalStatus.REJECTED,
              rejectionReason: `Paystack Transfer Failed: ${paystackError.message || 'Unknown error'}`,
            },
          });
        });
      } catch (rollbackError) {
        console.error('[WithdrawalService] CRITICAL: Failed to rollback / refund user wallet!', rollbackError);
      }

      throw new Error(`Withdrawal failed: ${paystackError.message || 'Could not process transfer with Paystack'}`);
    }
  }

  /**
   * Fetches withdrawal history for a user.
   */
  static async getUserWithdrawalHistory(userId: string) {
    return await prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
