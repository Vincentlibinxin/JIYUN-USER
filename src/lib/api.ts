import { API_BASE } from './config';

export interface User {
  id: number;
  username: string;
  phone: string | null;
  email: string | null;
  real_name: string | null;
  address: string | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as ApiError).error || '请求失败');
  }

  return data;
}

export const api = {
  auth: {
    register: (username: string, password: string, phone?: string, email?: string) =>
      request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, phone, email }),
      }),

    login: (username: string, password: string) =>
      request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),

    getMe: () =>
      request<{ user: User }>('/auth/me'),

    sendSMS: (phone: string) =>
      request<{ message: string }>('/auth/send-sms', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      }),

    verifyCode: (phone: string, code: string) =>
      request<{ message: string }>('/auth/verify-code', {
        method: 'POST',
        body: JSON.stringify({ phone, code }),
      }),
  },

  user: {
    getProfile: () =>
      request<{ user: User }>('/user/profile'),
  },
};
