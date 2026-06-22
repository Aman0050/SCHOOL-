import { Router } from 'express';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';
import {
  getTeacherDashboardSummary,
  getTeacherTimetable,
  getTeacherClasses
} from '../controllers/teacherController';

const router = Router();

// All routes require TEACHER role
router.use(authenticate);
router.use(authorizeRoles(SystemRole.TEACHER, SystemRole.SCHOOL_ADMIN));

router.get('/dashboard/summary', getTeacherDashboardSummary);
router.get('/timetable', getTeacherTimetable);
router.get('/classes', getTeacherClasses);

export default router;
