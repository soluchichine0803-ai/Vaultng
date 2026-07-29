import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// Secure all admin review routes to admins only
router.use(authenticate, authorize(['ADMIN']));

router.get('/dashboard-stats', AdminController.getDashboardStats);
router.get('/deposits', AdminController.getDeposits);
router.get('/withdrawals', AdminController.getWithdrawals);
router.get('/transactions', AdminController.getTransactionsTimeline);

router.put('/deposits/:id/approve', AdminController.approveDeposit);
router.put('/deposits/:id/reverse', AdminController.reverseDeposit);
router.put('/withdrawals/:id/pay', AdminController.payWithdrawal);
router.put('/withdrawals/:id/fail', AdminController.failWithdrawal);

export default router;
