import { Router } from 'express';
import { onboardTenant, getBranding, updateBranding } from '../controllers/tenantController';
import { getPlans, getMySubscription, upgradeSubscription, cancelSubscription } from '../controllers/subscriptionController';
import { getGlobalMetrics, getTenantsList, disableTenant } from '../controllers/saasAnalyticsController';
import { submitDemoRequest, submitLead, getLeads, updateLeadStatus } from '../controllers/publicController';
import { authenticate, authorizeRoles, SystemRole } from '../middlewares/auth';

const router = Router();

// 1. Public Marketing Routes
router.post('/public/demo', submitDemoRequest);
router.post('/public/lead', submitLead);
router.post('/onboarding', onboardTenant);

// 2. Subscription & Tenant Routes
router.get('/plans', getPlans);
router.get('/subscription/my', authenticate, authorizeRoles(SystemRole.PLATFORM_OWNER), getMySubscription);
router.post('/subscription/upgrade', authenticate, authorizeRoles(SystemRole.PLATFORM_OWNER), upgradeSubscription);
router.post('/subscription/cancel', authenticate, authorizeRoles(SystemRole.PLATFORM_OWNER), cancelSubscription);

// 3. White-Labeling Routes
router.get('/branding', authenticate, getBranding);
router.put('/branding', authenticate, authorizeRoles(SystemRole.PLATFORM_OWNER), updateBranding);



// 5. Super Admin Routes
router.get('/admin/metrics', authenticate, authorizeRoles(SystemRole.SUPER_ADMIN), getGlobalMetrics);
router.get('/admin/tenants', authenticate, authorizeRoles(SystemRole.SUPER_ADMIN), getTenantsList);
router.put('/admin/tenants/:id/disable', authenticate, authorizeRoles(SystemRole.SUPER_ADMIN), disableTenant);
router.get('/admin/leads', authenticate, authorizeRoles(SystemRole.SUPER_ADMIN), getLeads);
router.put('/admin/leads/:id/status', authenticate, authorizeRoles(SystemRole.SUPER_ADMIN), updateLeadStatus);

export default router;
