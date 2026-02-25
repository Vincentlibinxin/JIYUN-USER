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

function tryParseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
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

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(`无法连接到服务器（${API_BASE}），请确认后端已启动且网络可达`);
  }

  const rawText = await response.text();
  const contentType = response.headers.get('content-type') || '';
  const data = rawText
    ? (contentType.includes('application/json') ? tryParseJson(rawText) : tryParseJson(rawText) ?? { error: rawText })
    : null;

  if (!response.ok) {
    if (response.status === 500 && !rawText.trim()) {
      throw new Error('后端服务不可达（localhost:3001），请先启动后端服务');
    }

    const errorMessage =
      (data as ApiError | null)?.error ||
      (typeof data === 'string' ? data : '') ||
      rawText ||
      `请求失败（${response.status}）`;
    throw new Error(errorMessage);
  }

  if (data === null) {
    return {} as T;
  }

  return data as T;
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
