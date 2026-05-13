import { ApiResponse, Question } from "@/types";
import { apiFetch } from "./client";

export const questionApi = {
  async list(params?: { 
    workspaceId?: string; 
    examId?: string; 
    subjectId?: string; 
    classId?: string;
    limit?: number;
    page?: number;
    searchTerm?: string;
  }): Promise<ApiResponse<Question[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          queryParams.append(k, String(v));
        }
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiFetch<Question[]>(`/questions${query}`);
  },

  async getById(id: string): Promise<ApiResponse<Question>> {
    return apiFetch<Question>(`/questions/${id}`);
  },


  async create(data: any): Promise<ApiResponse<Question>> {
    return apiFetch<Question>('/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: any): Promise<ApiResponse<Question>> {
    return apiFetch<Question>(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/questions/${id}`, {
      method: 'DELETE',
    });
  }
};
