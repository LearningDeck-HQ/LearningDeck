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

  async create(data: { name: string; workspaceId: number }): Promise<ApiResponse<Subject>> {
    return apiFetch<Subject>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
