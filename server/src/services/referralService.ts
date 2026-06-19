import prisma from '../utils/prisma';
import { walletService } from './walletService';
import { TransactionType, Prisma } from '@prisma/client';

export const referralService = {
  processFirstInvestmentCommission: async (userId: string, investmentId: string, amount: number, tx?: Prisma.TransactionClient) => {
    const prismaClient = tx || prisma;

    // 1. Check if user was referred
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { referredBy: true }
    });

    if (!user || !user.referredBy) {
      return;
    }

    // 2. Check if this is the first investment
    const investmentCount = await prismaClient.investment.count({
      where: { userId }
    });

    // Since this is called AFTER the first investment is created, count will be 1
    if (investmentCount !== 1) {
      return;
    }

    // 3. Check if commission already processed (double safety)
    const referral = await prismaClient.referral.findUnique({
      where: { referredUserId: userId }
    });

    if (!referral || referral.status === 'EARNED') {
      return;
    }

    // 4. Get commission rate from settings
    const settings = await prismaClient.systemSettings.findFirst();
    const commissionRate = settings?.commissionRate ? Number(settings.commissionRate) : 10;

    // 5. Calculate commission
    const commissionAmount = amount * (commissionRate / 100);

    if (commissionAmount <= 0) {
      return;
    }

    // 6. Execute atomic updates (if no tx provided, we should ideally start one, but we expect to be inside one)
    const executeUpdates = async (innerTx: Prisma.TransactionClient) => {
      // Credit referrer
      await walletService.credit(
        referral.referrerId,
        commissionAmount,
        TransactionType.REFERRAL_BONUS,
        `Referral bonus from first investment of partner`,
        investmentId,
        innerTx
      );

      // Create notification for referrer
      await innerTx.notification.create({
        data: {
          userId: referral.referrerId,
          title: 'Referral Bonus Earned',
          message: `You earned ₦${commissionAmount.toLocaleString()} from your referral's first investment.`,
        }
      });

      // Mark referral as earned
      await innerTx.referral.update({
        where: { id: referral.id },
        data: {
          commission: commissionAmount,
          status: 'EARNED'
        }
      });
    };

    if (tx) {
      await executeUpdates(tx);
    } else {
      await prisma.$transaction(async (newTx) => {
        await executeUpdates(newTx);
      });
    }
  },

  getStats: async (userId: string) => {
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId }
    });

    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.status === 'EARNED').length;
    const totalEarnings = referrals.reduce((sum, r) => sum + Number(r.commission), 0);

    return {
      totalReferrals,
      activeReferrals,
      totalEarnings
    };
  },

  getTeam: async (userId: string) => {
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referredUser: {
          select: {
            username: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return referrals.map(r => ({
      id: r.id,
      username: maskUsername(r.referredUser.username),
      joinDate: r.referredUser.createdAt,
      status: r.status,
      commissionEarned: Number(r.commission)
    }));
  }
};

function maskUsername(username: string): string {
  if (username.length <= 4) {
    return username;
  }
  const first = username.slice(0, 3);
  const last = username.slice(-2);
  return `${first}***${last}`;
}
