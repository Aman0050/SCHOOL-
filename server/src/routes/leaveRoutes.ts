import { Router } from 'express';
import { getLeaves, createLeave, updateLeaveStatus, createLeaveSchema } from '../controllers/leaveController';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';
import { validateBody } from '../middlewares/validation';

const router = Router();

router.use(authenticate);

router.get('/', authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER, SystemRole.STUDENT, SystemRole.PARENT), getLeaves);

router.post('/', validateBody(createLeaveSchema), createLeave);

router.patch('/:id/status', authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER), updateLeaveStatus);

export default router;
