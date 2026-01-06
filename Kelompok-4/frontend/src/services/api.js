import axios from 'axios';

// 1. Setup Axios dasar
const api = axios.create({
  baseURL: 'http://localhost:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor untuk Token (agar login terjaga)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- DEFINISI SERVICE (INI YANG HILANG SEBELUMNYA) ---

export const menuService = {
  getMenus: () => api.get('/menus'),
  createMenu: (data) => api.post('/menus', data),
  updateMenu: (id, data) => api.put(`/menus/${id}`, data),
  deleteMenu: (id) => api.delete(`/menus/${id}`),
};

export const orderService = {
  getOrders: () => api.get('/orders'),
  createOrder: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
};

// Export default wajib ada
export default api;