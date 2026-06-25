import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent massive API blasts on tab focus
      refetchOnMount: false, // Rely on staleTime for caching
      refetchOnReconnect: true,
      retry: 1,
      staleTime: 60 * 1000, // 1 minute stale time for enterprise stability
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
