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
            className="text-xs font-semibold text-foreground select-none block"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center justify-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            className={twMerge(
              clsx(
                'w-full rounded-xl border bg-background py-3 text-sm min-h-[44px] outline-none transition-all duration-200 focus:ring-4 focus:ring-ring/10',
                icon ? 'pl-10 pr-4' : 'px-4',
                error
                  ? 'border-destructive focus:border-destructive focus:ring-destructive/10'
                  : 'border-input focus:border-ring',
                'disabled:opacity-50 disabled:bg-muted'
              ),
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs font-semibold text-destructive select-none block">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;
