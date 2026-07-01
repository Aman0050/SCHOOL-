import React, { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  widgetName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[Widget Error] ${this.props.widgetName || 'Unknown'}:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl border border-rose-200 dark:border-rose-800/50 p-5 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Widget Error</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {this.props.widgetName} failed to load
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-xs font-semibold text-primary hover:text-primary underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
