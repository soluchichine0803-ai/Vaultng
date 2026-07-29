import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../types/auth';
import { DepositStatus, WithdrawalStatus, TransactionType } from '@prisma/client';
import { walletService } from '../services/walletService';

export class AdminController {
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
          }
        });

        // 2. Send notification
        const formattedAmount = Number(withdrawal.amount).toLocaleString('en-NG', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });

        await tx.notification.create({
          data: {
            userId: withdrawal.userId,
            title: 'Withdrawal Successful',
            message: `Your withdrawal of ₦${formattedAmount} to ${withdrawal.bankName} has been processed and paid successfully.`,
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
