import { Router } from 'express';
import {
  getDepartments,
  createDepartment,
  departmentSchema,
  getCourses,
  createCourse,
  courseSchema,
  getClasses,
  createClass,
  classSchema,
  getEnrollments,
  createEnrollment,
  enrollmentSchema,
  getAuditLogs,
} from '../controllers/academicController';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';
import { validateBody } from '../middlewares/validation';

const router = Router();

router.use(authenticate);

// Departments
router.get('/departments', getDepartments);
router.post(
  '/departments',
  authorizeRoles(SystemRole.SCHOOL_ADMIN),
  validateBody(departmentSchema),
  createDepartment
);

// Courses
router.get('/courses', getCourses);
router.post(
  '/courses',
  authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER),
  validateBody(courseSchema),
  createCourse
);

// Classes
router.get('/classes', getClasses);
router.post(
  '/classes',
  authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER),
  validateBody(classSchema),
  createClass
);

// Enrollments
router.get('/enrollments', authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER), getEnrollments);
router.post(
  '/enrollments',
  authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER),
  validateBody(enrollmentSchema),
  createEnrollment
);

// Audit logs
router.get('/audit-logs', authorizeRoles(SystemRole.SCHOOL_ADMIN), getAuditLogs);

export default router;
