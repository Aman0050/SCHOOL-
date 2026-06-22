import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../features/auth/authContext';

let socket: Socket | null = null;

export const useSocket = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Connect to WebSocket Server
    const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    socket = io(SERVER_URL, {
      auth: { token: localStorage.getItem('token') },
      query: { tenantId: user.tenantId }
    });

    socket.on('connect', () => {
      console.log('[Real-Time] Connected to cluster');
    });

    // ----------------------------------------------------
    // CACHE INVALIDATION EVENTS (Triggered by WebSockets)
    // ----------------------------------------------------

    socket.on('ATTENDANCE_MARKED', (data) => {
      // Instantly refresh attendance analytics
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    });

    socket.on('FEE_PAID', (data) => {
      // Instantly refresh fee ledgers and revenue dashboard
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['platform_revenue'] });
    });

    socket.on('STUDENT_UPDATED', () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    });

    return () => {
      socket?.disconnect();
    };
  }, [user, queryClient]);

  return socket;
};
