import { Router } from 'express';
import { DepositController } from '../controllers/depositController';
import { authenticate } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// All deposit routes require authentication
router.use(authenticate);

// Support file upload for manual proof of payment
router.post('/', upload.single('proof'), DepositController.create);
router.get('/me', DepositController.getMyDeposits);

export default router;
