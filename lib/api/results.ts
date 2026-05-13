import { ApiResponse, Result } from "@/types";
import { apiFetch } from "./client";

export const resultApi = {
  async list(params?: { 
    userId?: string; 
    examId?: string; 
    workspaceId?: string;
    classId?: string;
    limit?: number;
    page?: number;
    searchTerm?: string;
  }): Promise<ApiResponse<Result[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          queryParams.append(k, String(v));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
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
