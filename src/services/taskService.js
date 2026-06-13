import api from './api';

// ---- Auth ----
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ---- Tasks ----
export const taskAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// ---- Comments ----
export const commentAPI = {
  getAll: (taskId) => api.get(`/tasks/${taskId}/comments`),
  add: (taskId, data) => api.post(`/tasks/${taskId}/comments`, data),
  update: (taskId, commentId, data) => api.put(`/tasks/${taskId}/comments/${commentId}`, data),
  delete: (taskId, commentId) => api.delete(`/tasks/${taskId}/comments/${commentId}`),
};

// ---- Dashboard ----
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
};

// ---- Users ----
export const userAPI = {
  getAll: () => api.get('/users'),
};
