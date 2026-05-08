"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Trash2,
  Search,
  Eye,
  RefreshCw,
  CheckCircle2,
  FileText,
  BarChart3,
  Filter,
} from 'lucide-react';
import { Result, Subject, Question, SubjectScore } from '@/types';
import { resultApi } from '@/lib/api/results';
import { questionApi } from '@/lib/api/questions';
import { subjectApi } from '@/lib/api/subjects';
import { ScaleLoader } from 'react-spinners';

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const userStr = localStorage.getItem('user');
      const workspaceId = userStr ? JSON.parse(userStr).workspaceId : '1';
      const [resultsRes, subjectsRes, questionsRes] = await Promise.all([
        resultApi.list({ workspaceId }),
        subjectApi.list(workspaceId),
        questionApi.list({ workspaceId }),
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const filteredResults = useMemo(() => {
    return results.filter(
      (r) =>
        r.user?.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        return <span className="text-xs text-[#6b6b6b] italic">Analytical data pending</span>;
      }

      if (mode === 'table') {
        return (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(scores).map(([subId, stats]: [string, SubjectScore]) => {
              const subName = subjects.find((s) => s.id === subId)?.name || 'General';
              return (
                <span
                  key={subId}
                  className="inline-flex items-center gap-1 bg-zinc-300/20 px-2 py-0.5 rounded-sm text-[10px] text-[#0e0f10]"
                >
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
              const subName = subjects.find((s) => s.id === subId)?.name || 'General';
              const percentage = Math.round((stats.correct / stats.total) * 100);
              return (
                <div
                  key={subId}
                  className="bg-zinc-50 p-3 rounded-sm border border-zinc-400/20 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-[#0e0f10]">{subName}</span>
                    <span className="text-xs text-[#6b6b6b]">{percentage}%</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${percentage >= 50 ? 'bg-emerald-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#6b6b6b]">
                    {stats.correct} correct of {stats.total} questions
                  </p>
                </div>
              );
            })}
          </div>
        );
      }
    } catch (e) {
      return <span className="text-xs text-red-400">Data parsing error</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <DashboardHeader
        title="Results"
        description="Monitor student performance, scores, and examination outcomes."
      >
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3 py-1 text-xs font-medium bg-zinc-100 text-[#0e0f10] rounded-sm hover:bg-zinc-200 transition-all border border-zinc-400/20 active:scale-[0.98]"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </DashboardHeader>

      {/* ── Filter Section ── */}
      <div className="bg-white p-4 rounded-sm border border-zinc-400/20 space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-[#6b6b6b]">
            <Filter size={13} />
            <span className="text-xs font-medium text-[#0e0f10]">Filter</span>
          </div>
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-[#6b6b6b] hover:text-[#0e0f10] transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-3 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b6b]"
              size={13}
            />
            <input
              type="text"
              placeholder="Search by student name or exam title..."
              className="w-full pl-8 pr-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none transition-all placeholder:text-[#6b6b6b]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={fetchData}
            className="px-3 py-1 text-xs rounded-sm bg-zinc-100 text-[#0e0f10] hover:bg-zinc-200 transition-colors border border-zinc-400/20"
          >
            Apply
          </button>
        </div>
      </div>

      {/* ── Result List ── */}
      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <ScaleLoader barCount={3} color="#a7a7a7ff" height={18} width={4} />
          </div>
        ) : filteredResults.length > 0 ? (
          filteredResults.map((result) => (
            <div
              key={result.id}
              className="group border border-zinc-400/20 bg-white rounded-sm overflow-hidden hover:bg-zinc-300/10 transition-all duration-200"
            >
              <div className="px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Result info */}
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-[#0e0f10] tracking-tight">
                      {result.user?.user_name || 'Unknown Student'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#6b6b6b]">
                      <span className="flex items-center gap-1.5">
                        <FileText size={11} /> {result.exam?.exam_name || 'Unknown Exam'}
                      </span>
                      <span
                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-medium ${result.overallScore >= 50
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-500'
                          }`}
                      >
                        {result.overallScore >= 50 ? 'Passed' : 'Failed'}
                      </span>
                      <span className="flex items-center gap-1.5 bg-zinc-300/20 px-2 py-0.5 rounded-sm text-[#0e0f10]">
                        Score: {result.overallScore}%
                      </span>
                    </div>
                    <div className="mt-1.5">
                      {renderSubjectScores(result)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-400/20 pt-3 md:pt-0 md:pl-6">
                  <button
                    onClick={() => fetchResultDetails(result)}
                    className="px-2 py-1 text-xs text-[#6b6b6b] hover:bg-zinc-300/20 hover:text-[#0e0f10] rounded-sm transition-all"
                    title="View Details"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(result.id)}
                    className="px-2 py-1 text-xs text-[#6b6b6b] hover:bg-red-50 hover:text-red-500 rounded-sm transition-all"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* ── Empty state ── */
          <div className="text-center py-20 bg-white rounded-sm border border-dashed border-zinc-400/30 flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-sm flex items-center justify-center mb-6">
              <BarChart3 size={28} className="text-[#6b6b6b]" />
            </div>
            <h3 className="text-sm font-medium text-[#0e0f10] mb-2">No results yet</h3>
            <p className="text-xs text-[#6b6b6b] max-w-xs mx-auto mb-8 leading-relaxed">
              Results will appear here once students complete their assigned examinations.
            </p>
            <button
              onClick={fetchData}
              className="px-4 py-1.5 text-xs font-medium bg-[#0e0f10] text-white rounded-sm hover:bg-zinc-700 transition-all"
            >
              Refresh Records
            </button>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      <Modal
        isOpen={!!selectedResult}
        onClose={() => setSelectedResult(null)}
        title="Result Details"
      >
        {selectedResult && (
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex items-center gap-6 px-3 py-2.5 bg-zinc-50 rounded-sm border border-zinc-400/20">
              <div>
                <p className="text-[10px] text-[#6b6b6b] uppercase tracking-wide mb-0.5">Score</p>
                <p
                  className={`text-sm font-medium ${selectedResult.overallScore >= 50 ? 'text-emerald-600' : 'text-red-500'
                    }`}
                >
                  {selectedResult.overallScore}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#6b6b6b] uppercase tracking-wide mb-0.5">Date</p>
                <p className="text-xs text-[#0e0f10]">
                  {new Date(selectedResult.date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#6b6b6b] uppercase tracking-wide mb-0.5">Status</p>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-sm ${selectedResult.overallScore >= 50
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-red-50 text-red-500'
                    }`}
                >
                  {selectedResult.overallScore >= 50 ? 'Passed' : 'Failed'}
                </span>
              </div>
            </div>

            {/* Subject breakdown */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 px-0.5">
                <CheckCircle2 size={12} className="text-[#6b6b6b]" />
                <p className="text-xs font-medium text-[#0e0f10]">Subject Breakdown</p>
              </div>
              {renderSubjectScores(selectedResult, 'modal')}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedResult(null)}
                className="px-4 py-1.5 text-xs text-[#6b6b6b] hover:bg-zinc-100 rounded-sm transition-all border border-zinc-400/20"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}