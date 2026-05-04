"use client";

import React, { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { BarChart3, Download, ExternalLink, Calendar, User, FileText } from 'lucide-react';
import { resultApi } from '@/lib/api/results';
import { Result } from '@/types';

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await resultApi.list();
        if (res.data) setResults(res.data);
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
        title="Performance Analytics" 
        description="Detailed breakdown of examination results and student performance."
      />

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-[100px] bg-gray-100 rounded-3xl animate-pulse" />)
        ) : results.length > 0 ? (
          results.map((result) => (
            <Card key={result.id} className="transition-all border border-zinc-200 bg-white rounded-xl">
              <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                    {result.overallScore}%
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[14px] text-[#6b7280]">
                     <div className="flex items-center gap-2">
                        <User size={16} className="text-[#A3AED0]" />
                        <div>
                          <p className="text-[12px] text-[#A3AED0]">Student ID</p>
                          <p className="text-[14px] text-[#1B2559]">{result.userId}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#A3AED0]" />
                        <div>
                          <p className="text-[12px] text-[#A3AED0]">Exam ID</p>
                          <p className="text-[14px] text-[#1B2559]">{result.examId}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[#A3AED0]" />
                        <div>
                          <p className="text-[12px] text-[#A3AED0]">Submitted</p>
                          <p className="text-[14px] text-[#1B2559]">{new Date(result.date).toLocaleDateString()}</p>
                        </div>
                     </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="h-10 px-4 flex items-center gap-2 bg-[#F4F7FF] text-[#1B2559] rounded-xl hover:bg-blue-500 hover:text-white transition-all text-[13px]">
                    <ExternalLink size={16} /> Details
                  </button>
                  <button className="h-10 w-10 flex items-center justify-center bg-[#F4F7FF] text-[#1B2559] rounded-xl hover:bg-gray-200 transition-all">
                    <Download size={16} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-[#E0E5F2]">
             <BarChart3 size={48} className="mx-auto text-[#E0E5F2] mb-4" />
             <p className="text-[#6b7280]">No results available to process yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
