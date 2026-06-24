import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, icon, id, ...props }, ref) => {
    const inputId = id || React.useId();
    
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 select-none block"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            className={twMerge(
              clsx(
                'w-full rounded-xl border bg-white dark:bg-slate-900 py-3 text-sm min-h-[44px] outline-none transition-all duration-200 focus:ring-4 focus:ring-primary/10',
                icon ? 'pl-10 pr-4' : 'px-4',
                error
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                  : 'border-slate-200 dark:border-slate-800 focus:border-primary',
                'disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-900/50'
              ),
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs font-semibold text-red-600 dark:text-red-400 select-none block">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;
