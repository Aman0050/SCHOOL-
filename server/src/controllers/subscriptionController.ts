import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../errors/AppError';

const dbRaw = new PrismaClient();

// ==================== SAAS PLANS ====================

export const getPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await dbRaw.saaSPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' }
    });
    res.json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

// ==================== TENANT SUBSCRIPTION ====================

export const getMySubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const subscription = await dbRaw.subscription.findUnique({
      where: { tenantId },
      include: {
        plan: true,
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!subscription) throw new AppError(404, 'NOT_FOUND', 'Subscription not found');

    res.json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const upgradeSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { planId, billingCycle } = req.body; // billingCycle: 'MONTHLY' | 'ANNUAL'

    const plan = await dbRaw.saaSPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new AppError(404, 'NOT_FOUND', 'Plan not found');

    const subscription = await dbRaw.subscription.findUnique({ where: { tenantId } });
    if (!subscription) throw new AppError(404, 'NOT_FOUND', 'Current subscription not found');

    // Here you would integrate Razorpay/Stripe checkout session generation.
    // For now, we simulate an immediate upgrade (Simulation mode).
    const amount = billingCycle === 'ANNUAL' ? plan.priceAnnual : plan.priceMonthly;
    const endDate = new Date();
    if (billingCycle === 'ANNUAL') endDate.setFullYear(endDate.getFullYear() + 1);
    else endDate.setMonth(endDate.getMonth() + 1);

    const updatedSub = await dbRaw.$transaction(async (tx) => {
      // 1. Update Subscription
      const sub = await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          planId: plan.id,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: endDate,
          trialEndsAt: null, // End trial if upgrading
        }
      });

      // 2. Generate Invoice
      await tx.saaSInvoice.create({
        data: {
          tenantId,
          subscriptionId: sub.id,
          amount,
          status: 'PAID',
          paidAt: new Date(),
        }
      });

      return sub;
    });

    res.json({
      success: true,
      message: `Successfully upgraded to ${plan.name}`,
      data: updatedSub
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;

    const subscription = await dbRaw.subscription.update({
      where: { tenantId },
      data: { cancelAtPeriodEnd: true }
    });

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period.',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};
