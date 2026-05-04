"use client";

import React, { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Briefcase, Plus, Users, BookOpen, GraduationCap, FileText, ChevronRight } from 'lucide-react';
import { workspaceApi } from '@/lib/api/workspaces';
import { Workspace } from '@/types';

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await workspaceApi.list();
        if (res.data) setWorkspaces(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 selection:bg-blue-100">
      <DashboardHeader
        title="Workspace Management"
        description="Organize your educational institutions and departments into isolated containers."
      >
        <Button className="bg-blue-600 text-white text-[14px] font-medium px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-none border-none">
          <Plus className="w-4 h-4" />
          Create Workspace
        </Button>
      </DashboardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="h-[280px] animate-pulse shadow-none">
              <CardContent className="p-8 h-full rounded" >
                <div/>
                </CardContent>
            </Card>
          ))
        ) : workspaces.length > 0 ? (
          workspaces.map((ws) => (
            <Card key={ws.id} className="group bg-white hover:border-blue-300 hover: transition-all shadow-none overflow-hidden p-0">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  {/* Icon matching the Landing Page "E-Learning Card" style */}
                  <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center border border-blue-100">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>

                  {/* Status badge matching the Landing Page Hero pulse badge */}
                  <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-gray-200 ">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span className="text-[12px] text-gray-600 font-medium">Active</span>
                  </div>
                </div>

                <h3 className="text-[20px] mb-2 text-gray-900 font-medium tracking-tight">{ws.name}</h3>
                <p className="text-gray-500 mb-6 leading-relaxed text-[14px] line-clamp-2">
                  {ws.description || "Integrated digital learning environment for streamlined education management."}
                </p>

                {/* Subdued stats grid */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-8">
                  <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                    <Users className="w-4 h-4 text-gray-400" />
                    {ws._count?.users || 0} Users
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                    <FileText className="w-4 h-4 text-gray-400" />
                    {ws._count?.exams || 0} Exams
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    {ws._count?.classes || 0} Classes
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-gray-600 font-medium">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    {ws._count?.subjects || 0} Subjects
                  </div>
                </div>

                {/* Secondary button style matching Landing Page Contact Sales button */}
                <button className="hidden w-full h-[40px] bg-white text-gray-700 border border-gray-300 text-[14px] font-medium rounded hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 group-hover:border-blue-200">
                  Enter Workspace <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-24 bg-[#F8F9FA] rounded border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-white rounded flex items-center justify-center mx-auto mb-6 border border-gray-200 ">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-[20px] font-medium text-gray-900 mb-2">No workspaces found</h3>
            <p className="text-[14px] text-gray-500 max-w-xs mx-auto mb-8 leading-relaxed">
              Get started by creating your first workspace for your school or organization.
            </p>
            <Button className="bg-blue-600 text-white text-[14px] font-medium px-6 py-2 rounded hover:bg-blue-700 transition-colors shadow-none border-none">
              Create Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}