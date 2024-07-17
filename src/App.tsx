import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocatorWrapper } from './components/LocatorWrapper';

const queryClient = new QueryClient();

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LocatorWrapper />
    </QueryClientProvider>
  );
};
