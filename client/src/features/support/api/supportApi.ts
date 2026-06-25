import api from '../../../lib/api';

export const supportApi = {
  createTicket: async (data: any) => {
    const res = await api.post('/support/tickets', data);
    return res.data;
  },
  getTickets: async () => {
    const res = await api.get('/support/tickets');
    return res.data.data;
  },
  getTicketDetails: async (id: string) => {
    const res = await api.get(`/support/tickets/${id}`);
    return res.data.data;
  },
  updateTicket: async (id: string, data: any) => {
    const res = await api.put(`/support/tickets/${id}/status`, data);
    return res.data;
  },
  addMessage: async (id: string, data: { content: string }) => {
    const res = await api.post(`/support/tickets/${id}/messages`, data);
    return res.data.data;
  },
  searchKnowledgeBase: async (query?: string) => {
    const res = await api.get('/support/knowledge-base', { params: { query } });
    return res.data.data;
  },
  getDashboardStats: async () => {
    const res = await api.get('/support/dashboard-stats');
    return res.data.data;
  }
};
