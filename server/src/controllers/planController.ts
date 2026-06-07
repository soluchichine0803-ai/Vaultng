import type { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await prisma.investmentPlan.findMany({
      where: {
        active: true,
      },
      orderBy: {
        minAmount: 'asc',
      },
    });

    // Convert Decimal values to numbers for frontend compatibility
    const formattedPlans = plans.map((plan) => ({
      ...plan,
      minAmount: Number(plan.minAmount),
      maxAmount: Number(plan.maxAmount),
      roiPercent: Number(plan.roiPercent),
    }));

    res.status(200).json({
      status: 'success',
      data: formattedPlans,
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch investment plans',
    });
  }
};

export const getPlanById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const plan = await prisma.investmentPlan.findUnique({
      where: {
        id,
      },
    });

    if (!plan || !plan.active) {
      return res.status(404).json({
        status: 'error',
        message: 'Investment plan not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        ...plan,
        minAmount: Number(plan.minAmount),
        maxAmount: Number(plan.maxAmount),
        roiPercent: Number(plan.roiPercent),
      },
    });
  } catch (error) {
    console.error(`Error fetching plan ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch investment plan',
    });
  }
};
