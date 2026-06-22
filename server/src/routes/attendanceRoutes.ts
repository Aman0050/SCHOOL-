import { Router } from 'express';
import {
  getAttendance,
  recordBulkAttendance,
  getAttendanceAnalytics,
  getMonthlyReport,
  bulkAttendanceSchema
} from '../controllers/attendanceController';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';
import { validateBody } from '../middlewares/validation';

const router = Router();

router.use(authenticate);

router.get('/', getAttendance);
router.get('/analytics', getAttendanceAnalytics);

// Admin / Teacher specific recording endpoints
router.post(
  '/bulk',
  authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER),
  validateBody(bulkAttendanceSchema),
  recordBulkAttendance
);

router.get(
  '/report',
  authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER),
  getMonthlyReport
);

export default router;
