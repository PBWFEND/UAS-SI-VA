// API Configuration - Update this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Token management
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }

  return data;
}

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Inventory {
  id: string;
  name: string;
  category: string;
  quantity: number;
  description?: string;
  userId: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

// Auth API
export const authApi = {
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getProfile: async (): Promise<User> => {
    return apiRequest<User>('/users/profile');
  },
};

// Inventory API
export const inventoryApi = {
  getAll: async (): Promise<Inventory[]> => {
    const response = await apiRequest<{ data: Inventory[] } | Inventory[]>('/inventory');
    return Array.isArray(response) ? response : response.data;
  },

  getById: async (id: string): Promise<Inventory> => {
    return apiRequest<Inventory>(`/inventory/${id}`);
  },

  create: async (data: Omit<Inventory, 'id' | 'userId' | 'createdAt'>): Promise<Inventory> => {
    return apiRequest<Inventory>('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Omit<Inventory, 'id' | 'userId' | 'createdAt'>>): Promise<Inventory> => {
    return apiRequest<Inventory>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(`/inventory/${id}`, {
      method: 'DELETE',
    });
  },
};
