import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { tenantStorage } from '../utils/tenantContext';

const dbRaw = new PrismaClient();

export const resolveTenant = async (req: Request, res: Response, next: NextFunction) => {
  // Support both header (X-Tenant-Subdomain) and host-based subdomain
  let subdomain = req.headers['x-tenant-subdomain'] as string;

  if (!subdomain) {
    const host = req.headers.host || '';
    const parts = host.split('.');
    
    // Check if we have a subdomain (e.g. "greenwood" in "greenwood.localhost:5000" or "greenwood.school.com")
    // Avoid mapping "localhost", "www", "api", etc.
    if (parts.length > 1) {
      const firstPart = parts[0];
      if (firstPart !== 'www' && firstPart !== 'api' && firstPart !== 'localhost') {
        subdomain = firstPart;
      }
    }
  }

  // If no subdomain is resolved, tenant is null (global routes, login, super admin)
  if (!subdomain) {
    req.tenant = null;
    return next();
  }

  try {
    const tenant = await dbRaw.tenant.findUnique({
      where: { subdomain },
    });

    if (!tenant) {
      // Don't throw 404 here anymore. 
      // Vercel deployments (school-j8gv) won't have a valid DB tenant.
      // Global routes (like Login) don't need a tenant initially.
      req.tenant = null;
      return next();
    }

    if (!tenant.isActive) {
      return next(new AppError(403, 'TENANT_SUSPENDED', `School tenant '${subdomain}' is currently deactivated`));
    }

    req.tenant = tenant;

    // Run the request in the tenantStorage AsyncLocalStorage context
    // This provides context for public routes that rely on tenant (e.g. public settings)
    tenantStorage.run({ tenantId: tenant.id }, () => {
      next();
    });
  } catch (error) {
    next(error);
  }
};
