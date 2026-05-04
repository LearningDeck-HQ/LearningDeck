"use client";

import React, { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { FileText, Plus, Clock, GraduationCap, Calendar, MoreVertical, PlayCircle } from 'lucide-react';
import { examApi } from '@/lib/api/exams';
import { Exam } from '@/types';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await examApi.list();
        if (res.data) setExams(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <DashboardHeader
        title="Exams & Assessments"
        description="Create and manage your examination cycles, question banks, and scheduling."
      >
        <Button className="flex items-center gap-2 bg-[#1B2559] hover:opacity-90 transition-opacity">
          <Plus size={18} />
          Create New Exam
        </Button>
      </DashboardHeader>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div />
            </Card>
          ))
        ) : exams.length > 0 ? (
          exams.map((exam) => (
            <Card key={exam.id} className="group transition-all duration-300 border border-zinc-200 bg-white rounded-xl overflow-hidden">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-14 h-14 bg-[#F4F7FF] rounded-xl flex items-center justify-center text-blue-600 border border-blue-50/50">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h3 className="text-[18px] text-[#1B2559] transition-colors">{exam.exam_name}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-[14px] text-[#6b7280]">
                      <span className="flex items-center gap-2">
                        <Clock size={16} /> {exam.minutes} Minutes
                      </span>
                      <span className="flex items-center gap-2">
                        <GraduationCap size={16} /> Class ID: {exam.classId}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar size={16} /> Scheduled for next week
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center mr-6 px-6 border-x border-zinc-200">
                    <span className="text-[12px] text-[#6b7280]">Progress</span>
                    <span className="text-[16px] text-blue-500">Draft</span>
                  </div>
                  <Button className="h-11 px-5 flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all border-none rounded-xl">
                    <PlayCircle size={20} />
                    Launch
                  </Button>
                  <Button variant="ghost" className="h-11 w-11 p-0 rounded-xl hover:bg-gray-100">
                    <MoreVertical size={20} className="text-[#A3AED0]" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#E0E5F2]">
            <div className="w-24 h-24 bg-[#F4F7FF] rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={48} className="text-[#A3AED0]" />
            </div>
            <h3 className="text-[20px] text-[#1B2559] mb-3">Your exam vault is empty</h3>
            <p className="text-[#6b7280] max-w-sm mx-auto mb-10 text-[15px] leading-relaxed">
              Start creating your first digital assessment. You can add multiple choice, true/false, or fill-in-the-blank questions.
            </p>
            <Button className="h-12 px-8 bg-[#1B2559] text-white rounded-xl hover:opacity-90 transition-all">
              Create New Exam
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
