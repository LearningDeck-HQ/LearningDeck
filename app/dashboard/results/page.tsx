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
            <Card key={result.id} className="hover:shadow-lg transition-all border-none bg-white">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center font-black">
                    {result.overallScore}%
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="flex items-center gap-2">
                        <User size={16} className="text-[#A3AED0]" />
                        <div>
                          <p className="text-[12px] font-bold text-[#A3AED0] uppercase">Student ID</p>
                          <p className="text-[14px] font-bold text-[#1B2559]">{result.userId}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#A3AED0]" />
                        <div>
                          <p className="text-[12px] font-bold text-[#A3AED0] uppercase">Exam ID</p>
                          <p className="text-[14px] font-bold text-[#1B2559]">{result.examId}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[#A3AED0]" />
                        <div>
                          <p className="text-[12px] font-bold text-[#A3AED0] uppercase">Submitted</p>
                          <p className="text-[14px] font-bold text-[#1B2559]">{new Date(result.date).toLocaleDateString()}</p>
                        </div>
                     </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="h-10 px-4 flex items-center gap-2 bg-[#F4F7FF] text-[#1B2559] font-bold rounded-xl hover:bg-blue-500 hover:text-white transition-all text-[13px]">
                    <ExternalLink size={16} /> Details
                  </button>
                  <button className="h-10 w-10 flex items-center justify-center bg-[#F4F7FF] text-[#1B2559] font-bold rounded-xl hover:bg-gray-200 transition-all">
                    <Download size={16} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-[#E0E5F2]">
             <BarChart3 size={48} className="mx-auto text-[#E0E5F2] mb-4" />
             <p className="text-[#A3AED0] font-bold">No results available to process yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
