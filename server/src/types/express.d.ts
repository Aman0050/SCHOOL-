import { Tenant, SystemRole } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      tenant: Tenant | null;
      user?: {
        id: string;
        email: string;
        role: SystemRole;
        tenantId: string;
      };
    }
  }
}
