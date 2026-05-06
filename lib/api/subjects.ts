import { ApiResponse, Subject } from "@/types";
import { apiFetch } from "./client";

export const subjectApi = {
  async list(workspaceId?: string): Promise<ApiResponse<Subject[]>> {
    const query = workspaceId ? `?workspaceId=${workspaceId}` : '';
    return apiFetch<Subject[]>(`/subjects${query}`);
  },

  async getById(id: string): Promise<ApiResponse<Subject>> {
    return apiFetch<Subject>(`/subjects/${id}`);
  },

  async create(data: { name: string; code?: string; description?: string; classIds?: string[]; workspaceId: string }): Promise<ApiResponse<Subject>> {
    return apiFetch<Subject>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: { name?: string; code?: string; description?: string; classIds?: string[]; workspaceId?: string }): Promise<ApiResponse<Subject>> {
    return apiFetch<Subject>(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/subjects/${id}`, {
      method: 'DELETE',
    });
  }
};
