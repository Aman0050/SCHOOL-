import { Router } from 'express';
import { getJobStatus } from '../controllers/jobController';
import { authenticate } from '../middlewares/auth';
import { resolveTenant } from '../middlewares/tenantResolver';

const router = Router();

router.use(resolveTenant);
router.use(authenticate);

router.get('/:id', getJobStatus);

export default router;
