import { Router } from 'express';
import { DepositController } from '../controllers/depositController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All deposit routes require authentication
router.use(authenticate);

router.post('/', DepositController.create);
router.get('/me', DepositController.getMyDeposits);

export default router;
