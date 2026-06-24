import { Router } from 'express';
import { globalSearch } from '../controllers/searchController';
import { authenticate } from '../middlewares/auth';
import { resolveTenant } from '../middlewares/tenantResolver';

const router = Router();

router.use(resolveTenant);
router.use(authenticate);

router.get('/', globalSearch);

export default router;
