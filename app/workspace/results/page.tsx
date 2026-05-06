"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  Trash2,
  ChevronDown,
  Loader2,
  AlertCircle,
  Search,
  Eye,
  RefreshCw,
  CheckCircle2,
  X,
  FileText,
  User as UserIcon,
  BarChart3,
  Download,
  Calendar,
  Check,
  Filter,
  ArrowRight,
  Database
} from 'lucide-react';
import { Result, Subject, Question, SubjectScore, QuestionAttempt } from '@/types';
import { resultApi } from '@/lib/api/results';
import { questionApi } from '@/lib/api/questions';
import { subjectApi } from '@/lib/api/subjects';

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  // Detail Modal States
  const [resultQuestions, setResultQuestions] = useState<Question[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const userStr = localStorage.getItem('user');
      const workspaceId = userStr ? JSON.parse(userStr).workspaceId : '1';

      const [resultsRes, subjectsRes, questionsRes] = await Promise.all([
        resultApi.list({ workspaceId }),
        subjectApi.list(workspaceId),
        questionApi.list({ workspaceId })
      ]);

      if (resultsRes.data) setResults(resultsRes.data);
      if (subjectsRes.data) setSubjects(subjectsRes.data);
      if (questionsRes.data) setAllQuestions(questionsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchResultDetails = async (result: Result) => {
    try {
      setIsLoadingDetails(true);
      setSelectedResult(result);
      const res = await questionApi.list({ examId: result.examId });
      if (res.data) setResultQuestions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const filteredResults = useMemo(() => {
    return results.filter(r =>
      r.exam?.exam_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [results, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this result record permanently?')) return;
    try {
      setIsLoading(true);
      await resultApi.delete(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSubjectScores = (result: Result, mode: 'table' | 'modal' = 'table') => {
    try {
      let scores = result.subjectScores || {};
      if (typeof scores === 'string') scores = JSON.parse(scores) as Record<string, SubjectScore>;

      if (Object.keys(scores).length === 0) {
        return <span className="text-[11px] text-[#A3AED0] italic">Analytical data pending</span>;
      }

      if (mode === 'table') {
        return (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(scores).map(([subId, stats]: [string, SubjectScore]) => {
              const subName = subjects.find(s => s.id === subId)?.name || 'General';
              return (
                <span key={subId} className="inline-flex items-center gap-1 bg-[#F4F7FF] px-2 py-0.5 rounded-lg text-[10px] font-bold text-[#1B2559] border border-blue-100/50">
                  {subName}: {stats.correct}/{stats.total}
                </span>
              );
            })}
          </div>
        );
      } else {
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(scores).map(([subId, stats]: [string, SubjectScore]) => {
              const subName = subjects.find(s => s.id === subId)?.name || 'General';
              const percentage = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={subId} className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold text-[#1B2559]">{subName}</span>
                    <span className="text-[13px] font-bold text-blue-600">{percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${percentage >= 50 ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#A3AED0] font-medium">{stats.correct} correct out of {stats.total} questions</p>
                </div>
              );
            })}
          </div>
        );
      }
    } catch (e) {
      return <span className="text-[11px] text-red-400">Data parsing error</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DashboardHeader
        title="Performance Hub"
        description="Monitor student achievements, subject mastery, and examination trends."
      >
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={fetchData}
            className="flex items-center gap-2 text-[#A3AED0] hover:text-blue-600 h-[48px] px-6 rounded-xl border border-transparent hover:border-blue-100"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Sync Data
          </Button>
          <Button className="flex items-center gap-2 bg-[#1B2559] hover:bg-[#2B3674] h-[48px] px-6 rounded-xl shadow-lg shadow-blue-900/10">
            <Download size={18} />
            Export Analytics
          </Button>
        </div>
      </DashboardHeader>

      {/* Filter Section */}
      <div className="bg-white p-5 rounded border border-zinc-200/60 space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center text-blue-600">
              <Filter size={14} />
            </div>
            <h2 className="workspace text-[#1B2559]">Global Filter Hub</h2>
          </div>
          <button
            onClick={() => setSearchTerm('')}
            className="workspace text-blue-600 hover:underline text-[13px]"
          >
            Reset Filters
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3AED0] group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by student name, examination title, or reference ID..."
            className="w-full pl-12 pr-4 py-2 mt-2 rounded bg-[#F4F7FF]/50 border border-transparent focus:border-blue-200 focus:bg-white workspace text-[#1B2559] outline-none transition-all placeholder:text-[#A3AED0]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="animate-pulse border-none h-[120px] rounded bg-white" />
          ))
        ) : filteredResults.length > 0 ? (
          filteredResults.map((result) => (
            <div key={result.id} className="group transition-all duration-300 border border-zinc-200/60 bg-white rounded overflow-hidden hover: hover:shadow-blue-900/5 hover:border-blue-200">
              <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5 flex-1 w-full">
                  <div className="w-12 h-12 rounded-2xl bg-[#1B2559] text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-900/10 shrink-0">
                    {result.userId.toString().charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                       <span className="workspace text-[#1B2559] font-bold">Student: {result.userId.slice(0, 8)}</span>
                       <div className="w-1 h-1 bg-zinc-300 rounded-full" />
                       <span className="workspace text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px]">ID: #{result.id.slice(0, 8)}</span>
                    </div>
                    <h3 className="workspace text-[#1B2559] tracking-tight flex items-center gap-2">
                       <FileText size={16} className="text-blue-500" /> {result.exam?.exam_name || 'Processing...'}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-8">
                  <div className="flex flex-col items-center mr-6">
                    <span className="workspace text-[#A3AED0] uppercase tracking-widest mb-1">Score</span>
                    <span className={`workspace text-[18px] font-black ${result.overallScore >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {result.overallScore}%
                    </span>
                  </div>

                  <div className={`inline-flex px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider mr-6 ${result.overallScore >= 50 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {result.overallScore >= 50 ? 'Passed' : 'Failed'}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button onClick={() => fetchResultDetails(result)} variant="ghost" className="text-black">
                      <Eye size={16} />
                    </Button>
                    <Button onClick={() => handleDelete(result.id)} variant="ghost" className="text-black">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="px-6 pb-6 pt-0">
                <div className="border-t border-zinc-50 pt-4">
                  {renderSubjectScores(result)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-white rounded border border-dashed border-[#E0E5F2] flex flex-col items-center">
            <div className="w-24 h-24 bg-[#F4F7FF] rounded flex items-center justify-center mb-8 shadow-inner">
              <BarChart3 size={48} className="text-[#A3AED0]" />
            </div>
            <h3 className="text-[#1B2559] mb-3">No Performance Records</h3>
            <p className="text-[#A3AED0] max-w-sm mx-auto mb-10 workspace leading-relaxed">
              Results will appear here once students complete their assigned examinations.
            </p>
            <Button onClick={fetchData} className="py-2 px-10 bg-[#1B2559] text-white rounded hover:opacity-90 transition-all workspace shadow-blue-900/20">
              Refresh Records
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedResult}
        onClose={() => setSelectedResult(null)}
        title="Comprehensive Performance Analysis"
      >
        {selectedResult && (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-white to-[#F4F7FF] border-none shadow-sm">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <p className="text-[11px] font-black text-[#A3AED0] uppercase tracking-widest mb-1">Final Outcome</p>
                  <span className={`text-[24px] font-black ${selectedResult.overallScore >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {selectedResult.overallScore >= 50 ? 'SUCCESS' : 'CRITICAL'}
                  </span>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-white to-[#F4F7FF] border-none shadow-sm">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <p className="text-[11px] font-black text-[#A3AED0] uppercase tracking-widest mb-1">Overall Precision</p>
                  <span className="text-[24px] font-black text-[#1B2559]">{selectedResult.overallScore}%</span>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-white to-[#F4F7FF] border-none shadow-sm">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <p className="text-[11px] font-black text-[#A3AED0] uppercase tracking-widest mb-1">Submission Date</p>
                  <span className="text-[16px] font-bold text-[#1B2559] mt-2">{new Date(selectedResult.date).toLocaleDateString()}</span>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h4 className="text-[13px] font-black text-[#1B2559] uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-500" /> Subject Mastery Breakdown
              </h4>
              {renderSubjectScores(selectedResult, 'modal')}
            </div>

            <div className="space-y-4 border-t border-zinc-100 pt-6">
              <h4 className="text-[13px] font-black text-[#1B2559] uppercase tracking-widest flex items-center gap-2">
                <Database size={16} className="text-blue-500" /> Item-by-Item Review
              </h4>

              {isLoadingDetails ? (
                <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    let attempts = selectedResult.questionAttempts || [];
                    if (typeof attempts === 'string') attempts = JSON.parse(attempts) as QuestionAttempt[];

                    return attempts.map((att: QuestionAttempt, idx: number) => {
                      const question = resultQuestions.find(q => q.id === att.questionId);
                      if (!question) return null;

                      let isCorrect = false;
                      let userAnswer = '';
                      let correctAnswer = question.correct_answer;

                      if (question.type === 'FILL_IN_THE_BLANK') {
                        userAnswer = att.userTextAnswer || 'NONE';
                        isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
                      } else {
                        const options = att.options || [];
                        userAnswer = att.userOption != null ? options[att.userOption] : 'NONE';
                        isCorrect = att.userOption != null && options[att.userOption] === correctAnswer;
                      }

                      return (
                        <div key={idx} className={`p-5 rounded-[28px] border ${isCorrect ? 'bg-emerald-50/20 border-emerald-100/50' : 'bg-red-50/20 border-red-100/50'}`}>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[11px] font-black text-[#A3AED0]">ITEM #{idx + 1}</span>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </div>
                          </div>
                          <p className="text-[14px] font-bold text-[#1B2559] mb-4 leading-relaxed">{question.question}</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/60 p-3 rounded-2xl border border-white">
                              <p className="text-[10px] font-black text-[#A3AED0] uppercase mb-1">Response</p>
                              <p className={`text-[13px] font-bold ${isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>{userAnswer}</p>
                            </div>
                            {!isCorrect && (
                              <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100/50">
                                <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Standard Answer</p>
                                <p className="text-[13px] font-bold text-emerald-700">{correctAnswer}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={() => setSelectedResult(null)}
                className="w-full h-12 rounded bg-[#1B2559] text-white font-bold shadow-xl shadow-blue-900/20"
              >
                Close Analysis
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
