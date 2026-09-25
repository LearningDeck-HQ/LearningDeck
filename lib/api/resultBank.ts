import { ApiResponse, ResultBankItem, BankImportResult } from "@/types";
import { apiFetch } from "./client";

export const resultBankApi = {
  async list(params?: { workspaceId?: string; searchTerm?: string; limit?: number; page?: number }): Promise<ApiResponse<ResultBankItem[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) queryParams.append(k, String(v));
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiFetch<ResultBankItem[]>(`/result-bank${query}`);
  },

  async exportResults(data: { resultIds: string[]; deleteOriginal: boolean }): Promise<ApiResponse<ResultBankItem[]>> {
    return apiFetch<ResultBankItem[]>('/result-bank/export', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async importItems(data: { ids: string[]; deleteFromBank: boolean }): Promise<ApiResponse<BankImportResult<any>>> {
    return apiFetch<BankImportResult<any>>('/result-bank/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/result-bank/${id}`, {
      method: 'DELETE',
    });
  }
};
