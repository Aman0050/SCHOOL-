import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { prisma } from '../config/db';
import { cache } from '../lib/cache';
import { broadcastSuperAdminUpdate } from '../lib/socketManager';

const hasRedis = !!process.env.REDIS_URL;
let redisConnection: any = null;
if (hasRedis) {
  redisConnection = new IORedis(process.env.REDIS_URL as string, { maxRetriesPerRequest: null });
} else {
  redisConnection = new (class { constructor(...args: any[]) {} on(...args: any[]) {} })();
}

class MockQueue {
  async add(name: string, data: any) {
    console.log(`[Mock Queue] Added job: ${name}`);
    if (name === 'aggregate-dashboard') {
      await processSuperAdminJob({ name, data } as any);
    }
    return { id: 'stub' };
  }
}

export const superAdminQueue = hasRedis
  ? new Queue('superadmin-aggregation', {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
      }
    })
  : new MockQueue() as any;

const calculateMRR = async (activeSubs: any[]) => {
  return activeSubs.reduce((sum, t) => {
    if (t.subscription?.plan?.priceMonthly) {
      return sum + Number(t.subscription.plan.priceMonthly);
    }
    return sum;
  }, 0);
};

export async function processSuperAdminJob(job: Job | any) {
  console.log(`[SuperAdminQueue] Processing job: ${job.name}`);

  if (job.name === 'aggregate-dashboard') {
    // 1. Fetch Tenants with Subscriptions
    const tenants = await prisma.tenant.findMany({
      include: {
        subscription: { include: { plan: true } },
        _count: { select: { users: { where: { role: 'STUDENT', isActive: true } } } }
      }
    });

    const totalSchools = tenants.length;
    const activeSchools = tenants.filter(t => t.isActive && t.subscription?.status === 'ACTIVE').length;
    
    const trialSchoolsList = tenants.filter(t => t.isActive && t.subscription?.status === 'TRIAL');
    const trialSchools = trialSchoolsList.length;
    const expiredSchools = tenants.filter(t => t.subscription?.status === 'EXPIRED' || t.subscription?.status === 'CANCELLED').length;

    const totalStudents = tenants.reduce((sum, t) => sum + t._count.users, 0);

    // Calculate Revenue
    const activeSubs = tenants.filter(t => t.subscription?.status === 'ACTIVE' && t.subscription.plan);
    const mrr = await calculateMRR(activeSubs);
    const arr = mrr * 12;

    // Churn calculation
    const churnRate = totalSchools > 0 ? ((expiredSchools / totalSchools) * 100).toFixed(1) : "0.0";
    const mrrLost = tenants.filter(t => t.subscription?.status === 'CANCELLED' || t.subscription?.status === 'EXPIRED')
                           .reduce((sum, t) => sum + Number(t.subscription?.plan?.priceMonthly || 0), 0);

    // Revenue Growth Trend (Group invoices by month for the last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const invoices = await prisma.saaSInvoice.findMany({
      where: { status: 'PAID', paidAt: { gte: sixMonthsAgo } },
      select: { amount: true, paidAt: true }
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueTrendMap: Record<string, number> = {};
    
    invoices.forEach(inv => {
      if (inv.paidAt) {
        const monthKey = `${months[inv.paidAt.getMonth()]} ${inv.paidAt.getFullYear()}`;
        if (!revenueTrendMap[monthKey]) revenueTrendMap[monthKey] = 0;
        revenueTrendMap[monthKey] += Number(inv.amount);
      }
    });

    // Fill in missing months
    const revenueTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${months[d.getMonth()]} ${d.getFullYear()}`;
      revenueTrend.push({
        name: monthKey,
        revenue: revenueTrendMap[monthKey] || 0
      });
    }

    // Live Alerts
    const expiringSoonDate = new Date();
    expiringSoonDate.setDate(expiringSoonDate.getDate() + 7);
    
    const alerts = [];
    const expiringSchools = tenants.filter(t => t.subscription?.endDate && t.subscription.endDate <= expiringSoonDate && t.subscription.status === 'ACTIVE');
    if (expiringSchools.length > 0) {
      alerts.push({ id: 1, type: 'warning', message: `${expiringSchools.length} schools have subscriptions expiring in < 7 days.` });
    }

    const failedInvoices = await prisma.saaSInvoice.count({ where: { status: 'UNCOLLECTIBLE' } });
    if (failedInvoices > 0) {
      alerts.push({ id: 2, type: 'error', message: `${failedInvoices} uncollectible invoices require attention.` });
    }
    
    const highTickets = await prisma.supportTicket.count({ where: { status: 'OPEN', priority: 'URGENT' } });
    if (highTickets > 0) {
      alerts.push({ id: 3, type: 'error', message: `${highTickets} urgent support tickets pending.` });
    }

    if (alerts.length === 0) {
      alerts.push({ id: 0, type: 'success', message: 'All systems operational. No immediate alerts.' });
    }

    // Health Score Aggregation
    const averageHealth = tenants.length > 0 
      ? tenants.reduce((sum, t) => sum + (t.healthScore || 100), 0) / tenants.length
      : 100;
    
    const healthStatus = averageHealth >= 90 ? 'Excellent' : averageHealth >= 75 ? 'Healthy' : averageHealth >= 60 ? 'At Risk' : 'Critical';

    // Executive Insights
    const forecasts = [
      { id: 1, text: `Projected MRR next month: $${(mrr * 1.05).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`, trend: 'up' },
      { id: 2, text: `Expected renewals in 30 days: ${expiringSchools.length}`, trend: 'neutral' },
      { id: 3, text: `Churn risk detected across ${trialSchoolsList.filter(s => (s.healthScore || 100) < 70).length} trial schools.`, trend: 'down' }
    ];

    const payload = {
      metrics: {
        totalSchools, activeSchools, trialSchools, expiredSchools,
        mrr, arr, totalStudents, churnRate, mrrLost,
        healthScore: Math.round(averageHealth),
        healthStatus
      },
      revenueTrend,
      alerts,
      forecasts
    };

    // Cache with exactly 60 seconds TTL (per user requirements)
    await cache.set('superadmin:dashboard:data', payload, 60);

    // Also broadcast over socket so frontend can reload if looking at the dashboard
    broadcastSuperAdminUpdate('dashboard_aggregated');

    return payload;
  }
}

let worker: any = null;
if (hasRedis) {
  worker = new Worker('superadmin-aggregation', processSuperAdminJob as any, { connection: redisConnection });
  worker.on('failed', (job: any, err: any) => {
    console.error(`[SuperAdminQueue] Job ${job?.id} failed:`, err);
  });
}
