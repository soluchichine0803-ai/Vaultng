import { Router } from 'express';
import { getPlans, getPlanById, getAllPlans } from '../controllers/planController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All plan routes require authentication
router.use(authenticate as any);

router.get('/', getPlans);
router.get('/all', getAllPlans);
router.get('/:id', getPlanById);

export default router;
