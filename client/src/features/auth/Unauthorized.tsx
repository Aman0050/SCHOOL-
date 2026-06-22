import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Access Restricted</h1>
        <p className="text-sm text-slate-500">
          Your account role does not have authorization to access this panel. If you believe this is in error, contact your school administrator.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
