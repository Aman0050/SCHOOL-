import React from 'react';
import { X, User, Building2, Mail, Phone, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface DemoRequestModalProps {
  request: any;
  onClose: () => void;
}

export const DemoRequestModal: React.FC<DemoRequestModalProps> = ({ request, onClose }) => {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start bg-slate-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Demo Request Details</h2>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              Received {format(new Date(request.createdAt), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-all bg-white hover:bg-slate-100 p-2.5 rounded-xl border border-slate-200 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar space-y-6 bg-white">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User className="w-4 h-4" /> Prospect Contact
              </h3>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="text-sm font-semibold text-slate-900">{request.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</p>
                  <a href={`mailto:${request.email}`} className="text-sm font-medium text-indigo-600 hover:underline flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {request.email}
                  </a>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</p>
                  <a href={`tel:${request.phoneNumber}`} className="text-sm font-medium text-slate-700 hover:underline flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {request.phoneNumber}
                  </a>
                </div>
              </div>
            </div>

            {/* Institution Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Institution Details
              </h3>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Institution Name</p>
                  <p className="text-sm font-semibold text-slate-900">{request.institutionName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Size (Students)</p>
                  <p className="text-sm font-medium text-slate-700 inline-block px-2 py-0.5 bg-white border border-slate-200 rounded-md shadow-sm">
                    {request.studentsCount} Students
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Campuses</p>
                  <p className="text-sm font-medium text-slate-700">{request.campusesCount} Campus(es)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message / Additional Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Prospect Message
            </h3>
            
            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
              {request.message ? (
                <p className="text-sm text-slate-700 leading-relaxed italic">
                  "{request.message}"
                </p>
              ) : (
                <p className="text-sm text-slate-400 italic flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> No additional message provided.
                </p>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
             <div className="text-xs text-slate-500">
               <span className="font-bold uppercase tracking-wider">Contact Preference:</span> {request.contactVia || 'Email'}
             </div>
             <div>
               <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                    request.status === 'NEW' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                    request.status === 'CONTACTED' ? 'bg-primary/10 text-primary border-primary/20' :
                    'bg-emerald-50 text-emerald-600 border-emerald-200'
                  }`}>
                 Status: {request.status}
               </span>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
