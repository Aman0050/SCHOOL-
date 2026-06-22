import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Check, Lock, Loader2, AlertCircle } from 'lucide-react';
import { examApi } from '../api/examApi';
import type {  Exam, ExamSubject, MarksEntry  } from '../types/exam.types';

export const MarksEntryUI: React.FC = () => {
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [marksData, setMarksData] = useState<Record<string, { theory?: number; practical?: number; isAbsent: boolean }>>({});
  
  const queryClient = useQueryClient();

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ['exams'],
    queryFn: () => examApi.getExams(),
  });

  const selectedExam = exams?.find(e => e.id === selectedExamId);
  const subjects = selectedExam?.schedules?.map(s => s.subject) || [];

  const { data: marksEntries, isLoading: marksLoading } = useQuery({
    queryKey: ['marks', selectedExamId, selectedSubjectId],
    queryFn: () => examApi.getMarksForExam(selectedExamId, selectedSubjectId),
    enabled: !!selectedExamId && !!selectedSubjectId,
  });

  // Initialize marksData when entries are fetched
  React.useEffect(() => {
    if (marksEntries) {
      const data: any = {};
      marksEntries.forEach(m => {
        data[m.studentId] = {
          theory: m.theoryMarks,
          practical: m.practicalMarks,
          isAbsent: m.isAbsent,
        };
      });
      setMarksData(data);
    }
  }, [marksEntries]);

  const bulkSaveMutation = useMutation({
    mutationFn: (entries: Partial<MarksEntry>[]) => examApi.bulkSaveMarks(selectedExamId, entries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks', selectedExamId, selectedSubjectId] });
      alert('Marks saved successfully as Draft.');
    }
  });

  const submitMutation = useMutation({
    mutationFn: () => examApi.submitMarks(selectedExamId, selectedSubjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marks', selectedExamId, selectedSubjectId] });
      alert('Marks submitted for verification.');
    }
  });

  const handleSaveDraft = () => {
    if (!marksEntries) return;
    const entriesToSave = marksEntries.map(m => {
      const updated = marksData[m.studentId] || {};
      return {
        studentId: m.studentId,
        subjectId: m.subjectId,
        theoryMarks: updated.theory,
        practicalMarks: updated.practical,
        isAbsent: updated.isAbsent || false,
      };
    });
    bulkSaveMutation.mutate(entriesToSave);
  };

  const handleMarksChange = (studentId: string, field: 'theory' | 'practical' | 'isAbsent', value: any) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const isAllSubmitted = marksEntries && marksEntries.length > 0 && marksEntries.every(m => m.entryStatus === 'SUBMITTED' || m.entryStatus === 'LOCKED');
  const isAllLocked = marksEntries && marksEntries.length > 0 && marksEntries.every(m => m.entryStatus === 'LOCKED');

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Select Exam & Subject</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Exam</label>
            <select
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
            >
              <option value="">-- Select Exam --</option>
              {exams?.map(e => <option key={e.id} value={e.id}>{e.name} ({e.class?.name})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
            <select
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={!selectedExamId}
            >
              <option value="">-- Select Subject --</option>
              {subjects.map(s => <option key={s?.id} value={s?.id}>{s?.name} ({s?.code})</option>)}
            </select>
          </div>
        </div>
      </div>

      {selectedExamId && selectedSubjectId && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex justify-between items-center">
            <h3 className="font-semibold text-slate-900 dark:text-white">Student Roster</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={isAllSubmitted || bulkSaveMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 disabled:opacity-50"
              >
                {bulkSaveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>
              <button
                onClick={() => submitMutation.mutate()}
                disabled={isAllSubmitted || submitMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Submit for Verification
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 font-semibold uppercase tracking-wider text-xs border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-5 py-3">Admission No</th>
                  <th className="px-5 py-3">Absent</th>
                  <th className="px-5 py-3 w-32">Theory Marks</th>
                  <th className="px-5 py-3 w-32">Practical Marks</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {marksLoading ? (
                  <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : marksEntries?.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-500">No students found for this subject</td></tr>
                ) : (
                  marksEntries?.map(m => {
                    const data = marksData[m.studentId] || {};
                    const isReadOnly = m.entryStatus === 'SUBMITTED' || m.entryStatus === 'LOCKED';
                    return (
                      <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{m.student?.firstName} {m.student?.lastName}</td>
                        <td className="px-5 py-4 text-slate-500">{m.student?.admission?.admissionNumber || 'N/A'}</td>
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={data.isAbsent || false}
                            onChange={(e) => handleMarksChange(m.studentId, 'isAbsent', e.target.checked)}
                            disabled={isReadOnly}
                            className="rounded text-primary focus:ring-primary w-4 h-4"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <input
                            type="number"
                            value={data.theory || ''}
                            onChange={(e) => handleMarksChange(m.studentId, 'theory', Number(e.target.value))}
                            disabled={isReadOnly || data.isAbsent}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm disabled:opacity-50"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <input
                            type="number"
                            value={data.practical || ''}
                            onChange={(e) => handleMarksChange(m.studentId, 'practical', Number(e.target.value))}
                            disabled={isReadOnly || data.isAbsent}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm disabled:opacity-50"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                            m.entryStatus === 'LOCKED' ? 'bg-red-100 text-red-700' :
                            m.entryStatus === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {m.entryStatus === 'LOCKED' && <Lock className="w-3 h-3" />}
                            {m.entryStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
