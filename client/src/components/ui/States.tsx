import React from 'react';
import { Loader2, AlertCircle, FileQuestion } from 'lucide-react';
import Button from './Button';

interface LoadingStateProps {
  title?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ title = 'Loading content...', className }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center space-y-4 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm font-semibold text-slate-500 animate-pulse">{title}</p>
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section.',
  onRetry,
  className,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto space-y-4 border border-red-100 dark:border-red-900/30 rounded-2xl bg-red-50/20 dark:bg-red-950/5 ${className}`}>
      <div className="h-12 w-12 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center max-w-sm mx-auto space-y-4 ${className}`}>
      <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center border border-slate-200/40 dark:border-slate-700/40 shadow-inner">
        {icon || <FileQuestion className="h-7 w-7" />}
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
