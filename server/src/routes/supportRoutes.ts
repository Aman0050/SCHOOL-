import { Router } from 'express';
import {
  createTicket,
  getTickets,
  getTicketDetails,
  updateTicket,
  addMessage,
  getKnowledgeBase,
  getSupportDashboardStats
} from '../controllers/supportController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.use(authenticate);

router.post('/tickets', createTicket);
router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicketDetails);
router.put('/tickets/:id/status', updateTicket);
router.post('/tickets/:id/messages', addMessage);

router.get('/knowledge-base', getKnowledgeBase);
router.get('/dashboard-stats', getSupportDashboardStats);

export default router;
