import { api } from './api';

export const clientService = {
  getMyProfile: () => api.get('/client/profile'),
  updateProfile: (data: any) => api.put('/client/profile', data),
};
