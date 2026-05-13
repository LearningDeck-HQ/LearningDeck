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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { examApi } from '@/lib/api/exams';
import { classApi } from '@/lib/api/classes';
import { ChevronDown } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';

export default function ResultsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedExam, setSelectedExam] = useState<string>('all');

  const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const workspaceId = useMemo(() => userStr ? JSON.parse(userStr).workspaceId : '1', [userStr]);

  const { data: resultResponse, isLoading: isLoadingResults, isFetching: isFetchingResults } = useQuery({
    queryKey: ['results', workspaceId, page, limit, searchTerm, selectedClass, selectedExam],
    queryFn: async () => {
      const res = await resultApi.list({
        workspaceId,
        page,
        limit,
        searchTerm,
        classId: selectedClass === 'all' ? undefined : selectedClass,
        examId: selectedExam === 'all' ? undefined : selectedExam
      });
      return res;
    },
  });

  const results = resultResponse?.data || [];
  const totalResults = resultResponse?.meta?.total || 0;
  const totalPages = Math.ceil(totalResults / limit);

  const { data: subjects = [], isFetching: isFetchingSubjects } = useQuery({
    queryKey: ['subjects', workspaceId],
    queryFn: async () => {
      const res = await subjectApi.list(workspaceId);
      return res.data || [];
    },
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes', workspaceId],
    queryFn: async () => {
      const res = await classApi.list(workspaceId);
      return res.data || [];
    },
  });

  const { data: exams = [] } = useQuery({
    queryKey: ['exams', workspaceId],
    queryFn: async () => {
      const res = await examApi.list(workspaceId);
      return res.data || [];
    },
  });

  const isLoading = isLoadingResults || isFetchingResults || isFetchingSubjects;


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
  const fetchData = () => {
    queryClient.invalidateQueries({ queryKey: ['results', workspaceId] });
    queryClient.invalidateQueries({ queryKey: ['subjects', workspaceId] });
    queryClient.invalidateQueries({ queryKey: ['questions', workspaceId] });
  };

  const filteredResults = results;

  const deleteResultMutation = useMutation({
    mutationFn: (id: string) => resultApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['results', workspaceId] });
      const previousResults = queryClient.getQueryData<Result[]>(['results', workspaceId]);
      queryClient.setQueryData(['results', workspaceId], (old: Result[] = []) =>
        old.filter((r) => r.id !== id)
      );
      return { previousResults };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['results', workspaceId], context?.previousResults);
      alert('Failed to delete result');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['results', workspaceId] });
    },
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this result record permanently?')) return;
    deleteResultMutation.mutate(id);
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
  const { isLeftSidebarCollapsed, toggleLeftSidebar } = useSidebar();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">

      <div className={`${isLeftSidebarCollapsed ? 'sticky  z-50' : ''} flex  bg-[#f9f9f9]  top-0  h-full w-full border-b border-[#ededed]  `}>
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


      </div>

      {/* ── Filter Section ── */}
      <div className="bg-white p-4  border-y border-zinc-400/20 space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b6b]"
              size={13}
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none transition-all placeholder:text-[#6b6b6b]"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="relative">
            <select
              className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none appearance-none cursor-pointer"
              value={selectedExam}
              onChange={(e) => {
                setSelectedExam(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Exams</option>
              {exams.map((e) => (
                <option key={e.id} value={e.id}>{e.exam_name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
          </div>

          <div className="relative">
            <select
              className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none appearance-none cursor-pointer"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
          </div>

          <div className="relative">
            <select
              className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none appearance-none cursor-pointer"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
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
              className="group border-y border-zinc-400/20 bg-white overflow-hidden hover:bg-zinc-300/10 transition-all duration-200"
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
              className="px-4 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-sm hover:bg-zinc-700 transition-all"
            >
              Refresh Records
            </button>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex sticky items-center justify-between px-4 py-3 bg-white border border-zinc-400/20 rounded-sm">
          <div className="text-xs text-[#6b6b6b]">
            Showing <span className="font-medium text-[#0e0f10]">{(page - 1) * limit + 1}</span> to <span className="font-medium text-[#0e0f10]">{Math.min(page * limit, totalResults)}</span> of <span className="font-medium text-[#0e0f10]">{totalResults}</span> records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-xs font-medium bg-zinc-50 text-[#0e0f10] border border-zinc-400/20 rounded-sm hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-7 h-7 flex items-center justify-center text-xs font-medium rounded-sm transition-all ${page === p ? 'bg-blue-500 text-white' : 'hover:bg-zinc-100 text-[#0e0f10]'}`}
                    >
                      {p}
                    </button>
                  );
                } else if (p === page - 2 || p === page + 2) {
                  return <span key={p} className="text-[#6b6b6b]">...</span>;
                }
                return null;
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-xs font-medium bg-zinc-50 text-[#0e0f10] border border-zinc-400/20 rounded-sm hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}

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