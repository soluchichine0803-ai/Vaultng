import prisma from '../utils/prisma';
import { DepositStatus } from '@prisma/client';
import crypto from 'crypto';

export class DepositService {
  /**
   * Generates a unique deposit reference in the format DEP-XXXXXXXX
   */
  private static generateReference(): string {
    const randomBytes = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `DEP-${randomBytes}`;
  }

  /**
   * Creates a new deposit request
   */
  static async createDepositRequest(userId: string, amount: number) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    // Generate a unique reference and ensure it doesn't already exist
    let reference = this.generateReference();
    let referenceExists = await prisma.deposit.findUnique({
      where: { reference }
    });

    while (referenceExists) {
      reference = this.generateReference();
      referenceExists = await prisma.deposit.findUnique({
        where: { reference }
      });
    }

    return await prisma.deposit.create({
      data: {
        userId,
        amount,
        reference,
        status: DepositStatus.PENDING,
        method: 'MANUAL'
      }
    });
  }

  /**
   * Retrieves deposit history for a specific user
   */
  static async getUserDepositHistory(userId: string) {
    return await prisma.deposit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
