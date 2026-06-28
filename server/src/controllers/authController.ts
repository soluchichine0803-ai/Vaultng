import type { Response } from 'express';
import { authService } from '../services/authService';
import type { AuthRequest } from '../types/auth';
import { walletService } from '../services/walletService';
import { TransactionType } from '@prisma/client';
import prisma from '../utils/prisma';

const formatUserResponse = (user: any) => {
  const { passwordHash, ...userWithoutPassword } = user;
  const availableBalance = Number(user.availableBalance);
  const lockedBalance = Number(user.lockedBalance);
  return {
    ...userWithoutPassword,
    availableBalance,
    lockedBalance,
    totalBalance: availableBalance + lockedBalance,
  };
};

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { user, token } = await authService.register(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        user: formatUserResponse(user),
        token,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'error',
      message: error.message || 'Registration failed',
    });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { user, token } = await authService.login(req.body);

    // Process Daily Login Bonus
    let updatedUser = user;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const lastBonus = user.lastLoginBonusAt ? new Date(user.lastLoginBonusAt) : null;
    const lastBonusDate = lastBonus ? new Date(lastBonus.getFullYear(), lastBonus.getMonth(), lastBonus.getDate()) : null;

    if (!lastBonusDate || lastBonusDate.getTime() < today.getTime()) {
      try {
        updatedUser = await prisma.$transaction(async (tx) => {
          // Double check within transaction
          const currentUser = await tx.user.findUniqueOrThrow({ where: { id: user.id } });
          const currentLastBonus = currentUser?.lastLoginBonusAt ? new Date(currentUser.lastLoginBonusAt) : null;
          const currentLastBonusDate = currentLastBonus ? new Date(currentLastBonus.getFullYear(), currentLastBonus.getMonth(), currentLastBonus.getDate()) : null;

          if (!currentLastBonusDate || currentLastBonusDate.getTime() < today.getTime()) {
            await walletService.credit(
              user.id,
              100,
              TransactionType.ADJUSTMENT, // Or a more specific type if we add one, but instructions said Record Transaction
              'Daily login reward',
              'DAILY_LOGIN_BONUS',
              tx
            );

            return await tx.user.update({
              where: { id: user.id },
              data: { lastLoginBonusAt: now }
            });
          }
          return currentUser;
        });
      } catch (err) {
        console.error('Error awarding daily login bonus:', err);
        // We don't fail the login if the bonus fails
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: formatUserResponse(updatedUser),
        token,
      },
    });
  } catch (error: any) {
    res.status(401).json({
      status: 'error',
      message: error.message || 'Login failed',
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: formatUserResponse(req.user),
    },
  });
};

export const logout = async (req: AuthRequest, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
};

export const forgotPassword = async (req: AuthRequest, res: Response) => {
  try {
    await authService.forgotPassword(req.body.email);
    res.status(200).json({
      status: 'success',
      message: 'If your email is in our system, you will receive a reset link.',
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'error',
      message: error.message || 'Forgot password request failed',
    });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    await authService.resetPassword(req.body.password);
    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      status: 'error',
      message: error.message || 'Password reset failed',
    });
  }
};
