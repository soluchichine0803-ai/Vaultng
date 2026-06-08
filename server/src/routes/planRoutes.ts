import { Router } from 'express';
import { getPlans, getPlanById } from '../controllers/planController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All plan routes require authentication
router.use(authenticate as any);

router.get('/', getPlans);
router.get('/:id', getPlanById);

export default router;
