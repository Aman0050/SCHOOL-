import React, { useState } from 'react';
import { useAuth } from '../../auth/authContext';
import { useSettings } from '../hooks/useSettings';
import { Loader2, Shield, Smartphone, Key, X, Check, Laptop, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../api/settingsApi';
import toast from 'react-hot-toast';

export const SecuritySettings: React.FC = () => {
  const { user } = useAuth();
  const { changePassword, disableMfa, revokeSession } = useSettings();
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [mfaSetup, setMfaSetup] = useState<{ secret: string, qrCode: string } | null>(null);
  const [mfaToken, setMfaToken] = useState('');
  const [showDisableMfaModal, setShowDisableMfaModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: settingsApi.getSessions
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

  const handleSetupMfa = async () => {
    try {
      const data = await settingsApi.setupMfa();
      setMfaSetup(data.data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to setup MFA');
    }
  };

  const handleVerifyMfa = async () => {
    if (!mfaToken || mfaToken.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    try {
      const res = await settingsApi.verifyMfa({ token: mfaToken });
      setBackupCodes(res.data.backupCodes);
      setMfaSetup(null);
      setMfaToken('');
      toast.success('MFA Enabled Successfully!');
      // Refresh user context via window location or query invalidation handles it if authContext listens
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Invalid code');
    }
  };

  const handleDisableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    disableMfa.mutate(
      { password: disablePassword },
      {
        onSuccess: () => {
          setShowDisableMfaModal(false);
          setDisablePassword('');
          setTimeout(() => window.location.reload(), 1000);
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
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
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-colors"
          >
            {changePassword.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Password
          </button>
        </form>
      </div>

      {/* MFA */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h3>
            <p className="text-sm text-slate-500">Add additional security to your account using an authenticator app.</p>
          </div>
        </div>

        {user?.mfaEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
              <Check className="w-5 h-5" />
              <span className="font-semibold">Two-factor authentication is currently enabled.</span>
            </div>
            {backupCodes && (
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mt-4">
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Save these backup codes in a secure location!</h4>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm text-slate-600 dark:text-slate-400">
                  {backupCodes.map(code => (
                    <div key={code}>{code}</div>
                  ))}
                </div>
              </div>
            )}
            <button 
              onClick={() => setShowDisableMfaModal(true)}
              className="px-6 py-2.5 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 rounded-xl font-bold transition-colors"
            >
              Disable Two-Factor Authentication
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-md">
            {!mfaSetup ? (
              <button 
                onClick={handleSetupMfa}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors"
              >
                Setup Authenticator App
              </button>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-medium mb-4 dark:text-slate-300 text-slate-700">1. Scan this QR code with Google Authenticator or Authy</p>
                  <img src={mfaSetup.qrCode} alt="QR Code" className="w-48 h-48 rounded-xl mx-auto bg-white p-2" />
                  <p className="text-xs text-center text-slate-500 mt-4 font-mono select-all">Secret: {mfaSetup.secret}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-medium mb-4 dark:text-slate-300 text-slate-700">2. Enter the 6-digit code from the app</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" maxLength={6} value={mfaToken}
                      onChange={e => setMfaToken(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-center tracking-widest text-lg font-mono focus:ring-2 focus:ring-indigo-500 outline-none" 
                      placeholder="000000"
                    />
                    <button 
                      onClick={handleVerifyMfa}
                      disabled={mfaToken.length !== 6}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Browser Sessions</h3>
            <p className="text-sm text-slate-500">Manage and log out your active sessions on other browsers and devices.</p>
          </div>
        </div>

        {sessionsLoading ? (
          <div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {sessions?.map((session: any) => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <Laptop className="w-6 h-6 text-slate-400" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      {session.deviceInfo?.browser || 'Unknown Browser'} on {session.deviceInfo?.os || 'Unknown OS'}
                      {session.token === localStorage.getItem('token') && (
                        <span className="text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">This Device</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <span>{session.ipAddress}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(session.lastActivityAt).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
                {session.token !== localStorage.getItem('token') && (
                  <button 
                    onClick={() => revokeSession.mutate(session.id)}
                    disabled={revokeSession.isPending}
                    className="text-sm font-bold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 px-4 py-2 rounded-lg transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Disable MFA Modal */}
      {showDisableMfaModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold dark:text-white text-slate-900">Disable Two-Factor Authentication</h3>
              <button onClick={() => setShowDisableMfaModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleDisableMfa} className="space-y-4">
              <p className="text-sm text-slate-500">Please enter your password to confirm you want to disable MFA.</p>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
                <input 
                  type="password" required value={disablePassword}
                  onChange={e => setDisablePassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none transition-shadow" 
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowDisableMfaModal(false)} className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</button>
                <button type="submit" disabled={disableMfa.isPending} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 flex items-center gap-2">
                  {disableMfa.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Disable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
