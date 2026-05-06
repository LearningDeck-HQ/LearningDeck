import { ApiResponse, Subject } from "@/types";
import { apiFetch } from "./client";

export const subjectApi = {
  async list(workspaceId?: number): Promise<ApiResponse<Subject[]>> {
    const query = workspaceId ? `?workspaceId=${workspaceId}` : '';
    return apiFetch<Subject[]>(`/subjects${query}`);
  },

  async getById(id: number): Promise<ApiResponse<Subject>> {
    return apiFetch<Subject>(`/subjects/${id}`);
  },

  async create(data: { name: string; code?: string; description?: string; classIds?: number[]; workspaceId: number }): Promise<ApiResponse<Subject>> {
    return apiFetch<Subject>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: { name?: string; code?: string; description?: string; classIds?: number[]; workspaceId?: number }): Promise<ApiResponse<Subject>> {
    return apiFetch<Subject>(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/subjects/${id}`, {
      method: 'DELETE',
    });
  }
};
