import axios from 'axios';

// Detectar entorno automáticamente (Vite lo hace por nosotros)
const isProduction = import.meta.env.PROD;

const API_URL = isProduction 
  ? 'https://offszn-oc7c.onrender.com/api'
  : 'http://localhost:3000/api'; // O tu URL local

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor opcional: si quieres mandar el token en cada petición automáticamente
/*
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken'); // O desde el store
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
*/