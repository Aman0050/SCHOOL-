import React, { useState } from 'react';
import { X, User, GraduationCap, Users, MapPin, CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface NewAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

const STEPS = [
  { id: 'student', title: 'Student Info', icon: User },
  { id: 'academic', title: 'Academic', icon: GraduationCap },
  { id: 'parents', title: 'Parents', icon: Users },
  { id: 'address', title: 'Address', icon: MapPin },
];

export const NewAdmissionModal: React.FC<NewAdmissionModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Student Info
    firstName: '', middleName: '', lastName: '', dateOfBirth: '', gender: '', bloodGroup: '', nationality: '', religion: '',
    // Academic Info
    grade: 'Grade 1', previousSchool: '', previousClass: '', transferStatus: '',
    // Contact Info
    email: '', phone: '',
    // Parent Info
    fatherName: '', fatherMobile: '', fatherEmail: '', fatherOccupation: '',
    motherName: '', motherMobile: '', motherEmail: '', motherOccupation: '', guardianRelation: '',
    // Address Info
    address: '', city: '', state: '', country: '', postalCode: ''
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = e.target.value;
    if (e.target.type === 'tel') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(c => c + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== STEPS.length - 1) {
      handleNext();
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      // Reset form on success
      setCurrentStep(0);
      setFormData({
        firstName: '', middleName: '', lastName: '', dateOfBirth: '', gender: '', bloodGroup: '', nationality: '', religion: '',
        grade: 'Grade 1', previousSchool: '', previousClass: '', transferStatus: '',
        email: '', phone: '',
        fatherName: '', fatherMobile: '', fatherEmail: '', fatherOccupation: '',
        motherName: '', motherMobile: '', motherEmail: '', motherOccupation: '', guardianRelation: '',
        address: '', city: '', state: '', country: '', postalCode: ''
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to submit registration. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto py-10">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-bold text-xl text-slate-900 dark:text-white flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg dark:bg-indigo-500/20 dark:text-indigo-400">
              <User className="h-5 w-5" />
            </div>
            New Admission Registration
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-full p-2 hover:bg-slate-200 dark:hover:bg-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between relative">
          <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-200 dark:bg-slate-800 -z-10 -translate-y-1/2 rounded-full" />
          <div 
            className="absolute top-1/2 left-10 h-0.5 bg-indigo-500 dark:bg-indigo-500 -z-10 -translate-y-1/2 transition-all duration-300 ease-in-out" 
            style={{ width: `calc(${currentStep * (100 / (STEPS.length - 1))}% - 2.5rem)` }}
          />
          
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStep > idx;
            const isCurrent = currentStep === idx;
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 px-2">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCompleted ? 'bg-indigo-500 border-indigo-500 text-white' : 
                  isCurrent ? 'bg-white dark:bg-slate-900 border-indigo-500 text-indigo-500 dark:text-indigo-400' : 
                  'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                }`}>
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={`text-xs font-bold ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitForm} className="p-8">
          
          {/* STEP 1: STUDENT INFO */}
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4">
              <div className="col-span-2"><h4 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-2">Student Information</h4></div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">First Name *</label>
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Middle Name</label>
                <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Last Name *</label>
                <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Blood Group</label>
                <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} placeholder="e.g. O+" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
            </div>
          )}

          {/* STEP 2: ACADEMIC INFO */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4">
              <div className="col-span-2"><h4 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-2">Academic & Contact</h4></div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Applying For Grade *</label>
                <select required name="grade" value={formData.grade} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white">
                  {[...Array(12)].map((_, i) => <option key={i} value={`Grade ${i+1}`}>Grade {i+1}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Previous School</label>
                <input type="text" name="previousSchool" value={formData.previousSchool} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Student Email (Optional)</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Student Phone (Optional)</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
            </div>
          )}

          {/* STEP 3: PARENT INFO */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4">
              <div className="col-span-2"><h4 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-2">Parent/Guardian Details</h4></div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Father's Name</label>
                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Father's Mobile</label>
                <input type="tel" name="fatherMobile" value={formData.fatherMobile} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mother's Name</label>
                <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mother's Mobile</label>
                <input type="tel" name="motherMobile" value={formData.motherMobile} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
            </div>
          )}

          {/* STEP 4: ADDRESS INFO */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4">
              <div className="col-span-2"><h4 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-2">Address Information</h4></div>
              
              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Street Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">State / Province</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-800">
            <button 
              type="button"
              onClick={currentStep === 0 ? onClose : handlePrev}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              {currentStep === 0 ? 'Cancel' : <><ChevronLeft className="h-4 w-4" /> Back</>}
            </button>
            
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20 flex items-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
              ) : currentStep === STEPS.length - 1 ? (
                <><CheckCircle2 className="h-4 w-4" /> Complete Registration</>
              ) : (
                <>Continue <ChevronRight className="h-4 w-4" /></>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
