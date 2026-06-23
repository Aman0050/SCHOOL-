import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Keep data fresh on tab switch
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 2,
      staleTime: 1 * 60 * 1000, // 1 minute (stale fast, fetch fast)
      gcTime: 15 * 60 * 1000, // 15 minutes memory cache
    },
  },
});

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
