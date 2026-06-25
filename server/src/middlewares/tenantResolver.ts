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

  // Safeguard for Vercel/Render deployments testing:
  if (subdomain && (subdomain.includes('school-j8gv') || subdomain.includes('school-mqot') || subdomain.includes('vercel') || subdomain.includes('onrender'))) {
    subdomain = 'aman';
  }

  // If no subdomain is resolved, tenant is null (could be super admin route, landing page, etc.)
  if (!subdomain) {
    req.tenant = null;
    return next();
  }

  try {
    const tenant = await dbRaw.tenant.findUnique({
      where: { subdomain },
    });

    if (!tenant) {
      return next(new AppError(404, 'TENANT_NOT_FOUND', `School subdomain '${subdomain}' does not exist`));
    }

    if (!tenant.isActive) {
      return next(new AppError(403, 'TENANT_SUSPENDED', `School tenant '${subdomain}' is currently deactivated`));
    }

    req.tenant = tenant;

    // Run the request in the tenantStorage AsyncLocalStorage context
    tenantStorage.run({ tenantId: tenant.id }, () => {
      next();
    });
  } catch (error) {
    next(error);
  }
};
