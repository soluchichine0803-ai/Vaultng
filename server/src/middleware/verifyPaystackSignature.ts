import type { Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface WebhookRequest extends Request {
  rawBody?: Buffer;
  body: any;
  headers: any;
}

export const verifyPaystackSignature = (req: any, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    if (!signature) {
      console.warn('[Webhook] Missing x-paystack-signature header');
      return res.status(401).json({
        status: 'error',
        message: 'Missing Paystack signature header',
      });
    }

    const secret = process.env.PAYSTACK_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[Webhook] PAYSTACK_WEBHOOK_SECRET is missing in environment variables');
      return res.status(500).json({
        status: 'error',
        message: 'Webhook configuration error',
      });
    }

    // Capture payload. Prefer rawBody for accurate hash generation.
    const payload = req.rawBody ? req.rawBody : Buffer.from(JSON.stringify(req.body));

    const computedSignature = crypto
      .createHmac('sha512', secret)
      .update(payload)
      .digest('hex');

    if (computedSignature !== signature) {
      console.warn('[Webhook] Invalid signature received');
      return res.status(401).json({
        status: 'error',
        message: 'Invalid webhook signature',
      });
    }

    next();
  } catch (error: any) {
    console.error('[Webhook] Signature verification error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Signature verification failed',
    });
  }
};
