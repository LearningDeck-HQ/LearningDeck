import { ApiResponse, Class } from "@/types";
import { apiFetch } from "./client";

export const classApi = {
  async list(workspaceId?: string): Promise<ApiResponse<Class[]>> {
    const query = workspaceId ? `?workspaceId=${workspaceId}` : '';
    return apiFetch<Class[]>(`/classes${query}`);
  },

  async getById(id: string): Promise<ApiResponse<Class>> {
    return apiFetch<Class>(`/classes/${id}`);
  },

  async create(data: { name: string; workspaceId: string }): Promise<ApiResponse<Class>> {
    return apiFetch<Class>('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any): Promise<ApiResponse<Class>> {
    return apiFetch<Class>(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/classes/${id}`, {
      method: 'DELETE',
    });
  }
};
