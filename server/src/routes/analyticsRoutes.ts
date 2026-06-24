import { Router } from 'express';
import { cacheMiddleware } from '../utils/cache';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';
import {
  getAttendanceIntelligence,
  getFeeIntelligence,
  getExamIntelligence,
  getSchoolHealthScore,
  getSystemAlerts,
  getStudentIntelligence,
  getTeacherWorkloadAnalytics,
  downloadDailyReport,
  downloadExcelReport,
  getDashboardAggregate
} from '../controllers/analyticsController';

const router = Router();

// Analytics is primarily for Admins, SuperAdmins, and Principals
router.use(authenticate, authorizeRoles(SystemRole.SUPER_ADMIN, SystemRole.SCHOOL_ADMIN));

router.get('/dashboard-aggregate', getDashboardAggregate);
router.get('/students', cacheMiddleware(300), getStudentIntelligence);
router.get('/attendance', cacheMiddleware(300), getAttendanceIntelligence);
router.get('/fees', cacheMiddleware(300), getFeeIntelligence);
router.get('/exams', cacheMiddleware(300), getExamIntelligence);
router.get('/health', cacheMiddleware(300), getSchoolHealthScore);
router.get('/alerts', cacheMiddleware(60), getSystemAlerts);
router.get('/teacher-workload', cacheMiddleware(300), getTeacherWorkloadAnalytics);
router.get('/daily-report', downloadDailyReport);
router.get('/download-excel', downloadExcelReport);

export default router;
