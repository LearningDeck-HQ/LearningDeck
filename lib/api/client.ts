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

let accessToken: string | null = null;
//let isRefreshing = false;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  return headers;
};

let isRefreshing = false;

export const apiFetch = async <T>(endpoint: string, options: RequestInit & { skipRefresh?: boolean, redirectOnFailure?: boolean } = {}): Promise<ApiResponse<T>> => {
  const { skipRefresh, redirectOnFailure = true, ...fetchOptions } = options;
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    credentials: 'include',
    headers: {
      ...getHeaders(),
      ...fetchOptions.headers,
    },
  });
  
  if (response.status === 401 && !skipRefresh && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
    if (typeof window !== 'undefined' && !isRefreshing) {
      isRefreshing = true;
      
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        
        const result = await refreshRes.json();
        
        if (result.success && result.data?.accessToken) {
          accessToken = result.data.accessToken;
          isRefreshing = false;
          // Retry original request
          return apiFetch<T>(endpoint, options);
        }
      } catch (e) {
        console.error("Token refresh failed", e);
      }
      
      isRefreshing = false;
      accessToken = null;
      localStorage.removeItem('user');
      
      // Only redirect if allowed and we are not already on the login page
      if (redirectOnFailure && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }
  
  return response.json();
};
