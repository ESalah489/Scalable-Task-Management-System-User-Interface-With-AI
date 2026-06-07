import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('Network Error - Is backend running on port 5000?');
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const createTask = (taskData) => api.post('/tasks', taskData);
export const getAllTasks = (page = 1, limit = 10) => 
  api.get('/tasks', { params: { page, limit } });
export const getTaskById = (id) => api.get(`/tasks/${id}`);
export const updateTask = (id, taskData) => api.put(`/tasks/${id}`, taskData);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const filterTasksByStatus = (status, page = 1, limit = 10) => 
  api.get(`/tasks/status/${status}`, { params: { page, limit } });
export const searchTasks = (query, page = 1, limit = 10) => 
  api.get('/tasks/search', { params: { q: query, page, limit } });

export default api;