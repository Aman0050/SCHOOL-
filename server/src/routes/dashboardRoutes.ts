import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.get('/overview', dashboardController.getOverview);
router.get('/executive-kpis', dashboardController.getExecutiveKpis);
router.get('/health-score', dashboardController.getHealthScore);
router.get('/operations', dashboardController.getOperations);
router.get('/activity-feed', dashboardController.getActivityFeed);
router.get('/upcoming-events', dashboardController.getUpcomingEvents);

export default router;
