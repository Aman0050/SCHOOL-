import { Router } from 'express';
import {
  getStudents,
  registerStudent,
  getStudentDetail,
  updateStudent,
  bulkImportStudents,
  bulkUpdateClass,
  getParents,
  importStudents,
  exportStudents,
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

import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

// Admin-only write controls
router.post('/', authorizeRoles(SystemRole.SCHOOL_ADMIN), validateBody(studentRegisterSchema), registerStudent);
router.put('/:id', authorizeRoles(SystemRole.SCHOOL_ADMIN), validateBody(studentUpdateSchema), updateStudent);
router.post('/bulk-import', authorizeRoles(SystemRole.SCHOOL_ADMIN), validateBody(bulkImportSchema), bulkImportStudents);
router.post('/bulk-update', authorizeRoles(SystemRole.SCHOOL_ADMIN), validateBody(bulkUpdateSchema), bulkUpdateClass);

// CSV / Excel endpoints
router.post('/import', authorizeRoles(SystemRole.SCHOOL_ADMIN), upload.single('file'), importStudents);
router.get('/export', authorizeRoles(SystemRole.SCHOOL_ADMIN), exportStudents);

export default router;
