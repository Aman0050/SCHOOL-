import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { HeartPulse, AlertTriangle, MessageSquare, ShieldCheck } from 'lucide-react';

export const CustomerSuccessDashboard: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Success Hub</h1>
          <p className="text-sm text-slate-500">Monitor school health, adoption rates, and prevent churn.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-t-4 border-emerald-500">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Global Health Score</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
              <HeartPulse className="w-6 h-6 text-emerald-500" /> 88/100
            </h3>
            <p className="text-xs text-slate-400 mt-2">Overall customer satisfaction is healthy</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-rose-500">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">At-Risk Schools</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-rose-500" /> 3 Schools
            </h3>
            <p className="text-xs text-slate-400 mt-2">Low login activity in last 14 days</p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-blue-500">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Open Support Tickets</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-500" /> 18
            </h3>
            <p className="text-xs text-slate-400 mt-2">Avg response time: 2 hours</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>School Adoption Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-4 font-semibold">School Name</th>
                  <th className="p-4 font-semibold">Subscription</th>
                  <th className="p-4 font-semibold">Teacher Activity</th>
                  <th className="p-4 font-semibold">Parent App Adoption</th>
                  <th className="p-4 font-semibold">Health Score</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500"/> Greenfield High</td>
                  <td className="p-4"><span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">PRO</span></td>
                  <td className="p-4 text-emerald-600 font-medium">High (95%)</td>
                  <td className="p-4">82%</td>
                  <td className="p-4 text-emerald-600 font-bold">98</td>
                </tr>
                <tr className="border-b bg-rose-50/50 dark:bg-rose-500/10">
                  <td className="p-4 font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-rose-500"/> Oakwood Academy</td>
                  <td className="p-4"><span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">STARTER</span></td>
                  <td className="p-4 text-rose-600 font-medium">Low (20%)</td>
                  <td className="p-4">12%</td>
                  <td className="p-4 text-rose-600 font-bold">45</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSuccessDashboard;
