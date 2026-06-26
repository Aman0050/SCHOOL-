import React, { useState, useRef } from 'react';
import { 
  X, User, Users, FileText, CheckCircle2, Clock, 
  Check, XCircle, FileCheck, ClipboardList, 
  Download, Eye, Upload, Loader2, Plus
} from 'lucide-react';
import { api } from '../../../../lib/api';
import toast from 'react-hot-toast';

interface ApplicationProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: any | null;
  onEnroll: () => void;
  onUpdateStage: (stage: string, status: string) => void;
  onRefresh: () => void;
}

const TABS = [
  { id: 'overview', label: 'Pipeline', icon: Clock },
  { id: 'documents', label: 'Documents', icon: FileCheck },
  { id: 'assessment', label: 'Assessment', icon: ClipboardList },
  { id: 'student', label: 'Student', icon: User },
  { id: 'parents', label: 'Parents', icon: Users },
];

const PIPELINE_STEPS = [
  { id: 'new-registrations', label: 'Application Submitted' },
  { id: 'document-verification', label: 'Document Verification' },
  { id: 'assessment-interview', label: 'Assessment' },
  { id: 'approved', label: 'Admission Approved' },
  { id: 'enrolled', label: 'Student Created' },
];

const DOC_TYPES = [
  'Birth Certificate',
  'Aadhaar / National ID',
  'Transfer Certificate',
  'Passport Photo',
  'Medical Certificate',
  'Address Proof',
  'Other',
];

// ── Document Center ────────────────────────────────────────────────────────────
const DocumentCenter: React.FC<{ applicant: any; onRefresh: () => void }> = ({ applicant, onRefresh }) => {
  const docs: any[] = applicant.documents || [];
  const verifiedCount = docs.filter(d => d.status === 'Verified').length;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('Birth Certificate');
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', selectedType);
      formData.append('name', selectedType);
      await api.post(`/applicants/${applicant.id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Document uploaded successfully!');
      setShowUploadPanel(false);
      onRefresh();
    } catch {
      toast.error('Failed to upload document.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVerify = async (docId: string, status: 'Verified' | 'Rejected') => {
    setUpdatingId(docId);
    try {
      await api.put(`/applicants/${applicant.id}/documents/${docId}/status`, { status });
      toast.success(`Document marked as ${status}`);
      onRefresh();
    } catch {
      toast.error('Failed to update document status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleView = (fileUrl: string) => {
    window.open(`http://localhost:5000${fileUrl}`, '_blank');
  };

  const handleDownload = (fileUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = `http://localhost:5000${fileUrl}`;
    link.download = name;
    link.click();
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Document Center</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
            {verifiedCount} / {docs.length} Verified
          </span>
          <button
            onClick={() => setShowUploadPanel(p => !p)}
            className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Upload Document
          </button>
        </div>
      </div>

      {/* Upload panel */}
      {showUploadPanel && (
        <div className="p-4 border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex flex-col gap-3">
          <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Upload a new document</p>
          <div className="flex gap-3">
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <label className={`flex items-center gap-2 cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? 'Uploading…' : 'Choose File'}
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        </div>
      )}

      {/* Document list */}
      {docs.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
          No documents uploaded yet. Click "Upload Document" to add one.
        </div>
      ) : (
        <div className="grid gap-3">
          {docs.map((doc: any) => (
            <div key={doc.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20' :
                  doc.status === 'Rejected' ? 'bg-red-100 text-red-600 dark:bg-red-500/20' :
                  'bg-amber-100 text-amber-600 dark:bg-amber-500/20'
                }`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{doc.name}</p>
                  <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${
                    doc.status === 'Verified' ? 'text-emerald-600' :
                    doc.status === 'Rejected' ? 'text-red-600' :
                    'text-amber-600'
                  }`}>{doc.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleView(doc.fileUrl)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded transition-colors"
                  title="Preview"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDownload(doc.fileUrl, doc.name)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                {doc.status !== 'Verified' && (
                  <button
                    onClick={() => handleVerify(doc.id, 'Verified')}
                    disabled={updatingId === doc.id}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded transition-colors"
                    title="Mark as Verified"
                  >
                    {updatingId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  </button>
                )}
                {doc.status !== 'Rejected' && (
                  <button
                    onClick={() => handleVerify(doc.id, 'Rejected')}
                    disabled={updatingId === doc.id}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                    title="Mark as Rejected"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Assessment Tab ─────────────────────────────────────────────────────────────
const AssessmentTab: React.FC<{ applicant: any; onRefresh: () => void }> = ({ applicant, onRefresh }) => {
  const assessments: any[] = applicant.assessments || [];
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    assessmentType: 'Entrance Exam',
    date: new Date().toISOString().split('T')[0],
    score: '',
    remarks: '',
    decision: 'Pending',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/applicants/${applicant.id}/assessments`, form);
      toast.success('Assessment recorded!');
      setShowForm(false);
      setForm({ assessmentType: 'Entrance Exam', date: new Date().toISOString().split('T')[0], score: '', remarks: '', decision: 'Pending' });
      onRefresh();
    } catch {
      toast.error('Failed to record assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Assessment Results</h3>
        <button
          onClick={() => setShowForm(p => !p)}
          className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Record Results
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex flex-col gap-3">
          <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">New Assessment Entry</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Type</label>
              <select value={form.assessmentType} onChange={e => setForm(f => ({ ...f, assessmentType: e.target.value }))}
                className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option>Entrance Exam</option>
                <option>Interview</option>
                <option>Written Test</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Score (out of 100)</label>
              <input type="number" min={0} max={100} value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))}
                placeholder="e.g. 85"
                className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Decision</label>
              <select value={form.decision} onChange={e => setForm(f => ({ ...f, decision: e.target.value }))}
                className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                <option>Pending</option>
                <option>Selected</option>
                <option>Rejected</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Remarks</label>
            <textarea value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
              rows={2} placeholder="Optional notes..."
              className="px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
          </div>
          <button type="submit" disabled={submitting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? 'Saving…' : 'Save Assessment'}
          </button>
        </form>
      )}

      {assessments.length === 0 && !showForm ? (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center mb-4">
            <ClipboardList className="h-8 w-8 text-slate-400" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white mb-1">No Assessment Recorded</h4>
          <p className="text-sm text-slate-500 max-w-sm mb-4">Click "Record Results" to log the assessment for this applicant.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {assessments.map((a: any) => (
            <div key={a.id} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm text-slate-900 dark:text-white">{a.assessmentType}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2">
                  {a.score != null && (
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{Number(a.score).toFixed(0)}<span className="text-xs text-slate-400">/100</span></span>
                  )}
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    a.decision === 'Selected' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                    a.decision === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                  }`}>{a.decision || 'Pending'}</span>
                </div>
              </div>
              {a.remarks && <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 italic">"{a.remarks}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Info Row helper ────────────────────────────────────────────────────────────
const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-0.5">{label}</p>
    <p className="text-sm font-medium text-slate-900 dark:text-white">{value || <span className="text-slate-400 italic">N/A</span>}</p>
  </div>
);

// ── Main Drawer ────────────────────────────────────────────────────────────────
export const ApplicationProfileDrawer: React.FC<ApplicationProfileDrawerProps> = ({
  isOpen, onClose, applicant, onEnroll, onUpdateStage, onRefresh
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !applicant) return null;

  const currentStepIndex = PIPELINE_STEPS.findIndex(s => s.id === applicant.stage);

  return (
    <div className={`fixed inset-y-0 right-0 w-[600px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>

      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-start">
        <div className="flex gap-4 items-center">
          <div className="h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center text-xl font-bold shadow-sm border-2 border-white dark:border-slate-800">
            {applicant?.firstName?.[0] || ''}{applicant?.lastName?.[0] || ''}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {applicant.firstName} {applicant.middleName || ''} {applicant.lastName}
              {applicant.stage === 'enrolled' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2 mt-1">
              <span className="font-mono bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-semibold">
                {applicant?.applicationNumber || applicant?.id?.slice(0, 8).toUpperCase() || 'N/A'}
              </span>
              <span>•</span>
              <span className="font-medium">Grade: {applicant.grade}</span>
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-4 gap-6 bg-slate-50 dark:bg-slate-800/50 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 border-b-2 font-semibold text-sm transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-between">
                Admission Pipeline Status
                <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 px-2 py-1 rounded-full">
                  {Math.round(((currentStepIndex + 1) / PIPELINE_STEPS.length) * 100)}% Complete
                </span>
              </h3>
              <div className="relative">
                <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
                <div
                  className="absolute left-[15px] top-0 w-0.5 bg-indigo-500 transition-all duration-500"
                  style={{ height: `${(currentStepIndex / (PIPELINE_STEPS.length - 1)) * 100}%` }}
                />
                <div className="flex flex-col gap-6">
                  {PIPELINE_STEPS.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    return (
                      <div key={step.id} className="relative flex items-center gap-4">
                        <div className={`z-10 h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                          isCompleted
                            ? 'bg-indigo-500 border-indigo-500 text-white'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-400'
                        } ${isCurrent ? 'ring-4 ring-indigo-500/20' : ''}`}>
                          {isCompleted ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm ${isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                            {step.label}
                          </h4>
                          {isCurrent && <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">Current Stage</p>}
                        </div>
                        {isCurrent && index < PIPELINE_STEPS.length - 1 && (
                          <button
                            onClick={() => {
                              const nextStep = PIPELINE_STEPS[index + 1];
                              if (nextStep.id === 'enrolled') {
                                onEnroll();
                              } else {
                                onUpdateStage(nextStep.id, nextStep.label);
                              }
                            }}
                            className="text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onUpdateStage('approved', 'Approved')}
                  className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 transition-colors text-left group"
                >
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-sm">Approve Admission</span>
                </button>
                <button
                  onClick={() => onUpdateStage('rejected', 'Rejected')}
                  className="flex items-center gap-3 p-3 rounded-xl border border-red-200 dark:border-red-800/50 hover:border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 transition-colors text-left group"
                >
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <XCircle className="h-4 w-4" />
                  </div>
                  <span className="font-semibold text-sm">Reject Application</span>
                </button>
              </div>
            </div>

            {applicant.stage === 'approved' && (
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> Ready for Enrollment
                </h3>
                <p className="text-emerald-50 text-sm mb-4">
                  This application has been approved. Enrolling will automatically create student and parent portal accounts, generate an admission number, and finalize the process.
                </p>
                <button
                  onClick={onEnroll}
                  className="bg-white text-emerald-600 px-6 py-2 rounded-xl font-bold hover:bg-emerald-50 transition-colors w-full shadow-sm"
                >
                  Confirm Enrollment
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── DOCUMENTS TAB ── */}
        {activeTab === 'documents' && (
          <DocumentCenter applicant={applicant} onRefresh={onRefresh} />
        )}

        {/* ── ASSESSMENT TAB ── */}
        {activeTab === 'assessment' && (
          <AssessmentTab applicant={applicant} onRefresh={onRefresh} />
        )}

        {/* ── STUDENT TAB ── */}
        {activeTab === 'student' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <InfoRow label="First Name" value={applicant.firstName} />
              <InfoRow label="Last Name" value={applicant.lastName} />
              <InfoRow label="Middle Name" value={applicant.middleName} />
              <InfoRow label="Date of Birth" value={applicant.dateOfBirth ? new Date(applicant.dateOfBirth).toLocaleDateString('en-IN') : undefined} />
              <InfoRow label="Gender" value={applicant.gender} />
              <InfoRow label="Blood Group" value={applicant.bloodGroup} />
              <InfoRow label="Nationality" value={applicant.nationality} />
              <InfoRow label="Religion" value={applicant.religion} />
              <InfoRow label="Email" value={applicant.email} />
              <InfoRow label="Phone" value={applicant.phone} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 mt-2">Academic Details</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <InfoRow label="Applying for Grade" value={applicant.grade} />
              <InfoRow label="Previous School" value={applicant.previousSchool} />
              <InfoRow label="Previous Class" value={applicant.previousClass} />
              <InfoRow label="Transfer Status" value={applicant.transferStatus} />
            </div>
          </div>
        )}

        {/* ── PARENTS TAB ── */}
        {activeTab === 'parents' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">Father's Details</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <InfoRow label="Full Name" value={applicant.fatherName} />
              <InfoRow label="Mobile" value={applicant.fatherMobile} />
              <InfoRow label="Email" value={applicant.fatherEmail} />
              <InfoRow label="Occupation" value={applicant.fatherOccupation} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 mt-2">Mother's Details</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <InfoRow label="Full Name" value={applicant.motherName} />
              <InfoRow label="Mobile" value={applicant.motherMobile} />
              <InfoRow label="Email" value={applicant.motherEmail} />
              <InfoRow label="Occupation" value={applicant.motherOccupation} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 mt-2">Address</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <div className="col-span-2">
                <InfoRow label="Street Address" value={applicant.address} />
              </div>
              <InfoRow label="City" value={applicant.city} />
              <InfoRow label="State" value={applicant.state} />
              <InfoRow label="Country" value={applicant.country} />
              <InfoRow label="Postal Code" value={applicant.postalCode} />
            </div>
          </div>
        )}


      </div>
    </div>
  );
};
