import app from './app';
import { PaymentService } from './services/paymentService';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  // Background Task: Run stale deposits cleanup every 5 minutes
  const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
  setInterval(() => {
    console.log('[Scheduler] Running periodic stale deposits cleanup task...');
    PaymentService.cleanupStaleDeposits().catch((err) => {
      console.error('[Scheduler] Stale deposits cleanup failed:', err);
    });
  }, CLEANUP_INTERVAL_MS);

  // Startup Reconciliation: Run once immediately on server boot
  console.log('[Scheduler] Running startup stale deposits reconciliation...');
  PaymentService.cleanupStaleDeposits().catch((err) => {
    console.error('[Scheduler] Startup stale deposits reconciliation failed:', err);
  });
});
