import { Response } from 'express';
import { DepositService } from '../services/depositService';
import { AuthRequest } from '../types/auth';

export class DepositController {
  /**
   * POST /api/deposits
   */
  static async create(req: AuthRequest, res: Response) {
    try {
      const { amount } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: 'Valid amount greater than zero is required' });
      }

      const deposit = await DepositService.createDepositRequest(userId, amount);
      return res.status(201).json(deposit);
    } catch (error: any) {
      console.error('Error creating deposit:', error);
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  /**
   * GET /api/deposits/me
   */
  static async getMyDeposits(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const deposits = await DepositService.getUserDepositHistory(userId);
      return res.json(deposits);
    } catch (error: any) {
      console.error('Error fetching deposits:', error);
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
}
