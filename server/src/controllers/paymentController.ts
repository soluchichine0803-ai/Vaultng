import type { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { PaymentService } from '../services/paymentService';
import type { AuthRequest } from '../types/auth';
import { DepositStatus, TransactionType, WithdrawalStatus } from '@prisma/client';
import { walletService } from '../services/walletService';

export class PaymentController {
  /**
   * POST /api/payments/initialize
   * Authenticated.
   */
  static async initialize(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }

      const { amount } = req.body;
      const numericAmount = parseFloat(amount);

      // Validate amount
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ status: 'error', message: 'Valid amount greater than zero is required' });
      }

      // Enforce minimum deposit amount (₦3,000)
      if (numericAmount < 3000) {
        return res.status(400).json({ status: 'error', message: 'Minimum deposit amount is ₦3,000' });
      }

      // Generate unique payment reference following the format: VNG-DEP-{depositId}-{timestamp}
      const depositId = crypto.randomUUID();
      const timestamp = Date.now();
      const reference = `VNG-DEP-${depositId}-${timestamp}`;

      console.log(`[PaymentController] Creating pending deposit for user ${user.id}: ref=${reference}, amount=${numericAmount}`);

      // Create Pending Deposit record in DB
      await prisma.deposit.create({
        data: {
          id: depositId,
          userId: user.id,
          amount: numericAmount,
          reference,
          method: 'PAYSTACK',
          status: DepositStatus.PENDING,
        },
      });

      // Initialize Paystack checkout session
      const paystackSession = await PaymentService.initializeTransaction(
        user.email,
        numericAmount,
        reference
      );

      // Return requested JSON response format directly at root
      return res.status(200).json({
        authorizationUrl: paystackSession.authorizationUrl,
        reference: paystackSession.reference,
        accessCode: paystackSession.accessCode,
      });
    } catch (error: any) {
      console.error('[PaymentController] Initialization error:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to initialize payment',
      });
    }
  }

  /**
   * POST /api/payments/webhook
   * Public (Signature is validated via middleware).
   */
  static async webhook(req: Request, res: Response) {
    try {
      const event = req.body;
      console.log(`[PaymentController] Webhook event received: ${event.event}`);

      // We process 'charge.success' and transfer events
      if (event.event === 'charge.success') {
        const reference = event.data.reference;
        const status = event.data.status;

        console.log(`[PaymentController] Hook Charge.success details: reference=${reference}, status=${status}`);

        if (status === 'success') {
          // Double check transaction status directly with Paystack API before crediting wallet
          const paystackData = await PaymentService.verifyTransaction(reference);

          if (paystackData.status === 'success') {
            await PaymentService.processDepositSuccess(reference, paystackData);
            console.log(`[PaymentController] Webhook successfully processed for ref: ${reference}`);
          } else {
            console.warn(`[PaymentController] Paystack verification failed for ref in hook: ${reference}. Status: ${paystackData.status}`);
          }
        }
      } else if (event.event === 'transfer.success') {
        const transferCode = event.data.transfer_code;
        console.log(`[PaymentController] Webhook transfer.success: code=${transferCode}`);

        // Find the withdrawal record
        const withdrawal = await prisma.withdrawal.findFirst({
          where: { transferCode }
        });

        if (withdrawal && withdrawal.status === WithdrawalStatus.PENDING) {
          await prisma.withdrawal.update({
            where: { id: withdrawal.id },
            data: { status: WithdrawalStatus.APPROVED }
          });

          // Send notification
          await prisma.notification.create({
            data: {
              userId: withdrawal.userId,
              title: 'Withdrawal Successful',
              message: `Your withdrawal of ₦${Number(withdrawal.amount).toLocaleString()} to ${withdrawal.bankName} has been processed successfully.`,
            }
          });

          console.log(`[PaymentController] Webhook successfully approved withdrawal for code: ${transferCode}`);
        }
      } else if (event.event === 'transfer.failed' || event.event === 'transfer.reversed') {
        const transferCode = event.data.transfer_code;
        let reason = 'Paystack transfer failed';
        if (event.data.failures && event.data.failures.message) {
          reason = event.data.failures.message;
        } else if (event.data.failure_reason) {
          reason = event.data.failure_reason;
        }
        console.log(`[PaymentController] Webhook transfer failed: code=${transferCode}, reason=${reason}`);

        // Find the withdrawal record
        const withdrawal = await prisma.withdrawal.findFirst({
          where: { transferCode }
        });

        if (withdrawal && withdrawal.status === WithdrawalStatus.PENDING) {
          // Refund user's wallet and update withdrawal record status to FAILED
          await prisma.$transaction(async (tx) => {
            await walletService.credit(
              withdrawal.userId,
              withdrawal.amount,
              TransactionType.ADJUSTMENT,
              `Refund: Failed withdrawal to ${withdrawal.bankName} (${withdrawal.accountNumber})`,
              transferCode,
              tx
            );

            await tx.withdrawal.update({
              where: { id: withdrawal.id },
              data: {
                status: WithdrawalStatus.FAILED,
                rejectionReason: reason
              }
            });
          });

          // Send notification
          await prisma.notification.create({
            data: {
              userId: withdrawal.userId,
              title: 'Withdrawal Failed',
              message: `Your withdrawal of ₦${Number(withdrawal.amount).toLocaleString()} to ${withdrawal.bankName} failed and has been refunded to your available balance.`,
            }
          });

          console.log(`[PaymentController] Webhook successfully refunded and rejected withdrawal for code: ${transferCode}`);
        }
      } else {
        console.log(`[PaymentController] Ignored event type: ${event.event}`);
      }

      // Always respond with 200 OK to Paystack
      return res.status(200).json({ status: 'success', message: 'Webhook event processed' });
    } catch (error: any) {
      console.error('[PaymentController] Webhook processing failed:', error);
      // Even if it fails, we return 200 or 400. 400 indicates an issue to retry if Paystack should retry.
      // Since signature was validated, return 400 on system errors so Paystack can retry.
      return res.status(400).json({
        status: 'error',
        message: error.message || 'Webhook processing failed',
      });
    }
  }

  /**
   * GET /api/payments/verify/:reference
   * Authenticated.
   */
  static async verify(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
      }

      const reference = req.params.reference;
      if (!reference || typeof reference !== 'string') {
        return res.status(400).json({ status: 'error', message: 'Reference is required and must be a string' });
      }

      // Find the Deposit request
      const deposit = await prisma.deposit.findUnique({
        where: { reference },
      });

      if (!deposit) {
        return res.status(404).json({ status: 'error', message: 'Deposit reference not found' });
      }

      // Security Check: Enforce user ownership of the deposit record
      if (deposit.userId !== user.id) {
        return res.status(403).json({ status: 'error', message: 'Forbidden: Unauthorized access to deposit record' });
      }

      // If already APPROVED, return immediately
      if (deposit.status === DepositStatus.APPROVED) {
        return res.status(200).json({
          status: 'success',
          message: 'Payment verified successfully',
          data: {
            reference: deposit.reference,
            amount: Number(deposit.amount),
            status: deposit.status,
          },
        });
      }

      // Verify transaction directly with Paystack
      const paystackData = await PaymentService.verifyTransaction(reference);

      if (paystackData.status === 'success') {
        const updatedDeposit = await PaymentService.processDepositSuccess(reference, paystackData);
        return res.status(200).json({
          status: 'success',
          message: 'Payment verified and credited successfully',
          data: {
            reference: updatedDeposit.reference,
            amount: Number(updatedDeposit.amount),
            status: updatedDeposit.status,
          },
        });
      } else {
        // Update deposit status to FAILED/REJECTED if Paystack returned failed/abandoned state
        let updatedDeposit = deposit;
        if (paystackData.status === 'failed' || paystackData.status === 'reversed') {
          updatedDeposit = await prisma.deposit.update({
            where: { id: deposit.id },
            data: {
              status: DepositStatus.REJECTED,
              rejectionReason: `Paystack payment status: ${paystackData.status}`,
            },
          });
        }

        return res.status(200).json({
          status: 'failed',
          message: `Payment status is ${paystackData.status}`,
          data: {
            reference: updatedDeposit.reference,
            amount: Number(updatedDeposit.amount),
            status: updatedDeposit.status,
          },
        });
      }
    } catch (error: any) {
      console.error('[PaymentController] Verification error:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to verify payment',
      });
    }
  }
}
