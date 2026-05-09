"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Check,
  Layers,
  Hash,
  MessageSquare,
} from 'lucide-react';
import { subjectApi } from '@/lib/api/subjects';
import { classApi } from '@/lib/api/classes';
import { Subject, Class } from '@/types';
import { ScaleLoader } from 'react-spinners';
import { MdOutlineDeleteOutline, MdOutlineModeEditOutline } from 'react-icons/md';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type SubjectWithStatus = Subject & { status?: 'saving' | 'saved' | 'failed' | 'deleting' | 'done' };

export default function SubjectsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [deleteProgress, setDeleteProgress] = useState<{ current: number; total: number } | null>(null);

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const userStr = localStorage.getItem('user');
      const workspaceId = userStr ? JSON.parse(userStr).workspaceId : '1';
      const res = await subjectApi.list(workspaceId);
      return (res.data || []) as SubjectWithStatus[];
    },
  });

  const { data: allClasses = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const userStr = localStorage.getItem('user');
      const workspaceId = userStr ? JSON.parse(userStr).workspaceId : '1';
      const res = await classApi.list(workspaceId);
      return res.data || [];
    },
  });

  const isLoading = isLoadingSubjects;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    description: string;
    classIds: string[];
  }>({
    name: '',
    code: '',
    description: '',
    classIds: [],
  });


  const filteredSubjects = useMemo(() => {
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [subjects, searchTerm]);

  const handleOpenModal = (subject: Subject | null = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code || '',
        description: subject.description || '',
        classIds: subject.classes?.map((c) => c.id) || [],
      });
    } else {
      setEditingSubject(null);
      setFormData({ name: '', code: '', description: '', classIds: [] });
    }
    setIsModalOpen(true);
  };

  const createSubjectMutation = useMutation({
    mutationFn: (payload: any) => subjectApi.create(payload),
    onMutate: async (newSubject) => {
      await queryClient.cancelQueries({ queryKey: ['subjects'] });
      const previousSubjects = queryClient.getQueryData<SubjectWithStatus[]>(['subjects']);
      const tempId = Math.random().toString(36).substring(7);
      queryClient.setQueryData(['subjects'], (old: SubjectWithStatus[] = []) => [
        { ...newSubject, id: tempId, status: 'saving' } as SubjectWithStatus,
        ...old,
      ]);
      return { previousSubjects, tempId };
    },
    onError: (err, newSubject, context) => {
      queryClient.setQueryData(['subjects'], context?.previousSubjects);
      alert('Failed to create subject');
    },
    onSuccess: (data, newSubject, context) => {
      queryClient.setQueryData(['subjects'], (old: SubjectWithStatus[] = []) =>
        old.map((s) =>
          s.id === context?.tempId ? { ...data.data, status: 'saved' } : s
        )
      );
      setTimeout(() => {
        queryClient.setQueryData(['subjects'], (old: SubjectWithStatus[] = []) =>
          old.map((s) => (s.id === data?.data?.id ? { ...s, status: undefined } : s))
        );
      }, 3000);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => subjectApi.update(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['subjects'] });
      const previousSubjects = queryClient.getQueryData<SubjectWithStatus[]>(['subjects']);
      queryClient.setQueryData(['subjects'], (old: SubjectWithStatus[] = []) =>
        old.map((s) => (s.id === id ? { ...s, ...payload, status: 'saving' } : s))
      );
      return { previousSubjects };
    },
    onError: (err, { id }, context) => {
      queryClient.setQueryData(['subjects'], context?.previousSubjects);
      alert('Failed to update subject');
    },
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(['subjects'], (old: SubjectWithStatus[] = []) =>
        old.map((s) => (s.id === id ? { ...s, status: 'saved' } : s))
      );
      setTimeout(() => {
        queryClient.setQueryData(['subjects'], (old: SubjectWithStatus[] = []) =>
          old.map((s) => (s.id === id ? { ...s, status: undefined } : s))
        );
      }, 3000);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id: string) => subjectApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['subjects'] });
      const previousSubjects = queryClient.getQueryData<SubjectWithStatus[]>(['subjects']);
      queryClient.setQueryData(['subjects'], (old: SubjectWithStatus[] = []) =>
        old.map((s) => (s.id === id ? { ...s, status: 'deleting' } : s))
      );
      return { previousSubjects };
    },
    onSuccess: (data, id) => {
      queryClient.setQueryData(['subjects'], (old: SubjectWithStatus[] = []) =>
        old.map((s) => (s.id === id ? { ...s, status: 'done' } : s))
      );
      setTimeout(() => {
        queryClient.setQueryData(['subjects'], (old: SubjectWithStatus[] = []) =>
          old.filter((s) => s.id !== id)
        );
      }, 1000);
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['subjects'], context?.previousSubjects);
      alert('Failed to delete subject');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem('user');
    const workspaceId = userStr ? JSON.parse(userStr).workspaceId : '1';
    const payload = { ...formData, workspaceId };

    if (editingSubject) {
      updateSubjectMutation.mutate({ id: editingSubject.id, payload });
    } else {
      createSubjectMutation.mutate(payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    deleteSubjectMutation.mutate(id);
  };

  const handleBulkDelete = async () => {
    if (selectedSubjects.length === 0) return;
    if (!window.confirm(`Delete ${selectedSubjects.length} subjects?`)) return;
    const idsToDelete = [...selectedSubjects];
    setDeleteProgress({ current: 0, total: idsToDelete.length });

    for (let i = 0; i < idsToDelete.length; i++) {
      const id = idsToDelete[i];
      try {
        await deleteSubjectMutation.mutateAsync(id);
        setDeleteProgress(prev => prev ? { ...prev, current: i + 1 } : null);
      } catch (err) {
        console.error(`Failed to delete ${id}`, err);
      }
    }

    setTimeout(() => setDeleteProgress(null), 2000);
    setSelectedSubjects([]);
  };

  const toggleClass = (classId: string) => {
    setFormData((prev) => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter((id) => id !== classId)
        : [...prev.classIds, classId],
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 relative">
      {deleteProgress && (
        <div className="sticky top-0 z-50 bg-white border-b border-red-100 p-2 mb-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Deleting Subjects...</span>
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
        title="Subjects"
        description="Define your learning domains, subject codes, and curriculum structure."
      >
        <div className="flex items-center gap-2">
          {selectedSubjects.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-red-500 bg-red-50 rounded-sm hover:bg-red-100 transition-all border border-red-200"
            >
              <MdOutlineDeleteOutline size={14} />
              Delete ({selectedSubjects.length})
            </button>
          )}
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-sm hover:bg-zinc-700 transition-all active:scale-[0.98]"
          >
            <Plus size={14} />
            Create Subject
          </button>
        </div>
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
              placeholder="Search by subject name or catalog code..."
              className="w-full pl-8 pr-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none transition-all placeholder:text-[#6b6b6b]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['subjects'] })}
            className="px-3 py-1 text-xs rounded-sm bg-zinc-100 text-[#0e0f10] hover:bg-zinc-200 transition-colors border border-zinc-400/20"
          >
            Apply
          </button>
        </div>
      </div>

      {/* ── Subject List ── */}
      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <ScaleLoader barCount={3} color="#a7a7a7ff" height={18} width={4} />
          </div>
        ) : filteredSubjects.length > 0 ? (
          filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              className="group border border-zinc-400/20 bg-white rounded-sm overflow-hidden hover:bg-zinc-300/10 transition-all duration-200"
            >
              <div className="px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Subject info */}
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-[#0e0f10] tracking-tight flex items-center gap-2">
                      {subject.name}
                      {subject.status && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-sm uppercase font-bold animate-pulse ${subject.status === 'saving' ? 'bg-amber-100 text-amber-700' :
                          subject.status === 'saved' ? 'bg-emerald-100 text-emerald-700' :
                            subject.status === 'deleting' ? 'bg-red-100 text-red-700' :
                              subject.status === 'done' ? 'bg-zinc-100 text-zinc-700' :
                                'bg-red-100 text-red-700'
                          }`}>
                          {subject.status}
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#6b6b6b]">
                      <span className="flex items-center gap-1.5 bg-zinc-300/20 px-2 py-0.5 rounded-sm text-[#0e0f10] font-mono text-[10px]">
                        {subject.code || 'UNCODED'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers size={11} /> Questions: {subject._count?.questions || 0}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {subject.classes && subject.classes.length > 0 ? (
                          subject.classes.map((cls) => (
                            <span
                              key={cls.id}
                              className="text-[10px] text-[#0e0f10] bg-zinc-100 border border-zinc-400/20 px-2 py-0.5 rounded-sm"
                            >
                              {cls.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-[#6b6b6b] italic">No classes</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-400/20 pt-3 md:pt-0 md:pl-6">
                  <button
                    onClick={() => handleOpenModal(subject)}
                    className="px-2 py-1 text-xs text-[#6b6b6b] hover:bg-zinc-300/20 hover:text-[#0e0f10] rounded-sm transition-all"
                    title="Edit"
                  >
                    <MdOutlineModeEditOutline size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    className="px-2 py-1 text-xs text-[#6b6b6b] hover:bg-red-50 hover:text-red-500 rounded-sm transition-all"
                    title="Delete"
                  >
                    <MdOutlineDeleteOutline size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* ── Empty state ── */
          <div className="text-center py-20 bg-white rounded-sm border border-dashed border-zinc-400/30 flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-sm flex items-center justify-center mb-6">
              <Layers size={28} className="text-[#6b6b6b]" />
            </div>
            <h3 className="text-sm font-medium text-[#0e0f10] mb-2">No subjects yet</h3>
            <p className="text-xs text-[#6b6b6b] max-w-xs mx-auto mb-8 leading-relaxed">
              Start building your question bank by creating subject categories and catalog codes.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-sm hover:bg-zinc-700 transition-all"
            >
              Create First Subject
            </button>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Edit Subject' : 'New Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {/* Subject name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#0e0f10] ml-0.5 flex items-center gap-1">
                <BookOpen size={11} className="text-[#6b6b6b]" /> Subject Name
              </label>
              <Input
                placeholder="e.g. APPLIED PHYSICS"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                required
                className="text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10] placeholder:text-[#6b6b6b]"
              />
            </div>

            {/* Code */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#0e0f10] ml-0.5 flex items-center gap-1">
                <Hash size={11} className="text-[#6b6b6b]" /> Catalog Code
              </label>
              <Input
                placeholder="e.g. PHY-202"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10] placeholder:text-[#6b6b6b] font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#0e0f10] ml-0.5 flex items-center gap-1">
              <MessageSquare size={11} className="text-[#6b6b6b]" /> Description
            </label>
            <textarea
              className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 rounded-sm text-[#0e0f10] outline-none transition-all min-h-[72px] placeholder:text-[#6b6b6b] resize-none"
              placeholder="Outline the core learning objectives and scope..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Class assignment */}
          <div className="space-y-2 p-3 bg-zinc-50 rounded-sm border border-zinc-400/20">
            <p className="text-xs font-medium text-[#0e0f10]">Assign to Classes</p>
            <div className="flex flex-wrap gap-1.5">
              {allClasses.length > 0 ? (
                allClasses.map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => toggleClass(cls.id)}
                    className={`px-3 py-1 text-xs rounded-sm transition-all border ${formData.classIds.includes(cls.id)
                      ? 'bg-blue-500 text-white border-[#0e0f10]'
                      : 'bg-white text-[#6b6b6b] border-zinc-400/20 hover:border-zinc-400/60 hover:text-[#0e0f10]'
                      }`}
                  >
                    {cls.name}
                  </button>
                ))
              ) : (
                <p className="text-[10px] text-[#6b6b6b] italic">No class units available.</p>
              )}
            </div>
          </div>

          {/* Footer buttons */}
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
              isLoading={createSubjectMutation.isPending || updateSubjectMutation.isPending}
            >
              {editingSubject ? (
                <span className="flex items-center justify-center gap-1.5"><Check size={13} /> Save Changes</span>
              ) : (
                <span className="flex items-center justify-center gap-1.5"><Plus size={13} /> Create Subject</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}