import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { generateMfaSecret, verifyAndEnableMfa } from '../controllers/mfaController';

const router = Router();

router.use(authenticate);

router.post('/setup', generateMfaSecret);
router.post('/verify', verifyAndEnableMfa);

export default router;
