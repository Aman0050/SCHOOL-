import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { CreditCard, Download, FileText, CheckCircle } from 'lucide-react';

export const BillingDashboard: React.FC = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subscription & Billing</h1>
          <p className="text-sm text-slate-500">Manage your plan, invoices, and payment methods.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 border-primary/30 dark:border-primary/30 shadow-sm">
          <CardHeader className="bg-primary/10 dark:bg-primary/10 border-b border-primary/30 dark:border-primary/30 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Current Plan</p>
                <CardTitle className="text-2xl mt-1">Enterprise Annual</CardTitle>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">$4,990</p>
                <p className="text-xs text-slate-500">per year</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Status</p>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 font-bold rounded flex items-center w-fit gap-1">
                  <CheckCircle className="w-3 h-3" /> ACTIVE
                </span>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Next Billing Date</p>
                <p className="font-semibold">Oct 15, 2027</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Student Quota</p>
                <p className="font-semibold">Unlimited</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">White Label</p>
                <p className="font-semibold">Enabled</p>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button>Change Plan</Button>
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">Cancel Subscription</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded">
                <CreditCard className="w-6 h-6 text-slate-600 dark:text-slate-300" />
              </div>
              <div>
                <p className="font-bold text-sm">•••• •••• •••• 4242</p>
                <p className="text-xs text-slate-500">Expires 12/28</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">Update Payment Method</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Invoice ID</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Download</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map(i => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="p-4 text-slate-600">Oct 15, 202{7-i}</td>
                    <td className="p-4 font-mono text-xs">INV-{1042-i}</td>
                    <td className="p-4 font-semibold">$4,990.00</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">PAID</span>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Download className="w-3 h-3" /> PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingDashboard;
