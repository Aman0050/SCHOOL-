import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { 
  MessageSquare, 
  Send, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Smartphone, 
  Bell, 
  Users 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export const CommunicationDashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['communication-stats'],
    queryFn: () => api.get('/communication/stats').then(res => res.data.data)
  });

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse">Loading Analytics...</div>;
  }

  const statCards = [
    {
      title: "Total Sent Today",
      value: stats?.totalSentToday || 0,
      icon: <Send className="w-5 h-5 text-blue-500" />,
      color: "border-blue-500"
    },
    {
      title: "Delivery Rate",
      value: `${(stats?.deliveryRate || 0).toFixed(1)}%`,
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      color: "border-emerald-500"
    },
    {
      title: "Read Rate",
      value: `${(stats?.readRate || 0).toFixed(1)}%`,
      icon: <MessageSquare className="w-5 h-5 text-indigo-500" />,
      color: "border-indigo-500"
    },
    {
      title: "Failed Messages",
      value: stats?.failedMessages || 0,
      icon: <XCircle className="w-5 h-5 text-rose-500" />,
      color: "border-rose-500"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Communication Center</h1>
          <p className="text-sm text-slate-500">Real-time metrics for SMS, Email, and WhatsApp.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <Card key={i} className={`border-t-4 ${card.color} shadow-sm`}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{card.value}</h3>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-full">
                {card.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel Breakdown */}
        <Card className="col-span-1 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Channel Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-[#25D366]" />
                <span className="font-medium">WhatsApp</span>
              </div>
              <span className="font-bold">45%</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-blue-500" />
                <span className="font-medium">SMS</span>
              </div>
              <span className="font-bold">30%</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-rose-500" />
                <span className="font-medium">Email</span>
              </div>
              <span className="font-bold">15%</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-amber-500" />
                <span className="font-medium">Push</span>
              </div>
              <span className="font-bold">10%</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Mock */}
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Live Message Stream</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${i % 2 === 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20'}`}>
                      {i % 2 === 0 ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {i % 2 === 0 ? 'Fee Reminder Q3' : 'Attendance Alert'}
                      </p>
                      <p className="text-xs text-slate-500">To: Parent of Rahul Kumar</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium px-2 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
                      Delivered
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">Just now</p>
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

export default CommunicationDashboard;
