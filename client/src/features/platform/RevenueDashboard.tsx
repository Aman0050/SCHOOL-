import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { IndianRupee, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export const RevenueDashboard: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Revenue Operations</h1>
          <p className="text-sm text-slate-500">Monitor MRR, ARR, and financial growth across all schools.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-t-4 border-emerald-500">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Monthly Recurring Revenue (MRR)</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-1">
              <IndianRupee className="w-6 h-6" /> 12.4L
            </h3>
            <div className="flex items-center text-sm mt-4 text-emerald-600">
              <ArrowUpRight className="w-4 h-4 mr-1" /> +14% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-primary/30">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Annual Recurring Revenue (ARR)</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-1">
              <IndianRupee className="w-6 h-6" /> 1.48Cr
            </h3>
            <div className="flex items-center text-sm mt-4 text-emerald-600">
              <ArrowUpRight className="w-4 h-4 mr-1" /> +22% YoY
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-primary/30">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Active Subscriptions</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" /> 142
            </h3>
            <div className="flex items-center text-sm mt-4 text-emerald-600">
              <ArrowUpRight className="w-4 h-4 mr-1" /> +8 new this month
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-rose-500">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Churn Rate</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
              <Activity className="w-6 h-6 text-rose-500" /> 1.2%
            </h3>
            <div className="flex items-center text-sm mt-4 text-emerald-600">
              <ArrowDownRight className="w-4 h-4 mr-1" /> -0.3% improvement
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Enterprise ($499/mo)</span>
                <span className="font-bold">42 Schools</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Professional ($199/mo)</span>
                <span className="font-bold">65 Schools</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-200">Starter ($99/mo)</span>
                <span className="font-bold">35 Schools</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-semibold text-sm">Delhi Public School - Subscription Renewal</p>
                    <p className="text-xs text-slate-500">Invoice #INV-{1024 + i}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">+$499.00</p>
                    <p className="text-xs text-slate-400">Paid • Today</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RevenueDashboard;
