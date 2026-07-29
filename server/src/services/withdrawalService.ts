import { Prisma, WithdrawalStatus, TransactionType } from '@prisma/client';
import prisma from '../utils/prisma';
import { walletService } from './walletService';

interface CachedBanks {
  banks: { name: string; code: string }[];
  fetchedAt: number;
}

let banksCache: CachedBanks | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const LARGE_WITHDRAWAL_THRESHOLD = 100000;

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
   * Creates a withdrawal request after validating business rules.
   * Debits the wallet immediately to reserve funds.
   */
  static async createWithdrawalRequest(
    userId: string,
    amount: number,
    bankCode: string,
    accountNumber: string,
    accountName: string
  ) {
    // 1. Validate Amount
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than zero');
    }

    // 2. Validate Time & Days (Enforced Schedule)
    const now = new Date();
    const serverTime = now.toISOString();

    console.log(`[WithdrawalService] DIAGNOSTIC: Current Environment = '${process.env.NODE_ENV}'`);
    console.log(`[WithdrawalService] DIAGNOSTIC: Current Server Time = ${serverTime}`);
    console.log(`[WithdrawalService] DIAGNOSTIC: Amount = ₦${amount}`);

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

    // 5. Generate a unique reference for the withdrawal request tracking
    const uniqueRef = `WTH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 6. Execute database changes and reserve wallet funds
    return await prisma.$transaction(async (tx) => {
      // Debit user wallet (checks for sufficient balance)
      try {
        await walletService.debit(
          userId,
          amount,
          TransactionType.WITHDRAWAL,
          `Withdrawal Request to ${bankName} (${accountNumber})`,
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
      const isLargeWithdrawal = amount > LARGE_WITHDRAWAL_THRESHOLD;
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId,
          amount,
          bankName,
          bankCode,
          accountNumber,
          accountName: accountName,
          status: WithdrawalStatus.PENDING,
          isLargeWithdrawal,
        },
      });

      // Create user notification
      const formattedAmount = amount.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      await tx.notification.create({
        data: {
          userId,
          title: 'Withdrawal Submitted',
          message: `Your withdrawal request of ₦${formattedAmount} to ${bankName} (${accountNumber}) has been submitted for review.`,
        }
      });

      return withdrawal;
    });
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
