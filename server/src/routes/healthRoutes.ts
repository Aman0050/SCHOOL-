import { Router } from 'express';
import { getHealthDashboard, runFastScan, resolveAnomaly } from '../controllers/healthController';
import { authenticate, authorizeRoles } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// Super Admins only for Data Integrity
router.get('/data-integrity', authorizeRoles('SUPER_ADMIN'), getHealthDashboard);
router.post('/data-integrity/scan', authorizeRoles('SUPER_ADMIN'), runFastScan);
router.put('/data-integrity/anomaly/:id/resolve', authorizeRoles('SUPER_ADMIN'), resolveAnomaly);

export default router;
