import { Router } from 'express';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';
import { getMyChildren, getStudentDashboard } from '../controllers/parentController';

const router = Router();
router.use(authenticate);
router.use(authorizeRoles(SystemRole.PARENT));

router.get('/children', getMyChildren);
router.get('/dashboard/:studentId', getStudentDashboard);

export default router;
