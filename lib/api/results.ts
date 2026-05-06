import { ApiResponse, Result } from "@/types";
import { apiFetch } from "./client";

export const resultApi = {
  async list(params?: { userId?: string; examId?: string; workspaceId?: string }): Promise<ApiResponse<Result[]>> {
    const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}` : '';
    return apiFetch<Result[]>(`/results${query}`);
  },

  async getById(id: string): Promise<ApiResponse<Result>> {
    return apiFetch<Result>(`/results/${id}`);
  },

  async getByUser(userId: string): Promise<ApiResponse<Result[]>> {
    return apiFetch<Result[]>(`/results/user/${userId}`);
  },

  async delete(id: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/results/${id}`, {
      method: 'DELETE',
    });
  }
};
