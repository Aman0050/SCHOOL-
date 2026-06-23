import { Request, Response, NextFunction } from 'express';
import { PrismaClient, SystemRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AppError } from '../errors/AppError';
import { seedDemoSchool } from '../utils/demoSeeder';

const dbRaw = new PrismaClient();

// ==================== ONBOARDING ====================

export const onboardTenant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { schoolName, domain, adminEmail, adminPassword, adminFirstName, adminLastName, includeDemoData } = req.body;

    if (!schoolName || !domain || !adminEmail || !adminPassword) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Missing required fields for onboarding');
    }

    // Check domain uniqueness
    const existingDomain = await dbRaw.tenant.findUnique({ where: { domain } });
    if (existingDomain) throw new AppError(400, 'DOMAIN_TAKEN', 'This domain is already in use');

    // Create subdomain from domain
    const subdomain = domain.split('.')[0];

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const tenantData = await dbRaw.$transaction(async (tx) => {
      // 1. Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: schoolName,
          domain,
          subdomain,
          onboardingStep: 'COMPLETED',
        }
      });

      // 2. Create School
      const school = await tx.school.create({
        data: {
          tenantId: tenant.id,
          name: schoolName,
        }
      });

      // 3. Create Super Admin
      const admin = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: adminEmail,
          passwordHash,
          firstName: adminFirstName || 'Admin',
          lastName: adminLastName || 'User',
          role: SystemRole.PLATFORM_OWNER,
        }
      });

      // 4. Default Trial Subscription
      const starterPlan = await tx.saaSPlan.findFirst({ where: { tier: 'STARTER' } });
      if (starterPlan) {
        await tx.subscription.create({
          data: {
            tenantId: tenant.id,
            planId: starterPlan.id,
            status: 'TRIAL',
            startDate: new Date(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 day trial
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          }
        });
      }

      return { tenant, school, admin };
    });

    if (includeDemoData) {
      // Run seed asynchronously in background
      seedDemoSchool(tenantData.tenant.id, tenantData.school.id).catch(console.error);
    }

    res.status(201).json({
      success: true,
      message: 'Onboarding completed successfully. Welcome to EduXeno!',
      data: {
        tenantId: tenantData.tenant.id,
        subdomain: tenantData.tenant.subdomain,
        loginUrl: `https://${tenantData.tenant.domain}/login`
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== WHITE LABELING ====================

export const getBranding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const tenant = await dbRaw.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new AppError(404, 'NOT_FOUND', 'Tenant not found');

    res.json({ success: true, data: tenant.branding });
  } catch (error) {
    next(error);
  }
};

export const updateBranding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { primaryColor, secondaryColor, logoUrl, fontUrl } = req.body;

    const tenant = await dbRaw.tenant.update({
      where: { id: tenantId },
      data: {
        branding: {
          primaryColor,
          secondaryColor,
          logoUrl,
          fontUrl
        }
      }
    });

    res.json({ success: true, message: 'Branding updated', data: tenant.branding });
  } catch (error) {
    next(error);
  }
};
