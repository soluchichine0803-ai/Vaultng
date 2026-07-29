import { Response } from 'express';
import { DepositService } from '../services/depositService';
import { AuthRequest } from '../types/auth';

export class DepositController {
  /**
   * POST /api/deposits
   * Multi-part form request with proof file upload.
   */
  static async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { amount, method, customerReference } = req.body;

      // Validate amount
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ message: 'Valid amount greater than zero is required' });
      }

      if (numericAmount < 3000) {
        return res.status(400).json({ message: 'Minimum deposit amount is ₦3,000' });
      }

      // Validate payment method
      if (!method || typeof method !== 'string') {
        return res.status(400).json({ message: 'Payment method is required' });
      }

      const allowedMethods = ['Bank Transfer'];
      if (!allowedMethods.includes(method)) {
        return res.status(400).json({ message: 'Invalid payment method. Supported: Bank Transfer' });
      }

      // Validate proof of payment upload
      if (!req.file) {
        return res.status(400).json({ message: 'Proof of payment is required (Image or PDF)' });
      }

      // Format relative path to file
      const proofImageUrl = `/uploads/${req.file.filename}`;

      const deposit = await DepositService.createDepositRequest(
        userId,
        numericAmount,
        method,
        proofImageUrl,
        customerReference
      );

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
