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
   * Creates a new manual deposit request
   */
  static async createDepositRequest(
    userId: string,
    amount: number,
    method: string,
    proofImageUrl: string,
    customerReference?: string
  ) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    const trimmedMethod = method.trim();
    if (!trimmedMethod) {
      throw new Error('Payment method is required');
    }

    if (!proofImageUrl) {
      throw new Error('Proof of payment is required');
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

    const deposit = await prisma.deposit.create({
      data: {
        userId,
        amount,
        reference,
        customerReference: customerReference || null,
        proofImageUrl,
        status: DepositStatus.PENDING,
        method: trimmedMethod,
      }
    });

    // Create user notification
    const formattedAmount = amount.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    await prisma.notification.create({
      data: {
        userId,
        title: 'Deposit Submitted',
        message: `Your manual deposit request of ₦${formattedAmount} (${trimmedMethod}) has been submitted for review. Reference: ${reference}`,
      }
    });

    return deposit;
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
