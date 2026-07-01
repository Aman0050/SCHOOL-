import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import { Shield, Key, Loader2, CheckCircle, ShieldAlert } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export const MfaSetup: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const setupMutation = useMutation({
    mutationFn: () => api.post('/mfa/setup'),
    onSuccess: (res) => {
      setQrCode(res.data.data.qrCode);
      setSecret(res.data.data.secret);
      setStep(2);
    }
  });

  const verifyMutation = useMutation({
    mutationFn: () => api.post('/mfa/verify', { token }),
    onSuccess: (res) => {
      setBackupCodes(res.data.data.backupCodes);
      setStep(3);
    }
  });

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary mb-4">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
        <p className="text-slate-500 mt-2">Secure your account with an authenticator app.</p>
      </div>

      {step === 1 && (
        <div className="text-center space-y-6">
          <p className="text-sm">Two-factor authentication adds an extra layer of security to your account. Once enabled, you'll be required to enter both your password and an authentication code from your mobile app.</p>
          <Button onClick={() => setupMutation.mutate()} disabled={setupMutation.isPending} className="w-full">
            {setupMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
            Set Up Authenticator App
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg text-center">
            <p className="text-sm font-medium mb-4">1. Scan this QR Code with Google Authenticator or Authy</p>
            <img src={qrCode} alt="MFA QR Code" className="mx-auto border-4 border-white rounded-lg shadow-sm w-48 h-48" />
            <p className="text-xs text-slate-500 mt-4">Or enter this code manually: <br/><span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{secret}</span></p>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">2. Enter the 6-digit code from your app</p>
            <div className="flex gap-3">
              <Input
                placeholder="000000"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                maxLength={6}
                className="font-mono text-center tracking-widest text-lg"
              />
              <Button onClick={() => verifyMutation.mutate()} disabled={token.length !== 6 || verifyMutation.isPending}>
                Verify
              </Button>
            </div>
            {verifyMutation.isError && <p className="text-sm text-red-500 mt-2">Invalid code. Try again.</p>}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-2">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-emerald-600">MFA Successfully Enabled!</h3>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-left">
            <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> Save your backup codes</h4>
            <p className="text-sm text-amber-700 mb-4">If you lose your device, these codes are the ONLY way to access your account. Keep them somewhere safe.</p>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((code, i) => (
                <div key={i} className="bg-white p-2 rounded text-center border border-amber-100 text-slate-700 font-bold">{code}</div>
              ))}
            </div>
          </div>

          <Button onClick={() => window.location.href = '/dashboard'} className="w-full">Return to Dashboard</Button>
        </div>
      )}
    </div>
  );
};

export default MfaSetup;
