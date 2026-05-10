import { ApiResponse } from "@/types";
import { apiFetch } from "./client";

export interface BillingInitializeData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export const billingApi = {
  async initialize(data: {
    workspaceId: string;
    plan: string;
    amount: number;
    email: string;
  }): Promise<ApiResponse<BillingInitializeData>> {
    return apiFetch<BillingInitializeData>('/billing/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getSubscription(workspaceId: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/billing/subscription/${workspaceId}`);
  },

  async getTransactions(workspaceId: string): Promise<ApiResponse<any[]>> {
    return apiFetch<any[]>(`/billing/transactions/${workspaceId}`);
  }
};
