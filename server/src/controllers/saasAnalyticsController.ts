import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { getOrSetCache } from '../services/redisService';

const dbRaw = new PrismaClient();

// ==================== SUPER ADMIN SAAS COMMAND CENTER ====================

export const getGlobalMetrics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== 'SUPER_ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'Access restricted to Super Admins');
    }

    const cacheKey = 'saas:globalMetrics';
    // Cache the metrics for 5 minutes (300 seconds)
    const metricsData = await getOrSetCache(cacheKey, 300, async () => {
      // 1. Total Tenants & Schools
      const totalTenants = await dbRaw.tenant.count();
      const totalSchools = await dbRaw.school.count();
      const totalUsers = await dbRaw.user.count();

      // 2. Subscriptions
      const activeSubscriptions = await dbRaw.subscription.count({
        where: { status: 'ACTIVE' }
      });
      
      const trialSubscriptions = await dbRaw.subscription.count({
        where: { status: 'TRIAL' }
      });

      const churnedSubscriptions = await dbRaw.subscription.count({
        where: { status: 'CANCELED' }
      });

      // 3. Revenue Metrics
      const subscriptions = await dbRaw.subscription.findMany({
        where: { status: 'ACTIVE' },
        include: { plan: true }
      });

      const mrr = subscriptions.reduce((sum, sub) => sum + Number(sub.plan.priceMonthly), 0);
      const arr = mrr * 12;

      const paidInvoices = await dbRaw.saaSInvoice.findMany({
        where: { status: 'PAID' }
      });
      const totalRevenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

      // 4. Ticket Backlog
      const openTickets = await dbRaw.supportTicket.count({
        where: { status: 'OPEN' }
      });

      return {
        platform: { totalTenants, totalSchools, totalUsers },
        subscriptions: { active: activeSubscriptions, trial: trialSubscriptions, churned: churnedSubscriptions },
        revenue: { mrr, arr, totalRevenue },
        support: { openTickets }
      };
    });

    res.json({
      success: true,
      data: metricsData,
      source: 'cache' // Implicit indicator
    });
  } catch (error) {
    next(error);
  }
};

export const getTenantsList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== 'SUPER_ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'Access restricted to Super Admins');
    }

    const tenants = await dbRaw.tenant.findMany({
      include: {
        subscription: { include: { plan: true } },
        _count: { select: { schools: true, users: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: tenants });
  } catch (error) {
    next(error);
  }
};

export const disableTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== 'SUPER_ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'Access restricted to Super Admins');
    }

    const { id } = req.params;
    const tenant = await dbRaw.tenant.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ success: true, message: `Tenant ${tenant.name} disabled`, data: tenant });
  } catch (error) {
    next(error);
  }
};
