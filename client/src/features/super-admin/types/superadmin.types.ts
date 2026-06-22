// Super Admin SaaS Control Center Types

export interface SaaSMetrics {
  totalSchools: number;
  activeSchools: number;
  trialSchools: number;
  expiredSchools: number;
  mrr: number;
  arr: number;
  totalStudents: number;
}

export interface SaaSPlan {
  id: string;
  name: string;
  tier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  priceMonthly: number;
  priceAnnual: number;
  maxStudents: number;
  features: string[];
}

export interface TenantSchool {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  isActive: boolean;
  createdAt: string;
  _count: { users: number };
  subscription: {
    status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
    plan: SaaSPlan;
    startDate: string;
    endDate: string;
  } | null;
}

export interface GlobalInvoice {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt?: string;
  tenant: { name: string };
  subscription: {
    plan: SaaSPlan;
  };
}

export interface SupportTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  tenant: { name: string };
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: { firstName: string; lastName: string; role: string };
}
