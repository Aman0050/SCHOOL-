import { Router } from 'express';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';
import {
  getAttendanceIntelligence,
  getFeeIntelligence,
  getExamIntelligence,
  getSchoolHealthScore,
  getSystemAlerts,
  getStudentIntelligence,
  getTeacherWorkloadAnalytics,
  downloadDailyReport
} from '../controllers/analyticsController';

const router = Router();

// Analytics is primarily for Admins, SuperAdmins, and Principals
router.use(authenticate, authorizeRoles(SystemRole.SUPER_ADMIN, SystemRole.SCHOOL_ADMIN));

router.get('/students', getStudentIntelligence);
router.get('/attendance', getAttendanceIntelligence);
router.get('/fees', getFeeIntelligence);
router.get('/exams', getExamIntelligence);
router.get('/health', getSchoolHealthScore);
router.get('/alerts', getSystemAlerts);
router.get('/teacher-workload', getTeacherWorkloadAnalytics);
router.get('/daily-report', downloadDailyReport);

export default router;
