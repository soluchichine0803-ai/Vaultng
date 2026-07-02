import { Response } from 'express';
import { WithdrawalService } from '../services/withdrawalService';
import { AuthRequest } from '../types/auth';

export class WithdrawalController {
  /**
   * POST /api/withdrawals
   */
  static async create(req: AuthRequest, res: Response) {
    try {
      const { amount, bankName, accountNumber, accountName } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized'
        });
      }

      if (!amount || !bankName || !accountNumber || !accountName) {
        return res.status(400).json({
          status: 'error',
          message: 'Amount, bank name, account number, and account name are required'
        });
      }

      const withdrawalAmount = Number(amount);
      if (isNaN(withdrawalAmount)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid withdrawal amount'
        });
      }

      const withdrawal = await WithdrawalService.createWithdrawalRequest(
        userId,
        withdrawalAmount,
        bankName,
        accountNumber,
        accountName
      );

      return res.status(201).json({
        status: 'success',
        data: withdrawal
      });
    } catch (error: any) {
      console.error('Error creating withdrawal:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message || 'Internal server error'
      });
    }
  }

  /**
   * GET /api/withdrawals/me
   */
  static async getMyWithdrawals(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized'
        });
      }

      const withdrawals = await WithdrawalService.getUserWithdrawalHistory(userId);

      const formattedWithdrawals = withdrawals.map(w => ({
        ...w,
        amount: Number(w.amount)
      }));

      return res.json({
        status: 'success',
        data: formattedWithdrawals
      });
    } catch (error: any) {
      console.error('Error fetching withdrawals:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Internal server error'
      });
    }
  }
}
