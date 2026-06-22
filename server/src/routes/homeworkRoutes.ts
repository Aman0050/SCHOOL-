import { Router } from 'express';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';
import { getHomeworks, createHomework, submitHomework } from '../controllers/homeworkController';

const router = Router();
router.use(authenticate);

router.get('/', getHomeworks);
router.post('/', authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER), createHomework);
router.post('/:id/submit', authorizeRoles(SystemRole.STUDENT, SystemRole.PARENT), submitHomework);

export default router;
