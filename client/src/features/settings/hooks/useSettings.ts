import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api/settingsApi';
import toast from 'react-hot-toast';

export const useSettings = () => {
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update profile');
    }
  });

  const uploadAvatar = useMutation({
    mutationFn: settingsApi.uploadAvatar,
    onSuccess: () => {
      toast.success('Avatar uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload avatar');
    }
  });

  const changePassword = useMutation({
    mutationFn: settingsApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to change password');
    }
  });

  const updateSchool = useMutation({
    mutationFn: settingsApi.updateSchool,
    onSuccess: () => {
      toast.success('School details updated successfully');
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update school details');
    }
  });

  const updateNotifications = useMutation({
    mutationFn: settingsApi.updateNotifications,
    onSuccess: () => {
      toast.success('Notification preferences updated');
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update notifications');
    }
  });

  const disableMfa = useMutation({
    mutationFn: settingsApi.disableMfa,
    onSuccess: () => {
      toast.success('MFA disabled successfully');
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to disable MFA');
    }
  });

  const revokeSession = useMutation({
    mutationFn: settingsApi.revokeSession,
    onSuccess: () => {
      toast.success('Session revoked');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error: any) => {
      toast.error('Failed to revoke session');
    }
  });

  return {
    updateProfile,
    uploadAvatar,
    changePassword,
    updateSchool,
    updateNotifications,
    disableMfa,
    revokeSession
  };
};
