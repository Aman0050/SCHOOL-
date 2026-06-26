import React from 'react';
import { FileText, Download, Clock, Image as ImageIcon } from 'lucide-react';

interface StudentDocumentsTabProps {
  student: any;
}

export const StudentDocumentsTab: React.FC<StudentDocumentsTabProps> = ({ student }) => {
  const { documents = [] } = student;

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 flex items-center justify-center">
          <FileText className="h-8 w-8" />
        </div>
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">No Documents Uploaded</p>
        <p className="text-sm mt-2">Birth certificates, transfer letters, and medical records will appear here.</p>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 animate-fade-in">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Student Vault</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc: any) => {
          const isPdf = doc.name.toLowerCase().endsWith('.pdf');
          
          return (
            <div key={doc.id} className="group bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${isPdf ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/10' : 'bg-blue-50 text-blue-500 dark:bg-blue-500/10'}`}>
                  {isPdf ? <FileText className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
                </div>
                <button className="text-slate-400 hover:text-indigo-500 transition-colors p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <Download className="h-5 w-5" />
                </button>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-white mb-1 truncate" title={doc.name}>
                  {doc.name}
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{formatFileSize(doc.fileSize)}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
