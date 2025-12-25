import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

// Daily Logs API
export const dailyLogApi = {
  getAll: (params) => api.get('/daily-logs', { params }),
  getOne: (id) => api.get(`/daily-logs/${id}`),
  create: (data) => api.post('/daily-logs', data),
  update: (id, data) => api.put(`/daily-logs/${id}`, data),
  delete: (id) => api.delete(`/daily-logs/${id}`),
  statistics: () => api.get('/daily-logs/statistics'),
};

// Verification API
export const verificationApi = {
  getSubordinates: () => api.get('/verification/subordinates'),
  getPendingLogs: (params) => api.get('/verification/pending-logs', { params }),
  approve: (id) => api.post(`/verification/approve/${id}`),
  reject: (id, data) => api.post(`/verification/reject/${id}`, data),
  bulkApprove: (logIds) => api.post('/verification/bulk-approve', { log_ids: logIds }),
  statistics: () => api.get('/verification/statistics'),
};

// Employee API
export const employeeApi = {
  getAll: (params) => api.get('/employees', { params }),
  getOne: (id) => api.get(`/employees/${id}`),
  getOrganization: () => api.get('/employees/organization'),
};
