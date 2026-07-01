import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { CheckCircle, School, Globe, Users, CreditCard } from 'lucide-react';

export const SchoolSetupWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    schoolName: '',
    subdomain: '',
    adminName: '',
    adminEmail: '',
    plan: 'STARTER'
  });

  const steps = [
    { num: 1, title: 'School Details', icon: School },
    { num: 2, title: 'Domain Setup', icon: Globe },
    { num: 3, title: 'Admin Account', icon: Users },
    { num: 4, title: 'Subscription', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-3xl mb-8">
        <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">Welcome to Edu<span className="text-primary font-serif italic uppercase font-normal ml-0.5">XENO</span></h1>
        <p className="text-center text-slate-500">Let's get your school up and running in minutes.</p>
        
        {/* Progress Bar */}
        <div className="flex justify-between items-center mt-12 relative">
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 z-0"></div>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary z-0 transition-all duration-500" style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%`}}></div>
          
          {steps.map(s => {
            const Icon = s.icon;
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isActive ? 'bg-primary text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900' :
                  isCompleted ? 'bg-emerald-500 text-white' :
                  'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700'
                }`}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-xs font-medium mt-2 absolute -bottom-6 w-32 text-center ${isActive ? 'text-primary dark:text-primary' : 'text-slate-500'}`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="w-full max-w-xl mt-8">
        <CardContent className="p-8">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-xl font-bold mb-4">What's the name of your school?</h2>
              <Input 
                label="School Name" 
                placeholder="e.g. Delhi Public School" 
                value={formData.schoolName}
                onChange={e => setFormData({...formData, schoolName: e.target.value})}
              />
              <Button className="w-full mt-6" onClick={() => setStep(2)} disabled={!formData.schoolName}>Continue</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-xl font-bold mb-4">Choose your custom portal address</h2>
              <p className="text-sm text-slate-500 mb-4">This is where your students and parents will log in.</p>
              <div className="flex items-center gap-2">
                <Input 
                  placeholder="e.g. dps" 
                  className="flex-1"
                  value={formData.subdomain}
                  onChange={e => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                />
                <span className="text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">.eduxeno.com</span>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(3)} disabled={!formData.subdomain}>Continue</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-xl font-bold mb-4">Create the Super Admin Account</h2>
              <Input 
                label="Your Full Name" 
                placeholder="John Doe" 
                value={formData.adminName}
                onChange={e => setFormData({...formData, adminName: e.target.value})}
              />
              <Input 
                label="Admin Email" 
                type="email"
                placeholder="admin@school.com" 
                value={formData.adminEmail}
                onChange={e => setFormData({...formData, adminEmail: e.target.value})}
              />
              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(4)} disabled={!formData.adminName || !formData.adminEmail}>Continue</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <h2 className="text-xl font-bold mb-4">Select your Launch Plan</h2>
              
              <div className="grid grid-cols-1 gap-3">
                <div 
                  className={`p-4 border-2 rounded-xl cursor-pointer ${formData.plan === 'STARTER' ? 'border-indigo-600 bg-primary/10 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-700'}`}
                  onClick={() => setFormData({...formData, plan: 'STARTER'})}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">Starter</h3>
                      <p className="text-sm text-slate-500">Up to 500 students</p>
                    </div>
                    <p className="font-bold text-xl">$99<span className="text-sm text-slate-500 font-normal">/mo</span></p>
                  </div>
                </div>

                <div 
                  className={`p-4 border-2 rounded-xl cursor-pointer ${formData.plan === 'ENTERPRISE' ? 'border-indigo-600 bg-primary/10 dark:bg-primary/10' : 'border-slate-200 dark:border-slate-700'}`}
                  onClick={() => setFormData({...formData, plan: 'ENTERPRISE'})}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">Enterprise</h3>
                      <p className="text-sm text-slate-500">Unlimited students + White Label</p>
                    </div>
                    <p className="font-bold text-xl">$499<span className="text-sm text-slate-500 font-normal">/mo</span></p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>Back</Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => window.location.href = '/dashboard'}>
                  Launch School!
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolSetupWizard;
