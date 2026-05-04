"use client";

import React, { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { BookOpen, Plus, FileText, ChevronRight } from 'lucide-react';
import { subjectApi } from '@/lib/api/subjects';
import { Subject } from '@/types';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await subjectApi.list();
        if (res.data) setSubjects(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DashboardHeader 
        title="Subjects & Curriculum" 
        description="Organize your academic courses and subject-specific question banks."
      >
        <Button className="flex items-center gap-2">
          <Plus size={18} />
          Add Subject
        </Button>
      </DashboardHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <div key={i} className="h-[180px] bg-gray-100 rounded-3xl animate-pulse" />)
        ) : subjects.length > 0 ? (
          subjects.map((subj) => (
            <Card key={subj.id} className="group transition-all border border-zinc-200 bg-white rounded-xl">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-[17px] text-[#1B2559] mb-1">{subj.name}</h3>
                <p className="text-[13px] text-[#6b7280] mb-6">Subject ID: {subj.id}</p>
                <button className="flex items-center gap-2 text-[14px] text-blue-500 hover:gap-3 transition-all">
                  View Questions <ChevronRight size={16} />
                </button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-dashed border-[#E0E5F2]">
             <p className="text-[#6b7280]">No subjects added to this workspace.</p>
          </div>
        )}
      </div>
    </div>
  );
}
