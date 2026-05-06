import { ApiResponse, Exam } from "@/types";
import { apiFetch } from "./client";

export const examApi = {
  async list(params?: { workspaceId?: string; classId?: string }): Promise<ApiResponse<Exam[]>> {
    const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}` : '';
    return apiFetch<Exam[]>(`/exams${query}`);
  },

  async getById(id: string): Promise<ApiResponse<Exam>> {
    return apiFetch<Exam>(`/exams/${id}`);
  },

  async create(data: { exam_name: string; minutes: number; workspaceId: string; classId: string; visible?: boolean }): Promise<ApiResponse<Exam>> {
    return apiFetch<Exam>('/exams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any): Promise<ApiResponse<Exam>> {
    return apiFetch<Exam>(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/exams/${id}`, {
      method: 'DELETE',
    });
  }
};
