import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-semibold tracking-wide transition-all duration-200 outline-none focus:ring-4 focus:ring-primary/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';
    
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/10 border border-primary/10',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border',
      outline: 'bg-transparent text-foreground border border-border hover:bg-secondary/40',
      ghost: 'bg-transparent text-foreground hover:bg-secondary/50',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md shadow-destructive/10',
      link: 'bg-transparent text-primary hover:underline p-0 focus:ring-0 active:scale-100',
    };

    const sizes = {
      sm: 'px-3.5 py-1.5 text-xs min-h-[36px]',
      md: 'px-5 py-2.5 text-sm min-h-[44px]',
      lg: 'px-7 py-3 text-base min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2 flex-shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
