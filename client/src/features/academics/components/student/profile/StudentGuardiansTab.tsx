import React from 'react';
import { Users, Phone, Mail, MapPin, ShieldAlert, Heart } from 'lucide-react';

interface StudentGuardiansTabProps {
  student: any;
}

export const StudentGuardiansTab: React.FC<StudentGuardiansTabProps> = ({ student }) => {
  const { parentRelations = [] } = student;

  if (parentRelations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 flex items-center justify-center">
          <Users className="h-8 w-8" />
        </div>
        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">No Guardians Assigned</p>
        <p className="text-sm mt-2">Parent and emergency contact profiles will appear here.</p>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Emergency Contacts</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {parentRelations.map((relation: any) => {
          const parent = relation.parent;
          const profile = parent.profile || {};
          
          return (
            <div key={relation.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center border border-primary/30 dark:border-primary/30">
                  <span className="text-2xl font-bold text-primary dark:text-primary">
                    {parent.firstName.charAt(0)}{parent.lastName.charAt(0)}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-xl font-bold text-slate-800 dark:text-white truncate">
                    {parent.firstName} {parent.lastName}
                  </h4>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 uppercase tracking-wider">
                    <Heart className="h-3 w-3" />
                    {relation.relationship}
                  </span>
                </div>
                
                <div className="space-y-3 mt-4">
                  {profile.phoneNumber && (
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-md">
                        <Phone className="h-4 w-4 text-slate-500" />
                      </div>
                      <a href={`tel:${profile.phoneNumber}`} className="hover:text-primary font-medium transition-colors">
                        {profile.phoneNumber}
                      </a>
                    </div>
                  )}
                  
                  {parent.email && (
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-md">
                        <Mail className="h-4 w-4 text-slate-500" />
                      </div>
                      <a href={`mailto:${parent.email}`} className="hover:text-primary font-medium transition-colors truncate">
                        {parent.email}
                      </a>
                    </div>
                  )}

                  {profile.address && (
                    <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-md mt-0.5">
                        <MapPin className="h-4 w-4 text-slate-500" />
                      </div>
                      <span className="leading-relaxed">
                        {profile.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
