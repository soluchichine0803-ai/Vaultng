import { Router } from 'express';
import { createInvestment, getMyInvestments } from '../controllers/investmentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All investment routes require authentication
router.use(authenticate as any);

router.post('/', createInvestment as any);
router.get('/me', getMyInvestments as any);

export default router;
