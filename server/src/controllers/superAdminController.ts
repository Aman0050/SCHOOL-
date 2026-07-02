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

    // If cache missed, compute it on the fly
    const { processSuperAdminJob } = await import('../workers/superAdminQueue');
    const freshData = await processSuperAdminJob({ name: 'aggregate-dashboard' });
    
    return res.json({
      success: true,
      data: freshData
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
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="eduxeno-executive-report.pdf"');
      
      doc.pipe(res);
      
      // Top Header Banner
      doc.rect(0, 0, doc.page.width, 100).fill('#0f172a'); // slate-900
      
      doc.fillColor('#ffffff')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('EduXeno Command Center', 50, 35);
         
      doc.fillColor('#94a3b8') // slate-400
         .fontSize(12)
         .font('Helvetica')
         .text('Executive Dashboard Report', 50, 65);
         
      // Reset position after absolute positioning
      doc.y = 130;
      
      // Metadata
      doc.fillColor('#64748b')
         .fontSize(10)
         .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'right' });
         
      doc.moveDown(2);
      
      // Section Title
      doc.fillColor('#1e293b') // slate-800
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('Key Performance Indicators');
         
      doc.moveDown(1);
      
      // Draw Table Header
      const tableTop = doc.y;
      doc.rect(50, tableTop, doc.page.width - 100, 30).fill('#1e293b');
      doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold');
      doc.text('Metric', 60, tableTop + 8);
      doc.text('Value', doc.page.width - 200, tableTop + 8, { width: 140, align: 'right' });
      
      let currentY = tableTop + 30;
      
      const drawRow = (label: string, value: string, isEven: boolean, colorOverride?: string) => {
        // Zebra striping
        doc.rect(50, currentY, doc.page.width - 100, 30).fill(isEven ? '#f8fafc' : '#ffffff');
        
        doc.fillColor('#334155').fontSize(11).font('Helvetica');
        doc.text(label, 60, currentY + 8);
        
        if (colorOverride) {
            doc.fillColor(colorOverride).font('Helvetica-Bold');
        } else {
            doc.fillColor('#0f172a').font('Helvetica-Bold');
        }
        
        doc.text(value, doc.page.width - 200, currentY + 8, { width: 140, align: 'right' });
        
        currentY += 30;
      };
      
      let isEven = false;
      const addMetric = (label: string, value: string, color?: string) => {
        drawRow(label, value, isEven, color);
        isEven = !isEven;
      };

      addMetric('Total Organizations', metrics.totalSchools.toString());
      addMetric('Paid Subscriptions', metrics.activeSchools.toString(), '#10b981'); // emerald
      addMetric('Active Trials', metrics.trialSchools.toString());
      addMetric('Churned / Expired', metrics.expiredSchools.toString(), '#ef4444'); // red
      addMetric('Monthly Recurring Revenue (MRR)', `$${metrics.mrr.toLocaleString()}`, '#4f46e5'); // indigo
      addMetric('Annual Recurring Revenue (ARR)', `$${metrics.arr.toLocaleString()}`, '#4f46e5');
      addMetric('Active Students (Global)', metrics.totalStudents.toLocaleString());
      
      let healthColor = '#10b981';
      if (metrics.healthStatus.toLowerCase().includes('warning')) healthColor = '#f59e0b';
      if (metrics.healthStatus.toLowerCase().includes('critical')) healthColor = '#ef4444';
      addMetric('Global Health Score', `${metrics.healthScore} (${metrics.healthStatus})`, healthColor);
      
      // Borders for the table
      doc.rect(50, tableTop, doc.page.width - 100, currentY - tableTop).stroke('#e2e8f0');

      // Footer
      doc.y = doc.page.height - 50;
      doc.fillColor('#94a3b8').fontSize(9).font('Helvetica');
      doc.text('© EduXeno Inc. Confidential & Proprietary.', 50, doc.y, { align: 'center' });
      
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
