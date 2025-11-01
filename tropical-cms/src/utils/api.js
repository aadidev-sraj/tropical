import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Featured API
export const featuredAPI = {
  getAll: () => api.get('/featured'),
  create: (data) => api.post('/featured', data),
  update: (id, data) => api.put(`/featured/${id}`, data),
  delete: (id) => api.delete(`/featured/${id}`),
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

// Upload API
export const uploadAPI = {
  single: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  multiple: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (filename) => api.delete(`/upload/${filename}`),
};

export const heroAPI = {
  getActive: () => api.get('/hero'),
  getAll: () => api.get('/hero/all'),
  create: (data) => api.post('/hero', data),
  update: (id, data) => api.put(`/hero/${id}`, data),
  delete: (id) => api.delete(`/hero/${id}`),
};

// Convert image URLs from backend to absolute, normalizing localhost or mismatched origins
export function toImageUrl(u) {
  if (!u) return undefined;
  
  try {
    // Absolute URL provided
    if (/^https?:\/\//i.test(u)) {
      const url = new URL(u);
      const api = new URL(API_URL);
      const path = url.pathname + (url.search || '');
      // If the stored absolute URL points to localhost or a different host, and looks like an asset path, rewrite to API origin
      const isLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(url.hostname);
      const isForeignHost = url.host !== api.host;
      const isAssetPath = /^(\/uploads\/|\/assets\/|\/images\/)/i.test(url.pathname);
      
      if ((isLocalhost || isForeignHost) && isAssetPath) {
        return api.origin + path;
      }
      return u; // keep as-is
    }

    // Protocol-relative
    if (/^\/\//.test(u)) {
      const api = new URL(API_URL);
      return `${api.protocol}${u}`;
    }

    // Relative path
    const startsWithSlash = u.startsWith('/');
    return (startsWithSlash ? API_URL + u : API_URL + '/' + u);
  } catch {
    // Fallback: best-effort join
    const startsWithSlash = u.startsWith('/');
    return (startsWithSlash ? API_URL + u : API_URL + '/' + u);
  }
}
