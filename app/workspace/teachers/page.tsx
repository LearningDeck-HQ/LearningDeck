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
} from 'lucide-react';
import { GiTeacher } from 'react-icons/gi';
import { userApi } from '@/lib/api/users';
import { classApi } from '@/lib/api/classes';
import { subjectApi } from '@/lib/api/subjects';
import { workspaceApi } from '@/lib/api/workspaces';
import { User, Class, Subject } from '@/types';
import { MdOutlineDeleteOutline, MdOutlineModeEditOutline } from 'react-icons/md';
import { ScaleLoader } from 'react-spinners';
import { BiUserPlus } from 'react-icons/bi';

export default function TeacherPage() {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const workspaceId = '1';
      const [usersRes, classesRes, subjectsRes] = await Promise.all([
        userApi.list({ role: 'TEACHER', workspaceId }),
        classApi.list(workspaceId),
        subjectApi.list(workspaceId),
      ]);
      if (usersRes.data) setTeachers(usersRes.data);
      if (classesRes.data) setClasses(classesRes.data);
      if (subjectsRes.data) setSubjects(subjectsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      setIsLoading(true);
      await userApi.delete(id);
      await fetchInitialData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete teacher');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const workspaceId = '1';
      let response;
      if (editingTeacher) {
        response = await userApi.update(editingTeacher.id, {
          user_name: formData.user_name,
          user_email: formData.user_email,
          active: formData.active,
        });
      } else {
        response = await workspaceApi.createTeacher(workspaceId, {
          user_name: formData.user_name,
          user_email: formData.user_email,
          user_password: formData.user_password,
          active: formData.active,
        });
      }
      if (response.success) {
        await fetchInitialData();
        if (!editingTeacher) {
          setEditingTeacher(response.data);
          setTeacherAssignments([]);
        } else {
          setIsModalOpen(false);
        }
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <DashboardHeader
        title="Teachers"
        description="Manage faculty members, subject assignments, and access permissions."
      >
        <button

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
            onClick={fetchInitialData}
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
                    <h3 className="text-sm font-medium text-[#0e0f10] tracking-tight">
                      {teacher.user_name}
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
              isLoading={isSubmitting}
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
    </div>
  );
}