"use client";

import React, { useEffect, useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { BookOpen, Users, BarChart3, TrendingUp, Clock } from 'lucide-react';
import { userApi } from '@/lib/api/users';
import { examApi } from '@/lib/api/exams';
import { resultApi } from '@/lib/api/results';
import { User, Exam, Result } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    students: 0,
    exams: 0,
    avgScore: 0,
    completionRate: 0
  });
  const [recentResults, setRecentResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, examsRes, resultsRes] = await Promise.all([
          userApi.list({ role: 'STUDENT' }),
          examApi.list(),
          resultApi.list()
        ]);

        const studentsCount = usersRes.data?.length || 0;
        const examsCount = examsRes.data?.length || 0;
        const results = resultsRes.data || [];
        
        const totalScore = results.reduce((acc, curr) => acc + curr.overallScore, 0);
        const avgScore = results.length > 0 ? (totalScore / results.length).toFixed(1) : 0;

        setStats({
          students: studentsCount,
          exams: examsCount,
          avgScore: Number(avgScore),
          completionRate: 98.4 // Mocked for now
        });

        setRecentResults(results.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <DashboardHeader 
        title="Welcome back, Administrator" 
        description="Here is what's happening across your LearningDeck workspaces."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Students" 
          value={isLoading ? "..." : stats.students.toLocaleString()} 
          change="+12%" 
          icon={Users} 
          color="text-blue-600" 
          bgColor="bg-blue-50" 
        />
        <StatCard 
          title="Total Exams" 
          value={isLoading ? "..." : stats.exams.toLocaleString()} 
          change="+5%" 
          icon={BookOpen} 
          color="text-purple-600" 
          bgColor="bg-purple-50" 
        />
        <StatCard 
          title="Avg. Score" 
          value={isLoading ? "..." : `${stats.avgScore}%`} 
          change="+3.2%" 
          icon={BarChart3} 
          color="text-green-600" 
          bgColor="bg-green-50" 
        />
        <StatCard 
          title="Completion Rate" 
          value={isLoading ? "..." : `${stats.completionRate}%`} 
          change="+1.5%" 
          icon={TrendingUp} 
          color="text-orange-600" 
          bgColor="bg-orange-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-xl shadow-gray-200/50 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[20px] font-extrabold text-[#1B2559]">Recent Activity</h3>
              <Clock size={20} className="text-[#A3AED0]" />
            </div>
            
            <div className="space-y-6">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-1.5 h-12 bg-gray-100 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-50 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : recentResults.length > 0 ? (
                recentResults.map((result, i) => (
                  <div key={i} className="group flex gap-4 transition-all hover:translate-x-1">
                    <div className="w-1.5 h-12 bg-blue-500 rounded-full group-hover:h-14 transition-all" />
                    <div>
                      <p className="text-[15px] font-bold text-[#1B2559]">
                        Exam submission: Score {result.overallScore}%
                      </p>
                      <p className="text-[13px] text-[#A3AED0]">
                        User ID: {result.userId} • {new Date(result.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-[#A3AED0] py-10">No recent activity found.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-gray-200/50 bg-gradient-to-br from-[#1B2559] to-[#2B3674] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
          <CardContent className="p-8 text-center flex flex-col items-center justify-center min-h-[300px] relative z-10">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
              <BarChart3 size={40} className="text-blue-400" />
            </div>
            <h3 className="text-[24px] font-bold mb-2">Performance Analytics</h3>
            <p className="text-white/60 max-w-xs mx-auto mb-6">
              Insights and trends for your workspace are being generated. Premium charts will appear here.
            </p>
            <button className="px-6 py-2.5 bg-white text-[#1B2559] font-bold rounded-xl hover:scale-105 transition-all">
              View Reports
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon, color, bgColor }: any) {
  return (
    <Card className="border-none shadow-lg shadow-gray-100/50 hover:scale-[1.02] transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 ${bgColor} ${color} rounded-[20px] flex items-center justify-center shadow-inner`}>
            <Icon size={28} />
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[12px] font-bold text-green-500 bg-green-50 px-2.5 py-1 rounded-full">{change}</span>
          </div>
        </div>
        <div>
          <p className="text-[#A3AED0] text-[14px] font-bold uppercase tracking-[1.5px]">{title}</p>
          <p className="text-[32px] font-extrabold text-[#1B2559] mt-1 tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}