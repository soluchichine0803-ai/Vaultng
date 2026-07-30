import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../types/auth';
import { DepositStatus, WithdrawalStatus, TransactionType } from '@prisma/client';
import { walletService } from '../services/walletService';

export class AdminController {
  /**
   * GET /api/admin/dashboard-stats
   */
  static async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      const pendingDepositsCount = await prisma.deposit.count({
        where: { status: DepositStatus.PENDING }
      });

      const pendingWithdrawalsCount = await prisma.withdrawal.count({
        where: { status: WithdrawalStatus.PENDING }
      });

      // Deposits and withdrawals today (Africa/Lagos or server local day boundary)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const depositsToday = await prisma.deposit.aggregate({
        where: {
          status: DepositStatus.APPROVED,
          reviewDate: { gte: startOfDay }
        },
        _sum: { amount: true }
      });

      const withdrawalsToday = await prisma.withdrawal.aggregate({
        where: {
          status: WithdrawalStatus.PAID,
          completionDate: { gte: startOfDay }
        },
        _sum: { amount: true }
      });

      const recentActivity = await prisma.adminLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { username: true, email: true } },
          target: { select: { username: true, email: true } }
        }
      });

      const processedActivity = recentActivity.map((log) => {
        let details = log.details;
        if (log.targetUser && log.target?.username) {
          const userUuid = log.targetUser;
          const username = log.target.username;

          const forUserPattern = new RegExp(`for\\s+user\\s+${userUuid}`, 'gi');
          const userPattern = new RegExp(`user\\s+${userUuid}`, 'gi');
          const uuidPattern = new RegExp(userUuid, 'gi');

          if (forUserPattern.test(details)) {
            details = details.replace(forUserPattern, `for ${username}`);
          } else if (userPattern.test(details)) {
            details = details.replace(userPattern, username);
          } else {
            details = details.replace(uuidPattern, username);
          }
        }
        return {
          ...log,
          details
        };
      });

      return res.status(200).json({
        status: 'success',
        data: {
          pendingDeposits: pendingDepositsCount,
          pendingWithdrawals: pendingWithdrawalsCount,
          depositsTodayAmount: Number(depositsToday._sum.amount || 0),
          withdrawalsTodayAmount: Number(withdrawalsToday._sum.amount || 0),
          recentActivity: processedActivity
        }
      });
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/admin/deposits
   */
  static async getDeposits(req: AuthRequest, res: Response) {
    try {
      const deposits = await prisma.deposit.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, email: true } }
        }
      });

      return res.status(200).json({
        status: 'success',
        data: deposits
      });
    } catch (error: any) {
      console.error('Error fetching deposits:', error);
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/admin/withdrawals
   */
  static async getWithdrawals(req: AuthRequest, res: Response) {
    try {
      const withdrawals = await prisma.withdrawal.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, email: true } }
        }
      });

      return res.status(200).json({
        status: 'success',
        data: withdrawals
      });
    } catch (error: any) {
      console.error('Error fetching withdrawals:', error);
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/admin/transactions
   */
  static async getTransactionsTimeline(req: AuthRequest, res: Response) {
    try {
      const { search, type } = req.query;

      // First filter users by search if it looks like username/email
      let matchedUserIds: string[] | undefined = undefined;
      if (search && typeof search === 'string' && search.trim()) {
        const queryTerm = search.trim();
        const users = await prisma.user.findMany({
          where: {
            OR: [
              { username: { contains: queryTerm, mode: 'insensitive' } },
              { email: { contains: queryTerm, mode: 'insensitive' } }
            ]
          },
          select: { id: true }
        });
        matchedUserIds = users.map(u => u.id);
      }

      // 1. Fetch Transactions
      let txWhere: any = {};
      if (matchedUserIds !== undefined) {
        txWhere.userId = { in: matchedUserIds };
      }
      if (search && typeof search === 'string' && search.trim()) {
        txWhere.OR = [
          ...(txWhere.OR || []),
          { reference: { contains: search.trim(), mode: 'insensitive' } },
          { description: { contains: search.trim(), mode: 'insensitive' } }
        ];
      }
      if (type && typeof type === 'string' && type !== 'all') {
        if (type === 'deposit') txWhere.type = TransactionType.DEPOSIT;
        else if (type === 'withdrawal') txWhere.type = TransactionType.WITHDRAWAL;
        else if (type === 'investment') txWhere.type = TransactionType.INVESTMENT_CREATED;
        else if (type === 'wallet') {
          txWhere.type = {
            in: [
              TransactionType.WELCOME_BONUS,
              TransactionType.ROI_CREDIT,
              TransactionType.REFERRAL_BONUS,
              TransactionType.ADJUSTMENT
            ]
          };
        }
      }

      const transactions = await prisma.transaction.findMany({
        where: txWhere,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, email: true } }
        }
      });

      // 2. Fetch Deposits if type matches or 'all'
      let deposits: any[] = [];
      if (!type || type === 'all' || type === 'deposit') {
        let depWhere: any = {};
        if (matchedUserIds !== undefined) {
          depWhere.userId = { in: matchedUserIds };
        }
        if (search && typeof search === 'string' && search.trim()) {
          depWhere.OR = [
            ...(depWhere.OR || []),
            { reference: { contains: search.trim(), mode: 'insensitive' } },
            { customerReference: { contains: search.trim(), mode: 'insensitive' } }
          ];
        }
        deposits = await prisma.deposit.findMany({
          where: depWhere,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { username: true, email: true } }
          }
        });
      }

      // 3. Fetch Withdrawals if type matches or 'all'
      let withdrawals: any[] = [];
      if (!type || type === 'all' || type === 'withdrawal') {
        let wdWhere: any = {};
        if (matchedUserIds !== undefined) {
          wdWhere.userId = { in: matchedUserIds };
        }
        if (search && typeof search === 'string' && search.trim()) {
          wdWhere.OR = [
            ...(wdWhere.OR || []),
            { id: { contains: search.trim(), mode: 'insensitive' } },
            { bankName: { contains: search.trim(), mode: 'insensitive' } },
            { accountName: { contains: search.trim(), mode: 'insensitive' } }
          ];
        }
        withdrawals = await prisma.withdrawal.findMany({
          where: wdWhere,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { username: true, email: true } }
          }
        });
      }

      // Combine them into a standardized timeline format
      const timeline: any[] = [];

      // Add transactions
      transactions.forEach(t => {
        timeline.push({
          id: t.id,
          userId: t.userId,
          user: t.user,
          amount: Number(t.amount),
          type: 'Transaction',
          subType: t.type,
          description: t.description,
          reference: t.reference,
          status: t.status,
          createdAt: t.createdAt
        });
      });

      // Add deposits
      deposits.forEach(d => {
        timeline.push({
          id: d.id,
          userId: d.userId,
          user: d.user,
          amount: Number(d.amount),
          type: 'Deposit',
          subType: d.method,
          description: `Deposit via ${d.method} (Cust Ref: ${d.customerReference || 'None'})`,
          reference: d.reference,
          status: d.status,
          createdAt: d.createdAt
        });
      });

      // Add withdrawals
      withdrawals.forEach(w => {
        timeline.push({
          id: w.id,
          userId: w.userId,
          user: w.user,
          amount: Number(w.amount),
          type: 'Withdrawal',
          subType: 'Payout',
          description: `Withdrawal to ${w.bankName} (${w.accountNumber})`,
          reference: w.id.slice(0, 8).toUpperCase(),
          status: w.status,
          createdAt: w.createdAt
        });
      });

      // Sort timeline descending by createdAt
      timeline.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return res.status(200).json({
        status: 'success',
        data: timeline
      });
    } catch (error: any) {
      console.error('Error fetching transactions timeline:', error);
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  /**
   * PUT /api/admin/deposits/:id/approve
   */
  static async approveDeposit(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if deposit exists and is pending
      const deposit = await prisma.deposit.findUnique({
        where: { id }
      });

      if (!deposit) {
        return res.status(404).json({ message: 'Deposit request not found' });
      }

      if (deposit.status !== DepositStatus.PENDING) {
        return res.status(400).json({ message: `Deposit is already in ${deposit.status} state` });
      }

      // Process approval atomically
      const updatedDeposit = await prisma.$transaction(async (tx) => {
        // Double-check status inside tx
        const currentDeposit = await tx.deposit.findUnique({
          where: { id }
        });

        if (!currentDeposit || currentDeposit.status !== DepositStatus.PENDING) {
          throw new Error('Deposit has already been processed or modified by another worker');
        }

        // 1. Update status
        const updated = await tx.deposit.update({
          where: { id },
          data: {
            status: DepositStatus.APPROVED,
            approvedBy: adminId,
            reviewDate: new Date(),
          }
        });

        // 2. Credit wallet
        await walletService.credit(
          deposit.userId,
          deposit.amount,
          TransactionType.DEPOSIT,
          `Manual deposit approved (Ref: ${deposit.reference})`,
          deposit.reference,
          tx
        );

        // 3. Send notification
        const formattedAmount = Number(deposit.amount).toLocaleString('en-NG', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        await tx.notification.create({
          data: {
            userId: deposit.userId,
            title: 'Deposit Approved',
            message: `Your manual deposit request of ₦${formattedAmount} has been approved and credited to your available balance.`,
          }
        });

        // 4. Log admin action
        await tx.adminLog.create({
          data: {
            adminId,
            action: 'Deposit Approved',
            targetUser: deposit.userId,
            details: `Approved manual deposit (Ref: ${deposit.reference}) of ₦${formattedAmount} for user ${deposit.userId}`,
          }
        });

        return updated;
      });

      return res.status(200).json({
        message: 'Deposit approved and credited successfully',
        deposit: updatedDeposit
      });
    } catch (error: any) {
      console.error('Error approving deposit:', error);
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  /**
   * PUT /api/admin/deposits/:id/reverse
   */
  static async reverseDeposit(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { rejectionReason } = req.body;
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!rejectionReason || typeof rejectionReason !== 'string' || !rejectionReason.trim()) {
        return res.status(400).json({ message: 'Reversal reason is required' });
      }

      // Check if deposit exists and is pending
      const deposit = await prisma.deposit.findUnique({
        where: { id }
      });

      if (!deposit) {
        return res.status(404).json({ message: 'Deposit request not found' });
      }

      if (deposit.status !== DepositStatus.PENDING) {
        return res.status(400).json({ message: `Deposit is already in ${deposit.status} state` });
      }

      // Process reversal atomically
      const updatedDeposit = await prisma.$transaction(async (tx) => {
        // Double-check status inside tx
        const currentDeposit = await tx.deposit.findUnique({
          where: { id }
        });

        if (!currentDeposit || currentDeposit.status !== DepositStatus.PENDING) {
          throw new Error('Deposit has already been processed or modified by another worker');
        }

        // 1. Update status (rejectionReason acts as the review reason)
        const updated = await tx.deposit.update({
          where: { id },
          data: {
            status: DepositStatus.REVERSED,
            approvedBy: adminId,
            rejectionReason: rejectionReason.trim(),
            reviewDate: new Date(),
          }
        });

        // 2. Send notification
        const formattedAmount = Number(deposit.amount).toLocaleString('en-NG', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        await tx.notification.create({
          data: {
            userId: deposit.userId,
            title: 'Deposit Reversed',
            message: `Your manual deposit request of ₦${formattedAmount} was reversed. Reason: ${rejectionReason.trim()}`,
          }
        });

        // 3. Log admin action
        await tx.adminLog.create({
          data: {
            adminId,
            action: 'Deposit Reversed',
            targetUser: deposit.userId,
            details: `Reversed manual deposit (Ref: ${deposit.reference}) of ₦${formattedAmount}. Reason: ${rejectionReason.trim()}`,
          }
        });

        return updated;
      });

      return res.status(200).json({
        message: 'Deposit reversed successfully',
        deposit: updatedDeposit
      });
    } catch (error: any) {
      console.error('Error reversing deposit:', error);
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  /**
   * PUT /api/admin/withdrawals/:id/pay
   */
  static async payWithdrawal(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Check if withdrawal exists and is pending
      const withdrawal = await prisma.withdrawal.findUnique({
        where: { id }
      });

      if (!withdrawal) {
        return res.status(404).json({ message: 'Withdrawal request not found' });
      }

      if (withdrawal.status !== WithdrawalStatus.PENDING) {
        return res.status(400).json({ message: `Withdrawal is already in ${withdrawal.status} state` });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Proof of payment is required' });
      }

      const proofOfPaymentUrl = `/uploads/${req.file.filename}`;

      // Process payout atomically
      const updatedWithdrawal = await prisma.$transaction(async (tx) => {
        // Double-check status inside tx
        const currentWithdrawal = await tx.withdrawal.findUnique({
          where: { id }
        });

        if (!currentWithdrawal || currentWithdrawal.status !== WithdrawalStatus.PENDING) {
          throw new Error('Withdrawal has already been processed or modified by another worker');
        }

        // 1. Update status to PAID
        const updated = await tx.withdrawal.update({
          where: { id },
          data: {
            status: WithdrawalStatus.PAID,
            approvedBy: adminId,
            completionDate: new Date(),
            proofOfPaymentUrl,
          }
        });

        // 2. Send notification
        const formattedAmount = Number(withdrawal.amount).toLocaleString('en-NG', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        const formattedFee = Number(withdrawal.fee).toLocaleString('en-NG', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        const formattedNetAmount = Number(withdrawal.netAmount).toLocaleString('en-NG', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        await tx.notification.create({
          data: {
            userId: withdrawal.userId,
            title: 'Withdrawal Successful',
            message: `Your withdrawal of ₦${formattedAmount} (20% fee: ₦${formattedFee}, Net paid: ₦${formattedNetAmount}) to ${withdrawal.bankName} has been processed and paid successfully.`,
          }
        });

        // 3. Log admin action
        await tx.adminLog.create({
          data: {
            adminId,
            action: 'Withdrawal Paid',
            targetUser: withdrawal.userId,
            details: `Marked withdrawal of ₦${formattedAmount} (Fee: ₦${formattedFee}, Net: ₦${formattedNetAmount}) to ${withdrawal.bankName} as PAID (ID: ${withdrawal.id})`,
          }
        });

        return updated;
      });

      return res.status(200).json({
        message: 'Withdrawal marked as PAID successfully',
        withdrawal: updatedWithdrawal
      });
    } catch (error: any) {
      console.error('Error paying withdrawal:', error);
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  /**
   * PUT /api/admin/withdrawals/:id/fail
   */
  static async failWithdrawal(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { rejectionReason } = req.body;
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!rejectionReason || typeof rejectionReason !== 'string' || !rejectionReason.trim()) {
        return res.status(400).json({ message: 'Failure reason is required' });
      }

      // Check if withdrawal exists and is pending
      const withdrawal = await prisma.withdrawal.findUnique({
        where: { id }
      });

      if (!withdrawal) {
        return res.status(404).json({ message: 'Withdrawal request not found' });
      }

      if (withdrawal.status !== WithdrawalStatus.PENDING) {
        return res.status(400).json({ message: `Withdrawal is already in ${withdrawal.status} state` });
      }

      // Process failure and refund atomically
      const updatedWithdrawal = await prisma.$transaction(async (tx) => {
        // Double-check status inside tx
        const currentWithdrawal = await tx.withdrawal.findUnique({
          where: { id }
        });

        if (!currentWithdrawal || currentWithdrawal.status !== WithdrawalStatus.PENDING) {
          throw new Error('Withdrawal has already been processed or modified by another worker');
        }

        // 1. Update status to FAILED (rejectionReason acts as the failure reason)
        const updated = await tx.withdrawal.update({
          where: { id },
          data: {
            status: WithdrawalStatus.FAILED,
            approvedBy: adminId,
            rejectionReason: rejectionReason.trim(),
            completionDate: new Date(),
          }
        });

        // 2. Refund user's wallet
        const refundRef = `REF-${withdrawal.id.slice(0, 8).toUpperCase()}`;
        await walletService.credit(
          withdrawal.userId,
          withdrawal.amount,
          TransactionType.ADJUSTMENT,
          `Refund: Failed withdrawal to ${withdrawal.bankName} (${withdrawal.accountNumber})`,
          refundRef,
          tx
        );

        // 3. Send notification
        const formattedAmount = Number(withdrawal.amount).toLocaleString('en-NG', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        await tx.notification.create({
          data: {
            userId: withdrawal.userId,
            title: 'Withdrawal Failed',
            message: `Your withdrawal of ₦${formattedAmount} to ${withdrawal.bankName} failed and has been refunded. Reason: ${rejectionReason.trim()}`,
          }
        });

        // 4. Log admin action
        await tx.adminLog.create({
          data: {
            adminId,
            action: 'Withdrawal Failed',
            targetUser: withdrawal.userId,
            details: `Marked withdrawal of ₦${formattedAmount} to ${withdrawal.bankName} as FAILED (ID: ${withdrawal.id}). Reason: ${rejectionReason.trim()}`,
          }
        });

        return updated;
      });

      return res.status(200).json({
        message: 'Withdrawal marked as FAILED and wallet refunded successfully',
        withdrawal: updatedWithdrawal
      });
    } catch (error: any) {
      console.error('Error failing withdrawal:', error);
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
}
