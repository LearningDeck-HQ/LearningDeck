"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  Plus,
  Search,
  Filter,
  HelpCircle,
  CheckCircle2,
  Type,
  LayoutGrid,
  ChevronDown,
  BookOpen,
  GraduationCap,
  Check,
} from 'lucide-react';
import { questionApi } from '@/lib/api/questions';
import { examApi } from '@/lib/api/exams';
import { subjectApi } from '@/lib/api/subjects';
import { classApi } from '@/lib/api/classes';
import { userApi } from '@/lib/api/users';
import { Question, Exam, Subject, Class, QuestionType, User } from '@/types';
import { MdOutlineDelete, MdOutlineModeEditOutline } from 'react-icons/md';
import { ScaleLoader } from 'react-spinners';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiUser } from 'react-icons/fi';

type QuestionWithStatus = Question & { status?: 'saving' | 'saved' | 'failed' | 'deleting' | 'done' };

export default function QuestionsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteProgress, setDeleteProgress] = useState<{ current: number; total: number } | null>(null);
  const [gridCols, setGridCols] = useState(2);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [user_name, setUser_Name] = useState<User | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const res = await userApi.me();
      if (res.success && res.data) {
        setCurrentUser(res.data);
        setUser_Name(res.data);
      }
    };
    fetchUser();
  }, []);

  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const res = await questionApi.list();
      return (res.data || []) as QuestionWithStatus[];
    },
  });

  const { data: exams = [] } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const res = await examApi.list();
      return res.data || [];
    },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await subjectApi.list();
      return res.data || [];
    },
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const res = await classApi.list();
      return res.data || [];
    },
  });

  const isLoading = isLoadingQuestions;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    type: 'MULTIPLE_CHOICE' as QuestionType,
    question: '',
    correct_answer: '',
    incorrect_answers: ['', '', ''],
    explanation: '',
    examId: '',
    subjectId: '',
    classId: '',
    img: null as string | null,
    author: '' as string | null,
  });


  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = q?.question?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      const matchesExam = selectedExam === 'all' || q.examId === selectedExam;
      const matchesSubject = selectedSubject === 'all' || q.subjectId === selectedSubject;
      const matchesClass = selectedClass === 'all' || q.classId === selectedClass;
      return matchesSearch && matchesExam && matchesSubject && matchesClass;
    });
  }, [questions, searchTerm, selectedExam, selectedSubject, selectedClass]);

  const handleOpenModal = (q: Question | null = null) => {
    if (q) {
      setEditingQuestion(q);
      setFormData({
        type: q.type,
        question: q.question,
        correct_answer: q.correct_answer,
        incorrect_answers: q.incorrect_answers.length > 0 ? q.incorrect_answers : ['', '', ''],
        explanation: q.explanation || '',
        examId: q.examId,
        subjectId: q.subjectId,
        classId: q.classId,
        img: q.img,
        author: q.author || '',
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        type: 'MULTIPLE_CHOICE',
        question: '',
        correct_answer: '',
        incorrect_answers: ['', '', ''],
        explanation: '',
        examId: exams[0]?.id || '',
        subjectId: subjects[0]?.id || '',
        classId: classes[0]?.id || '',
        img: null,
        author: currentUser?.user_name || '',
      });
    }
    setIsModalOpen(true);
  };

  const createQuestionMutation = useMutation({
    mutationFn: (payload: any) => questionApi.create(payload),
    onMutate: async (newQuestion) => {
      await queryClient.cancelQueries({ queryKey: ['questions'] });
      const previousQuestions = queryClient.getQueryData<QuestionWithStatus[]>(['questions']);
      const tempId = Math.random().toString(36).substring(7);
      queryClient.setQueryData(['questions'], (old: QuestionWithStatus[] = []) => [
        { ...newQuestion, id: tempId, status: 'saving' } as QuestionWithStatus,
        ...old,
      ]);
      return { previousQuestions, tempId };
    },
    onError: (err, newQuestion, context) => {
      queryClient.setQueryData(['questions'], context?.previousQuestions);
      alert('Failed to create question');
    },
    onSuccess: (data, newQuestion, context) => {
      queryClient.setQueryData(['questions'], (old: QuestionWithStatus[] = []) =>
        old.map((q) =>
          q.id === context?.tempId ? { ...data.data, status: 'saved' } : q
        )
      );
      setTimeout(() => {
        queryClient.setQueryData(['questions'], (old: QuestionWithStatus[] = []) =>
          old.map((q) => (q.id === data?.data?.id ? { ...q, status: undefined } : q))
        );
      }, 3000);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => questionApi.update(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['questions'] });
      const previousQuestions = queryClient.getQueryData<QuestionWithStatus[]>(['questions']);
      queryClient.setQueryData(['questions'], (old: QuestionWithStatus[] = []) =>
        old.map((q) => (q.id === id ? { ...q, ...payload, status: 'saving' } : q))
      );
      return { previousQuestions };
    },
    onError: (err, { id }, context) => {
      queryClient.setQueryData(['questions'], context?.previousQuestions);
      alert('Failed to update question');
    },
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(['questions'], (old: QuestionWithStatus[] = []) =>
        old.map((q) => (q.id === id ? { ...q, status: 'saved' } : q))
      );
      setTimeout(() => {
        queryClient.setQueryData(['questions'], (old: QuestionWithStatus[] = []) =>
          old.map((q) => (q.id === id ? { ...q, status: undefined } : q))
        );
      }, 3000);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: (id: string) => questionApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['questions'] });
      const previousQuestions = queryClient.getQueryData<QuestionWithStatus[]>(['questions']);
      queryClient.setQueryData(['questions'], (old: QuestionWithStatus[] = []) =>
        old.map((q) => (q.id === id ? { ...q, status: 'deleting' } : q))
      );
      return { previousQuestions };
    },
    onSuccess: (data, id) => {
      queryClient.setQueryData(['questions'], (old: QuestionWithStatus[] = []) =>
        old.map((q) => (q.id === id ? { ...q, status: 'done' } : q))
      );
      setTimeout(() => {
        queryClient.setQueryData(['questions'], (old: QuestionWithStatus[] = []) =>
          old.filter((q) => q.id !== id)
        );
      }, 1000);
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['questions'], context?.previousQuestions);
      alert('Failed to delete question');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredQuestions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredQuestions.map(q => q.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    deleteQuestionMutation.mutate(id);
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} questions?`)) return;
    const idsToDelete = [...selectedIds];
    setDeleteProgress({ current: 0, total: idsToDelete.length });

    for (let i = 0; i < idsToDelete.length; i++) {
      const id = idsToDelete[i];
      try {
        await deleteQuestionMutation.mutateAsync(id);
        setDeleteProgress(prev => prev ? { ...prev, current: i + 1 } : null);
      } catch (err) {
        console.error(`Failed to delete ${id}`, err);
      }
    }

    setTimeout(() => setDeleteProgress(null), 2000);
    setSelectedIds([]);
  };



  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedUser = window.localStorage.getItem('user');
    if (!storedUser) return;

    try {
      setUser_Name(JSON.parse(storedUser));
    } catch (error) {
      console.error('Header: Failed to parse stored user', error);
    }
  }, []);

  const profileName = user_name?.user_name || 'Guest';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem('user');
    const workspaceId = currentUser?.workspaceId || (userStr ? JSON.parse(userStr).workspaceId : '1');
    const payload = {
      ...formData,
      workspaceId,
      author: profileName || 'System',
      incorrect_answers:
        formData.type === 'MULTIPLE_CHOICE'
          ? formData.incorrect_answers.filter(a => a.trim() !== '')
          : [],
    };
    if (editingQuestion) {
      updateQuestionMutation.mutate({ id: editingQuestion.id, payload });
    } else {
      createQuestionMutation.mutate(payload);
    }
    setIsModalOpen(false);
  };

  const handleIncorrectAnswerChange = (index: number, value: string) => {
    const newAnswers = [...formData.incorrect_answers];
    newAnswers[index] = value;
    setFormData({ ...formData, incorrect_answers: newAnswers });
  };

  const typeIcon = (type: QuestionType) => {
    if (type === 'MULTIPLE_CHOICE') return <LayoutGrid size={11} />;
    if (type === 'TRUE_FALSE') return <CheckCircle2 size={11} />;
    return <Type size={11} />;
  };

  const getUserColor = (name: string) => {
    if (!name) return 'bg-zinc-100 text-zinc-600';
    const colors = [
      'bg-blue-50 text-blue-600 border-blue-200',
      'bg-purple-50 text-purple-600 border-purple-200',
      'bg-emerald-50 text-emerald-600 border-emerald-200',
      'bg-amber-50 text-amber-600 border-amber-200',
      'bg-rose-50 text-rose-600 border-rose-200',
      'bg-indigo-50 text-indigo-600 border-indigo-200',
      'bg-cyan-50 text-cyan-600 border-cyan-200',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 relative">
      {deleteProgress && (
        <div className="sticky top-0 z-50 bg-white border-b border-red-100 p-2 mb-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Deleting Questions...</span>
            <span className="text-[10px] font-bold text-red-600">{deleteProgress.current} / {deleteProgress.total}</span>
          </div>
          <div className="w-full h-1 bg-red-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-300 ease-out"
              style={{ width: `${(deleteProgress.current / deleteProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
      <DashboardHeader
        title="Question Bank"
        description="Manage your collection of questions across exams, subjects, and classes."
      >
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-sm hover:bg-zinc-700 transition-all active:scale-[0.98]"
        >
          <Plus size={14} />
          Add Question
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
            onClick={() => {
              setSearchTerm('');
              setSelectedExam('all');
              setSelectedSubject('all');
              setSelectedClass('all');
            }}
            className="text-xs text-[#6b6b6b] hover:text-[#0e0f10] transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="md:col-span-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b6b]" size={13} />
            <input
              type="text"
              placeholder="Search questions..."
              className="w-full pl-8 pr-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none transition-all placeholder:text-[#6b6b6b]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Exam filter */}
          <div className="relative">
            <select
              className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none appearance-none cursor-pointer"
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
            >
              <option value="all">All Exams</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.exam_name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
          </div>

          {/* Subject filter */}
          <div className="relative">
            <select
              className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none appearance-none cursor-pointer"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
          </div>

          {/* Class filter */}
          <div className="relative">
            <select
              className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none appearance-none cursor-pointer"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
            >
              <option value="all">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
          </div>

          {/* Grid columns */}
          <div className="relative">
            <select
              className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none appearance-none cursor-pointer"
              value={gridCols}
              onChange={e => setGridCols(Number(e.target.value))}
            >
              <option value={1}>1 Column</option>
              <option value={2}>2 Columns</option>
             
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
          </div>
        </div>
      </div>

      {/* ── Selection Actions ── */}
      {filteredQuestions.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 border border-zinc-400/20 rounded-sm">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              checked={selectedIds.length === filteredQuestions.length && filteredQuestions.length > 0}
              onChange={toggleSelectAll}
            />
            <span className="text-xs font-medium text-[#0e0f10]">
              {selectedIds.length} {selectedIds.length === 1 ? 'question' : 'questions'} selected
            </span>
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-red-50 text-red-600 rounded-sm hover:bg-red-100 transition-all active:scale-95"
            >
              <MdOutlineDelete size={14} />
              Delete Selected
            </button>
          )}
        </div>
      )}

      {/* ── Question List ── */}
      <div className={`grid gap-3 grid-cols-${gridCols}`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <ScaleLoader barCount={3} color="#a7a7a7ff" height={18} width={4} />
          </div>
        ) : filteredQuestions.length > 0 ? (
          filteredQuestions.map(q => (
      <div
  key={q.id}
  className="group relative border border-zinc-400/20 bg-white rounded-sm overflow-hidden hover:bg-zinc-300/10 transition-all duration-200" // added relative
>
  {/* Author badge — top right corner */}
  {q.author && (
    <button title='Author' className={`absolute top-[-1px] right-[-1px] text-[12px] sm:text-[10px] px-2 py-0.5 rounded-bl border-l  border-b  whitespace-nowrap transition-all  cursor-default ${getUserColor(q.author)}`}>
   <div className= "flex items-center gap-1"> <FiUser className=" mr-1" />  {q.author}</div>
    </button>
  )}

  <div className="flex flex-col md:flex-row items-start justify-between">
    {/* Selection Checkbox */}
    <div className=" my-6 ml-4 md:pt-0 md:h-full md:flex md:items-center">
      <input
        type="checkbox"
        className="w-3.5 h-3.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        checked={selectedIds.includes(q.id)}
        onChange={() => toggleSelectOne(q.id)}
      />
    </div>

    <div className="px-4 py-6 flex flex-1 flex-col md:flex-row items-start justify-between gap-4 w-full">
      {/* Left: question info */}
      <div className="flex items-start gap-3 flex-1 w-full">
        <span className="mt-0.5 flex items-center justify-center bg-zinc-300/20 text-[#0e0f10] rounded-sm px-1.5 py-0.5">
          {typeIcon(q.type)}
        </span>
        <div className="space-y-1 flex-1">
          <div className="flex items-start gap-4"> {/* removed justify-between since author is gone */}
            <h3 className="text-xs font-medium text-[#0e0f10]  tracking-tight leading-snug flex items-center gap-2">
              {q.question}
              {q.status && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-sm uppercase font-bold animate-pulse ${q.status === 'saving' ? 'bg-amber-100 text-amber-700' :
                  q.status === 'saved' ? 'bg-emerald-100 text-emerald-700' :
                    q.status === 'deleting' ? 'bg-red-100 text-red-700' :
                      q.status === 'done' ? 'bg-zinc-100 text-zinc-700' :
                        'bg-red-100 text-red-700'
                  }`}>
                  {q.status}
                </span>
              )}
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6b6b6b]">
            <span className="flex items-center gap-1.5 bg-zinc-300/20 px-2 py-0.5 rounded-sm text-[#0e0f10]">
              {q.type.replace(/_/g, ' ')}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen size={11} />
              {subjects.find(s => s.id === q.subjectId)?.name || 'N/A'}
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap size={11} />
              {classes.find(c => c.id === q.classId)?.name || 'N/A'}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 size={11} />
              {q.correct_answer}
            </span>
          </div>
        </div>
      </div>

      {/* Right: exam tag + actions */}
      <div className="flex items-center gap-1 w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-400/20 pt-3 md:pt-0 md:pl-6">
        <span className="mr-2 text-xs text-[#6b6b6b] bg-zinc-300/20 px-2 py-0.5 rounded-sm hidden md:block">
          {exams.find(e => e.id === q.examId)?.exam_name || 'N/A'}
        </span>
        <button
          onClick={() => handleOpenModal(q)}
          className="px-2 py-1 text-xs text-[#6b6b6b] hover:bg-zinc-300/20 hover:text-[#0e0f10] rounded-sm transition-all"
          title="Edit"
        >
          <MdOutlineModeEditOutline size={15} />
        </button>
        <button
          onClick={() => handleDelete(q.id)}
          className="px-2 py-1 text-xs text-[#6b6b6b] hover:bg-red-50 hover:text-red-500 rounded-sm transition-all"
          title="Delete"
        >
          <MdOutlineDelete size={15} />
        </button>
      </div>
    </div>
  </div>
</div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-sm border border-dashed border-zinc-400/30 flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-sm flex items-center justify-center mb-6">
              <HelpCircle size={28} className="text-[#6b6b6b]" />
            </div>
            <h3 className="text-sm font-medium text-[#0e0f10] mb-2">No questions yet</h3>
            <p className="text-xs text-[#6b6b6b] max-w-xs mx-auto mb-8 leading-relaxed">
              Build your question bank by adding multiple choice, true/false, or fill-in-the-blank questions.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-sm hover:bg-zinc-700 transition-all"
            >
              Add First Question
            </button>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'New Question'}
      >
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Type + Subject */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Question Type</label>
              <div className="relative">
                <select
                  className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10] outline-none appearance-none cursor-pointer"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as QuestionType })}
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Subject</label>
              <div className="relative">
                <select
                  className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10] outline-none appearance-none cursor-pointer"
                  value={formData.subjectId}
                  onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
              </div>
            </div>
          </div>

          {/* Question text */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Question</label>
            <textarea
              placeholder="Enter the question or problem statement..."
              className="w-full px-3 py-2 text-xs min-h-[80px] rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none transition-all placeholder:text-[#6b6b6b] resize-none"
              value={formData.question}
              onChange={e => setFormData({ ...formData, question: e.target.value })}
              required
            />
          </div>

          {/* Correct answer */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-0.5">
              <label className="text-xs font-medium text-[#0e0f10]">Correct Answer</label>
              {formData.type === 'TRUE_FALSE' && (
                <div className="flex gap-1">
                  {['TRUE', 'FALSE'].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setFormData({ ...formData, correct_answer: v })}
                      className={`px-2 py-0.5 text-xs rounded-sm transition-all ${formData.correct_answer === v ? 'bg-blue-500 text-white' : 'bg-zinc-100 text-[#6b6b6b] hover:bg-zinc-200'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Input
              placeholder={formData.type === 'TRUE_FALSE' ? 'TRUE or FALSE' : 'Correct answer'}
              value={formData.correct_answer}
              onChange={e => setFormData({ ...formData, correct_answer: e.target.value })}
              required
              className="text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10]"
            />
          </div>

          {/* Incorrect answers (MCQ only) */}
          {formData.type === 'MULTIPLE_CHOICE' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Incorrect Options (min. 1)</label>
              {formData.incorrect_answers.map((ans, idx) => (
                <Input
                  key={idx}
                  placeholder={`Option ${idx + 1}`}
                  value={ans}
                  onChange={e => handleIncorrectAnswerChange(idx, e.target.value)}
                  className="text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10]"
                  required={idx === 0}
                />
              ))}
            </div>
          )}

          {/* Exam + Class */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Exam</label>
              <div className="relative">
                <select
                  className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10] outline-none appearance-none cursor-pointer"
                  value={formData.examId}
                  onChange={e => setFormData({ ...formData, examId: e.target.value })}
                  required
                >
                  <option value="">Select Exam</option>
                  {exams.map(e => <option key={e.id} value={e.id}>{e.exam_name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Class</label>
              <div className="relative">
                <select
                  className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10] outline-none appearance-none cursor-pointer"
                  value={formData.classId}
                  onChange={e => setFormData({ ...formData, classId: e.target.value })}
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="hidden space-y-1.5">
            <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Explanation (optional)</label>
            <textarea
              placeholder="Provide reasoning for the correct answer..."
              className="w-full px-3 py-2 text-xs h-[60px] rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none transition-all placeholder:text-[#6b6b6b] resize-none"
              value={formData.explanation}
              onChange={e => setFormData({ ...formData, explanation: e.target.value })}
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-1.5 text-xs text-[#6b6b6b] hover:bg-zinc-100 rounded-sm transition-all border border-zinc-400/20"
            >
              Cancel
            </button>
            <Button
              type="submit"
              className="flex-1 py-1.5 text-xs rounded-sm bg-blue-500 text-white hover:bg-zinc-700 transition-all"
              isLoading={createQuestionMutation.isPending || updateQuestionMutation.isPending}
            >
              {editingQuestion ? (
                <span className="flex items-center justify-center gap-1.5"><Check size={13} /> Save Changes</span>
              ) : (
                <span className="flex items-center justify-center gap-1.5"><Plus size={13} /> Add Question</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}