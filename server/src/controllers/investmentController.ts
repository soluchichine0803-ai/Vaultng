import type { Response } from 'express';
import type { AuthRequest } from '../types/auth';
import prisma from '../utils/prisma';
import { InvestmentStatus } from '@prisma/client';

export const createInvestment = async (req: AuthRequest, res: Response) => {
  try {
    const { planId, amount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (!planId || !amount) {
      return res.status(400).json({
        status: 'error',
        message: 'Plan ID and amount are required',
      });
    }

    const investmentAmount = Number(amount);
    if (isNaN(investmentAmount) || investmentAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid investment amount',
      });
    }

    // Validate plan
    const plan = await prisma.investmentPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.active) {
      return res.status(404).json({
        status: 'error',
        message: 'Investment plan not found or inactive',
      });
    }

    // Validate amount against plan limits
    if (investmentAmount < Number(plan.minAmount)) {
      return res.status(400).json({
        status: 'error',
        message: `Minimum investment amount for this plan is ${plan.minAmount}`,
      });
    }

    if (investmentAmount > Number(plan.maxAmount)) {
      return res.status(400).json({
        status: 'error',
        message: `Maximum investment amount for this plan is ${plan.maxAmount}`,
      });
    }

    // Calculate expected profit and maturity date
    const expectedProfit = investmentAmount * (Number(plan.roiPercent) / 100);
    const maturityDate = new Date();
    maturityDate.setHours(maturityDate.getHours() + plan.durationHours);

    // Create investment record
    const investment = await prisma.investment.create({
      data: {
        userId,
        planId,
        amount: investmentAmount,
        expectedProfit,
        roiPercentSnapshot: Number(plan.roiPercent),
        durationHoursSnapshot: plan.durationHours,
        maturityDate,
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

    res.status(201).json({
      status: 'success',
      data: {
        ...investment,
        amount: Number(investment.amount),
        expectedProfit: Number(investment.expectedProfit),
      },
    });
  } catch (error) {
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
