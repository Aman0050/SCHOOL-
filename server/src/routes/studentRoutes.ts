import { Router } from 'express';
import {
  getStudents,
  registerStudent,
  getStudentDetail,
  updateStudent,
  bulkImportStudents,
  bulkUpdateClass,
  getParents,
  // searchStudents,
  // getStudentPreview,
  studentRegisterSchema,
  studentUpdateSchema,
  bulkImportSchema,
  bulkUpdateSchema
} from '../controllers/studentController';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';
import { validateBody } from '../middlewares/validation';

const router = Router();

router.use(authenticate);

// Public student lookups for auth users
router.get('/', getStudents);
// router.get('/search', searchStudents);
router.get('/parents', getParents);
// router.get('/:id/preview', getStudentPreview);
router.get('/:id', getStudentDetail);

// Admin-only write controls
router.post('/', authorizeRoles(SystemRole.SCHOOL_ADMIN), validateBody(studentRegisterSchema), registerStudent);
router.put('/:id', authorizeRoles(SystemRole.SCHOOL_ADMIN), validateBody(studentUpdateSchema), updateStudent);
router.post('/bulk-import', authorizeRoles(SystemRole.SCHOOL_ADMIN), validateBody(bulkImportSchema), bulkImportStudents);
router.post('/bulk-update', authorizeRoles(SystemRole.SCHOOL_ADMIN), validateBody(bulkUpdateSchema), bulkUpdateClass);

export default router;
