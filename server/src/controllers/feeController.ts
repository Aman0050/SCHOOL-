import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import { AppError } from '../errors/AppError';
import { logAudit } from '../services/auditService';
import { AuditAction } from '@prisma/client';
import { broadcastCacheInvalidation } from '../lib/socketManager';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { exportQueue } from '../workers/exportQueue';

// ==================== HELPERS ====================

async function generateReceiptNumber(tenantId: string): Promise<string> {
  const counter = await prisma.feeReceiptCounter.upsert({
    where: { tenantId },
    create: { tenantId, prefix: 'RCP', lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });
  const padded = String(counter.lastNumber).padStart(6, '0');
  return `${counter.prefix}-${new Date().getFullYear()}-${padded}`;
}

async function recalcAssignment(assignmentId: string): Promise<void> {
  const assignment = await prisma.studentFeeAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      collections: { include: { payments: true } },
      discounts: true,
      fines: { where: { isPaid: false } },
    },
  });
  if (!assignment) return;

  const totalPaid = assignment.collections.reduce((sum, c) => {
    const collPaid = c.payments
      .filter((p) => p.status === 'SUCCESS')
      .reduce((s, p) => s + Number(p.amount), 0);
    return sum + collPaid;
  }, 0);

  const totalFines = assignment.fines.reduce((s, f) => s + Number(f.amount), 0);
  const netDue =
    Number(assignment.totalAmount) -
    Number(assignment.discountAmount) +
    totalFines -
    totalPaid;

  let status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' = 'PENDING';
  if (totalPaid === 0) {
    status = 'PENDING';
  } else if (netDue <= 0) {
    status = 'PAID';
  } else {
    status = 'PARTIAL';
  }

  await prisma.studentFeeAssignment.update({
    where: { id: assignmentId },
    data: {
      paidAmount: new Prisma.Decimal(totalPaid),
      fineAmount: new Prisma.Decimal(totalFines),
      dueAmount: new Prisma.Decimal(Math.max(0, netDue)),
      status,
    },
  });
}

// ==================== FEE CATEGORIES ====================

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const categories = await prisma.feeCategory.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: categories });
  } catch (e) {
    next(e);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { name, description } = req.body;
    if (!name) throw new AppError(400, 'VALIDATION_ERROR', 'Category name is required');

    const category = await prisma.feeCategory.create({
      data: { tenantId, name, description },
    });
    res.status(201).json({ success: true, data: category });
  } catch (e) {
    next(e);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;
    const category = await prisma.feeCategory.update({
      where: { id },
      data: { name, description, isActive },
    });
    res.json({ success: true, data: category });
  } catch (e) {
    next(e);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.feeCategory.update({ where: { id }, data: { isActive: false } });
    res.json({ success: true, message: 'Category deactivated' });
  } catch (e) {
    next(e);
  }
};

// ==================== FEE STRUCTURES ====================

export const getStructures = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const structures = await prisma.feeStructure.findMany({
      where: { tenantId },
      include: {
        items: { include: { feeCategory: true } },
        class: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: structures });
  } catch (e) {
    next(e);
  }
};

export const createStructure = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { name, classId, academicYear, items } = req.body;

    if (!name || !academicYear) {
      throw new AppError(400, 'VALIDATION_ERROR', 'name and academicYear are required');
    }

    const itemList: Array<{
      feeCategoryId: string;
      amount: number;
      dueDate?: string;
      isOptional?: boolean;
    }> = items || [];

    const totalAmount = itemList.reduce((sum, i) => sum + Number(i.amount), 0);

    const structure = await prisma.$transaction(async (tx) => {
      const s = await tx.feeStructure.create({
        data: {
          tenantId,
          name,
          classId: classId || null,
          academicYear,
          totalAmount: new Prisma.Decimal(totalAmount),
        },
      });

      if (itemList.length > 0) {
        await tx.feeStructureItem.createMany({
          data: itemList.map((item) => ({
            tenantId,
            feeStructureId: s.id,
            feeCategoryId: item.feeCategoryId,
            amount: new Prisma.Decimal(item.amount),
            dueDate: item.dueDate ? new Date(item.dueDate) : null,
            isOptional: item.isOptional || false,
          })),
        });
      }

      return tx.feeStructure.findUnique({
        where: { id: s.id },
        include: { items: { include: { feeCategory: true } }, class: true },
      });
    });

    res.status(201).json({ success: true, data: structure });
  } catch (e) {
    next(e);
  }
};

export const updateStructure = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, academicYear, isActive } = req.body;
    const structure = await prisma.feeStructure.update({
      where: { id },
      data: { name, academicYear, isActive },
      include: { items: { include: { feeCategory: true } }, class: true },
    });
    res.json({ success: true, data: structure });
  } catch (e) {
    next(e);
  }
};

// ==================== FEE ASSIGNMENTS ====================

export const getAssignments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { studentId, status, academicYear } = req.query;

    const assignments = await prisma.studentFeeAssignment.findMany({
      where: {
        tenantId,
        ...(studentId ? { studentId: String(studentId) } : {}),
        ...(status ? { status: String(status) as any } : {}),
        ...(academicYear ? { academicYear: String(academicYear) } : {}),
      },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        feeStructure: {
          include: { items: { include: { feeCategory: true } } },
        },
        discounts: { include: { discount: true } },
        fines: true,
        collections: { include: { payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: assignments });
  } catch (e) {
    next(e);
  }
};

export const getStudentAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studentId } = req.params;

    const assignments = await prisma.studentFeeAssignment.findMany({
      where: { studentId },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        feeStructure: {
          include: { items: { include: { feeCategory: true } } },
        },
        discounts: { include: { discount: true } },
        fines: true,
        collections: { include: { payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: assignments });
  } catch (e) {
    next(e);
  }
};

export const createAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;
    const { studentId, feeStructureId, academicYear, installmentPlanId } = req.body;

    if (!studentId || !feeStructureId || !academicYear) {
      throw new AppError(400, 'VALIDATION_ERROR', 'studentId, feeStructureId, and academicYear are required');
    }

    const structure = await prisma.feeStructure.findUnique({ where: { id: feeStructureId } });
    if (!structure) throw new AppError(404, 'NOT_FOUND', 'Fee structure not found');

    const assignment = await prisma.studentFeeAssignment.create({
      data: {
        tenantId,
        studentId,
        feeStructureId,
        academicYear,
        installmentPlanId,
        totalAmount: structure.totalAmount,
        dueAmount: structure.totalAmount,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
        feeStructure: true,
      },
    });

    // Create initial ledger debit entry
    const lastLedger = await prisma.financialLedger.findFirst({
      where: { tenantId, studentId },
      orderBy: { createdAt: 'desc' },
    });
    const prevBalance = lastLedger ? Number(lastLedger.balance) : 0;

    await prisma.financialLedger.create({
      data: {
        tenantId,
        studentId,
        referenceType: 'ASSIGNMENT',
        referenceId: assignment.id,
        description: `Fee assigned: ${structure.name} (${academicYear})`,
        type: 'DEBIT',
        amount: structure.totalAmount,
        balance: new Prisma.Decimal(prevBalance + Number(structure.totalAmount)),
        createdBy: userId,
      },
    });

    // Generate Installments if installmentPlanId is provided
    if (installmentPlanId) {
      const plan = await prisma.feeInstallmentPlan.findUnique({ where: { id: installmentPlanId }});
      if (plan) {
         const amountPerInstallment = Number(structure.totalAmount) / plan.totalInstallments;
         const installments = [];
         let currentDate = new Date();
         for (let i = 0; i < plan.totalInstallments; i++) {
           let dueDate = new Date(currentDate);
           if (plan.intervalType === 'MONTHLY') dueDate.setMonth(dueDate.getMonth() + i);
           else if (plan.intervalType === 'QUARTERLY') dueDate.setMonth(dueDate.getMonth() + (i * 3));
           else if (plan.intervalType === 'HALF_YEARLY') dueDate.setMonth(dueDate.getMonth() + (i * 6));
           else if (plan.intervalType === 'ANNUALLY') dueDate.setFullYear(dueDate.getFullYear() + i);
           
           installments.push({
             tenantId,
             assignmentId: assignment.id,
             installmentPlanId,
             name: `Installment ${i + 1}`,
             amount: amountPerInstallment,
             dueDate,
           });
         }
         await prisma.feeInstallment.createMany({ data: installments });
      }
    }

    await logAudit(
      AuditAction.CREATE,
      'StudentFeeAssignment',
      assignment.id,
      null,
      { studentId, feeStructureId, totalAmount: structure.totalAmount },
      req
    );

    res.status(201).json({ success: true, data: assignment });
  } catch (e) {
    next(e);
  }
};

export const bulkCreateAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;
    const { studentIds, classId, feeStructureId, academicYear, installmentPlanId } = req.body;

    if (!feeStructureId || !academicYear) {
      throw new AppError(400, 'VALIDATION_ERROR', 'feeStructureId and academicYear are required');
    }

    const structure = await prisma.feeStructure.findUnique({ where: { id: feeStructureId } });
    if (!structure) throw new AppError(404, 'NOT_FOUND', 'Fee structure not found');

    let targetStudentIds: string[] = [];
    if (studentIds && studentIds.length > 0) {
      targetStudentIds = studentIds;
    } else if (classId) {
      const enrollments = await prisma.enrollment.findMany({ where: { classId, tenantId, status: 'ACTIVE' } });
      targetStudentIds = enrollments.map(e => e.studentId);
    } else {
      throw new AppError(400, 'VALIDATION_ERROR', 'Provide either studentIds array or a classId');
    }

    let plan = null;
    if (installmentPlanId) {
      plan = await prisma.feeInstallmentPlan.findUnique({ where: { id: installmentPlanId } });
    }

    const results = [];
    for (const sid of targetStudentIds) {
      try {
        const assignment = await prisma.studentFeeAssignment.create({
          data: {
            tenantId,
            studentId: sid,
            feeStructureId,
            academicYear,
            installmentPlanId,
            totalAmount: structure.totalAmount,
            dueAmount: structure.totalAmount,
          }
        });

        // Ledger
        const lastLedger = await prisma.financialLedger.findFirst({
          where: { tenantId, studentId: sid },
          orderBy: { createdAt: 'desc' },
        });
        const prevBalance = lastLedger ? Number(lastLedger.balance) : 0;

        await prisma.financialLedger.create({
          data: {
            tenantId,
            studentId: sid,
            referenceType: 'ASSIGNMENT',
            referenceId: assignment.id,
            description: `Fee assigned: ${structure.name} (${academicYear})`,
            type: 'DEBIT',
            amount: structure.totalAmount,
            balance: new Prisma.Decimal(prevBalance + Number(structure.totalAmount)),
            createdBy: userId,
          },
        });

        if (plan) {
           const amountPerInstallment = Number(structure.totalAmount) / plan.totalInstallments;
           const installments = [];
           let currentDate = new Date();
           for (let i = 0; i < plan.totalInstallments; i++) {
             let dueDate = new Date(currentDate);
             if (plan.intervalType === 'MONTHLY') dueDate.setMonth(dueDate.getMonth() + i);
             else if (plan.intervalType === 'QUARTERLY') dueDate.setMonth(dueDate.getMonth() + (i * 3));
             else if (plan.intervalType === 'HALF_YEARLY') dueDate.setMonth(dueDate.getMonth() + (i * 6));
             else if (plan.intervalType === 'ANNUALLY') dueDate.setFullYear(dueDate.getFullYear() + i);
             
             installments.push({
               tenantId,
               assignmentId: assignment.id,
               installmentPlanId,
               name: `Installment ${i + 1}`,
               amount: amountPerInstallment,
               dueDate,
             });
           }
           await prisma.feeInstallment.createMany({ data: installments });
        }
        
        // Push notification log
        await prisma.feeNotification.create({
          data: {
             tenantId,
             userId: sid,
             assignmentId: assignment.id,
             type: 'FEE_ASSIGNED',
             channel: 'EMAIL',
             status: 'PENDING'
          }
        });

        results.push({ studentId: sid, status: 'SUCCESS', assignmentId: assignment.id });
      } catch (err: any) {
        results.push({ studentId: sid, status: 'FAILED', error: err.message });
      }
    }

    res.status(201).json({ success: true, message: `Processed ${targetStudentIds.length} assignments`, data: results });
  } catch (e) {
    next(e);
  }
};

// ==================== FEE COLLECTIONS ====================

export const getCollections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { studentId } = req.query;

    const collections = await prisma.feeCollection.findMany({
      where: {
        tenantId,
        ...(studentId ? { studentId: String(studentId) } : {}),
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        payments: true,
        assignment: { include: { feeStructure: true } },
        collectedByUser: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: collections });
  } catch (e) {
    next(e);
  }
};

export const createCollection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;
    const { assignmentId, studentId, totalAmount, remarks } = req.body;

    if (!assignmentId || !studentId || totalAmount === undefined) {
      throw new AppError(400, 'VALIDATION_ERROR', 'assignmentId, studentId, and totalAmount are required');
    }

    const receiptNumber = await generateReceiptNumber(tenantId);

    const collection = await prisma.feeCollection.create({
      data: {
        tenantId,
        assignmentId,
        studentId,
        receiptNumber,
        totalAmount: new Prisma.Decimal(totalAmount),
        paidAmount: new Prisma.Decimal(0),
        status: 'PENDING',
        collectedBy: userId,
        remarks,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        assignment: { include: { feeStructure: true } },
      },
    });

    res.status(201).json({ success: true, data: collection });
  } catch (e) {
    next(e);
  }
};

export const recordPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;
    const { id: collectionId } = req.params;
    const {
      amount,
      method,
      transactionId,
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
      remarks,
    } = req.body;

    if (!amount || !method) {
      throw new AppError(400, 'VALIDATION_ERROR', 'amount and method are required');
    }

    let assignmentIdToRecalc = '';
    let studentIdForEmit = '';
    let receiptNumberForLedger = '';
    let oldPaidAmount: any;
    let oldStatus: any;

    const payment = await prisma.$transaction(async (tx) => {
      // Database-level row lock to prevent race conditions for concurrent identical requests
      await tx.$executeRaw`SELECT * FROM "FeeCollection" WHERE id = ${collectionId} FOR UPDATE`;

      // Re-fetch collection inside transaction
      const currentCollection = await tx.feeCollection.findUnique({
        where: { id: collectionId },
        include: { payments: true },
      });
      if (!currentCollection) throw new AppError(404, 'NOT_FOUND', 'Collection not found');

      if (gatewayPaymentId || transactionId) {
        const existing = await tx.paymentInstallment.findFirst({
          where: { OR: [
            { gatewayPaymentId: gatewayPaymentId || undefined },
            { transactionId: transactionId || undefined }
          ].filter(x => Object.values(x)[0] !== undefined) }
        });
        if (existing) throw new AppError(400, 'DUPLICATE_PAYMENT', 'A payment with this transaction or gateway ID already exists');
      }

      assignmentIdToRecalc = currentCollection.assignmentId;
      studentIdForEmit = currentCollection.studentId;
      receiptNumberForLedger = currentCollection.receiptNumber;
      oldPaidAmount = currentCollection.paidAmount;
      oldStatus = currentCollection.status;

      const p = await tx.paymentInstallment.create({
        data: {
          tenantId,
          collectionId,
          amount: new Prisma.Decimal(amount),
          method,
          status: 'SUCCESS',
          transactionId,
          gatewayOrderId,
          gatewayPaymentId,
          gatewaySignature,
          remarks,
        },
      });

      const previouslyPaid = currentCollection.payments
        .filter((pay) => pay.status === 'SUCCESS')
        .reduce((s, pay) => s + Number(pay.amount), 0);
      const totalPaid = previouslyPaid + Number(amount);
      const collectionStatus =
        totalPaid >= Number(currentCollection.totalAmount) ? 'PAID' : ('PARTIAL' as const);

      await tx.feeCollection.update({
        where: { id: collectionId },
        data: {
          paidAmount: new Prisma.Decimal(totalPaid),
          status: collectionStatus,
        },
      });

      // Ledger entry
      const lastLedger = await tx.financialLedger.findFirst({
        where: { tenantId, studentId: currentCollection.studentId },
        orderBy: { createdAt: 'desc' },
      });
      const prevBalance = lastLedger ? Number(lastLedger.balance) : 0;
      const newBalance = Math.max(0, prevBalance - Number(amount));

      await tx.financialLedger.create({
        data: {
          tenantId,
          studentId: currentCollection.studentId,
          referenceType: 'PAYMENT',
          referenceId: p.id,
          description: `Payment via ${method} - Receipt #${receiptNumberForLedger}`,
          type: 'CREDIT',
          amount: new Prisma.Decimal(amount),
          balance: new Prisma.Decimal(newBalance),
          createdBy: userId,
        },
      });

      return p;
    });

    await recalcAssignment(assignmentIdToRecalc);

    // Emit live activity feed for Finance Dashboard
    const student = await prisma.user.findUnique({
      where: { id: studentIdForEmit },
      include: { profile: true }
    });
    const studentName = student?.profile?.firstName ? `${student.profile.firstName} ${student.profile.lastName}` : 'Student';
    
    (req as any).io?.to(tenantId).emit('activity_feed', {
      type: 'FEE',
      text: `Fee Collection: ₹${amount} received from ${studentName}`,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    });

    await logAudit(
      AuditAction.UPDATE,
      'FeeCollection',
      collectionId,
      { paidAmount: oldPaidAmount, status: oldStatus },
      { paidAmount: Number(oldPaidAmount) + Number(amount), newPayment: amount },
      req
    );

    // Broadcast real-time invalidation
    broadcastCacheInvalidation(tenantId, ['fees']);
    broadcastCacheInvalidation(tenantId, ['studentStats']);
    broadcastCacheInvalidation(tenantId, ['dashboard']);

    res.json({ success: true, data: payment });
  } catch (e) {
    next(e);
  }
};

export const getReceipt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const collection = await prisma.feeCollection.findUnique({
      where: { id },
      include: {
        student: {
          include: { profile: true, admission: true },
        },
        payments: true,
        assignment: {
          include: {
            feeStructure: {
              include: {
                items: { include: { feeCategory: true } },
                class: true,
              },
            },
            discounts: { include: { discount: true } },
          },
        },
        collectedByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!collection) throw new AppError(404, 'NOT_FOUND', 'Receipt not found');
    res.json({ success: true, data: collection });
  } catch (e) {
    next(e);
  }
};

export const getReceiptPdf = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const collection = await prisma.feeCollection.findUnique({
      where: { id },
      include: {
        student: {
          include: { profile: true, admission: true },
        },
        payments: true,
        assignment: {
          include: {
            feeStructure: {
              include: {
                items: { include: { feeCategory: true } },
                class: true,
              },
            },
            discounts: { include: { discount: true } },
          },
        },
        collectedByUser: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!collection) throw new AppError(404, 'NOT_FOUND', 'Receipt not found');
    
    // Enqueue the job
    const job = await exportQueue.add('generate_fee_receipt', { 
      collectionId: id,
      tenantId: (req as any).tenantId,
      userId: req.user!.id
    });
    
    res.json({ success: true, jobId: job.id, message: 'Receipt generation queued' });
  } catch (e) {
    next(e);
  }
};

// ==================== RAZORPAY (SIMULATION OR REAL) ====================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_simulation',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret'
});

export const createRazorpayOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, currency = 'INR', collectionId } = req.body;

    if (!amount || !collectionId) {
      throw new AppError(400, 'VALIDATION_ERROR', 'amount and collectionId are required');
    }

    // Simulation mode fallback
    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_simulation') {
      const mockOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      return res.json({
        success: true,
        data: {
          id: mockOrderId,
          amount: Math.round(Number(amount) * 100), // paise
          currency,
          collectionId,
          mode: 'simulation',
          key: 'rzp_test_simulation',
        },
      });
    }

    // Real Razorpay Order Creation
    const options = {
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: `rcpt_${collectionId}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        collectionId,
        mode: 'production',
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const verifyRazorpayPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      collectionId,
      amount,
    } = req.body;

    const isSimulation = typeof razorpay_order_id === 'string' && razorpay_order_id.startsWith('order_sim_');

    if (!isSimulation) {
      if (!razorpay_signature) {
        throw new AppError(400, 'PAYMENT_VERIFICATION_FAILED', 'Payment verification signature missing');
      }
      
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'secret')
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
         throw new AppError(400, 'PAYMENT_VERIFICATION_FAILED', 'Invalid signature passed');
      }
    }

    const collection = await prisma.feeCollection.findUnique({
      where: { id: collectionId },
      include: { payments: true },
    });
    if (!collection) throw new AppError(404, 'NOT_FOUND', 'Collection not found');

    await prisma.$transaction(async (tx) => {
      const p = await tx.paymentInstallment.create({
        data: {
          tenantId,
          collectionId,
          amount: new Prisma.Decimal(amount),
          method: 'RAZORPAY',
          status: 'SUCCESS',
          gatewayOrderId: razorpay_order_id,
          gatewayPaymentId: razorpay_payment_id,
          gatewaySignature: razorpay_signature,
        },
      });

      const previouslyPaid = collection.payments
        .filter((p) => p.status === 'SUCCESS')
        .reduce((s, p) => s + Number(p.amount), 0);
      const totalPaid = previouslyPaid + Number(amount);
      const newStatus = totalPaid >= Number(collection.totalAmount) ? 'PAID' : ('PARTIAL' as const);

      await tx.feeCollection.update({
        where: { id: collectionId },
        data: {
          paidAmount: new Prisma.Decimal(totalPaid),
          status: newStatus,
        },
      });

      const lastLedger = await tx.financialLedger.findFirst({
        where: { tenantId, studentId: collection.studentId },
        orderBy: { createdAt: 'desc' },
      });
      const prevBal = lastLedger ? Number(lastLedger.balance) : 0;

      await tx.financialLedger.create({
        data: {
          tenantId,
          studentId: collection.studentId,
          referenceType: 'RAZORPAY',
          referenceId: p.id,
          description: `Razorpay payment - ${razorpay_payment_id ?? 'SIM'}`,
          type: 'CREDIT',
          amount: new Prisma.Decimal(amount),
          balance: new Prisma.Decimal(Math.max(0, prevBal - Number(amount))),
          createdBy: userId,
        },
      });
    });

    await recalcAssignment(collection.assignmentId);
    res.json({ success: true, message: 'Payment verified and recorded' });
  } catch (e) {
    next(e);
  }
};

// ==================== FINES ====================

export const getFines = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { studentId, isPaid } = req.query;

    const fines = await prisma.fineRecord.findMany({
      where: {
        tenantId,
        ...(studentId ? { studentId: String(studentId) } : {}),
        ...(isPaid !== undefined ? { isPaid: isPaid === 'true' } : {}),
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: fines });
  } catch (e) {
    next(e);
  }
};

export const createFine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;
    const { studentId, assignmentId, type, amount, reason } = req.body;

    if (!studentId || !type || !amount || !reason) {
      throw new AppError(400, 'VALIDATION_ERROR', 'studentId, type, amount, and reason are required');
    }

    const fine = await prisma.fineRecord.create({
      data: {
        tenantId,
        studentId,
        assignmentId: assignmentId || null,
        type,
        amount: new Prisma.Decimal(amount),
        reason,
        createdBy: userId,
      },
    });

    if (assignmentId) await recalcAssignment(assignmentId);

    // Ledger debit for fine
    const lastLedger = await prisma.financialLedger.findFirst({
      where: { tenantId, studentId },
      orderBy: { createdAt: 'desc' },
    });
    const prevBal = lastLedger ? Number(lastLedger.balance) : 0;

    await prisma.financialLedger.create({
      data: {
        tenantId,
        studentId,
        referenceType: 'FINE',
        referenceId: fine.id,
        description: `Fine: ${type} - ${reason}`,
        type: 'DEBIT',
        amount: new Prisma.Decimal(amount),
        balance: new Prisma.Decimal(prevBal + Number(amount)),
        createdBy: userId,
      },
    });

    res.status(201).json({ success: true, data: fine });
  } catch (e) {
    next(e);
  }
};

export const updateFine = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { isPaid, waive } = req.body;

    const fine = await prisma.fineRecord.findUnique({ where: { id } });
    if (!fine) throw new AppError(404, 'NOT_FOUND', 'Fine not found');

    const updated = await prisma.fineRecord.update({
      where: { id },
      data: {
        isPaid: waive ? fine.isPaid : (isPaid ?? fine.isPaid),
        paidAt: isPaid && !waive ? new Date() : fine.paidAt,
        waivedBy: waive ? userId : fine.waivedBy,
        waivedAt: waive ? new Date() : fine.waivedAt,
      },
    });

    if (fine.assignmentId) await recalcAssignment(fine.assignmentId);

    res.json({ success: true, data: updated });
  } catch (e) {
    next(e);
  }
};

// ==================== DISCOUNTS & SCHOLARSHIPS ====================

export const getDiscounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const discounts = await prisma.feeDiscount.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: discounts });
  } catch (e) {
    next(e);
  }
};

export const createDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { name, description, type, value, isScholarship } = req.body;

    if (!name || !type || value === undefined) {
      throw new AppError(400, 'VALIDATION_ERROR', 'name, type, and value are required');
    }

    const discount = await prisma.feeDiscount.create({
      data: {
        tenantId,
        name,
        description,
        type,
        value: new Prisma.Decimal(value),
        isScholarship: isScholarship || false,
      },
    });

    res.status(201).json({ success: true, data: discount });
  } catch (e) {
    next(e);
  }
};

export const applyDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const userId = req.user!.id;
    const { studentId, assignmentId, discountId, remarks } = req.body;

    if (!studentId || !assignmentId || !discountId) {
      throw new AppError(400, 'VALIDATION_ERROR', 'studentId, assignmentId, and discountId are required');
    }

    const [discount, assignment] = await Promise.all([
      prisma.feeDiscount.findUnique({ where: { id: discountId } }),
      prisma.studentFeeAssignment.findUnique({ where: { id: assignmentId } }),
    ]);

    if (!discount) throw new AppError(404, 'NOT_FOUND', 'Discount not found');
    if (!assignment) throw new AppError(404, 'NOT_FOUND', 'Fee assignment not found');

    let appliedAmount: number;
    if (discount.type === 'PERCENTAGE') {
      appliedAmount = (Number(assignment.totalAmount) * Number(discount.value)) / 100;
    } else {
      appliedAmount = Number(discount.value);
    }

    const studentDiscount = await prisma.$transaction(async (tx) => {
      const sd = await tx.studentDiscount.create({
        data: {
          tenantId,
          studentId,
          assignmentId,
          discountId,
          appliedAmount: new Prisma.Decimal(appliedAmount),
          appliedBy: userId,
          remarks,
        },
      });

      const newDiscountTotal = Number(assignment.discountAmount) + appliedAmount;
      const newDue = Math.max(
        0,
        Number(assignment.totalAmount) -
          newDiscountTotal -
          Number(assignment.paidAmount) +
          Number(assignment.fineAmount),
      );

      await tx.studentFeeAssignment.update({
        where: { id: assignmentId },
        data: {
          discountAmount: new Prisma.Decimal(newDiscountTotal),
          dueAmount: new Prisma.Decimal(newDue),
        },
      });

      const lastLedger = await tx.financialLedger.findFirst({
        where: { tenantId, studentId },
        orderBy: { createdAt: 'desc' },
      });
      const prevBal = lastLedger ? Number(lastLedger.balance) : 0;

      await tx.financialLedger.create({
        data: {
          tenantId,
          studentId,
          referenceType: 'DISCOUNT',
          referenceId: sd.id,
          description: `Discount applied: ${discount.name} (${discount.isScholarship ? 'Scholarship' : 'Discount'})`,
          type: 'ADJUSTMENT',
          amount: new Prisma.Decimal(appliedAmount),
          balance: new Prisma.Decimal(Math.max(0, prevBal - appliedAmount)),
          createdBy: userId,
        },
      });

      return sd;
    });

    res.status(201).json({ success: true, data: studentDiscount });
  } catch (e) {
    next(e);
  }
};

// ==================== REPORTS ====================

export const getDueReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { academicYear, status } = req.query;

    const assignments = await prisma.studentFeeAssignment.findMany({
      where: {
        tenantId,
        ...(academicYear ? { academicYear: String(academicYear) } : {}),
        status: status
          ? (String(status) as any)
          : { in: ['PENDING', 'PARTIAL', 'OVERDUE'] as any[] },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            admission: true,
          },
        },
        feeStructure: {
          select: {
            name: true,
            academicYear: true,
            class: { select: { name: true } },
          },
        },
        fines: { where: { isPaid: false } },
      },
      orderBy: { dueAmount: 'desc' },
    });

    const totalDue = assignments.reduce((s, a) => s + Number(a.dueAmount), 0);
    const totalFines = assignments.reduce(
      (s, a) => s + a.fines.reduce((f, fi) => f + Number(fi.amount), 0),
      0,
    );

    res.json({
      success: true,
      data: {
        assignments,
        summary: {
          totalStudents: assignments.length,
          totalDue,
          totalFines,
          grandTotal: totalDue + totalFines,
        },
      },
    });
  } catch (e) {
    next(e);
  }
};

export const getCollectionReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { from, to, method } = req.query;

    const payments = await prisma.paymentInstallment.findMany({
      where: {
        tenantId,
        status: 'SUCCESS',
        ...(method ? { method: String(method) as any } : {}),
        paidAt: {
          ...(from ? { gte: new Date(String(from)) } : {}),
          ...(to ? { lte: new Date(String(to)) } : {}),
        },
      },
      include: {
        collection: {
          include: {
            student: { select: { id: true, firstName: true, lastName: true } },
            assignment: {
              include: {
                feeStructure: { select: { name: true, academicYear: true } },
              },
            },
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    });

    const totalCollected = payments.reduce((s: number, p: any) => s + Number(p.amount), 0);
    const byMethod = payments.reduce(
      (acc: Record<string, number>, p: any) => {
        acc[p.method] = (acc[p.method] || 0) + Number(p.amount);
        return acc;
      },
      {},
    );

    res.json({
      success: true,
      data: {
        payments,
        summary: {
          totalCollected,
          totalTransactions: payments.length,
          byMethod,
        },
      },
    });
  } catch (e) {
    next(e);
  }
};

export const getLedger = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;
    const { studentId } = req.params;

    const entries = await prisma.financialLedger.findMany({
      where: { tenantId, studentId },
      include: {
        student: { select: { id: true, firstName: true, lastName: true } },
        createdByUser: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: entries });
  } catch (e) {
    next(e);
  }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.user!.tenantId;

    const [
      totalAssigned, 
      collected, 
      pendingCount, 
      partial, 
      outstandingFines,
      defaultersCount,
      payments
    ] = await Promise.all([
      prisma.studentFeeAssignment.aggregate({
        where: { tenantId },
        _sum: { totalAmount: true },
      }),
      prisma.studentFeeAssignment.aggregate({
        where: { tenantId, status: 'PAID' },
        _sum: { paidAmount: true },
      }),
      prisma.studentFeeAssignment.count({
        where: { tenantId, status: 'PENDING' },
      }),
      prisma.studentFeeAssignment.aggregate({
        where: { tenantId, status: 'PARTIAL' },
        _sum: { dueAmount: true },
      }),
      prisma.fineRecord.aggregate({
        where: { tenantId, isPaid: false },
        _sum: { amount: true },
      }),
      prisma.studentFeeAssignment.count({
        where: { tenantId, status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] } }
      }),
      prisma.paymentInstallment.findMany({
        where: { tenantId, status: 'SUCCESS' },
        select: { amount: true, method: true, createdAt: true }
      })
    ]);

    const assigned = Number(totalAssigned._sum.totalAmount || 0);
    const totalCollected = Number(collected._sum.paidAmount || 0);
    
    // Monthly collections
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyCollected = payments
      .filter((p: any) => p.createdAt.getMonth() === currentMonth && p.createdAt.getFullYear() === currentYear)
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      
    // Today's collection
    const todayStr = now.toDateString();
    const todayCollected = payments
      .filter((p: any) => p.createdAt.toDateString() === todayStr)
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    // Collection rate
    const collectionRate = assigned > 0 ? ((totalCollected / assigned) * 100).toFixed(1) : 0;
    
    // Financial Health Score
    let healthScore = 'Excellent';
    const rate = Number(collectionRate);
    if (rate < 50) healthScore = 'Critical';
    else if (rate < 75) healthScore = 'Warning';
    else if (rate < 90) healthScore = 'Good';

    // Payment Methods Breakdown
    const paymentMethods = payments.reduce((acc, curr) => {
      acc[curr.method] = (acc[curr.method] || 0) + Number(curr.amount);
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        totalAssigned: assigned,
        totalCollected: totalCollected,
        pendingCollection: assigned - totalCollected,
        overdueCollection: partial._sum.dueAmount || 0,
        collectionRate,
        todayCollected,
        monthlyCollected,
        outstandingFines: outstandingFines._sum.amount || 0,
        defaultersCount,
        healthScore,
        paymentMethods
      },
    });
  } catch (e) {
    next(e);
  }
};
