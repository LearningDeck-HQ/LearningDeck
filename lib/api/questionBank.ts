import { ApiResponse, QuestionBankItem, BankImportResult } from "@/types";
import { apiFetch } from "./client";

export const questionBankApi = {
  async list(params?: { workspaceId?: string; searchTerm?: string; limit?: number; page?: number }): Promise<ApiResponse<QuestionBankItem[]>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) queryParams.append(k, String(v));
      });
    }
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiFetch<QuestionBankItem[]>(`/question-bank${query}`);
  },

  async exportFromExam(data: { examId: string; deleteOriginal: boolean }): Promise<ApiResponse<QuestionBankItem[]>> {
    return apiFetch<QuestionBankItem[]>('/question-bank/export', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async importItems(data: { ids: string[]; deleteFromBank: boolean; examId?: string; subjectId?: string; classId?: string }): Promise<ApiResponse<BankImportResult<any>>> {
    return apiFetch<BankImportResult<any>>('/question-bank/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/question-bank/${id}`, {
      method: 'DELETE',
    });
  }
};
