import { Request, Response, NextFunction } from 'express';
import { PrismaClient, SystemRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';
import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';
import { broadcastSuperAdminUpdate } from '../lib/socketManager';

const prisma = new PrismaClient();

// ==================== DASHBOARD & ANALYTICS ====================

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cache } = await import('../lib/cache');
    const { superAdminQueue } = await import('../workers/superAdminQueue');
    
    // Attempt to get the latest 60-second TTL pre-aggregated dashboard data
    const cachedData = await cache.get('superadmin:dashboard:data');
    
    if (cachedData) {
      return res.json({
        success: true,
        data: cachedData
      });
    }

    // If cache missed, fire background job and return pending structure
    // (This usually only happens on cold boot before cron fires)
    superAdminQueue.add('aggregate-dashboard', {});
    
    return res.json({
      success: true,
      data: {
        metrics: { totalSchools: 0, activeSchools: 0, trialSchools: 0, expiredSchools: 0, mrr: 0, arr: 0, totalStudents: 0, churnRate: "0.0", mrrLost: 0, healthScore: 100, healthStatus: 'Loading...' },
        revenueTrend: [],
        alerts: [{ id: 99, type: 'warning', message: 'Aggregating live analytics. Dashboard will refresh momentarily.' }],
        forecasts: []
      }
    });
  } catch (error) {
    next(error);
  }
};

export const exportDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { format } = req.query;
    const { cache } = await import('../lib/cache');
    let cachedData = await cache.get('superadmin:dashboard:data') as any;

    if (!cachedData) {
      // Data not aggregated yet. Let's do it on the fly!
      const { processSuperAdminJob } = await import('../workers/superAdminQueue');
      await processSuperAdminJob({ name: 'aggregate-dashboard' });
      cachedData = await cache.get('superadmin:dashboard:data') as any;
      
      if (!cachedData) {
        return res.status(500).json({ success: false, message: 'Failed to aggregate data for export.' });
      }
    }

    const { metrics } = cachedData;

    if (format === 'csv') {
      const csvData = [
        ['Metric', 'Value'],
        ['Total Organizations', metrics.totalSchools],
        ['Paid Subscriptions', metrics.activeSchools],
        ['Active Trials', metrics.trialSchools],
        ['Churned / Expired', metrics.expiredSchools],
        ['Monthly Recurring Revenue (MRR)', metrics.mrr],
        ['Annual Recurring Revenue (ARR)', metrics.arr],
        ['Active Students (Global)', metrics.totalStudents],
        ['Global Health Score', metrics.healthScore],
        ['Health Status', metrics.healthStatus]
      ];
      
      const csvString = stringify(csvData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="eduxeno-executive-report.csv"');
      return res.send(csvString);
    } 
    
    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="eduxeno-executive-report.pdf"');
      
      doc.pipe(res);
      
      doc.fontSize(24).text('EduXeno Executive Dashboard Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);
      
      doc.fontSize(16).text('Key Performance Indicators', { underline: true });
      doc.moveDown();
      
      const addMetric = (label: string, value: any) => {
        doc.fontSize(12).text(`${label}:`, { continued: true }).text(` ${value}`, { align: 'right' });
        doc.moveDown(0.5);
      };

      addMetric('Total Organizations', metrics.totalSchools);
      addMetric('Paid Subscriptions', metrics.activeSchools);
      addMetric('Active Trials', metrics.trialSchools);
      addMetric('Churned / Expired', metrics.expiredSchools);
      addMetric('Monthly Recurring Revenue (MRR)', `$${metrics.mrr.toLocaleString()}`);
      addMetric('Annual Recurring Revenue (ARR)', `$${metrics.arr.toLocaleString()}`);
      addMetric('Active Students (Global)', metrics.totalStudents.toLocaleString());
      addMetric('Global Health Score', `${metrics.healthScore} (${metrics.healthStatus})`);
      
      doc.end();
      return;
    }

    res.status(400).json({ success: false, message: 'Invalid format requested' });
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
        schools: true,
        users: {
          where: { role: 'SCHOOL_ADMIN' },
          select: { id: true, firstName: true, lastName: true, email: true }
        }
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
    broadcastSuperAdminUpdate('tenant_created', { tenantId: tenant.id });
  } catch (error) {
    next(error);
  }
};

export const deleteTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.tenant.delete({ where: { id } });
    res.json({ success: true, message: 'Tenant deleted successfully' });
    broadcastSuperAdminUpdate('tenant_deleted', { tenantId: id });
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

export const updateTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, subdomain, domain, adminUserId, adminFirstName, adminLastName, adminEmail, adminPassword, planId } = req.body;
    
    // Start a transaction if we need to update multiple tables
    const tenant = await prisma.$transaction(async (tx) => {
      // 1. Update Tenant
      const updatedTenant = await tx.tenant.update({
        where: { id },
        data: { name, subdomain, domain: domain || null }
      });

      // 2. Update Primary Admin if details provided
      if (adminUserId && adminEmail) {
        const updateData: any = {
          firstName: adminFirstName,
          lastName: adminLastName,
          email: adminEmail
        };

        if (adminPassword) {
          const salt = await bcrypt.genSalt(10);
          updateData.passwordHash = await bcrypt.hash(adminPassword, salt);
        }

        await tx.user.update({
          where: { id: adminUserId },
          data: updateData
        });
      }

      // 3. Update Subscription if planId provided
      if (planId) {
        await tx.subscription.update({
          where: { tenantId: id },
          data: { planId }
        });
      }

      return updatedTenant;
    });

    res.json({ success: true, data: tenant });
  } catch (error) {
    next(error);
  }
};

export const resetAdminPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    
    // Generate a random 10-character password
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let tempPassword = '';
    for (let i = 0; i < 10; i++) tempPassword += chars.charAt(crypto.randomInt(0, chars.length));

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    res.json({ success: true, tempPassword });
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
