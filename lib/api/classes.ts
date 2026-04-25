import { ApiResponse, Class } from "@/types";
import { apiFetch } from "./client";

export const classApi = {
  async list(workspaceId?: number): Promise<ApiResponse<Class[]>> {
    const query = workspaceId ? `?workspaceId=${workspaceId}` : '';
    return apiFetch<Class[]>(`/classes${query}`);
  },

  async getById(id: number): Promise<ApiResponse<Class>> {
    return apiFetch<Class>(`/classes/${id}`);
  },

  async create(data: { name: string; workspaceId: number }): Promise<ApiResponse<Class>> {
    return apiFetch<Class>('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
