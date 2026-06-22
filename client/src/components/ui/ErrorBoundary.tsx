import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    // Here we would normally send to Sentry: Sentry.captureException(error)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h1>
          <p className="text-slate-500 max-w-md mb-8">
            We encountered an unexpected error. Our engineering team has been notified.
            <br/><br/>
            <span className="font-mono text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 p-2 rounded block">
              {this.state.error?.message}
            </span>
          </p>
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Reload Page
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
