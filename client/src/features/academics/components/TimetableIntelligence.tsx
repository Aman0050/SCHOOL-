import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../lib/api';
import { AlertTriangle, Save, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const TIMES = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];

export const TimetableIntelligence: React.FC<{ classId?: string }> = ({ classId }) => {
  const queryClient = useQueryClient();
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [localPeriods, setLocalPeriods] = useState<any[]>([]);

  // Query actual data
  const { data: timetable, isLoading } = useQuery({
    queryKey: ['timetable', classId],
    queryFn: () => api.get(`/timetable?classId=${classId}`).then(res => res.data.data),
    enabled: !!classId
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => api.get('/examinations/subjects').then(res => res.data.data)
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get('/academics/teachers').then(res => res.data.data)
  });

  useEffect(() => {
    if (timetable) {
      setLocalPeriods(timetable);
    }
  }, [timetable]);

  const saveMutation = useMutation({
    mutationFn: (periods: any[]) => api.post('/timetable', { classId, periods }),
    onSuccess: () => {
      toast.success('Timetable saved successfully');
      setConflicts([]);
      queryClient.invalidateQueries({ queryKey: ['timetable', classId] });
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        setConflicts(error.response.data.conflicts);
        toast.error('Conflict detected!');
      } else {
        toast.error('Failed to save timetable');
      }
    }
  });

  const handleDragStart = (e: React.DragEvent, subjectId: string, teacherId: string) => {
    e.dataTransfer.setData('subjectId', subjectId);
    e.dataTransfer.setData('teacherId', teacherId);
  };

  const handleDrop = (e: React.DragEvent, day: string, time: string) => {
    e.preventDefault();
    const subjectId = e.dataTransfer.getData('subjectId');
    const teacherId = e.dataTransfer.getData('teacherId');

    if (!subjectId || !teacherId) return;

    // End time is simply +1 hour for this demo grid
    const endHour = parseInt(time.split(':')[0]) + 1;
    const endTime = `${endHour.toString().padStart(2, '0')}:00`;

    const newPeriod = {
      dayOfWeek: day,
      startTime: time,
      endTime: endTime,
      subjectId,
      teacherId,
      room: 'TBD',
      isBreak: false
    };

    setLocalPeriods(prev => {
      // Remove any existing period in this slot
      const filtered = prev.filter(p => !(p.dayOfWeek === day && p.startTime === time));
      return [...filtered, newPeriod];
    });
  };

  const getPeriod = (day: string, time: string) => {
    return localPeriods.find(p => p.dayOfWeek === day && p.startTime === time);
  };

  if (!classId) return <div className="p-8 text-center text-slate-500">Please select a class to view its timetable.</div>;
  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Live Timetable Engine</h2>
          <p className="text-sm text-slate-500">Drag and drop subjects into the grid. System will auto-detect conflicts.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setLocalPeriods(timetable || [])} className="px-4 py-2 flex items-center gap-2 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
          <button onClick={() => saveMutation.mutate(localPeriods)} disabled={saveMutation.isPending} className="px-4 py-2 flex items-center gap-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Publish
          </button>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex gap-3 text-red-800 dark:text-red-200">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold mb-1">Conflicts Detected</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {conflicts.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Available Subjects Palette */}
        <div className="w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm h-fit sticky top-4">
          <h3 className="font-semibold mb-4 text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Available Subjects</h3>
          <div className="space-y-3">
            {subjects?.map((sub: any) => (
              <div
                key={sub.id}
                draggable
                onDragStart={(e) => handleDragStart(e, sub.id, teachers?.[0]?.id || '')} // Hardcoding first teacher for demo
                className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
              >
                <div className="font-medium text-sm text-slate-900 dark:text-white">{sub.name}</div>
                <div className="text-xs text-slate-500 mt-1">Drag to schedule</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timetable Grid */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="p-3 text-center text-xs font-semibold text-slate-500 border-r border-slate-200 dark:border-slate-800">Time</div>
            {DAYS.map(day => (
              <div key={day} className="p-3 text-center text-xs font-semibold text-slate-500 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                {day.substring(0, 3)}
              </div>
            ))}
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {TIMES.map(time => (
              <div key={time} className="grid grid-cols-7">
                <div className="p-3 text-center text-xs font-medium text-slate-500 border-r border-slate-100 dark:border-slate-800 flex items-center justify-center">
                  {time}
                </div>
                {DAYS.map(day => {
                  const period = getPeriod(day, time);
                  return (
                    <div
                      key={`${day}-${time}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, day, time)}
                      className="p-2 border-r border-slate-100 dark:border-slate-800 last:border-r-0 min-h-[80px] hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {period && (
                        <div className="h-full w-full bg-primary/10 border border-primary/20 rounded p-2 flex flex-col justify-center items-center text-center">
                          <span className="text-xs font-bold text-primary block truncate w-full">{period.subject?.name || 'Subject'}</span>
                          <span className="text-[10px] text-primary/70 block truncate w-full">{period.teacher?.firstName || 'Teacher'}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
