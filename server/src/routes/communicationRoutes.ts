import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth';
import { getCommunicationStats, createCampaign, getCampaigns } from '../controllers/communicationController';

const router = Router();

router.use(authenticate);

router.get('/stats', getCommunicationStats);
router.get('/campaigns', getCampaigns);
router.post('/campaigns', authorizeRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'), createCampaign);

export default router;
