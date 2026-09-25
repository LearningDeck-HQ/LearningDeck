"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { BookOpen, GraduationCap, ArrowRight, ClipboardList } from 'lucide-react';
import { ScaleLoader } from 'react-spinners';
import { useQuery } from '@tanstack/react-query';
import { workspaceApi } from '@/lib/api/workspaces';
import { useUser } from '@/hooks/useUser';
import { useSidebar } from '@/context/SidebarContext';

interface TeacherAssignment {
  id: string;
  subjectId: string;
  classId: string;
  subject?: { name: string };
  class?: { name: string };
}

const AssignmentsPage = () => {
  const router = useRouter();
  const { data: user } = useUser();
  const workspaceId = user?.workspaceId;
  const { isLeftSidebarCollapsed } = useSidebar();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['my-assignments', user?.id],
    queryFn: async () => {
      if (!workspaceId || !user?.id) return [];
      const res = await workspaceApi.getAssignments(workspaceId, user.id);
      return (res.data || []) as TeacherAssignment[];
    },
    enabled: !!workspaceId && !!user?.id,
  });

  const handleOpen = (assignment: TeacherAssignment) => {
    router.push(`/workspace/questions?subjectId=${assignment.subjectId}&classId=${assignment.classId}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className={`${isLeftSidebarCollapsed ? 'sticky z-50' : ''} flex bg-[#f9f9f9] top-0 h-full w-full border-b border-[#ededed]`}>
        <DashboardHeader
          title="Assignments"
          description="Subjects and classes assigned to you. Select one to manage its questions."
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <ScaleLoader barCount={3} color="#a7a7a7ff" height={18} width={4} />
          </div>
        ) : assignments.length > 0 ? (
          assignments.map((assignment) => (
            <button
              key={assignment.id}
              onClick={() => handleOpen(assignment)}
              className="group text-left border-y border-zinc-400/20 bg-white overflow-hidden hover:bg-zinc-300/10 transition-all duration-200"
            >
              <div className="px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center justify-center bg-zinc-300/20 text-[#0e0f10] rounded-sm px-1.5 py-1">
                    <ClipboardList size={15} />
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-[#0e0f10] tracking-tight">
                      {assignment.subject?.name || 'Unknown subject'}
                    </h3>
                    <div className="flex items-center gap-x-4 gap-y-1 text-xs text-[#6b6b6b]">
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={11} /> {assignment.subject?.name || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <GraduationCap size={11} /> {assignment.class?.name || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#6b6b6b] group-hover:text-[#0e0f10] group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-sm border border-dashed border-zinc-400/30 flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-sm flex items-center justify-center mb-6">
              <ClipboardList size={28} className="text-[#6b6b6b]" />
            </div>
            <h3 className="text-sm font-medium text-[#0e0f10] mb-2">No assignments yet</h3>
            <p className="text-xs text-[#6b6b6b] max-w-xs mx-auto leading-relaxed">
              An administrator hasn't assigned you to any subject/class combination yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentsPage;
