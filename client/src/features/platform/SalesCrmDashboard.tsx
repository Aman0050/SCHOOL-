import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Phone, Mail, Calendar, CheckCircle, Target } from 'lucide-react';

export const SalesCrmDashboard: React.FC = () => {
  const pipeline = [
    { title: 'New Leads', count: 12, value: '₹1.2L' },
    { title: 'Demo Scheduled', count: 8, value: '₹3.4L' },
    { title: 'Proposal Sent', count: 5, value: '₹5.0L' },
    { title: 'Closed Won', count: 3, value: '₹2.8L' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sales Pipeline (CRM)</h1>
          <p className="text-sm text-slate-500">Track prospects and close enterprise deals.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <Target className="w-4 h-4" /> Add Lead
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {pipeline.map((stage, idx) => (
          <div key={idx} className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 min-h-[400px]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">{stage.title}</h3>
              <span className="text-xs font-semibold px-2 py-1 bg-white dark:bg-slate-700 rounded-full">{stage.count}</span>
            </div>
            
            {/* Mock Lead Card */}
            <Card className="mb-3 cursor-pointer hover:border-indigo-400 transition-colors">
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm">Sunrise Academy High</h4>
                <p className="text-xs text-slate-500 mt-1">Rajesh Sharma • Principal</p>
                <div className="flex gap-2 mt-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600"><Phone className="w-3 h-3" /></span>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-600"><Mail className="w-3 h-3" /></span>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600"><Calendar className="w-3 h-3" /></span>
                </div>
                <div className="mt-3 pt-3 border-t text-xs font-bold text-indigo-600">
                  Value: ₹45,000/yr
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesCrmDashboard;
