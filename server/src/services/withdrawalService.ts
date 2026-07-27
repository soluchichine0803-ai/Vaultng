import { Prisma, WithdrawalStatus, TransactionType } from '@prisma/client';
import prisma from '../utils/prisma';
import { walletService } from './walletService';

export class WithdrawalService {
  /**
   * Creates a withdrawal request after validating business rules.
   */
  static async createWithdrawalRequest(
    userId: string,
    amount: number,
    bankName: string,
    accountNumber: string,
    accountName: string
  ) {
    // 1. Validate Amount
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than zero');
    }

    // 2. Validate Time & Days (with development mode bypass support)
    const isDevelopment = process.env.NODE_ENV !== 'production';

    console.log(`[WithdrawalService] DIAGNOSTIC: process.env.NODE_ENV = '${process.env.NODE_ENV}'`);
    console.log(`[WithdrawalService] DIAGNOSTIC: isDevelopment flag = ${isDevelopment}`);
    console.log(`[WithdrawalService] DIAGNOSTIC: Amount = ₦${amount}`);

    if (!isDevelopment) {
      console.log('[WithdrawalService] DIAGNOSTIC: Schedule validation is EXECUTED (Production Mode)');
      const now = new Date();
      const lagosTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Lagos',
        hour: 'numeric',
        hour12: false,
      }).format(now);

      const currentHour = parseInt(lagosTime, 10);
      if (currentHour < 10 || currentHour >= 18) {
        console.log(`[WithdrawalService] DIAGNOSTIC: Rejected because currentHour (${currentHour}) is outside 10-18 WAT`);
        throw new Error('Withdrawals are only allowed between 10:00 AM and 6:00 PM WAT');
      }

      // 3. Validate Days
      // Tuesday: ₦3,000 – ₦50,000
      // Thursday: Above ₦50,000
      const dayOfWeek = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Lagos',
        weekday: 'long',
      }).format(now);

      if (amount >= 3000 && amount <= 50000) {
        if (dayOfWeek !== 'Tuesday') {
          console.log(`[WithdrawalService] DIAGNOSTIC: Rejected because dayOfWeek (${dayOfWeek}) is not Tuesday for amount ₦${amount}`);
          throw new Error('Withdrawals between ₦3,000 and ₦50,000 are only allowed on Tuesdays');
        }
      } else if (amount > 50000) {
        if (dayOfWeek !== 'Thursday') {
          console.log(`[WithdrawalService] DIAGNOSTIC: Rejected because dayOfWeek (${dayOfWeek}) is not Thursday for amount ₦${amount}`);
          throw new Error('Withdrawals above ₦50,000 are only allowed on Thursdays');
        }
      } else {
         console.log(`[WithdrawalService] DIAGNOSTIC: Rejected because amount (₦${amount}) is less than ₦3,000`);
         throw new Error('Minimum withdrawal amount is ₦3,000');
      }
    } else {
      console.log('[WithdrawalService] DIAGNOSTIC: Schedule validation is SKIPPED (Development Bypass Mode)');
      // In development bypass mode, we must still enforce the minimum withdrawal amount of ₦3,000
      if (amount < 3000) {
        console.log(`[WithdrawalService] DIAGNOSTIC: Rejected in bypass mode because amount (₦${amount}) is less than ₦3,000`);
        throw new Error('Minimum withdrawal amount is ₦3,000');
      }
    }

    // 4. Large Withdrawal Flag
    const isLargeWithdrawal = amount > 100000;

    // 5. Execute within a transaction
    return await prisma.$transaction(async (tx) => {
      // Debit user wallet (checks for sufficient balance)
      try {
        await walletService.debit(
          userId,
          amount,
          TransactionType.WITHDRAWAL,
          `Withdrawal to ${bankName} (${accountNumber})`,
          undefined,
          tx
        );
      } catch (error: any) {
        if (error.message === 'Insufficient available balance') {
          throw new Error('Insufficient balance for this withdrawal');
        }
        throw error;
      }

      // Create withdrawal record
      const withdrawal = await tx.withdrawal.create({
        data: {
          userId,
          amount,
          bankName,
          accountNumber,
          accountName,
          status: WithdrawalStatus.PENDING,
          isLargeWithdrawal,
        },
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
