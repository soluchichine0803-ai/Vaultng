import { Prisma, TransactionType, TransactionStatus } from '@prisma/client';
import prisma from '../utils/prisma';

export const walletService = {
  /**
   * Credits a user's available balance and records a transaction.
   */
  credit: async (
    userId: string,
    amount: number | Prisma.Decimal,
    type: TransactionType,
    description: string,
    reference?: string,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    const numAmount = typeof amount === 'number' ? amount : amount.toNumber();

    const execute = async (activeTx: Prisma.TransactionClient) => {
      // Update user balance
      const user = await activeTx.user.update({
        where: { id: userId },
        data: {
          availableBalance: {
            increment: numAmount,
          },
        },
      });

      // Create transaction record
      await activeTx.transaction.create({
        data: {
          userId,
          amount: numAmount,
          type,
          description,
          status: TransactionStatus.COMPLETED,
          reference,
        },
      });

      return user;
    };

    if (tx) {
      return execute(tx);
    }

    return await prisma.$transaction(execute);
  },

  /**
   * Debits a user's available balance and records a transaction.
   */
  debit: async (
    userId: string,
    amount: number | Prisma.Decimal,
    type: TransactionType,
    description: string,
    reference?: string,
    tx?: Prisma.TransactionClient
  ) => {
    const numAmount = typeof amount === 'number' ? amount : amount.toNumber();

    const execute = async (activeTx: Prisma.TransactionClient) => {
      // Check for sufficient balance
      const user = await activeTx.user.findUnique({
        where: { id: userId },
        select: { availableBalance: true },
      });

      if (!user || user.availableBalance.toNumber() < numAmount) {
        throw new Error('Insufficient available balance');
      }

      // Update user balance
      const updatedUser = await activeTx.user.update({
        where: { id: userId },
        data: {
          availableBalance: {
            decrement: numAmount,
          },
        },
      });

      // Create transaction record
      await activeTx.transaction.create({
        data: {
          userId,
          amount: numAmount,
          type,
          description,
          status: TransactionStatus.COMPLETED,
          reference,
        },
      });

      return updatedUser;
    };

    if (tx) {
      return execute(tx);
    }

    return await prisma.$transaction(execute);
  },

  /**
   * Locks funds: moves amount from availableBalance to lockedBalance.
   */
  lockFunds: async (
    userId: string,
    amount: number | Prisma.Decimal,
    type: TransactionType,
    description: string,
    reference?: string,
    tx?: Prisma.TransactionClient
  ) => {
    const numAmount = typeof amount === 'number' ? amount : amount.toNumber();

    const execute = async (activeTx: Prisma.TransactionClient) => {
      // Check for sufficient balance
      const user = await activeTx.user.findUnique({
        where: { id: userId },
        select: { availableBalance: true },
      });

      if (!user || user.availableBalance.toNumber() < numAmount) {
        throw new Error('Insufficient available balance');
      }

      // Update user balance
      const updatedUser = await activeTx.user.update({
        where: { id: userId },
        data: {
          availableBalance: {
            decrement: numAmount,
          },
          lockedBalance: {
            increment: numAmount,
          },
        },
      });

      // Create transaction record
      await activeTx.transaction.create({
        data: {
          userId,
          amount: numAmount,
          type,
          description,
          status: TransactionStatus.COMPLETED,
          reference,
        },
      });

      return updatedUser;
    };

    if (tx) {
      return execute(tx);
    }

    return await prisma.$transaction(execute);
  },

  /**
   * Unlocks funds: moves amount from lockedBalance to availableBalance.
   */
  unlockFunds: async (
    userId: string,
    amount: number | Prisma.Decimal,
    type: TransactionType,
    description: string,
    reference?: string,
    tx?: Prisma.TransactionClient
  ) => {
    const numAmount = typeof amount === 'number' ? amount : amount.toNumber();

    const execute = async (activeTx: Prisma.TransactionClient) => {
      // Check for sufficient locked balance
      const user = await activeTx.user.findUnique({
        where: { id: userId },
        select: { lockedBalance: true },
      });

      if (!user || user.lockedBalance.toNumber() < numAmount) {
        throw new Error('Insufficient locked balance');
      }

      // Update user balance
      const updatedUser = await activeTx.user.update({
        where: { id: userId },
        data: {
          availableBalance: {
            increment: numAmount,
          },
          lockedBalance: {
            decrement: numAmount,
          },
        },
      });

      // Create transaction record
      await activeTx.transaction.create({
        data: {
          userId,
          amount: numAmount,
          type,
          description,
          status: TransactionStatus.COMPLETED,
          reference,
        },
      });

      return updatedUser;
    };

    if (tx) {
      return execute(tx);
    }

    return await prisma.$transaction(execute);
  },
};
