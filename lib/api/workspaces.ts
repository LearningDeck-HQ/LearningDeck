import { ApiResponse, AuditLog, Workspace } from "@/types";
import { apiFetch } from "./client";

export type AuditLogFilters = {
  userRole?: 'ADMIN' | 'TEACHER' | 'ALL';
  action?: string;
  timeRange?: 'today' | 'this_week' | 'last_week' | 'all';
};

const buildAuditLogQuery = (filters?: AuditLogFilters) => {
  const params = new URLSearchParams();

  if (filters?.userRole && filters.userRole !== 'ALL') {
    params.set('role', filters.userRole);
  }

  if (filters?.action && filters.action !== 'ALL') {
    params.set('action', filters.action);
  }

  if (filters?.timeRange && filters.timeRange !== 'all') {
    params.set('timeRange', filters.timeRange);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export const workspaceApi = {
  async list(): Promise<ApiResponse<Workspace[]>> {
    return apiFetch<Workspace[]>('/workspaces');
  },

  async getById(id: string): Promise<ApiResponse<Workspace>> {
    return apiFetch<Workspace>(`/workspaces/${id}`);
  },

  async create(data: { name: string; description?: string }): Promise<ApiResponse<Workspace>> {
    return apiFetch<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: Partial<Workspace>): Promise<ApiResponse<Workspace>> {
    return apiFetch<Workspace>(`/workspaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/workspaces/${id}`, {
      method: 'DELETE',
    });
  },

  async setup(data: { workspace_name: string; admin_name: string; admin_email: string; admin_password: string }): Promise<ApiResponse<any>> {
    return apiFetch<any>('/workspaces/setup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createStudent(workspaceId: string, data: any): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/workspaces/${workspaceId}/students`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createTeacher(workspaceId: string, data: any): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/workspaces/${workspaceId}/teachers`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAssignments(workspaceId: string, userId: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/workspaces/${workspaceId}/users/${userId}/assignments`);
  },

  async addAssignment(workspaceId: string, userId: string, data: { subjectId: string; classId: string; examId?: string }): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/workspaces/${workspaceId}/users/${userId}/assignments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteAssignment(workspaceId: string, userId: string, assignmentId: string): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/workspaces/${workspaceId}/users/${userId}/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
  },

  async getUsage(workspaceId: string): Promise<ApiResponse<{ usage: any; limits: any }>> {
    return apiFetch<{ usage: any; limits: any }>(`/workspaces/${workspaceId}/usage`);
  },

  async getAuditLogs(filters?: AuditLogFilters): Promise<ApiResponse<AuditLog[]>> {
    return apiFetch<AuditLog[]>(`/workspaces/audit-logs${buildAuditLogQuery(filters)}`);
  }
};

