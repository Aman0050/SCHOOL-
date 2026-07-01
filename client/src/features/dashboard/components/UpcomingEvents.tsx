import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import { CalendarDays, MapPin } from 'lucide-react';

export const UpcomingEvents: React.FC = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['dashboard', 'upcomingEvents'],
    queryFn: () => api.get('/dashboard/upcoming-events').then(res => res.data),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  if (isLoading || !events) {
    return <div className="h-full w-full bg-slate-50 dark:bg-slate-800/50 rounded-2xl animate-pulse"></div>;
  }

  const formatMonth = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short' });
  };

  const formatDay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { day: 'numeric' });
  };

  return (
    <div className="h-full w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-hidden relative group">
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-500/5 rounded-full blur-3xl group-hover:bg-pink-500/10 transition-colors pointer-events-none"></div>

      <div className="flex justify-between items-center mb-4 z-10">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-pink-500" />
            Upcoming Events
          </h3>
          <p className="text-xs text-slate-500 mt-1">Next 30 days schedule</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar z-10">
        {events?.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            No upcoming events
          </div>
        ) : (
          events?.map((event: any) => (
            <div key={event.id} className="flex gap-3 items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-xl transition-colors cursor-pointer group/item border border-transparent hover:border-slate-100 dark:hover:border-slate-700/50">
              <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border flex-shrink-0 bg-${event.color}-50 dark:bg-${event.color}-500/10 border-${event.color}-100 dark:border-${event.color}-500/20 group-hover/item:scale-105 transition-transform`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider text-${event.color}-600 dark:text-${event.color}-400`}>{formatMonth(event.date)}</span>
                <span className={`text-lg font-black leading-none text-${event.color}-700 dark:text-${event.color}-300`}>{formatDay(event.date)}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover/item:text-pink-600 dark:group-hover/item:text-pink-400 transition-colors line-clamp-1">{event.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{event.type}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
