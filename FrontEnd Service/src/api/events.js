import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_EVENTS_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});


axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const eventsAPI = {
  getAll: () => axiosInstance.get('/events'),
  getByUser: (userId) => axiosInstance.get(`/events/user/${userId}`),
  getById: (id) => axiosInstance.get(`/events/${id}`),
  create: (eventData) => axiosInstance.post('/events', eventData),
  update: (id, eventData) => axiosInstance.put(`/events/${id}`, eventData),
  delete: (id) => axiosInstance.delete(`/events/${id}`)
};
