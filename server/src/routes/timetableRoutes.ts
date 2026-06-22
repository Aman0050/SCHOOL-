import { Router } from 'express';
import { getTimetable, saveTimetable } from '../controllers/timetableController';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

// Get timetable for a class
router.get('/', authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER, SystemRole.STUDENT, SystemRole.PARENT), getTimetable);

// Save timetable for a class (with conflict detection)
router.post('/', authorizeRoles(SystemRole.SCHOOL_ADMIN), saveTimetable);

export default router;
