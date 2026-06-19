import type { Response } from 'express';
import type { AuthRequest } from '../types/auth';
import { referralService } from '../services/referralService';

export const getReferralStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const stats = await referralService.getStats(userId);

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch referral stats' });
  }
};

export const getReferralTeam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const team = await referralService.getTeam(userId);

    res.status(200).json({
      status: 'success',
      data: team
    });
  } catch (error) {
    console.error('Error fetching referral team:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch referral team' });
  }
};
