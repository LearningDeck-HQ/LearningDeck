import { ApiResponse, StudentBankItem, BankImportResult } from "@/types";
import { apiFetch } from "./client";

export const studentBankApi = {
  async list(params?: { workspaceId?: string; searchTerm?: string; limit?: number; page?: number }): Promise<ApiResponse<StudentBankItem[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) queryParams.append(k, String(v));
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiFetch<StudentBankItem[]>(`/student-bank${query}`);
  },

  async exportStudents(data: { userIds: string[]; deleteOriginal: boolean }): Promise<ApiResponse<StudentBankItem[]>> {
    return apiFetch<StudentBankItem[]>('/student-bank/export', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async importItems(data: { ids: string[]; deleteFromBank: boolean }): Promise<ApiResponse<BankImportResult<any>>> {
    return apiFetch<BankImportResult<any>>('/student-bank/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/student-bank/${id}`, {
      method: 'DELETE',
    });
  }
};
