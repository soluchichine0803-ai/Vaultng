import { Router } from 'express';
import * as referralController from '../controllers/referralController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/stats', authenticate, referralController.getReferralStats);
router.get('/team', authenticate, referralController.getReferralTeam);

export default router;
