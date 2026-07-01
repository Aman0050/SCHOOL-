import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, children, id, ...props }, ref) => {
    const selectId = id || React.useId();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold text-foreground select-none block"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full rounded-xl border bg-background py-3 px-4 text-sm outline-none transition-all duration-200 focus:ring-4 focus:ring-ring/10 appearance-none cursor-pointer',
              error
                ? 'border-destructive focus:border-destructive focus:ring-destructive/10'
                : 'border-input focus:border-ring',
              'disabled:opacity-50'
            ),
            className
          )}
          {...props}
        >
          {children ? (
            children
          ) : (
            options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          )}
        </select>
        {error && (
          <span className="text-xs font-semibold text-destructive select-none block">
            {error}
          </span>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';
export default Select;
