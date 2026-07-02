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

    // Revenue Growth Trend for multiple timeframes
    const now = new Date();
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    
    const invoices = await prisma.saaSInvoice.findMany({
      where: { status: 'PAID', paidAt: { gte: lastYearStart } },
      select: { amount: true, paidAt: true }
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const trendThisWeek = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      
      const rev = invoices.filter(inv => inv.paidAt! >= start && inv.paidAt! < end)
                          .reduce((s, inv) => s + Number(inv.amount), 0);
      trendThisWeek.push({ name: days[d.getDay()], revenue: rev });
    }

    const trendThisMonth = [];
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const start = new Date(now.getFullYear(), now.getMonth(), i);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const rev = invoices.filter(inv => inv.paidAt! >= start && inv.paidAt! < end)
                          .reduce((s, inv) => s + Number(inv.amount), 0);
      trendThisMonth.push({ name: `${i} ${months[now.getMonth()]}`, revenue: rev });
    }

    const trendThisYear = [];
    for (let i = 0; i <= now.getMonth(); i++) {
      const start = new Date(now.getFullYear(), i, 1);
      const end = new Date(now.getFullYear(), i + 1, 1);
      const rev = invoices.filter(inv => inv.paidAt! >= start && inv.paidAt! < end)
                          .reduce((s, inv) => s + Number(inv.amount), 0);
      trendThisYear.push({ name: months[i], revenue: rev });
    }

    const trendLast6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const rev = invoices.filter(inv => inv.paidAt! >= start && inv.paidAt! < end)
                          .reduce((s, inv) => s + Number(inv.amount), 0);
      trendLast6Months.push({ name: `${months[d.getMonth()]} ${d.getFullYear()}`, revenue: rev });
    }

    const trendLastYear = [];
    for (let i = 0; i < 12; i++) {
      const start = new Date(now.getFullYear() - 1, i, 1);
      const end = new Date(now.getFullYear() - 1, i + 1, 1);
      const rev = invoices.filter(inv => inv.paidAt! >= start && inv.paidAt! < end)
                          .reduce((s, inv) => s + Number(inv.amount), 0);
      trendLastYear.push({ name: months[i], revenue: rev });
    }

    const revenueTrend = {
      'This Week': trendThisWeek,
      'This Month': trendThisMonth,
      'This Year': trendThisYear,
      'Last 6 Months': trendLast6Months,
      'Last Year': trendLastYear
    };

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
