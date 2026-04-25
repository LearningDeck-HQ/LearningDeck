import { ApiResponse, User } from "@/types";
import { apiFetch } from "./client";

export const userApi = {
  async list(params?: { role?: string; workspaceId?: number; classId?: number }): Promise<ApiResponse<User[]>> {
    const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}` : '';
    return apiFetch<User[]>(`/users${query}`);
  },

  async getById(id: number): Promise<ApiResponse<User>> {
    return apiFetch<User>(`/users/${id}`);
  },

  async update(id: number, data: Partial<User>): Promise<ApiResponse<User>> {
    return apiFetch<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/users/${id}`, {
      method: 'DELETE',
    });
  }
};
