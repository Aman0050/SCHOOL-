import api from '../../../lib/api';

export const settingsApi = {
  updateProfile: async (data: { firstName: string; lastName: string; email: string }) => {
    const res = await api.put('/settings/profile', data);
    return res.data;
  },
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.post('/settings/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  changePassword: async (data: any) => {
    const res = await api.put('/settings/security/password', data);
    return res.data;
  },
  updateSchool: async (data: any) => {
    const res = await api.put('/settings/school', data);
    return res.data;
  },
  updateNotifications: async (preferences: any) => {
    const res = await api.put('/settings/notifications', preferences);
    return res.data;
  },
  setupMfa: async () => {
    const res = await api.post('/mfa/setup');
    return res.data;
  },
  verifyMfa: async (data: { token: string }) => {
    const res = await api.post('/mfa/verify', data);
    return res.data;
  },
  disableMfa: async (data: { password: string }) => {
    const res = await api.post('/settings/security/mfa/disable', data);
    return res.data;
  },
  getSessions: async () => {
    const res = await api.get('/auth/sessions');
    return res.data.data;
  },
  revokeSession: async (sessionId: string) => {
    const res = await api.delete(`/auth/sessions/${sessionId}`);
    return res.data;
  }
};
