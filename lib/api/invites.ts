import { ApiResponse } from "@/types";
import { apiFetch } from "./client";

export const inviteApi = {
  async create(data: { workspaceId: string; role: string }): Promise<ApiResponse<{ token: string }>> {
    return apiFetch<{ token: string }>('/invites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async validate(token: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/invites/${token}`);
  },
};
