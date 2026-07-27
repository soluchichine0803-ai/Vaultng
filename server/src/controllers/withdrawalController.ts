import { Request, Response } from 'express';
import { WithdrawalService } from '../services/withdrawalService';
import { AuthRequest } from '../types/auth';

export class WithdrawalController {
  /**
   * GET /api/withdrawals/config
   */
  static async getConfig(req: Request, res: Response) {
    try {
      const bypassActive = process.env.DEV_BYPASS_WITHDRAWAL_SCHEDULE === 'true';
      return res.json({
        status: 'success',
        data: {
          bypassActive
        }
      });
    } catch (error: any) {
      console.error('Error fetching withdrawal config:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Internal server error'
      });
    }
  }

  /**
   * GET /api/withdrawals/banks
   */
  static async getBanks(req: Request, res: Response) {
    try {
      const banks = await WithdrawalService.getBanks();
      return res.json({
        status: 'success',
        data: banks
      });
    } catch (error: any) {
      console.error('Error fetching banks:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to fetch banks'
      });
    }
  }

  /**
   * POST /api/withdrawals/resolve
   */
  static async resolveAccount(req: Request, res: Response) {
    try {
      const { accountNumber, bankCode } = req.body;

      if (!accountNumber || !bankCode) {
        return res.status(400).json({
          status: 'error',
          message: 'Account number and bank code are required'
        });
      }

      const result = await WithdrawalService.resolveAccount(accountNumber, bankCode);
      return res.json({
        status: 'success',
        data: result
      });
    } catch (error: any) {
      console.error('Error resolving account:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to resolve account'
      });
    }
  }

  /**
   * POST /api/withdrawals
   */
  static async create(req: AuthRequest, res: Response) {
    try {
      const { amount, bankCode, accountNumber } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized'
        });
      }

      if (!amount || !bankCode || !accountNumber) {
        return res.status(400).json({
          status: 'error',
          message: 'Amount, bank code, and account number are required'
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
        bankCode,
        accountNumber
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
