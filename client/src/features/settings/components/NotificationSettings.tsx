import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/authContext';
import { useSettings } from '../hooks/useSettings';
import { Bell, Loader2 } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';

export const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const { updateNotifications } = useSettings();

  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: false,
    attendanceAlerts: true,
    feeAlerts: true,
    resultAlerts: true
  });

  useEffect(() => {
    if (user?.preferences) {
      setPrefs({ ...prefs, ...(user.preferences as any) });
    }
  }, [user]);

  const handleToggle = (key: keyof typeof prefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    updateNotifications.mutate(newPrefs);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Communication Preferences</h3>
          <p className="text-sm text-slate-500">Control how and when you receive alerts from EduXeno.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Delivery Channels</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300">Email Notifications</p>
                <p className="text-xs text-slate-500">Receive important updates via email</p>
              </div>
              <Switch.Root 
                checked={prefs.emailNotifications} onCheckedChange={() => handleToggle('emailNotifications')}
                className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative data-[state=checked]:bg-teal-500 outline-none cursor-default transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300">SMS Notifications</p>
                <p className="text-xs text-slate-500">Receive text messages for urgent alerts</p>
              </div>
              <Switch.Root 
                checked={prefs.smsNotifications} onCheckedChange={() => handleToggle('smsNotifications')}
                className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative data-[state=checked]:bg-teal-500 outline-none cursor-default transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-300">WhatsApp Integration</p>
                <p className="text-xs text-slate-500">Receive alerts via WhatsApp</p>
              </div>
              <Switch.Root 
                checked={prefs.whatsappNotifications} onCheckedChange={() => handleToggle('whatsappNotifications')}
                className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative data-[state=checked]:bg-teal-500 outline-none cursor-default transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Alert Types</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Switch.Root checked={prefs.attendanceAlerts} onCheckedChange={() => handleToggle('attendanceAlerts')} className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full relative data-[state=checked]:bg-primary outline-none cursor-default transition-colors">
                <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform duration-100 translate-x-0.5 data-[state=checked]:translate-x-[18px]" />
              </Switch.Root>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Attendance Alerts</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch.Root checked={prefs.feeAlerts} onCheckedChange={() => handleToggle('feeAlerts')} className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full relative data-[state=checked]:bg-primary outline-none cursor-default transition-colors">
                <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform duration-100 translate-x-0.5 data-[state=checked]:translate-x-[18px]" />
              </Switch.Root>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Fee Payment Reminders</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch.Root checked={prefs.resultAlerts} onCheckedChange={() => handleToggle('resultAlerts')} className="w-9 h-5 bg-slate-200 dark:bg-slate-700 rounded-full relative data-[state=checked]:bg-primary outline-none cursor-default transition-colors">
                <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform duration-100 translate-x-0.5 data-[state=checked]:translate-x-[18px]" />
              </Switch.Root>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Exam Results Published</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
