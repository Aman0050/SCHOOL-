import React, { useState } from 'react';
import { useAuth } from '../../auth/authContext';
import { useSettings } from '../hooks/useSettings';
import { Loader2, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export const SecuritySettings: React.FC = () => {
  const { user } = useAuth();
  const { changePassword } = useSettings();
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    changePassword.mutate(
      { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword },
      {
        onSuccess: () => {
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h3>
            <p className="text-sm text-slate-500">Ensure your account is using a long, random password.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Password</label>
            <input 
              type="password" required value={passwordData.currentPassword}
              onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition-shadow" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">New Password</label>
            <input 
              type="password" required value={passwordData.newPassword} minLength={8}
              onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition-shadow" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirm New Password</label>
            <input 
              type="password" required value={passwordData.confirmPassword} minLength={8}
              onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none transition-shadow" 
            />
          </div>
          <button 
            type="submit" disabled={changePassword.isPending}
            className="flex items-center gap-2 bg-primary hover:bg-primary disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-colors"
          >
            {changePassword.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
