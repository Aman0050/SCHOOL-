import { api } from '../../../lib/api';
import type { SaaSMetrics, TenantSchool, GlobalInvoice, SupportTicket } from '../types/superadmin.types';

export const superAdminApi = {
  getDashboardStats: () => api.get<{ success: boolean; data: any }>('/superadmin/dashboard').then(res => res.data.data),
  exportDashboard: (format: 'csv' | 'pdf') => api.get(`/superadmin/export/dashboard?format=${format}`, { responseType: 'blob' }).then(res => res.data),
  
  getTenants: () => api.get<{ success: boolean; data: TenantSchool[] }>('/superadmin/tenants').then(res => res.data.data),
  createTenant: (data: any) => api.post<{ success: boolean; data: TenantSchool }>('/superadmin/tenants', data).then(res => res.data.data),
  updateTenantStatus: (id: string, isActive: boolean) => api.patch(`/superadmin/tenants/${id}/status`, { isActive }).then(res => res.data.data),
  updateTenant: (id: string, data: any) => api.put<{ success: boolean; data: TenantSchool }>(`/superadmin/tenants/${id}`, data).then(res => res.data.data),
  deleteTenant: (id: string) => api.delete<{ success: boolean }>(`/superadmin/tenants/${id}`).then(res => res.data),
  resetAdminPassword: (userId: string) => api.post<{ success: boolean; tempPassword: string }>(`/superadmin/users/${userId}/reset-password`).then(res => res.data),

  getInvoices: () => api.get<{ success: boolean; data: GlobalInvoice[] }>('/superadmin/invoices').then(res => res.data.data),

  getTickets: () => api.get<{ success: boolean; data: SupportTicket[] }>('/superadmin/tickets').then(res => res.data.data),
  getTicketDetails: (id: string) => api.get<{ success: boolean; data: SupportTicket }>(`/superadmin/tickets/${id}`).then(res => res.data.data),
  replyToTicket: (id: string, content: string, status?: string) => api.post(`/superadmin/tickets/${id}/reply`, { content, status }).then(res => res.data.data),

  getAuditLogs: () => api.get<{ success: boolean; data: any[] }>('/superadmin/audit-logs').then(res => res.data.data),

  getDemoRequests: () => api.get<{ success: boolean; data: any[] }>('/superadmin/demo-requests').then(res => res.data.data),
  updateDemoRequestStatus: (id: string, status: string) => api.patch<{ success: boolean; data: any }>(`/superadmin/demo-requests/${id}/status`, { status }).then(res => res.data.data),
};
