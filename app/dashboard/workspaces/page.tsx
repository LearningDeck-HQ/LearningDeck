"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Briefcase, Plus, Users, BookOpen, GraduationCap, FileText, ChevronRight, HelpCircle } from 'lucide-react';
import { workspaceApi } from '@/lib/api/workspaces';
import { Workspace } from '@/types';
import Link from 'next/link';
import { ScaleLoader } from 'react-spinners';

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
    <div className="flex flex-col gap-8 h-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-64 w-full">
          <ScaleLoader barCount={3} color="#a7a7a7" height={20} width={5} />
        </div>
      ) : workspaces.length > 0 ? (
        <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="group py-10 px-5 flex flex-col md:flex-row md:items-center justify-between gap-8 transition-colors hover:bg-gray-50/50 border-y border-zinc-400/20 rounded"
            >
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center border border-blue-100">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className=" text-gray-900  tracking-tight">
                        {ws.name}
                      </h3>
                      <div className="inline-flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        <span className=" text-gray-600  uppercase tracking-wider">Active</span>
                      </div>
                    </div>
                    <p className="text-gray-500 mt-1  max-w-2xl leading-relaxed">
                      {ws.description || "Integrated digital learning environment for streamlined education management."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                  <div className="flex items-center gap-2  text-gray-500">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 ">{ws._count?.users || 0}</span> Students
                  </div>
                  <div className="flex items-center gap-2  text-gray-500">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 ">{ws._count?.exams || 0}</span> Exams
                  </div>
                  <div className="flex items-center gap-2  text-gray-500">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 ">{ws._count?.teachers || 0}</span> Teachers
                  </div>
                  <div className="flex items-center gap-2  text-gray-500">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700 ">{ws._count?.subjects || 0}</span> Subjects
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href={`/workspace`}
                  target='_blank'
                  className="h-11 px-6 bg-white text-gray-700 border border-gray-200   rounded hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  Open Workspace
                  <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-gray-200 rounded-xl">
          <div className="w-12 h-12 bg-gray-50 rounded flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <Briefcase className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="  text-gray-900 mb-2">No workspaces found</h3>
          <p className=" text-gray-500 max-w-xs mx-auto mb-6">
            Get started by creating your first workspace for your school or organization.
          </p>
          <Button className="bg-blue-600 text-white   px-8 h-10 rounded hover:bg-blue-700 transition-colors border-none ring-0">
            Create Now
          </Button>
        </div>
      )}
    </div>
  );
}