import { PrismaClient, SystemRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ==================== DASHBOARD & ANALYTICS ====================

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { getOrSetCache } = await import('../config/redis');
    
    const stats = await getOrSetCache('superadmin:dashboard-stats', 300, async () => {
      const tenants = await prisma.tenant.findMany({
        include: {
          subscription: { include: { plan: true } },
          _count: { select: { users: { where: { role: 'STUDENT' } } } }
        }
      });

      const totalSchools = tenants.length;
      const activeSchools = tenants.filter(t => t.isActive && t.subscription?.status === 'ACTIVE').length;
      const trialSchools = tenants.filter(t => t.isActive && t.subscription?.status === 'TRIAL').length;
      const expiredSchools = tenants.filter(t => t.subscription?.status === 'EXPIRED').length;

      const totalStudents = tenants.reduce((sum, t) => sum + t._count.users, 0);

      // Calculate MRR & ARR from active subscriptions
      const activeSubs = tenants.filter(t => t.subscription?.status === 'ACTIVE' && t.subscription.plan);
      const mrr = activeSubs.reduce((sum, t) => sum + Number(t.subscription!.plan.priceMonthly), 0);
      const arr = mrr * 12; // Simplified calculation

      // Get recent support tickets across all tenants
      const recentTickets = await prisma.supportTicket.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { tenant: { select: { name: true } } }
      });

      return {
        metrics: {
          totalSchools, activeSchools, trialSchools, expiredSchools,
          mrr, arr, totalStudents
        },
        recentTickets
      };
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// ==================== TENANTS (SCHOOLS) MANAGEMENT ====================

export const getTenants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenants = await prisma.tenant.findMany({
      include: {
        subscription: { include: { plan: true } },
        _count: { select: { users: true } },
        schools: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: tenants });
  } catch (error) {
    next(error);
  }
};

export const createTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, subdomain, domain, adminEmail, adminFirstName, adminLastName, adminPassword } = req.body;

    const tenant = await prisma.$transaction(async (tx) => {
      // 1. Create Tenant
      const t = await tx.tenant.create({
        data: { name, subdomain, domain: domain || null, isActive: true }
      });

      // 2. Create Default School
      const s = await tx.school.create({
        data: { tenantId: t.id, name: `${name} Main Campus` }
      });

      // 3. Create Admin User
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);
      const admin = await tx.user.create({
        data: {
          tenantId: t.id,
          email: adminEmail,
          passwordHash,
          firstName: adminFirstName,
          lastName: adminLastName,
          role: SystemRole.SCHOOL_ADMIN
        }
      });
      await tx.profile.create({ data: { userId: admin.id } });

      return t;
    });

    res.status(201).json({ success: true, data: tenant });
  } catch (error) {
    next(error);
  }
};

export const deleteTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.tenant.delete({ where: { id } });
    res.json({ success: true, message: 'Tenant deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateTenantStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    const tenant = await prisma.tenant.update({
      where: { id },
      data: { isActive }
    });
    
    res.json({ success: true, data: tenant });
  } catch (error) {
    next(error);
  }
};

// ==================== BILLING & INVOICES ====================

export const getGlobalInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoices = await prisma.saaSInvoice.findMany({
      include: { tenant: { select: { name: true } }, subscription: { include: { plan: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: invoices });
  } catch (error) {
    next(error);
  }
};

// ==================== SUPPORT TICKETS ====================

export const getGlobalTickets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: { tenant: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

export const getTicketDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        tenant: { select: { name: true } },
        messages: {
          include: { sender: { select: { firstName: true, lastName: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    if (!ticket) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

export const replyToTicket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { content, status } = req.body;
    const senderId = req.user!.id;

    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.ticketMessage.create({
        data: { ticketId: id, senderId, content }
      });
      if (status) {
        await tx.supportTicket.update({
          where: { id },
          data: { status, updatedAt: new Date() }
        });
      }
      return msg;
    });

    res.json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
};

// ==================== AUDIT LOGS ====================

export const getGlobalAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        tenant: { select: { name: true } }
      }
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};
