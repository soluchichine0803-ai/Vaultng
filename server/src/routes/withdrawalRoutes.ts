import { Router } from 'express';
import { WithdrawalController } from '../controllers/withdrawalController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All withdrawal routes require authentication
router.use(authenticate);

// Configuration & helper endpoints must be placed BEFORE dynamic/id endpoints if we had any,
// but they are simple static paths so any order works. Let's declare them cleanly.
router.get('/banks', WithdrawalController.getBanks);
router.get('/resolve-account', WithdrawalController.resolveAccount);
router.get('/config', WithdrawalController.getConfig);

router.post('/', WithdrawalController.create);
router.get('/me', WithdrawalController.getMyWithdrawals);

export default router;
