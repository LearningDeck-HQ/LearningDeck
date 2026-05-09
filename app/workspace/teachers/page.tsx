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
  Mail,
  Shield,
  Check,
  X,
  BookOpen,
  GraduationCap,
  ChevronDown,
  Loader2,
  Copy,
} from 'lucide-react';
import { GiTeacher } from 'react-icons/gi';
import { userApi } from '@/lib/api/users';
import { classApi } from '@/lib/api/classes';
import { subjectApi } from '@/lib/api/subjects';
import { workspaceApi } from '@/lib/api/workspaces';
import { inviteApi } from '@/lib/api/invites';
import { User, Class, Subject } from '@/types';
import { MdOutlineDeleteOutline, MdOutlineModeEditOutline } from 'react-icons/md';
import { ScaleLoader } from 'react-spinners';
import { BiCopy, BiUserPlus } from 'react-icons/bi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type UserWithStatus = User & { status?: 'saving' | 'saved' | 'failed' | 'deleting' | 'done' };

export default function TeacherPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteProgress, setDeleteProgress] = useState<{ current: number; total: number } | null>(null);

  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const userStr = localStorage.getItem('user');
      const workspaceId = userStr ? JSON.parse(userStr).workspaceId : '1';
      const res = await userApi.list({ role: 'TEACHER', workspaceId });
      return (res.data || []) as UserWithStatus[];
    },
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const userStr = localStorage.getItem('user');
      const workspaceId = userStr ? JSON.parse(userStr).workspaceId : '1';
      const res = await classApi.list(workspaceId);
      return res.data || [];
    },
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const userStr = localStorage.getItem('user');
      const workspaceId = userStr ? JSON.parse(userStr).workspaceId : '1';
      const res = await subjectApi.list(workspaceId);
      return res.data || [];
    },
  });

  const isLoading = isLoadingTeachers;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_password: '',
    active: true,
  });

  // Assignment states
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([]);
  const [newAssignment, setNewAssignment] = useState({ subjectId: '', classId: '' });

  // Invite states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(false);
  const [copied, setCopied] = useState(false);


  const fetchAssignments = async (teacherId: string) => {
    try {
      const workspaceId = '1';
      const res = await workspaceApi.getAssignments(workspaceId, teacherId);
      if (res.data) setTeacherAssignments(res.data);
    } catch (err) {
      console.error('Failed to fetch assignments', err);
    }
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(
      (t) =>
        t.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [teachers, searchTerm]);

  const handleOpenModal = async (t: User | null = null) => {
    if (t) {
      setEditingTeacher(t);
      setFormData({
        user_name: t.user_name,
        user_email: t.user_email,
        user_password: '',
        active: t.active,
      });
      await fetchAssignments(t.id);
    } else {
      setEditingTeacher(null);
      setFormData({ user_name: '', user_email: '', user_password: 'password123', active: true });
      setTeacherAssignments([]);
    }
    setNewAssignment({
      subjectId: subjects[0]?.id || '',
      classId: classes[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const createTeacherMutation = useMutation({
    mutationFn: (payload: any) => {
      const userStr = localStorage.getItem('user');
      const workspaceId = userStr ? JSON.parse(userStr).workspaceId : '1';
      return workspaceApi.createTeacher(workspaceId, payload);
    },
    onMutate: async (newTeacher) => {
      await queryClient.cancelQueries({ queryKey: ['teachers'] });
      const previousTeachers = queryClient.getQueryData<UserWithStatus[]>(['teachers']);
      const tempId = Math.random().toString(36).substring(7);
      queryClient.setQueryData(['teachers'], (old: UserWithStatus[] = []) => [
        { ...newTeacher, id: tempId, status: 'saving' } as UserWithStatus,
        ...old,
      ]);
      return { previousTeachers, tempId };
    },
    onError: (err, newTeacher, context) => {
      queryClient.setQueryData(['teachers'], context?.previousTeachers);
      alert('Failed to add teacher');
    },
    onSuccess: (data, newTeacher, context) => {
      queryClient.setQueryData(['teachers'], (old: UserWithStatus[] = []) =>
        old.map((t) =>
          t.id === context?.tempId ? { ...data.data, status: 'saved' } : t
        )
      );
      setEditingTeacher(data.data);
      setTeacherAssignments([]);
      setTimeout(() => {
        queryClient.setQueryData(['teachers'], (old: UserWithStatus[] = []) =>
          old.map((t) => (t.id === data.data.id ? { ...t, status: undefined } : t))
        );
      }, 3000);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });

  const updateTeacherMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => userApi.update(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['teachers'] });
      const previousTeachers = queryClient.getQueryData<UserWithStatus[]>(['teachers']);
      queryClient.setQueryData(['teachers'], (old: UserWithStatus[] = []) =>
        old.map((t) => (t.id === id ? { ...t, ...payload, status: 'saving' } : t))
      );
      return { previousTeachers };
    },
    onError: (err, { id }, context) => {
      queryClient.setQueryData(['teachers'], context?.previousTeachers);
      alert('Failed to update teacher');
    },
    onSuccess: (data, { id }) => {
      queryClient.setQueryData(['teachers'], (old: UserWithStatus[] = []) =>
        old.map((t) => (t.id === id ? { ...t, status: 'saved' } : t))
      );
      setTimeout(() => {
        queryClient.setQueryData(['teachers'], (old: UserWithStatus[] = []) =>
          old.map((t) => (t.id === id ? { ...t, status: undefined } : t))
        );
      }, 3000);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['teachers'] });
      const previousTeachers = queryClient.getQueryData<UserWithStatus[]>(['teachers']);
      queryClient.setQueryData(['teachers'], (old: UserWithStatus[] = []) =>
        old.map((t) => (t.id === id ? { ...t, status: 'deleting' } : t))
      );
      return { previousTeachers };
    },
    onSuccess: (data, id) => {
      queryClient.setQueryData(['teachers'], (old: UserWithStatus[] = []) =>
        old.map((t) => (t.id === id ? { ...t, status: 'done' } : t))
      );
      setTimeout(() => {
        queryClient.setQueryData(['teachers'], (old: UserWithStatus[] = []) =>
          old.filter((t) => t.id !== id)
        );
      }, 1000);
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['teachers'], context?.previousTeachers);
      alert('Failed to delete teacher');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    deleteTeacherMutation.mutate(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      updateTeacherMutation.mutate({
        id: editingTeacher.id,
        payload: {
          user_name: formData.user_name,
          user_email: formData.user_email,
          active: formData.active,
        },
      });
      setIsModalOpen(false);
    } else {
      createTeacherMutation.mutate({
        user_name: formData.user_name,
        user_email: formData.user_email,
        user_password: formData.user_password,
        active: formData.active,
      });
    }
  };

  const handleAddAssignment = async () => {
    if (!editingTeacher || !newAssignment.subjectId || !newAssignment.classId) return;
    try {
      const workspaceId = '1';
      const res = await workspaceApi.addAssignment(workspaceId, editingTeacher.id, {
        subjectId: newAssignment.subjectId,
        classId: newAssignment.classId,
      });
      if (res.success) await fetchAssignments(editingTeacher.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!editingTeacher) return;
    try {
      const workspaceId = '1';
      const res = await workspaceApi.deleteAssignment(workspaceId, editingTeacher.id, assignmentId);
      if (res.success) await fetchAssignments(editingTeacher.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGenerateInvite = async () => {
    try {
      setIsLoadingInvite(true);
      const userStr = localStorage.getItem('user');
      const workspaceId = userStr ? JSON.parse(userStr).workspaceId : '1';
      const res = await inviteApi.create({ workspaceId, role: 'TEACHER' });
      if (res.success && res.data) {
        setInviteToken(res.data.token);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to generate invite');
    } finally {
      setIsLoadingInvite(false);
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 relative">
      {deleteProgress && (
        <div className="sticky top-0 z-50 bg-white border-b border-red-100 p-2 mb-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Deleting Teachers...</span>
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
        title="Teachers"
        description="Manage faculty members, subject assignments, and access permissions."
      >
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-sm hover:bg-zinc-700 transition-all active:scale-[0.98]"
        >
          <BiUserPlus size={14} /> Invite
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
              placeholder="Search by name or email..."
              className="w-full pl-8 pr-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none transition-all placeholder:text-[#6b6b6b]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['teachers'] })}
            className="px-3 py-1 text-xs rounded-sm bg-zinc-100 text-[#0e0f10] hover:bg-zinc-200 transition-colors border border-zinc-400/20"
          >
            Apply
          </button>
        </div>
      </div>

      {/* ── Teacher List ── */}
      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <ScaleLoader barCount={3} color="#a7a7a7ff" height={18} width={4} />
          </div>
        ) : filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="group border border-zinc-400/20 bg-white rounded-sm overflow-hidden hover:bg-zinc-300/10 transition-all duration-200"
            >
              <div className="px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Teacher info */}
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-[#0e0f10] tracking-tight flex items-center gap-2">
                      {teacher.user_name}
                      {teacher.status && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-sm uppercase font-bold animate-pulse ${
                          teacher.status === 'saving' ? 'bg-amber-100 text-amber-700' :
                          teacher.status === 'saved' ? 'bg-emerald-100 text-emerald-700' :
                          teacher.status === 'deleting' ? 'bg-red-100 text-red-700' :
                          teacher.status === 'done' ? 'bg-zinc-100 text-zinc-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {teacher.status}
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#6b6b6b]">
                      <span className="flex items-center gap-1.5">
                        <Mail size={11} /> {teacher.user_email}
                      </span>
                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-medium ${teacher.active
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-zinc-100 text-[#6b6b6b]'
                          }`}
                      >
                        {teacher.active ? 'Active' : 'Restricted'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-400/20 pt-3 md:pt-0 md:pl-6">
                  <button
                    onClick={() => handleOpenModal(teacher)}
                    className="hidden px-2 py-1 text-xs text-[#6b6b6b] hover:bg-zinc-300/20 hover:text-[#0e0f10] rounded-sm transition-all"
                    title="Edit"
                  >
                    <MdOutlineModeEditOutline size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(teacher.id)}
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
              <GiTeacher size={28} className="text-[#6b6b6b]" />
            </div>
            <h3 className="text-sm font-medium text-[#0e0f10] mb-2">No teachers yet</h3>
            <p className="text-xs text-[#6b6b6b] max-w-xs mx-auto mb-8 leading-relaxed">
              Start by adding your first faculty member to the workspace.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-1.5 text-xs font-medium bg-[#0e0f10] text-white rounded-sm hover:bg-zinc-700 transition-all"
            >
              Add First Teacher
            </button>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? 'Edit Teacher' : 'New Teacher'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Full Name</label>
            <Input
              placeholder="e.g. PROF. ALBERT EINSTEIN"
              value={formData.user_name}
              onChange={(e) => setFormData({ ...formData, user_name: e.target.value.toUpperCase() })}
              required
              className="text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10] placeholder:text-[#6b6b6b]"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Academic Email</label>
            <Input
              type="email"
              placeholder="faculty@school.edu"
              value={formData.user_email}
              onChange={(e) => setFormData({ ...formData, user_email: e.target.value.toLowerCase() })}
              required
              className="text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10] placeholder:text-[#6b6b6b]"
            />
          </div>

          {/* Password — create only */}
          {!editingTeacher && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Password</label>
              <Input
                type="password"
                placeholder="Initial secure password"
                value={formData.user_password}
                onChange={(e) => setFormData({ ...formData, user_password: e.target.value })}
                required
                className="text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10] placeholder:text-[#6b6b6b]"
              />
            </div>
          )}

          {/* Subject assignments — edit only */}
          {editingTeacher && (
            <div className="space-y-3 p-3 bg-zinc-50 rounded-sm border border-zinc-400/20">
              <p className="text-xs font-medium text-[#0e0f10]">Subject Assignments</p>

              <div className="space-y-1.5 min-h-[40px]">
                {teacherAssignments.length > 0 ? (
                  teacherAssignments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between bg-white px-3 py-1.5 rounded-sm border border-zinc-400/20"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen size={11} className="text-[#6b6b6b]" />
                        <span className="text-xs text-[#0e0f10]">{a.subject?.name}</span>
                        <span className="text-[10px] text-[#6b6b6b]">— {a.class?.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAssignment(a.id)}
                        className="px-1.5 py-0.5 text-[#6b6b6b] hover:bg-red-50 hover:text-red-500 rounded-sm transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-[#6b6b6b] italic px-1">No subjects assigned yet.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <select
                    className="w-full px-3 py-1 text-xs rounded-sm bg-white border border-zinc-400/20 text-[#0e0f10] outline-none appearance-none cursor-pointer"
                    value={newAssignment.subjectId}
                    onChange={(e) => setNewAssignment({ ...newAssignment, subjectId: e.target.value })}
                  >
                    <option value="" disabled>Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={11} />
                </div>
                <div className="relative">
                  <select
                    className="w-full px-3 py-1 text-xs rounded-sm bg-white border border-zinc-400/20 text-[#0e0f10] outline-none appearance-none cursor-pointer"
                    value={newAssignment.classId}
                    onChange={(e) => setNewAssignment({ ...newAssignment, classId: e.target.value })}
                  >
                    <option value="" disabled>Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={11} />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddAssignment}
                className="w-full py-1 text-xs text-[#6b6b6b] hover:bg-zinc-200 rounded-sm transition-colors border border-zinc-400/20 bg-white"
              >
                Add Assignment
              </button>
            </div>
          )}

          {/* Faculty status toggle */}
          <div className="hidden flex items-center justify-between px-3 py-2.5 bg-zinc-50 rounded-sm border border-zinc-400/20">
            <div>
              <p className="text-xs font-medium text-[#0e0f10]">Faculty Status</p>
              <p className="text-[11px] text-[#6b6b6b] mt-0.5">Control workspace access permissions</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, active: !formData.active })}
              className={`w-10 h-5 rounded-full relative transition-colors duration-200 focus:outline-none ${formData.active ? 'bg-[#0e0f10]' : 'bg-zinc-300'
                }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${formData.active ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
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
              isLoading={createTeacherMutation.isPending || updateTeacherMutation.isPending}
            >
              {editingTeacher ? (
                <span className="flex items-center justify-center gap-1.5"><Check size={13} /> Save Changes</span>
              ) : (
                <span className="flex items-center justify-center gap-1.5"><BiUserPlus size={13} /> Invite</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Invite Link Modal ── */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => {
          setIsInviteModalOpen(false);
          setInviteToken(null);
          setCopied(false);
        }}
        title="Invite Teacher"
      >
        <div className="space-y-4 py-2">
          {!inviteToken ? (
            <div className="space-y-4">
              <p className="text-xs text-[#6b6b6b] leading-relaxed">
                Generate a secure invitation link for a new teacher to join this workspace.
              </p>
              <Button
                onClick={handleGenerateInvite}
                isLoading={isLoadingInvite}
                className="w-full py-2 bg-[#0e0f10] text-white hover:bg-zinc-800"
              >
                <Plus size={14} className="mr-2" /> Generate Invite Link
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="p-3 bg-zinc-50 border border-zinc-400/20 rounded-sm">
                <p className="text-[10px] uppercase tracking-wider text-[#6b6b6b] font-semibold mb-2">Invitation Link</p>
                <div className="text-xs font-mono break-all text-[#0e0f10] bg-white p-2 border border-zinc-400/10 rounded-sm">
                  {`https://learningdeck.online/invite/teacher?token=${inviteToken}`}
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://learningdeck.online/invite/teacher?token=${inviteToken}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`w-full py-2 rounded-sm flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                  copied
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : 'bg-[#0e0f10] text-white hover:bg-zinc-800'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} /> Copied!
                  </>
                ) : (
                  <>
                    <BiCopy size={14} /> Copy Link
                  </>
                )}
              </button>

              <button
                onClick={() => setInviteToken(null)}
                className="w-full text-[11px] text-[#6b6b6b] hover:text-[#0e0f10] transition-colors"
              >
                Generate another link
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}