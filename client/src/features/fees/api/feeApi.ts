import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import type {
  FeeCategory,
  FeeStructure,
  StudentFeeAssignment,
  FeeCollection,
  FineRecord,
  FeeDiscount,
  FinancialLedgerEntry,
  DashboardStats,
  CreateCategoryPayload,
  CreateStructurePayload,
  CreateAssignmentPayload,
  RecordPaymentPayload,
  CreateFinePayload,
  CreateDiscountPayload,
  ApplyDiscountPayload,
  RazorpayOrderPayload,
  VerifyRazorpayPayload,
} from '../types/fee.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const feeApi = {
  // Dashboard
  getDashboardStats: () =>
    api.get<{ data: DashboardStats }>('/fees/dashboard/stats').then((r) => r.data.data),

  // Categories
  getCategories: () =>
    api.get<{ data: FeeCategory[] }>('/fees/categories').then((r) => r.data.data),
  createCategory: (payload: CreateCategoryPayload) =>
    api.post<{ data: FeeCategory }>('/fees/categories', payload).then((r) => r.data.data),
  updateCategory: (id: string, payload: Partial<CreateCategoryPayload> & { isActive?: boolean }) =>
    api.patch<{ data: FeeCategory }>(`/fees/categories/${id}`, payload).then((r) => r.data.data),
  deleteCategory: (id: string) =>
    api.delete(`/fees/categories/${id}`),

  // Structures
  getStructures: () =>
    api.get<{ data: FeeStructure[] }>('/fees/structures').then((r) => r.data.data),
  createStructure: (payload: CreateStructurePayload) =>
    api.post<{ data: FeeStructure }>('/fees/structures', payload).then((r) => r.data.data),
  updateStructure: (id: string, payload: Partial<CreateStructurePayload> & { isActive?: boolean }) =>
    api.patch<{ data: FeeStructure }>(`/fees/structures/${id}`, payload).then((r) => r.data.data),
  deleteStructure: (id: string) =>
    api.delete(`/fees/structures/${id}`),

  // Assignments
  getAssignments: (params?: { status?: string; academicYear?: string }) =>
    api.get<{ data: StudentFeeAssignment[] }>('/fees/assignments', { params }).then((r) => r.data.data),
  getStudentAssignment: (studentId: string) =>
    api.get<{ data: StudentFeeAssignment[] }>(`/fees/assignments/student/${studentId}`).then((r) => r.data.data),
  createAssignment: (payload: CreateAssignmentPayload) =>
    api.post<{ data: StudentFeeAssignment }>('/fees/assignments', payload).then((r) => r.data.data),

  // Collections
  getCollections: (params?: { startDate?: string; endDate?: string; method?: string }) =>
    api.get<{ data: FeeCollection[] }>('/fees/collections', { params }).then((r) => r.data.data),
  createCollection: (payload: { assignmentId: string; remarks?: string }) =>
    api.post<{ data: FeeCollection }>('/fees/collections', payload).then((r) => r.data.data),
  recordPayment: (collectionId: string, payload: RecordPaymentPayload) =>
    api.post<{ data: FeeCollection }>(`/fees/collections/${collectionId}/payments`, payload).then((r) => r.data.data),
  getReceipt: (collectionId: string) =>
    api.get<{ data: FeeCollection }>(`/fees/collections/${collectionId}/receipt`).then((r) => r.data.data),

  // Fines
  getFines: (params?: { isPaid?: boolean; studentId?: string }) =>
    api.get<{ data: FineRecord[] }>('/fees/fines', { params }).then((r) => r.data.data),
  createFine: (payload: CreateFinePayload) =>
    api.post<{ data: FineRecord }>('/fees/fines', payload).then((r) => r.data.data),
  updateFine: (id: string, payload: { isPaid?: boolean; waivedBy?: string }) =>
    api.patch<{ data: FineRecord }>(`/fees/fines/${id}`, payload).then((r) => r.data.data),

  // Discounts
  getDiscounts: () =>
    api.get<{ data: FeeDiscount[] }>('/fees/discounts').then((r) => r.data.data),
  createDiscount: (payload: CreateDiscountPayload) =>
    api.post<{ data: FeeDiscount }>('/fees/discounts', payload).then((r) => r.data.data),
  applyDiscount: (payload: ApplyDiscountPayload) =>
    api.post('/fees/discounts/apply', payload).then((r) => r.data.data),

  // Reports
  getDueReport: (params?: { academicYear?: string; status?: string }) =>
    api.get<{ data: StudentFeeAssignment[] }>('/fees/reports/due', { params }).then((r) => r.data.data),
  getCollectionReport: (params?: { startDate?: string; endDate?: string; method?: string }) =>
    api.get<{ data: FeeCollection[] }>('/fees/reports/collections', { params }).then((r) => r.data.data),
  getStudentLedger: (studentId: string) =>
    api.get<{ data: FinancialLedgerEntry[] }>(`/fees/ledger/student/${studentId}`).then((r) => r.data.data),
  getLedger: (params?: { type?: string }) =>
    api.get<{ data: FinancialLedgerEntry[] }>('/fees/ledger', { params }).then((r) => r.data.data),

  // Razorpay
  createRazorpayOrder: (payload: RazorpayOrderPayload) =>
    api.post('/fees/payments/razorpay/order', payload).then((r) => r.data.data),
  verifyRazorpayPayment: (payload: VerifyRazorpayPayload) =>
    api.post('/fees/payments/razorpay/verify', payload).then((r) => r.data.data),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const useFeeDashboardStats = () =>
  useQuery({
    queryKey: ['fees', 'dashboard'],
    queryFn: feeApi.getDashboardStats,
  });

// ─── Categories ───────────────────────────────────────────────────────────────
export const useFeeCategories = () =>
  useQuery({
    queryKey: ['fees', 'categories'],
    queryFn: feeApi.getCategories,
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: feeApi.createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fees', 'categories'] }),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateCategoryPayload> & { isActive?: boolean } }) =>
      feeApi.updateCategory(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fees', 'categories'] }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => feeApi.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fees', 'categories'] }),
  });
};

// ─── Structures ───────────────────────────────────────────────────────────────
export const useFeeStructures = () =>
  useQuery({
    queryKey: ['fees', 'structures'],
    queryFn: feeApi.getStructures,
  });

export const useCreateStructure = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: feeApi.createStructure,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fees', 'structures'] }),
  });
};

export const useUpdateStructure = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateStructurePayload> & { isActive?: boolean } }) =>
      feeApi.updateStructure(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fees', 'structures'] }),
  });
};

export const useDeleteStructure = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => feeApi.deleteStructure(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fees', 'structures'] }),
  });
};

// ─── Assignments ──────────────────────────────────────────────────────────────
export const useFeeAssignments = (params?: { status?: string; academicYear?: string }) =>
  useQuery({
    queryKey: ['fees', 'assignments', params],
    queryFn: () => feeApi.getAssignments(params),
  });

export const useStudentAssignments = (studentId: string) =>
  useQuery({
    queryKey: ['fees', 'assignments', 'student', studentId],
    queryFn: () => feeApi.getStudentAssignment(studentId),
    enabled: !!studentId,
  });

export const useCreateAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: feeApi.createAssignment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fees', 'assignments'] });
      qc.invalidateQueries({ queryKey: ['fees', 'dashboard'] });
    },
  });
};

// ─── Collections ──────────────────────────────────────────────────────────────
export const useFeeCollections = (params?: { startDate?: string; endDate?: string; method?: string }) =>
  useQuery({
    queryKey: ['fees', 'collections', params],
    queryFn: () => feeApi.getCollections(params),
  });

export const useCreateCollection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: feeApi.createCollection,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fees', 'collections'] });
      qc.invalidateQueries({ queryKey: ['fees', 'dashboard'] });
    },
  });
};

export const useRecordPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, payload }: { collectionId: string; payload: RecordPaymentPayload }) =>
      feeApi.recordPayment(collectionId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fees', 'collections'] });
      qc.invalidateQueries({ queryKey: ['fees', 'assignments'] });
      qc.invalidateQueries({ queryKey: ['fees', 'dashboard'] });
    },
  });
};

export const useFeeReceipt = (collectionId: string) =>
  useQuery({
    queryKey: ['fees', 'receipt', collectionId],
    queryFn: () => feeApi.getReceipt(collectionId),
    enabled: !!collectionId,
  });

// ─── Fines ────────────────────────────────────────────────────────────────────
export const useFines = (params?: { isPaid?: boolean; studentId?: string }) =>
  useQuery({
    queryKey: ['fees', 'fines', params],
    queryFn: () => feeApi.getFines(params),
  });

export const useCreateFine = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: feeApi.createFine,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fees', 'fines'] });
      qc.invalidateQueries({ queryKey: ['fees', 'dashboard'] });
    },
  });
};

export const useUpdateFine = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { isPaid?: boolean; waivedBy?: string } }) =>
      feeApi.updateFine(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fees', 'fines'] });
      qc.invalidateQueries({ queryKey: ['fees', 'dashboard'] });
    },
  });
};

// ─── Discounts ────────────────────────────────────────────────────────────────
export const useDiscounts = () =>
  useQuery({
    queryKey: ['fees', 'discounts'],
    queryFn: feeApi.getDiscounts,
  });

export const useCreateDiscount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: feeApi.createDiscount,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fees', 'discounts'] }),
  });
};

export const useApplyDiscount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: feeApi.applyDiscount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fees', 'assignments'] });
      qc.invalidateQueries({ queryKey: ['fees', 'dashboard'] });
    },
  });
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const useDueReport = (params?: { academicYear?: string; status?: string }) =>
  useQuery({
    queryKey: ['fees', 'reports', 'due', params],
    queryFn: () => feeApi.getDueReport(params),
  });

export const useCollectionReport = (params?: { startDate?: string; endDate?: string; method?: string }) =>
  useQuery({
    queryKey: ['fees', 'reports', 'collections', params],
    queryFn: () => feeApi.getCollectionReport(params),
  });

export const useStudentLedger = (studentId: string) =>
  useQuery({
    queryKey: ['fees', 'ledger', 'student', studentId],
    queryFn: () => feeApi.getStudentLedger(studentId),
    enabled: !!studentId,
  });

export const useLedger = (params?: { type?: string }) =>
  useQuery({
    queryKey: ['fees', 'ledger', params],
    queryFn: () => feeApi.getLedger(params),
  });

// ─── Razorpay ─────────────────────────────────────────────────────────────────
export const useCreateRazorpayOrder = () => {
  return useMutation({
    mutationFn: feeApi.createRazorpayOrder,
  });
};

export const useVerifyRazorpayPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: feeApi.verifyRazorpayPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fees', 'collections'] });
      qc.invalidateQueries({ queryKey: ['fees', 'assignments'] });
      qc.invalidateQueries({ queryKey: ['fees', 'dashboard'] });
    },
  });
};

export default feeApi;
