import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_REGISTRATIONS_SERVICE_URL,
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

export const registrationAPI = {
  getRegistrations: () => axiosInstance.get('/registrations'),
  createRegistration: (eventId) => axiosInstance.post('/registrations', { 
    eventId,
    userId: localStorage.getItem('userId') // Ensure server expects these parameters
  }),
  cancelRegistration: (registrationId) => axiosInstance.delete(`/registrations/${registrationId}`)
};
