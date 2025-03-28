import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (name: string, email: string, password: string) => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
  
  // Add this if you implement forgot password functionality in the backend
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
};

// Category API endpoints
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  create: (data: { name: string, order: number }) => 
    api.post('/categories', data),
  update: (id: string, data: { name?: string, order?: number }) => 
    api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
  // We'll need to create this endpoint on the backend
  reorder: (id: string, newOrder: number) => 
    api.put(`/categories/${id}/reorder`, { order: newOrder }),
};

// Album API endpoints
export const albumAPI = {
  getAll: (categoryId?: string) => {
    const url = categoryId ? `/albums?categoryId=${categoryId}` : '/albums';
    return api.get(url);
  },
  getById: (id: string) => api.get(`/albums/${id}`),
  create: (data: { name: string, categoryId: string, coverImage?: string, order?: number,description?:string }) => 
    api.post('/albums', data),
  update: (id: string, data: { name?: string, categoryId?: string, coverImage?: string, order?: number }) => 
    api.put(`/albums/${id}`, data),
  delete: (id: string) => api.delete(`/albums/${id}`),
  reorder: (id: string, categoryId: string, newOrder: number) => 
    api.put(`/albums/${id}/reorder`, { categoryId, order: newOrder }),
};

// Export other API endpoints (images, etc.)
// ...

export default api;
