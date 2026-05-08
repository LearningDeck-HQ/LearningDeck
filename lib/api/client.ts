import { ApiResponse } from "@/types";

const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  try {
    // Check if it's base64 encoded (common in this project's .env)
    if (url.includes('aHR0')) {
      return atob(url);
    }
  } catch (e) {}
  return url;
};

const API_URL = getApiUrl();

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

export const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });
  
  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
  
  return response.json();
};
