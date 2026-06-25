import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportApi } from '../api/supportApi';
import toast from 'react-hot-toast';

export const useSupport = () => {
  const queryClient = useQueryClient();

  const useTickets = () => useQuery({
    queryKey: ['support', 'tickets'],
    queryFn: supportApi.getTickets
  });

  const useTicketDetails = (id: string) => useQuery({
    queryKey: ['support', 'tickets', id],
    queryFn: () => supportApi.getTicketDetails(id),
    enabled: !!id
  });

  const useDashboardStats = () => useQuery({
    queryKey: ['support', 'dashboard-stats'],
    queryFn: supportApi.getDashboardStats
  });

  const useKnowledgeBase = (query?: string) => useQuery({
    queryKey: ['support', 'kb', query],
    queryFn: () => supportApi.searchKnowledgeBase(query)
  });

  const createTicket = useMutation({
    mutationFn: supportApi.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
      toast.success('Ticket created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create ticket');
    }
  });

  const updateTicket = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => supportApi.updateTicket(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support', 'tickets', variables.id] });
      toast.success('Ticket updated');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update ticket');
    }
  });

  const addMessage = useMutation({
    mutationFn: ({ id, content }: { id: string, content: string }) => supportApi.addMessage(id, { content }),
    // Optimistic UI can be handled in the component
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    }
  });

  return {
    useTickets,
    useTicketDetails,
    useDashboardStats,
    useKnowledgeBase,
    createTicket,
    updateTicket,
    addMessage
  };
};
