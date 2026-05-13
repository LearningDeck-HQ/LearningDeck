import { ApiResponse, User } from "@/types";
import { apiFetch } from "./client";

export const userApi = {
  async list(params?: { role?: string; workspaceId?: string; classId?: string }): Promise<ApiResponse<User[]>> {
    const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}` : '';
    return apiFetch<User[]>(`/users${query}`);
  },

  async getById(id: string): Promise<ApiResponse<User>> {
    return apiFetch<User>(`/users/${id}`);
  },

  async update(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    return apiFetch<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  async me(): Promise<ApiResponse<User>> {
    const res = await apiFetch<User>('/users/profile');
    if (res.success && res.data) {
      return {
        success: true,
        data: res.data as User
      };
    }
    return {
      success: false,
      message: res.message || 'Failed to fetch user profile'
    };
  },

  async changePassword(data: any): Promise<ApiResponse<any>> {
    return apiFetch<any>('/users/profile/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
};
