import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyEmail: (token) => api.post('/auth/verify-email', { token })
};

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getPotentialMatches: () => api.get('/user/potential-matches'),
  getSmartMatches: () => api.get('/user/smart-matches'),
  performAction: (targetUserId, action) => api.post('/user/action', { targetUserId, action }),
  uploadPhoto: (formData) => api.post('/user/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMatches: () => api.get('/user/matches'),
  blockUser: (userId) => api.post('/user/block', { userId })
};

export const messageAPI = {
  sendMessage: (receiverId, content) => api.post('/messages', { receiverId, content }),
  getMessages: (userId) => api.get(`/messages/${userId}`)
};

export default api;
