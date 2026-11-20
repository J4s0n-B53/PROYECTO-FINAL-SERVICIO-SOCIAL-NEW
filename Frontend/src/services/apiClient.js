/*import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  r => r,
  err => {
    const is401 = err.response?.status === 401;
    const isAuthEndpoint = ['/auth/login', '/auth/me', '/auth/logout'].some(path =>
      err.config?.url?.includes(path)
    );

    if (is401 && !isAuthEndpoint) {
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export default api;*/


import axios from 'axios';

// Detecta automáticamente si estás en la PC (localhost) o en el celular (usando la IP de red)
const getBaseUrl = () => {
  // Si la ventana está abierta, usa el hostname actual de la barra de direcciones pero con el puerto del backend (4000)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname; // Será 'localhost' o '192.168.1.37'
    return `http://${hostname}:4000/api`;
  }
  return 'http://localhost:4000/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
});

api.interceptors.response.use(
  r => r,
  err => {
    const is401 = err.response?.status === 401;
    const isAuthEndpoint = ['/auth/login', '/auth/me', '/auth/logout'].some(path =>
      err.config?.url?.includes(path)
    );

    if (is401 && !isAuthEndpoint) {
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export default api;