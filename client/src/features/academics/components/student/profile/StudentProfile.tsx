import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../../lib/api';
import { StudentHealthCard } from './StudentHealthCard';
import { StudentAcademicsTab } from './StudentAcademicsTab';
import { StudentFeesTab } from './StudentFeesTab';
import { StudentDocumentsTab } from './StudentDocumentsTab';
import { StudentGuardiansTab } from './StudentGuardiansTab';
import { User, Mail, Phone, MapPin, Calendar, FileText, ArrowLeft, Loader2 } from 'lucide-react';

export const StudentProfile: React.FC<{ studentId: string; onBack: () => void }> = ({ studentId, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: student, isLoading } = useQuery({
    queryKey: ['studentProfile', studentId],
    queryFn: () => api.get(`/students/${studentId}`).then((res) => res.data.data),
    enabled: !!studentId
  });

  if (isLoading) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
  }

  if (!student) return <div>Error loading profile</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
            {student.profile?.avatarUrl ? (
              <img 
                src={student.profile.avatarUrl} 
                alt={`${student.firstName} ${student.lastName}`} 
                className="h-24 w-24 rounded-full object-cover mx-auto mb-4 border-2 border-slate-100 dark:border-slate-700"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900/50 mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-indigo-500">
                {student.firstName?.[0]}{student.lastName?.[0]}
              </div>
            )}
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {student.firstName} {student.lastName}
            </h2>
            <p className="text-sm text-slate-500 mb-4">{student.admission?.admissionNumber}</p>
            <div className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full text-xs font-semibold">
              {student.status}
            </div>
          </div>
          
          <StudentHealthCard student={student} />
        </div>

        {/* Right Content */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto custom-scrollbar">
            {['overview', 'attendance', 'academics', 'fees', 'documents', 'guardians'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6 flex-1 bg-slate-50 dark:bg-slate-800/50">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 mb-3">Contact Details</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"><Mail className="h-4 w-4"/> {student.email}</div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"><Phone className="h-4 w-4"/> {student.profile?.phone || 'N/A'}</div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"><MapPin className="h-4 w-4"/> {student.profile?.address || 'N/A'}</div>
                </div>
                <div className="space-y-4 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2 mb-3">Admission Details</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"><Calendar className="h-4 w-4"/> Date: {new Date(student.admission?.admissionDate).toLocaleDateString()}</div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"><User className="h-4 w-4"/> Class: {student.enrollments?.[0]?.class?.name || 'N/A'}</div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400"><FileText className="h-4 w-4"/> Roll No: {student.enrollments?.[0]?.rollNumber || 'N/A'}</div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Recent Attendance Logs</h3>
                <div className="space-y-2">
                  {student.attendanceRecords?.map((record: any) => (
                    <div key={record.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm border border-slate-100 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">{new Date(record.date).toLocaleDateString()}</span>
                      <span className={`font-semibold ${record.status === 'PRESENT' ? 'text-emerald-500' : 'text-red-500'}`}>{record.status}</span>
                    </div>
                  ))}
                  {(!student.attendanceRecords || student.attendanceRecords.length === 0) && (
                    <p className="text-slate-500 text-sm text-center py-4">No attendance records found.</p>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'academics' && (
              <StudentAcademicsTab student={student} />
            )}

            {activeTab === 'fees' && (
              <StudentFeesTab student={student} />
            )}

            {activeTab === 'documents' && (
              <StudentDocumentsTab student={student} />
            )}

            {activeTab === 'guardians' && (
              <StudentGuardiansTab student={student} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
