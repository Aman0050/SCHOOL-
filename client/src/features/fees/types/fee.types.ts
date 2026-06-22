export type FeeStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'WAIVED';
export type PaymentMethod = 'CASH' | 'UPI' | 'RAZORPAY' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CHEQUE';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type FineType = 'LATE_PAYMENT' | 'LIBRARY' | 'DAMAGE' | 'DISCIPLINE' | 'OTHER';
export type TransactionType = 'CREDIT' | 'DEBIT' | 'REFUND' | 'ADJUSTMENT';

export interface FeeCategory {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeeStructureItem {
  id: string;
  feeCategoryId: string;
  feeCategory: FeeCategory;
  amount: string;
  dueDate?: string;
  isOptional: boolean;
}

export interface FeeStructure {
  id: string;
  name: string;
  classId?: string;
  class?: { id: string; name: string };
  academicYear: string;
  totalAmount: string;
  isActive: boolean;
  items: FeeStructureItem[];
  createdAt: string;
}

export interface StudentInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  admission?: { admissionNumber: string };
}

export interface FeeDiscount {
  id: string;
  name: string;
  description?: string;
  type: DiscountType;
  value: string;
  isScholarship: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface StudentDiscount {
  id: string;
  appliedAmount: string;
  remarks?: string;
  discount: FeeDiscount;
  createdAt: string;
}

export interface FineRecord {
  id: string;
  type: FineType;
  amount: string;
  reason: string;
  isPaid: boolean;
  paidAt?: string;
  waivedBy?: string;
  student: StudentInfo;
  createdAt: string;
}

export interface PaymentInstallment {
  id: string;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paidAt: string;
  remarks?: string;
}

export interface FeeCollection {
  id: string;
  receiptNumber: string;
  totalAmount: string;
  paidAmount: string;
  status: FeeStatus;
  remarks?: string;
  student: StudentInfo;
  payments: PaymentInstallment[];
  assignment: StudentFeeAssignment;
  collectedByUser: { firstName: string; lastName: string };
  createdAt: string;
}

export interface StudentFeeAssignment {
  id: string;
  studentId: string;
  academicYear: string;
  totalAmount: string;
  discountAmount: string;
  fineAmount: string;
  paidAmount: string;
  dueAmount: string;
  status: FeeStatus;
  student: StudentInfo;
  feeStructure: FeeStructure;
  discounts: StudentDiscount[];
  fines: FineRecord[];
  collections: FeeCollection[];
  createdAt: string;
}

export interface FinancialLedgerEntry {
  id: string;
  referenceType: string;
  referenceId: string;
  description: string;
  type: TransactionType;
  amount: string;
  balance: string;
  student: StudentInfo;
  createdByUser: { firstName: string; lastName: string };
  createdAt: string;
}

export interface DashboardStats {
  totalAssigned: number;
  totalCollected: number;
  pendingCount: number;
  partialDue: number;
  outstandingFines: number;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

export interface CreateStructurePayload {
  name: string;
  academicYear: string;
  classId?: string;
  items: {
    feeCategoryId: string;
    amount: number;
    dueDate?: string;
    isOptional: boolean;
  }[];
}

export interface CreateAssignmentPayload {
  studentId: string;
  feeStructureId: string;
  academicYear: string;
}

export interface RecordPaymentPayload {
  assignmentId: string;
  amount: number;
  method: PaymentMethod;
  remarks?: string;
  transactionId?: string;
}

export interface CreateFinePayload {
  studentId: string;
  type: FineType;
  amount: number;
  reason: string;
}

export interface CreateDiscountPayload {
  name: string;
  description?: string;
  type: DiscountType;
  value: number;
  isScholarship: boolean;
}

export interface ApplyDiscountPayload {
  assignmentId: string;
  discountId: string;
  remarks?: string;
}

export interface RazorpayOrderPayload {
  amount: number;
  assignmentId: string;
}

export interface VerifyRazorpayPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  assignmentId: string;
}
