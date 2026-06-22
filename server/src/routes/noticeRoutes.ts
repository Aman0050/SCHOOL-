import { Router } from 'express';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';
import { getNotices, createNotice } from '../controllers/noticeController';

const router = Router();
router.use(authenticate);

router.get('/', getNotices);
router.post('/', authorizeRoles(SystemRole.SCHOOL_ADMIN, SystemRole.TEACHER), createNotice);

export default router;
