import { Router } from 'express';
import { getLessonPlans, createLessonPlan, updateLessonPlanStatus } from '../controllers/curriculumController';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/lesson-plans', authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER, SystemRole.STUDENT, SystemRole.PARENT), getLessonPlans);
router.post('/lesson-plans', authorizeRoles(SystemRole.TEACHER), createLessonPlan);
router.patch('/lesson-plans/:id/status', authorizeRoles(SystemRole.TEACHER, SystemRole.SCHOOL_ADMIN), updateLessonPlanStatus);

export default router;
