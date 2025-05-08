import axios from 'axios';

const usersAPI = axios.create({
  baseURL: import.meta.env.VITE_USERS_SERVICE_URL
});

usersAPI.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userAPI = {
  getUserById: (userId) => usersAPI.get(`/users/${userId}`),
  updateUser: (userId, data) => usersAPI.put(`/users/${userId}`, data),
  changePassword: (data) => usersAPI.post('/users/change-password', data)
};

export const authAPI = {
  login: (email, password) => usersAPI.post('/users/login', { email, password }),
  register: (userData) => usersAPI.post('/users/register', userData),
  getProfile: (userId) => usersAPI.get(`/users/${userId}`),
  getUserById: (userId) => usersAPI.get(`/users/${userId}`),
  updateUser: (userId, data) => usersAPI.put(`/users/${userId}`, data),
 changePassword: (data) => usersAPI.post('/users/change-password', data)
};