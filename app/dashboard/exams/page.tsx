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
                <CardContent className="p-8 h-[120px] bg-gray-50/50" />
            </Card>
          ))
        ) : exams.length > 0 ? (
          exams.map((exam) => (
            <Card key={exam.id} className="group hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 border-none bg-white relative overflow-hidden">
               <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-500 transform group-hover:w-2 transition-all" />
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 flex-1">
                  <div className="w-16 h-16 bg-[#F4F7FF] rounded-[24px] flex items-center justify-center text-blue-600 shadow-sm border border-blue-50/50 group-hover:scale-110 transition-transform">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h3 className="text-[20px] font-black text-[#1B2559] group-hover:text-blue-600 transition-colors uppercase tracking-tight">{exam.exam_name}</h3>
                    <div className="flex flex-wrap items-center gap-6 mt-2">
                       <span className="flex items-center gap-2 text-[14px] font-bold text-[#A3AED0]">
                        <Clock size={16} /> {exam.minutes} Minutes
                      </span>
                      <span className="flex items-center gap-2 text-[14px] font-bold text-[#A3AED0]">
                        <GraduationCap size={16} /> Class ID: {exam.classId}
                      </span>
                      <span className="flex items-center gap-2 text-[14px] font-bold text-[#A3AED0]">
                        <Calendar size={16} /> Scheduled for next week
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center mr-8 px-8 border-x border-[#F4F7FF]">
                         <span className="text-[12px] font-bold text-[#A3AED0] uppercase tracking-widest">Progress</span>
                         <span className="text-[18px] font-black text-blue-500">Draft</span>
                    </div>
                    <Button className="h-12 px-6 flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all font-black border-none rounded-2xl group/btn">
                        <PlayCircle size={20} />
                        Launch
                    </Button>
                    <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl hover:bg-gray-100">
                      <MoreVertical size={20} className="text-[#A3AED0]" />
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
             <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-[#E0E5F2]">
                <div className="w-24 h-24 bg-[#F4F7FF] rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText size={48} className="text-[#A3AED0]" />
                </div>
                <h3 className="text-[24px] font-black text-[#1B2559] mb-3">Your exam vault is empty</h3>
                <p className="text-[#A3AED0] max-w-sm mx-auto mb-10 text-[16px] leading-relaxed">
                    Start creating your first digital assessment. You can add multiple choice, true/false, or fill-in-the-blank questions.
                </p>
                <Button className="h-14 px-10 bg-[#1B2559] text-white font-bold rounded-2xl shadow-xl shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all">
                    Create New Exam
                </Button>
            </div>
        )}
      </div>
    </div>
  );
}
