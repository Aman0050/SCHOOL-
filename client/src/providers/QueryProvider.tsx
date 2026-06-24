import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Keep data fresh on tab switch
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 2,
      staleTime: 30 * 1000, // 30 seconds (fetch fast in background)
      gcTime: 24 * 60 * 60 * 1000, // 24 hours memory cache (instant navigation)
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
