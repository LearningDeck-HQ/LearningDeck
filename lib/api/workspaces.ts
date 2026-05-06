import { ApiResponse, Workspace } from "@/types";
import { apiFetch } from "./client";

export const workspaceApi = {
  async list(): Promise<ApiResponse<Workspace[]>> {
    return apiFetch<Workspace[]>('/workspaces');
  },

  async getById(id: number): Promise<ApiResponse<Workspace>> {
    return apiFetch<Workspace>(`/workspaces/${id}`);
  },

  async create(data: { name: string; description?: string }): Promise<ApiResponse<Workspace>> {
    return apiFetch<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: number, data: Partial<Workspace>): Promise<ApiResponse<Workspace>> {
    return apiFetch<Workspace>(`/workspaces/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id: number): Promise<ApiResponse<any>> {
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

  async createStudent(workspaceId: number, data: any): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/workspaces/${workspaceId}/students`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createTeacher(workspaceId: number, data: any): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/workspaces/${workspaceId}/teachers`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getAssignments(workspaceId: number, userId: number): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/workspaces/${workspaceId}/users/${userId}/assignments`);
  },

  async addAssignment(workspaceId: number, userId: number, data: { subjectId: number; classId: number }): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/workspaces/${workspaceId}/users/${userId}/assignments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteAssignment(workspaceId: number, userId: number, assignmentId: number): Promise<ApiResponse<any>> {
    return apiFetch<any>(`/workspaces/${workspaceId}/users/${userId}/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
  }
};

