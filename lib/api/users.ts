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
  }
};
