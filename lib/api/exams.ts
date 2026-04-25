import { ApiResponse, Exam } from "@/types";
import { apiFetch } from "./client";

export const examApi = {
  async list(params?: { workspaceId?: number; classId?: number }): Promise<ApiResponse<Exam[]>> {
    const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}` : '';
    return apiFetch<Exam[]>(`/exams${query}`);
  },

  async getById(id: number): Promise<ApiResponse<Exam>> {
    return apiFetch<Exam>(`/exams/${id}`);
  },

  async create(data: { exam_name: string; minutes: number; workspaceId: number; classId: number }): Promise<ApiResponse<Exam>> {
    return apiFetch<Exam>('/exams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
