import { api } from './api';

export const clientService = {
  getMyProfile: () => api.get('/client/profile'),
  updateProfile: (data: any) => api.put('/client/profile', data),
  requestEmailChange: (newEmail: string) =>
    api.post('/client/profile/request-email-change', { newEmail }),
  verifyEmailChange: (otp: string) =>
    api.post('/client/profile/verify-email-change', { otp }),
  requestPhoneOtp: (phoneNumber: string) =>
    api.post('/client/profile/request-phone-otp', { phoneNumber }),
  verifyPhoneOtp: (otp: string) =>
    api.post('/client/profile/verify-phone-otp', { otp }),
};
