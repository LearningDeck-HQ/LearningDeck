import { ApiResponse } from "@/types";
import { AuthData } from "@/types/auth";
import { apiFetch } from "./client";

export const authApi = {
  async login(email: string, password: string): Promise<ApiResponse<AuthData>> {
    return apiFetch<AuthData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ user_email: email, user_password: password }),
    });
  },

  async register(data: any): Promise<ApiResponse<AuthData>> {
    return apiFetch<AuthData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  }
};
