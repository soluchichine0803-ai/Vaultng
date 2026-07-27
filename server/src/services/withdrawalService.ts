import { Prisma, WithdrawalStatus, TransactionType } from '@prisma/client';
import prisma from '../utils/prisma';
import { walletService } from './walletService';

export class WithdrawalService {
  private static cachedBanks: any[] | null = null;
  private static lastCacheTime: number = 0;
  private static CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Fetches supported Nigerian banks from Paystack and caches them server-side.
   */
  static async getSupportedBanks() {
    const now = Date.now();
    if (this.cachedBanks && (now - this.lastCacheTime) < this.CACHE_DURATION_MS) {
      console.log('[WithdrawalService] Returning cached supported banks list');
      return this.cachedBanks;
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    console.log('[WithdrawalService] Fetching supported banks list from Paystack...');
    const response = await fetch('https://api.paystack.co/bank?country=nigeria', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const resData: any = await response.json();
    if (!response.ok || !resData.status) {
      console.error('[WithdrawalService] Paystack bank fetch failed:', resData);
      throw new Error(resData.message || 'Failed to fetch supported banks from Paystack');
    }

    const rawBanks = resData.data || [];
    const filteredBanks = rawBanks
      .filter((b: any) => {
        const country = (b.country || '').toLowerCase();
        const currency = (b.currency || '').toLowerCase();
        return country === 'nigeria' || currency === 'ngn';
      })
      .map((b: any) => ({
        name: b.name,
        code: b.code,
        active: b.active,
      }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    this.cachedBanks = filteredBanks;
    this.lastCacheTime = now;
    console.log(`[WithdrawalService] Cached ${filteredBanks.length} Nigerian banks successfully.`);
    return filteredBanks;
  }

  /**
   * Securely resolves account name from Paystack.
   */
  static async resolveAccountNumber(accountNumber: string, bankCode: string) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    console.log(`[WithdrawalService] Resolving account number=${accountNumber}, bankCode=${bankCode} via Paystack`);

    const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    });

    const resData: any = await response.json();
    if (!response.ok || !resData.status) {
      console.error('[WithdrawalService] Paystack account resolution failed:', resData);
      throw new Error(resData.message || 'Could not resolve bank account details. Please verify the account number and bank.');
    }

    return {
      accountNumber: resData.data.account_number,
      accountName: resData.data.account_name,
      bankId: resData.data.bank_id,
    };
  }

  /**
   * Creates a Paystack transfer recipient.
   */
  static async createPaystackRecipient(name: string, accountNumber: string, bankCode: string) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    console.log(`[WithdrawalService] Creating Paystack transfer recipient: name='${name}', account='${accountNumber}', bank='${bankCode}'`);

    const response = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'nuban',
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN',
      }),
    });

    const resData: any = await response.json();
    if (!response.ok || !resData.status) {
      console.error('[WithdrawalService] Paystack recipient creation failed:', resData);
      throw new Error(resData.message || 'Failed to create transfer recipient on Paystack');
    }

    return {
      recipientCode: resData.data.recipient_code,
      id: resData.data.id,
    };
  }

  /**
   * Initiates a Paystack transfer.
   */
  static async initiatePaystackTransfer(amount: number, recipientCode: string, reference: string) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    const amountInKobo = Math.round(amount * 100);
    console.log(`[WithdrawalService] Initiating Paystack transfer: amount=${amount} (kobo=${amountInKobo}), recipient=${recipientCode}, ref=${reference}`);

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
        reason: 'VaultNG Asset Withdrawal Outflow',
        reference,
      }),
    });

    const resData: any = await response.json();
    if (!response.ok || !resData.status) {
      console.error('[WithdrawalService] Paystack transfer initiation failed:', resData);
      throw new Error(resData.message || 'Failed to initiate transfer on Paystack');
    }

    return {
      transferCode: resData.data.transfer_code,
      status: resData.data.status,
    };
  }

  /**
   * Creates a withdrawal request after validating business rules.
   */
  static async createWithdrawalRequest(
    userId: string,
    amount: number,
    bankName: string,
    accountNumber: string,
    accountName: string,
    bankCode?: string
  ) {
    // 1. Validate Amount
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than zero');
    }

    // 2. Validate Time & Days (with development mode bypass support)
    const bypassActive = process.env.DEV_BYPASS_WITHDRAWAL_SCHEDULE === 'true';

    const now = new Date();
    const lagosFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Lagos',
      hour: 'numeric',
      hour12: false,
      weekday: 'long',
    });

    const parts = lagosFormatter.formatToParts(now);
    const lagosHour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const lagosDay = parts.find(p => p.type === 'weekday')?.value || '';

    console.log(`[WithdrawalService] DIAGNOSTIC LOG START:`);
    console.log(`  - Server Time (Local): ${now.toString()}`);
    console.log(`  - Africa/Lagos Time: Hour=${lagosHour}, Day=${lagosDay}`);
    console.log(`  - process.env.NODE_ENV: '${process.env.NODE_ENV}'`);
    console.log(`  - process.env.DEV_BYPASS_WITHDRAWAL_SCHEDULE: '${process.env.DEV_BYPASS_WITHDRAWAL_SCHEDULE}'`);
    console.log(`  - Schedule Bypass flag (bypassActive): ${bypassActive}`);
    console.log(`  - Amount: ₦${amount}`);

    if (bypassActive) {
      console.log('[WithdrawalService] DIAGNOSTIC: Schedule validation is SKIPPED (Bypass Active)');
      if (amount < 3000) {
        console.log(`[WithdrawalService] DIAGNOSTIC: Rejected in bypass mode because amount (₦${amount}) is less than ₦3,000`);
        throw new Error('Minimum withdrawal amount is ₦3,000');
      }
    } else {
      console.log('[WithdrawalService] DIAGNOSTIC: Schedule validation is EXECUTED (Bypass Inactive)');

      // Validate Time (10:00 AM – 6:00 PM WAT)
      if (lagosHour < 10 || lagosHour >= 18) {
        console.log(`[WithdrawalService] DIAGNOSTIC: Rejected because lagosHour (${lagosHour}) is outside 10:00 - 18:00 WAT`);
        throw new Error('Withdrawals are only allowed between 10:00 AM and 6:00 PM WAT.');
      }

      // Validate Days
      // Tuesday: ₦3,000 – ₦50,000
      // Thursday: Above ₦50,000
      if (amount >= 3000 && amount <= 50000) {
        if (lagosDay !== 'Tuesday') {
          console.log(`[WithdrawalService] DIAGNOSTIC: Rejected because lagosDay (${lagosDay}) is not Tuesday for amount ₦${amount}`);
          throw new Error('Withdrawals between ₦3,000 and ₦50,000 are only allowed on Tuesdays');
        }
      } else if (amount > 50000) {
        if (lagosDay !== 'Thursday') {
          console.log(`[WithdrawalService] DIAGNOSTIC: Rejected because lagosDay (${lagosDay}) is not Thursday for amount ₦${amount}`);
          throw new Error('Withdrawals above ₦50,000 are only allowed on Thursdays');
        }
      } else {
         console.log(`[WithdrawalService] DIAGNOSTIC: Rejected because amount (₦${amount}) is less than ₦3,000`);
         throw new Error('Minimum withdrawal amount is ₦3,000');
      }
    }

    // Check backend user available balance explicitly beforehand
    const userWallet = await prisma.user.findUnique({
      where: { id: userId },
      select: { availableBalance: true },
    });

    if (!userWallet || userWallet.availableBalance.toNumber() < amount) {
      console.log(`[WithdrawalService] DIAGNOSTIC: Rejected because of insufficient available balance (Wallet: ₦${userWallet?.availableBalance || 0}, Requested: ₦${amount})`);
      throw new Error('Insufficient balance for this withdrawal');
    }

    // 3. Backend-only Account Verification using Paystack
    let verifiedAccountName = accountName;
    if (bankCode) {
      try {
        const resolution = await this.resolveAccountNumber(accountNumber, bankCode);
        verifiedAccountName = resolution.accountName;
        console.log(`[WithdrawalService] Successfully re-verified account with Paystack. Name resolved: '${verifiedAccountName}'`);
      } catch (err: any) {
        console.error('[WithdrawalService] Account re-verification with Paystack failed:', err);
        throw new Error(err.message || 'Account resolution failed during verification. Please check details and try again.');
      }
    }

    // Large Withdrawal Flag
    const isLargeWithdrawal = amount > 100000;

    // 4. Create local Pending withdrawal record and Debit wallet
    const withdrawal = await prisma.$transaction(async (tx) => {
      // Debit user wallet
      await walletService.debit(
        userId,
        amount,
        TransactionType.WITHDRAWAL,
        `Withdrawal to ${bankName} (${accountNumber})`,
        undefined,
        tx
      );

      // Create pending withdrawal record
      const record = await tx.withdrawal.create({
        data: {
          userId,
          amount,
          bankName,
          bankCode: bankCode || null,
          accountNumber,
          accountName: verifiedAccountName,
          status: WithdrawalStatus.PENDING,
          isLargeWithdrawal,
        },
      });

      return record;
    });

    console.log(`[WithdrawalService] Created local pending withdrawal: ID=${withdrawal.id}, debited ₦${amount}`);

    // 5. Call Paystack APIs end-to-end (Recipient Creation & Transfer Initiation)
    if (bankCode) {
      try {
        // a. Create Transfer Recipient
        const recipientResult = await this.createPaystackRecipient(
          verifiedAccountName,
          accountNumber,
          bankCode
        );

        // b. Initiate Transfer
        const transferRef = `WTH-${withdrawal.id}-${Date.now()}`;
        const transferResult = await this.initiatePaystackTransfer(
          amount,
          recipientResult.recipientCode,
          transferRef
        );

        // c. Update database with Paystack identifiers
        const updatedRecord = await prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            recipientCode: recipientResult.recipientCode,
            transferCode: transferResult.transferCode,
          },
        });

        console.log(`[WithdrawalService] Paystack transfer initiated successfully. Recipient: ${recipientResult.recipientCode}, Transfer: ${transferResult.transferCode}`);
        return updatedRecord;
      } catch (paystackError: any) {
        console.error('[WithdrawalService] Critical Error: Paystack transfer failed. Reversing local transaction...', paystackError);

        // Rollback: Refund user's wallet and mark withdrawal as REJECTED
        await prisma.$transaction(async (tx) => {
          // Refund user balance
          await walletService.credit(
            userId,
            amount,
            TransactionType.ADJUSTMENT,
            `Refund: Failed withdrawal outflow (Ref: ${withdrawal.id})`,
            undefined,
            tx
          );

          // Update withdrawal record status to REJECTED
          await tx.withdrawal.update({
            where: { id: withdrawal.id },
            data: {
              status: WithdrawalStatus.REJECTED,
              rejectionReason: paystackError.message || 'Failed to process payout via Paystack',
            },
          });
        });

        throw new Error(`Withdrawal request processed but payout failed: ${paystackError.message || 'Paystack communication error'}`);
      }
    }

    return withdrawal;
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
