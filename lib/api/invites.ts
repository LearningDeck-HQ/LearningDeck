import { ApiResponse } from "@/types";
import { apiFetch } from "./client";

export const inviteApi = {
  async list(): Promise<ApiResponse<any[]>> {
    return apiFetch<any[]>('/invites');
  },

  async create(data: { email: string; role: string; classId?: string }): Promise<ApiResponse<any>> {
    return apiFetch<any>('/invites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async resend(id: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/invites/resend/${id}`, {
      method: 'POST',
    });
  },

  async revoke(id: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/invites/${id}`, {
      method: 'DELETE',
    });
  },

  async validate(token: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/invites/${token}`);
  },
};
