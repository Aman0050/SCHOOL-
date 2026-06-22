import { Router } from 'express';
import { getSchools, createSchool, updateSchool, schoolSchema } from '../controllers/schoolController';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';
import { validateBody } from '../middlewares/validation';

const router = Router();

router.use(authenticate);

router.get('/', getSchools);
router.post('/', authorizeRoles(SystemRole.SCHOOL_ADMIN), validateBody(schoolSchema), createSchool);
router.put('/:id', authorizeRoles(SystemRole.SCHOOL_ADMIN), validateBody(schoolSchema), updateSchool);

export default router;
