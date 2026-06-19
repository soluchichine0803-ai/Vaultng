import { Router } from 'express';
import { getPlans, getPlanById, getAllPlans } from '../controllers/planController';

const router = Router();

router.get('/', getPlans);
router.get('/all', getAllPlans);
router.get('/:id', getPlanById);

export default router;