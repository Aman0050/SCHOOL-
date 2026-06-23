import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Enterprise Compliance: Data Retention Policy
const AUDIT_LOG_RETENTION_DAYS = 90;
const SESSION_RETENTION_DAYS = 30;

export const executeRetentionPolicy = async () => {
  console.log(`[Compliance] Executing Data Retention Policy...`);
  
  try {
    const auditRetentionDate = new Date();
    auditRetentionDate.setDate(auditRetentionDate.getDate() - AUDIT_LOG_RETENTION_DAYS);

    const sessionRetentionDate = new Date();
    sessionRetentionDate.setDate(sessionRetentionDate.getDate() - SESSION_RETENTION_DAYS);

    // 1. Prune Audit Logs (e.g., move to cold storage / delete)
    const deletedAudits = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: auditRetentionDate,
        },
      },
    });

    // 2. Prune Expired/Old Sessions
    const deletedSessions = await prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { createdAt: { lt: sessionRetentionDate } }
        ]
      },
    });

    // 3. Prune Old Notifications
    const notificationRetentionDate = new Date();
    notificationRetentionDate.setDate(notificationRetentionDate.getDate() - 60);
    const deletedNotifications = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: notificationRetentionDate,
        },
      },
    });

    console.log(`[Compliance] Retention cleanup complete.`);
    console.log(`- Deleted ${deletedAudits.count} obsolete audit logs (Older than ${AUDIT_LOG_RETENTION_DAYS} days)`);
    console.log(`- Deleted ${deletedSessions.count} obsolete sessions`);
    console.log(`- Deleted ${deletedNotifications.count} obsolete notifications`);

    return {
      success: true,
      deletedAudits: deletedAudits.count,
      deletedSessions: deletedSessions.count,
      deletedNotifications: deletedNotifications.count,
    };
  } catch (error) {
    console.error(`[Compliance] Error executing retention policy:`, error);
    throw error;
  }
};
