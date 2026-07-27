import { Router } from 'express';
import { WithdrawalController } from '../controllers/withdrawalController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All withdrawal routes require authentication
router.use(authenticate);

router.get('/banks', WithdrawalController.getBanks);
router.post('/resolve', WithdrawalController.resolveAccount);
router.post('/', WithdrawalController.create);
router.get('/me', WithdrawalController.getMyWithdrawals);

export default router;
