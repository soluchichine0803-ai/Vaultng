import { Router } from 'express';
import { WithdrawalController } from '../controllers/withdrawalController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All withdrawal routes require authentication
router.use(authenticate);

router.post('/', WithdrawalController.create);
router.get('/me', WithdrawalController.getMyWithdrawals);

export default router;
