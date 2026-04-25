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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <DashboardHeader 
        title="Workspace Management" 
        description="Organize your educational institutions and departments into isolated containers."
      >
        <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 shadow-xl shadow-blue-500/20">
          <Plus size={18} />
          Create Workspace
        </Button>
      </DashboardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="h-[280px] animate-pulse">
                <CardContent className="p-8 h-full bg-gray-50/50" />
            </Card>
          ))
        ) : workspaces.length > 0 ? (
          workspaces.map((ws) => (
            <Card key={ws.id} className="group overflow-hidden border-none shadow-xl shadow-gray-200/40 bg-white/80 backdrop-blur-sm hover:translate-y-[-4px] transition-all duration-300">
              <div className="h-2 w-full bg-blue-500" />
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <Briefcase size={28} />
                  </div>
                  <span className="text-[12px] font-black text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest">Active</span>
                </div>
                
                <h3 className="text-[20px] font-extrabold text-[#1B2559] mb-2">{ws.name}</h3>
                <p className="text-[#A3AED0] text-[14px] line-clamp-2 mb-6">
                  {ws.description || "Integrated digital learning environment for streamlined education management."}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-[#1B2559]">
                    <Users size={16} className="text-[#A3AED0]" />
                    {ws._count?.users || 0} Users
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-bold text-[#1B2559]">
                    <FileText size={16} className="text-[#A3AED0]" />
                    {ws._count?.exams || 0} Exams
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-bold text-[#1B2559]">
                    <GraduationCap size={16} className="text-[#A3AED0]" />
                    {ws._count?.classes || 0} Classes
                  </div>
                  <div className="flex items-center gap-2 text-[13px] font-bold text-[#1B2559]">
                    <BookOpen size={16} className="text-[#A3AED0]" />
                    {ws._count?.subjects || 0} Subjects
                  </div>
                </div>
                
                <button className="w-full h-[48px] border-2 border-[#F4F7FF] rounded-xl flex items-center justify-center gap-2 text-[14px] font-black text-[#1B2559] hover:bg-[#1B2559] hover:text-white hover:border-transparent transition-all group">
                  Enter Workspace <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </CardContent>
            </Card>
          ))
        ) : (
            <div className="col-span-full text-center py-24 bg-white rounded-[32px] border-2 border-dashed border-[#E0E5F2]">
                <Briefcase size={64} className="mx-auto text-[#E0E5F2] mb-6" />
                <h3 className="text-[20px] font-bold text-[#1B2559] mb-2">No workspaces found</h3>
                <p className="text-[#A3AED0] max-w-xs mx-auto mb-8">Get started by creating your first workspace for your school or organization.</p>
                <Button className="bg-[#1B2559]">Create Now</Button>
            </div>
        )}
      </div>
    </div>
  );
}
