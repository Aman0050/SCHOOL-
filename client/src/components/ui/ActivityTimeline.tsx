import React from 'react';
import { Circle } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events }) => {
  const getColorClass = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'success': return 'text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20';
      case 'warning': return 'text-amber-500 bg-amber-100 dark:bg-amber-500/20';
      case 'error': return 'text-red-500 bg-red-100 dark:bg-red-500/20';
      case 'info':
      default: return 'text-primary bg-primary/10 dark:bg-primary/20';
    }
  };

  if (events.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        No recent activity to display.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
              ) : null}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  {event.user.avatar ? (
                    <img
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 ring-8 ring-white dark:ring-slate-900"
                      src={event.user.avatar}
                      alt=""
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 ring-8 ring-white dark:ring-slate-900">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {event.user.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  <span className="absolute -bottom-1 -right-1 rounded-full ring-2 ring-white dark:ring-slate-900 bg-white dark:bg-slate-900">
                    <Circle className={`h-4 w-4 rounded-full ${getColorClass(event.type)}`} fill="currentColor" />
                  </span>
                </div>
                <div className="min-w-0 flex-1 py-1.5">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {event.user.name}
                    </span>{' '}
                    {event.action}{' '}
                    {event.target && (
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {event.target}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-slate-400 dark:text-slate-500 flex items-center">
                    {event.timestamp}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
