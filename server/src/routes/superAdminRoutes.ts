import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';
import {
  getDashboardStats,
  getTenants,
  createTenant,
  updateTenantStatus,
  deleteTenant,
  getGlobalInvoices,
  getGlobalTickets,
  getTicketDetails,
  replyToTicket
} from '../controllers/superAdminController';

const router = Router();

// Protect all routes under this file for SUPER_ADMIN only
router.use(authenticate);
router.use(authorizeRoles(SystemRole.SUPER_ADMIN));

router.get('/dashboard', getDashboardStats as (req: Request, res: Response, next: NextFunction) => void);
router.get('/tenants', getTenants as (req: Request, res: Response, next: NextFunction) => void);
router.post('/tenants', createTenant as (req: Request, res: Response, next: NextFunction) => void);
router.patch('/tenants/:id/status', updateTenantStatus as (req: Request, res: Response, next: NextFunction) => void);
router.delete('/tenants/:id', deleteTenant as (req: Request, res: Response, next: NextFunction) => void);

// Subscription Engine
router.get('/plans', (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const plans = await prisma.saaSPlan.findMany({ orderBy: { priceMonthly: 'asc' } });
    res.json({ success: true, data: plans });
  } catch (error) { next(error); }
}) as any);

router.post('/subscriptions/:tenantId/upgrade', (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const { planId } = req.body;
    const { tenantId } = req.params;
    
    // Calculate new end date (1 year for simplicity in this MVP)
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);

    const sub = await prisma.subscription.upsert({
      where: { tenantId },
      create: { tenantId, planId, status: 'ACTIVE', endDate },
      update: { planId, status: 'ACTIVE', endDate }
    });
    
    res.json({ success: true, data: sub });
  } catch (error) { next(error); }
}) as any);

router.post('/subscriptions/:tenantId/cancel', (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const { tenantId } = req.params;
    
    const sub = await prisma.subscription.update({
      where: { tenantId },
      data: { status: 'CANCELED', cancelAtPeriodEnd: true }
    });
    
    res.json({ success: true, data: sub });
  } catch (error) { next(error); }
}) as any);

router.get('/invoices', getGlobalInvoices as (req: Request, res: Response, next: NextFunction) => void);
router.get('/tickets', getGlobalTickets as (req: Request, res: Response, next: NextFunction) => void);
router.get('/tickets/:id', getTicketDetails as (req: Request, res: Response, next: NextFunction) => void);
router.post('/tickets/:id/reply', replyToTicket as (req: Request, res: Response, next: NextFunction) => void);

router.get('/audit-logs', (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { getGlobalAuditLogs } = await import('../controllers/superAdminController');
    await getGlobalAuditLogs(req, res, next);
  } catch(error) { next(error); }
}) as any);

router.get('/demo-requests', (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const requests = await prisma.demoRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: requests });
  } catch (error) { next(error); }
}) as any);

router.patch('/demo-requests/:id/status', (async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.demoRequest.update({
      where: { id },
      data: { status }
    });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
}) as any);

export default router;
