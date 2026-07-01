import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  getAttendance,
  recordBulkAttendance,
  getAttendanceAnalytics,
  getMonthlyReport,
  bulkAttendanceSchema,
  getSubmissionStatus,
  getAttendanceAlerts,
  getAttendanceQuerySchema,
  getAnalyticsQuerySchema,
  getReportQuerySchema
} from '../controllers/attendanceController';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';
import { validateBody, validateQuery } from '../middlewares/validation';

const router = Router();

const bulkRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: { success: false, message: 'Too many bulk attendance requests, please try again later.' }
});

router.use(authenticate);

router.get('/', authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER), validateQuery(getAttendanceQuerySchema), getAttendance);
router.get('/analytics', authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER), validateQuery(getAnalyticsQuerySchema), getAttendanceAnalytics);

router.get('/submission-status', authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER), getSubmissionStatus);
router.get('/alerts', authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER), getAttendanceAlerts);

// Admin / Teacher specific recording endpoints
router.post(
  '/bulk',
  authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER),
  bulkRateLimiter,
  validateBody(bulkAttendanceSchema),
  recordBulkAttendance
);

router.get(
  '/report',
  authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER),
  validateQuery(getReportQuerySchema),
  getMonthlyReport
);

export default router;
