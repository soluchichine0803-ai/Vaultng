import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authenticate } from '../middleware/authMiddleware';
import { verifyPaystackSignature } from '../middleware/verifyPaystackSignature';

const router = Router();

// Public webhook route (secured with Paystack signature verification)
router.post('/webhook', verifyPaystackSignature, PaymentController.webhook);

// Authenticated payment routes
router.post('/initialize', authenticate, PaymentController.initialize);
router.get('/verify/:reference', authenticate, PaymentController.verify);

export default router;
