import { PrismaClient } from '@prisma/client';
import { readReplicas } from '@prisma/extension-read-replicas';
import { tenantStorage } from '../utils/tenantContext';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Configure Base Prisma Client
const basePrisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma;

// Attach Read Replicas and Tenant Isolation Extensions
let prismaWithReplicas: any = basePrisma;

if (process.env.DATABASE_URL_REPLICA) {
  prismaWithReplicas = basePrisma.$extends(
    readReplicas({
      replicas: [new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_REPLICA } } })],
    })
  );
}

export const prisma = prismaWithReplicas.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }: any) {
        const tenantIsolatedModels = [
          'School',
          'User',
          'Department',
          'Course',
          'Class',
          'Enrollment',
          'AuditLog',
          // Fee Models
          'FeeCategory', 'FeeStructure', 'FeeStructureItem', 'StudentFeeAssignment',
          'FeeDiscount', 'StudentDiscount', 'FeeCollection', 'PaymentInstallment',
          'FineRecord', 'FinancialLedger', 'FeeReceiptCounter',
          // Exam Models
          'AcademicSession', 'ExamTerm', 'ExamSubject', 'ExamSubjectMapping',
          'Exam', 'ExamSubjectSchedule', 'MarksEntry', 'GradeRule',
          'GradeConfig', 'StudentResult', 'ReportCard', 'StudentRanking',
          // Parent Portal Models
          'Homework', 'HomeworkAttachment', 'HomeworkSubmission',
          'Notice', 'NoticeAttachment',
          'CommunicationThread', 'CommunicationMessage',
          'Notification', 'DeviceToken',
          // SaaS Control Center Models
          'Subscription', 'SaaSInvoice', 'SupportTicket'
        ];

        // Only inject tenantId filter if we have a current tenant context active and the model needs isolation
        if (tenantIsolatedModels.includes(model)) {
          const context = tenantStorage.getStore();
          if (context?.tenantId) {
            // Only inject where clause for operations that support it
            const operationsWithWhere = ['findUnique', 'findUniqueOrThrow', 'findFirst', 'findFirstOrThrow', 'findMany', 'update', 'updateMany', 'delete', 'deleteMany', 'aggregate', 'groupBy', 'count', 'upsert'];
            if (operationsWithWhere.includes(operation)) {
              // Safe assignment for where parameters
              args.where = args.where || {};
              args.where.tenantId = context.tenantId;
            }

            // Auto-populate tenantId for write operations
            if (operation === 'create' && args.data) {
              args.data.tenantId = context.tenantId;
            } else if (operation === 'createMany' && args.data) {
              if (Array.isArray(args.data)) {
                args.data = args.data.map((item: any) => ({
                  ...item,
                  tenantId: context.tenantId,
                }));
              } else {
                args.data.tenantId = context.tenantId;
              }
            } else if (operation === 'update' && args.data) {
              // Ensure we don't allow changing tenantId on updates
              delete args.data.tenantId;
            } else if (operation === 'updateMany' && args.data) {
              delete args.data.tenantId;
            }
          }
        }

        const start = performance.now();
        const result = await query(args);
        const duration = performance.now() - start;

        if (duration > 50) {
          console.warn(`[SLOW_QUERY] ${model}.${operation} took ${duration.toFixed(2)}ms`);
          const { alertManager } = require('../lib/alerting');
          alertManager.send({
            title: 'Database Slow Query Detected',
            message: `${model}.${operation} took ${duration.toFixed(2)}ms`,
            severity: 'WARNING',
            metadata: { model, operation, duration }
          }).catch(console.error);
        }

        // Elasticsearch Sync Logic
        const searchSyncModels = ['Student']; // Expand to others as needed
        if (searchSyncModels.includes(model)) {
          // Import here to avoid circular dependency in some setups, or rely on hoisting if safe
          const { searchQueue } = require('../lib/queueManager');
          
          if (operation === 'create' || operation === 'update') {
            searchQueue.add('index-entity', {
              entity: model.toLowerCase() + 's', // e.g. students
              operation: 'upsert',
              id: result.id,
              payload: result
            }).catch(console.error);
          } else if (operation === 'delete') {
            searchQueue.add('index-entity', {
              entity: model.toLowerCase() + 's',
              operation: 'delete',
              id: args.where.id
            }).catch(console.error);
          }
        }

        return result;
      },
    },
  },
}) as any;

export default prisma;
