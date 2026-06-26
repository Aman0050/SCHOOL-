import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useAuth } from '../../auth/authContext';
import { useFinanceLayoutStore } from '../store/useFinanceLayoutStore';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { PageSkeleton } from '../../../components/ui/skeletons/PageSkeleton';

// Components
import { FinanceExecutiveHero } from './dashboard/FinanceExecutiveHero';
import { CollectionHealth } from './dashboard/CollectionHealth';
import { FeeAnalyticsCharts } from './dashboard/FeeAnalyticsCharts';
import { PaymentMethodsAnalytics } from './dashboard/PaymentMethodsAnalytics';
import { RevenueIntelligence } from './dashboard/RevenueIntelligence';
import { RecentTransactionsFeed } from './dashboard/RecentTransactionsFeed';
import { InstallmentManager } from './dashboard/InstallmentManager';

const ResponsiveGridLayout = WidthProvider(Responsive);

export const AccountantDashboard = () => {
  const { user } = useAuth();
  const { layout, saveLayout, resetLayout } = useFinanceLayoutStore(user?.id || 'default');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['feeStats'],
    queryFn: () => api.get('/fees/stats').then(res => res.data.data)
  });

  const onLayoutChange = (newLayout: any) => {
    saveLayout(newLayout);
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Finance Operations Center</h2>

      </div>

      <ResponsiveGridLayout
        className="layout"
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        draggableHandle=".drag-handle"
        isDraggable={false}
        isResizable={false}
        margin={[16, 16]}
      >
        <div key="financeHero" data-grid={{ x: 0, y: 0, w: 12, h: 3, static: true }}>
          <FinanceExecutiveHero stats={stats} />
        </div>
        <div key="healthScore" data-grid={{ x: 0, y: 3, w: 4, h: 3 }} className="h-full"><CollectionHealth stats={stats} /></div>
        <div key="revenueIntel" data-grid={{ x: 4, y: 3, w: 8, h: 3 }} className="h-full"><RevenueIntelligence stats={stats} /></div>
        <div key="collectionTrends" data-grid={{ x: 0, y: 6, w: 8, h: 4 }} className="h-full"><FeeAnalyticsCharts /></div>
        <div key="paymentMethods" data-grid={{ x: 8, y: 6, w: 4, h: 4 }} className="h-full"><PaymentMethodsAnalytics methods={stats?.paymentMethods} /></div>
        <div key="recentTransactions" data-grid={{ x: 0, y: 10, w: 6, h: 5 }} className="h-full"><RecentTransactionsFeed /></div>
        <div key="installmentManager" data-grid={{ x: 6, y: 10, w: 6, h: 5 }} className="h-full"><InstallmentManager /></div>
      </ResponsiveGridLayout>
    </div>
  );
};

export default AccountantDashboard;

