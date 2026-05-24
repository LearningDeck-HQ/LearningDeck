  'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { workspaceApi } from '@/lib/api/workspaces';

const AuditLogs = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['workspace-audit-logs'],
    queryFn: async () => {
      const res = await workspaceApi.getAuditLogs();
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Failed to load audit logs');
      }
      return res.data;
    },
    staleTime: 60_000,
  });

  return (
    <div className="p-6">
      <div className="mb-6">
       
        <h1 className="text-sm font-medium text-slate-900">Audit logs</h1>
      </div>

      {isLoading && (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading audit logs...
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Failed to load audit logs'}
        </div>
      )}

      {!isLoading && !isError && (!data || data.length === 0) && (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-500">
          No audit activity yet.
        </div>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="overflow-x-auto rounded border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Time</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">User</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Action</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {log.user?.user_name || 'System'}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {log.action.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {log.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;