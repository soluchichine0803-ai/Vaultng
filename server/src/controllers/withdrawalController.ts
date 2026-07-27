import { Request, Response } from 'express';
import { WithdrawalService } from '../services/withdrawalService';
import { AuthRequest } from '../types/auth';

export class WithdrawalController {
  /**
   * POST /api/withdrawals
   */
  static async create(req: AuthRequest, res: Response) {
    try {
      const { amount, bankName, accountNumber, accountName, bankCode } = req.body;
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
        accountName,
        bankCode
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

  /**
   * GET /api/withdrawals/banks
   */
  static async getBanks(req: AuthRequest, res: Response) {
    try {
      const banks = await WithdrawalService.getSupportedBanks();
      return res.status(200).json({
        status: 'success',
        data: banks,
      });
    } catch (error: any) {
      console.error('[WithdrawalController] Error fetching banks:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to fetch banks',
      });
    }
  }

  /**
   * GET /api/withdrawals/resolve-account
   */
  static async resolveAccount(req: AuthRequest, res: Response) {
    try {
      const { accountNumber, bankCode } = req.query;

      if (!accountNumber || !bankCode) {
        return res.status(400).json({
          status: 'error',
          message: 'Account number and bank code are required parameters',
        });
      }

      const result = await WithdrawalService.resolveAccountNumber(
        String(accountNumber),
        String(bankCode)
      );

      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error: any) {
      console.error('[WithdrawalController] Error resolving account:', error);
      return res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to resolve bank account details',
      });
    }
  }

  /**
   * GET /api/withdrawals/config
   */
  static async getConfig(req: AuthRequest, res: Response) {
    try {
      const devBypassActive = process.env.DEV_BYPASS_WITHDRAWAL_SCHEDULE === 'true';
      return res.status(200).json({
        status: 'success',
        data: {
          devBypassActive,
        },
      });
    } catch (error: any) {
      console.error('[WithdrawalController] Error getting config:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve configuration',
      });
    }
  }
}
