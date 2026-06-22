import React from 'react';
import { Shield, ShieldAlert, Key, Smartphone, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export const SecurityDashboard: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Security Center</h1>
          <p className="text-sm text-slate-500">Monitor threats, manage devices, and enforce policies.</p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold rounded-lg flex items-center gap-2">
          <Shield className="w-5 h-5" />
          School Trust Score: 98/100
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-t-4 border-indigo-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">MFA Adoption</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">84%</h3>
                <p className="text-xs text-slate-400 mt-1">Required for Admins</p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 rounded-full">
                <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-emerald-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Active Devices</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">1,420</h3>
                <p className="text-xs text-slate-400 mt-1">Across 3 OS platforms</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/20 rounded-full">
                <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-amber-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Failed Logins (24h)</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">12</h3>
                <p className="text-xs text-slate-400 mt-1">Normal baseline</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-500/20 rounded-full">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-rose-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">Critical Threats</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">0</h3>
                <p className="text-xs text-slate-400 mt-1">No active breaches</p>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-500/20 rounded-full">
                <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Recent Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 items-start pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 bg-amber-100 text-amber-600 dark:bg-amber-500/20 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Permission Denied</p>
                  <p className="text-xs text-slate-500">User 'Teacher A' attempted to access Finance Module.</p>
                </div>
                <span className="text-xs text-slate-400">10m ago</span>
              </div>
              <div className="flex gap-4 items-start pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="p-2 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">MFA Enabled</p>
                  <p className="text-xs text-slate-500">Principal enabled Two-Factor Authentication.</p>
                </div>
                <span className="text-xs text-slate-400">1h ago</span>
              </div>
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-rose-100 text-rose-600 dark:bg-rose-500/20 rounded-lg">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Multiple Failed Logins</p>
                  <p className="text-xs text-slate-500">5 failed attempts from IP 192.168.1.45 blocked.</p>
                </div>
                <span className="text-xs text-slate-400">3h ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="font-medium">Data Retention Policy</p>
                  <p className="text-xs text-slate-500">Active (7 Years Storage)</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">ENFORCED</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="font-medium">FERPA/GDPR Consent</p>
                  <p className="text-xs text-slate-500">Required on first login</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">ACTIVE</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityDashboard;
