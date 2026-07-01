import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/authContext';
import { useSettings } from '../hooks/useSettings';
import { Loader2 } from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { updateProfile, uploadAvatar } = useSettings();
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.profile?.avatarUrl ? `http://localhost:5000${user.profile.avatarUrl}` : null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
      if (user.profile?.avatarUrl) {
        setAvatarPreview(`http://localhost:5000${user.profile.avatarUrl}`);
      }
    }
  }, [user]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);

    await uploadAvatar.mutateAsync(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const getInitials = () => {
    return `${formData.firstName?.[0] || ''}${formData.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Profile Settings</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary text-2xl font-bold overflow-hidden relative">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              getInitials()
            )}
            {uploadAvatar.isPending && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}
          </div>
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/png, image/jpeg, image/gif" 
              className="hidden" 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadAvatar.isPending}
              className="bg-primary hover:bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors mb-2 disabled:opacity-50"
            >
              Upload Avatar
            </button>
            <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size of 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">First Name</label>
            <input 
              type="text" 
              required
              value={formData.firstName}
              onChange={e => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Last Name</label>
            <input 
              type="text" 
              required
              value={formData.lastName}
              onChange={e => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" 
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" 
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit"
            disabled={updateProfile.isPending}
            className="flex items-center gap-2 bg-primary hover:bg-primary disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-primary/20"
          >
            {updateProfile.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
