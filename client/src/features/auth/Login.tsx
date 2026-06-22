import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';
import { Lock, Mail, AlertTriangle, ArrowLeft, GraduationCap, Eye, EyeOff } from 'lucide-react';

const loginFormSchema = z.object({
  email: z.string().min(1, 'Please enter your email or user ID'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export const Login: React.FC = () => {
  const { login, tenantSubdomain } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const loggedInUser = await login(data.email, data.password);
      
      if (loggedInUser && loggedInUser.role === 'SUPER_ADMIN') {
        navigate('/superadmin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const message = err.response?.data?.error?.message || 'Invalid email or password. Please try again.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-900 font-sans">
      {/* Left Column: Branding / Visual */}
      <div className="hidden lg:flex w-1/2 relative bg-black overflow-hidden">
        {/* Blurred background to fill any empty space */}
        <img 
          src="/login-bg-moodboard.png.jpg" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-60 z-0 scale-110"
        />
        
        {/* The actual image, contained so it's fully visible */}
        <img 
          src="/login-bg-moodboard.png.jpg" 
          alt="EduXeno Platform" 
          className="absolute inset-0 w-full h-full object-contain z-0"
        />
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="relative z-20 flex flex-col justify-between p-16 h-full w-full">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight drop-shadow-md">Edu<span className="text-indigo-400 font-serif italic uppercase font-normal ml-0.5">XENO</span></span>
          </div>
          
          <div className="flex-grow"></div>
          
          <div className="text-sm font-medium text-white/50">
            © {new Date().getFullYear()} EduXeno Inc. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-hidden bg-slate-50/50 dark:bg-slate-900">
        {/* Beautiful subtle animated gradient mesh background for right side */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-indigo-100/40 via-purple-50/40 to-transparent rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 opacity-70 pointer-events-none dark:from-indigo-900/20 dark:via-purple-900/20"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-50/40 to-transparent rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 opacity-70 pointer-events-none dark:from-blue-900/20"></div>
        
        <div className="w-full max-w-[480px] relative z-10 space-y-8">
          <div className="space-y-2">
            {/* Mobile logo only */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Edu<span className="text-indigo-600 font-serif italic uppercase font-normal ml-0.5">XENO</span></span>
            </div>

            <div className="flex items-center gap-5 pt-2">
              <div className="bg-indigo-600 p-4 rounded-3xl shadow-xl shadow-indigo-600/20">
                <GraduationCap className="h-12 w-12 text-white" />
              </div>
              <span className="text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">Edu<span className="text-indigo-600 font-serif italic uppercase font-normal ml-1">XENO</span></span>
            </div>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium pt-1">
              Empowering the next generation of education.
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400 shadow-sm animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="font-medium">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-[15px] font-semibold text-slate-700 dark:text-slate-300 ml-1">
                Email or User ID
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-6 w-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  id="email"
                  type="text"
                  autoComplete="username"
                  placeholder="name@school.edu or admin123"
                  className={`block w-full rounded-xl border ${
                    errors.email ? 'border-red-400 focus:ring-red-400/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  } bg-white dark:bg-slate-800 py-4 pl-12 pr-4 text-base text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 shadow-sm`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <span className="text-xs font-semibold text-red-500 flex items-center mt-1 ml-1">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password-field" className="text-[15px] font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Password
                </label>
              </div>
              <div className="relative group">
                <input
                  id="password-field"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`block w-full rounded-xl border ${
                    errors.password ? 'border-red-400 focus:ring-red-400/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  } bg-white dark:bg-slate-800 py-4 pl-4 pr-12 text-base text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 shadow-sm`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs font-semibold text-red-500 flex items-center mt-1 ml-1">
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-4 text-base font-bold text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
              >
                {isSubmitting ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>


        </div>
      </div>
    </div>
  );
};

export default Login;
