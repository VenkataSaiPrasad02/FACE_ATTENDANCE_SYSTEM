import api from './api';

const userService = {
  getAll: async () => {
    const response = await api.get('/api/users');
    return response.data;
  },

  createAdmin: async (data) => {
    const response = await api.post('/api/users/admin', data);
    return response.data;
  },

  getAllAdmins: async () => {
    const response = await api.get('/api/users/admins');
    return response.data;
  },

  updateAdmin: async (id, data) => {
    const response = await api.put(`/api/users/admin/${id}`, data);
    return response.data;
  },

  deleteAdmin: async (id) => {
    const response = await api.delete(`/api/users/admin/${id}`);
    return response.data;
  },

  getMyProfile: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  },

  updateMyProfile: async (data) => {
    const response = await api.put('/api/users/me', data);
    return response.data;
  },

  // NEW — profile photo
  uploadMyProfilePhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/users/me/photo', formData);
    return response.data;
  },

  removeMyProfilePhoto: async () => {
    const response = await api.delete('/api/users/me/photo');
    return response.data;
  },
};

export default userService;