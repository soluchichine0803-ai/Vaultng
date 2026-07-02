import type { Response } from 'express';
import type { AuthRequest } from '../types/auth';
import prisma from '../utils/prisma';
import { InvestmentStatus, TransactionType } from '@prisma/client';
import { walletService } from '../services/walletService';
import { referralService } from '../services/referralService';

export const createInvestment = async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (!amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Investment amount is required',
      });
    }

    const investmentAmount = Number(amount);
    if (isNaN(investmentAmount) || investmentAmount < 3000) {
      return res.status(400).json({
        status: 'error',
        message: 'Minimum investment amount is ₦3,000',
      });
    }

    // Determine the appropriate plan based on amount
    const plan = await prisma.investmentPlan.findFirst({
      where: {
        active: true,
        minAmount: { lte: investmentAmount },
        maxAmount: { gte: investmentAmount },
      },
    });

    if (!plan) {
      return res.status(400).json({
        status: 'error',
        message: 'No suitable investment package found for this amount',
      });
    }

    // Calculate expected profit and maturity date
    // Monthly ROI 30%. Expected profit is based on monthly rate for the total duration.
    // Package A: 60 days (2 months) -> 60% total profit
    // Package B: 90 days (3 months) -> 90% total profit
    const months = plan.durationHours / (30 * 24);
    const totalRoiPercent = Number(plan.roiPercent) * months;
    const expectedProfit = investmentAmount * (totalRoiPercent / 100);

    const maturityDate = new Date();
    maturityDate.setHours(maturityDate.getHours() + plan.durationHours);

    // Initial payout date (e.g., 30 days from now)
    const nextRoiPayoutAt = new Date();
    nextRoiPayoutAt.setDate(nextRoiPayoutAt.getDate() + 30);

    // Create investment and update wallet atomically
    const investment = await prisma.$transaction(async (tx) => {
      // 1. Create investment record first to get ID
      const newInvestment = await tx.investment.create({
        data: {
          userId,
          planId: plan.id,
          amount: investmentAmount,
          expectedProfit,
          roiPercentSnapshot: Number(plan.roiPercent),
          durationHoursSnapshot: plan.durationHours,
          maturityDate,
          nextRoiPayoutAt,
          status: InvestmentStatus.ACTIVE,
        },
        include: {
          plan: {
            select: {
              name: true,
            },
          },
        },
      });

      // 2. Lock funds using the investment ID as reference
      try {
        await walletService.lockFunds(
          userId,
          investmentAmount,
          TransactionType.INVESTMENT_CREATED,
          `Investment in ${plan.name} plan`,
          newInvestment.id,
          tx
        );
      } catch (error: any) {
        if (error.message === 'Insufficient available balance') {
          throw new Error('INSUFFICIENT_BALANCE');
        }
        throw error;
      }

      // 3. Process referral commission if applicable
      await referralService.processFirstInvestmentCommission(
        userId,
        newInvestment.id,
        investmentAmount,
        tx
      );

      return newInvestment;
    });

    res.status(201).json({
      status: 'success',
      data: {
        ...investment,
        amount: Number(investment.amount),
        expectedProfit: Number(investment.expectedProfit),
      },
    });
  } catch (error: any) {
    if (error.message === 'INSUFFICIENT_BALANCE') {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient available balance for this investment',
      });
    }

    console.error('Error creating investment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create investment',
    });
  }
};

export const getMyInvestments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    // Check for expired investments and update their status
    const now = new Date();
    await prisma.investment.updateMany({
      where: {
        userId,
        status: InvestmentStatus.ACTIVE,
        maturityDate: { lte: now },
      },
      data: {
        status: InvestmentStatus.COMPLETED,
      },
    });

    const investments = await prisma.investment.findMany({
      where: { userId },
      include: {
        plan: {
          select: {
            name: true,
            roiPercent: true,
            durationHours: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Convert Decimal values to numbers
    const formattedInvestments = investments.map((inv) => ({
      ...inv,
      amount: Number(inv.amount),
      expectedProfit: Number(inv.expectedProfit),
      roiPercentSnapshot: Number(inv.roiPercentSnapshot),
      plan: {
        ...inv.plan,
        roiPercent: Number(inv.plan.roiPercent),
      },
    }));

    res.status(200).json({
      status: 'success',
      data: formattedInvestments,
    });
  } catch (error) {
    console.error('Error fetching user investments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch investments',
    });
  }
};
