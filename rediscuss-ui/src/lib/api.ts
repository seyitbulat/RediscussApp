import axios from "axios";


const API_BASE_URL = 'http://localhost:5293';

const api = axios.create({
  baseURL: API_BASE_URL,
});


api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('rediscuss_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;