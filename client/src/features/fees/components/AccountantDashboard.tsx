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
        <button 
          onClick={resetLayout}
          className="text-sm text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors"
        >
          Reset Layout
        </button>
      </div>

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout as any }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onLayoutChange={onLayoutChange}
        draggableHandle=".drag-handle"
        isDraggable={true}
        isResizable={true}
        margin={[16, 16]}
      >
        <div key="financeHero" data-grid={{ x: 0, y: 0, w: 12, h: 2, static: true }}>
          <FinanceExecutiveHero stats={stats} />
        </div>
        <div key="healthScore" className="drag-handle cursor-move h-full"><CollectionHealth stats={stats} /></div>
        <div key="revenueIntel" className="drag-handle cursor-move h-full"><RevenueIntelligence stats={stats} /></div>
        <div key="collectionTrends" className="drag-handle cursor-move h-full"><FeeAnalyticsCharts /></div>
        <div key="paymentMethods" className="drag-handle cursor-move h-full"><PaymentMethodsAnalytics methods={stats?.paymentMethods} /></div>
        <div key="recentTransactions" className="drag-handle cursor-move h-full"><RecentTransactionsFeed /></div>
        <div key="installmentManager" className="drag-handle cursor-move h-full"><InstallmentManager /></div>
      </ResponsiveGridLayout>
    </div>
  );
};

export default AccountantDashboard;

