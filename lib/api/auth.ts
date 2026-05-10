import { ApiResponse } from "@/types";
import { AuthData } from "@/types/auth";
import { apiFetch, setAccessToken } from "./client";

export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<AuthData>> {
    const res = await apiFetch<AuthData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ user_email: email, user_password: password }),
    });
    if (res.success && res.data?.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    return res;
  },

  async register(data: any): Promise<ApiResponse<AuthData>> {
    const res = await apiFetch<AuthData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.success && res.data?.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    return res;
  },

  async logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      if (typeof window !== 'undefined') {
        setAccessToken(null);
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  },
  
  async getDesktopCode(): Promise<ApiResponse<{ code: string }>> {
    return apiFetch<{ code: string }>('/auth/desktop-code');
  },

  async verifyToken(): Promise<ApiResponse<any>> {
    return apiFetch<any>('/auth/verify-token');
  },

  async refresh(): Promise<ApiResponse<AuthData>> {
    const res = await apiFetch<AuthData>('/auth/refresh', { method: 'POST' });
    if (res.success && res.data?.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    return res;
  },

  async getSessions(): Promise<ApiResponse<any[]>> {
    return apiFetch<any[]>('/auth/sessions');
  },

  async revokeSession(sessionId: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/auth/sessions/${sessionId}`, { method: 'DELETE' });
  }
};
