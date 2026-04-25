import { ApiResponse, Result } from "@/types";
import { apiFetch } from "./client";

export const resultApi = {
  async list(params?: { userId?: number; examId?: number }): Promise<ApiResponse<Result[]>> {
    const query = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}` : '';
    return apiFetch<Result[]>(`/results${query}`);
  },

  async getById(id: number): Promise<ApiResponse<Result>> {
    return apiFetch<Result>(`/results/${id}`);
  },

  async getByUser(userId: number): Promise<ApiResponse<Result[]>> {
    return apiFetch<Result[]>(`/results/user/${userId}`);
  }
};
