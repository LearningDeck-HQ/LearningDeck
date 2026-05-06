"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { 
  GiTeacher 
} from 'react-icons/gi';
import { 
  Plus, 
  Search, 
  Filter, 
  Mail, 
  Calendar, 
  Shield, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  Check, 
  X, 
  ArrowRight,
  BookOpen,
  GraduationCap,
  Loader2,
  Database
} from 'lucide-react';
import { userApi } from '@/lib/api/users';
import { classApi } from '@/lib/api/classes';
import { subjectApi } from '@/lib/api/subjects';
import { workspaceApi } from '@/lib/api/workspaces';
import { User, Class, Subject } from '@/types';

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
    active: true
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
        subjectApi.list(workspaceId)
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
    return teachers.filter(t =>
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
        active: t.active
      });
      await fetchAssignments(t.id);
    } else {
      setEditingTeacher(null);
      setFormData({
        user_name: '',
        user_email: '',
        user_password: 'password123',
        active: true
      });
      setTeacherAssignments([]);
    }
    setNewAssignment({ 
      subjectId: subjects[0]?.id || '', 
      classId: classes[0]?.id || '' 
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
          active: formData.active
        });
      } else {
        response = await workspaceApi.createTeacher(workspaceId, {
          user_name: formData.user_name,
          user_email: formData.user_email,
          user_password: formData.user_password,
          active: formData.active
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
        classId: newAssignment.classId
      });
      if (res.success) {
        await fetchAssignments(editingTeacher.id);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!editingTeacher) return;
    try {
      const workspaceId = '1';
      const res = await workspaceApi.deleteAssignment(workspaceId, editingTeacher.id, assignmentId);
      if (res.success) {
        await fetchAssignments(editingTeacher.id);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DashboardHeader
        title="Teacher Directory"
        description="Manage your faculty members, subject assignments, and academic responsibilities."
      >
        <Button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#1B2559] hover:bg-[#2B3674] h-[48px] px-6 rounded-xl shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          Enroll New Teacher
        </Button>
      </DashboardHeader>

      <div className="bg-white p-6 rounded-[32px] border border-zinc-200/60 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#1B2559] flex items-center gap-2">
                <Search size={18} className="text-blue-500" />
                Staff Search Console
            </h2>
            <Button variant="ghost" onClick={fetchInitialData} className="text-[#A3AED0] hover:text-blue-600">
                <Database size={16} className="mr-2" /> Sync Data
            </Button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3AED0] group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or faculty ID..."
            className="w-full pl-12 pr-4 h-[56px] rounded-2xl bg-[#F4F7FF]/50 border border-transparent focus:border-blue-200 focus:bg-white text-[15px] text-[#1B2559] outline-none transition-all placeholder:text-[#A3AED0]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-zinc-200/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F7FF]/50 border-b border-zinc-100">
                <th className="px-8 py-5 text-[12px] font-bold text-[#A3AED0] uppercase tracking-wider">Teacher Profile</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#A3AED0] uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#A3AED0] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-10 bg-gray-100 rounded-xl w-48" /></td>
                    <td className="px-8 py-6"><div className="h-6 bg-gray-100 rounded-lg w-32" /></td>
                    <td className="px-8 py-6 text-right"><div className="h-8 bg-gray-100 rounded-lg w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="group hover:bg-[#F4F7FF]/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-100">
                          {teacher.user_name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[16px] font-bold text-[#1B2559]">{teacher.user_name}</span>
                          <span className="text-[13px] text-[#A3AED0] flex items-center gap-1"><Mail size={12}/> {teacher.user_email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${teacher.active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-zinc-100'}`}>
                         <span className={`w-1.5 h-1.5 rounded-full ${teacher.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                         {teacher.active ? 'Active' : 'Restricted'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                          <button 
                              onClick={() => handleOpenModal(teacher)}
                              className="p-2 hover:bg-blue-50 text-blue-500 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                          >
                              <Edit3 size={18} />
                          </button>
                          <button 
                              onClick={() => handleDelete(teacher.id)}
                              className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors border border-transparent hover:border-red-100"
                          >
                              <Trash2 size={18} />
                          </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-32 text-center">
                     <div className="flex flex-col items-center">
                          <div className="w-20 h-20 bg-[#F4F7FF] rounded-full flex items-center justify-center mb-6">
                              <GiTeacher size={40} className="text-[#A3AED0]" />
                          </div>
                          <h3 className="text-[20px] font-bold text-[#1B2559] mb-2">No Faculty Members Found</h3>
                          <p className="text-[#A3AED0] max-w-xs mx-auto mb-8">Start by enrolling your first teacher to the workspace.</p>
                          <Button onClick={() => handleOpenModal()} className="bg-[#1B2559] rounded-xl px-8 h-12">Enroll Teacher</Button>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? 'Staff Member Profile' : 'Staff Enrollment Portal'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto px-1">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#1B2559] ml-1">Full Legal Name</label>
            <Input
              placeholder="e.g. PROF. ALBERT EINSTEIN"
              value={formData.user_name}
              onChange={(e) => setFormData({ ...formData, user_name: e.target.value.toUpperCase() })}
              required
              className="h-[52px] rounded-xl bg-[#F4F7FF] border-none focus:ring-2 focus:ring-blue-500/20 text-[15px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#1B2559] ml-1">Academic Email</label>
            <Input
              type="email"
              placeholder="faculty@institution.edu"
              value={formData.user_email}
              onChange={(e) => setFormData({ ...formData, user_email: e.target.value.toLowerCase() })}
              required
              className="h-[52px] rounded-xl bg-[#F4F7FF] border-none focus:ring-2 focus:ring-blue-500/20 text-[15px]"
            />
          </div>

          {!editingTeacher && (
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#1B2559] ml-1">Access Credentials</label>
              <Input
                type="password"
                placeholder="Initial secure password"
                value={formData.user_password}
                onChange={(e) => setFormData({ ...formData, user_password: e.target.value })}
                required
                className="h-[52px] rounded-xl bg-[#F4F7FF] border-none focus:ring-2 focus:ring-blue-500/20 text-[15px]"
              />
            </div>
          )}

          {editingTeacher && (
            <div className="space-y-4 p-5 bg-gradient-to-br from-zinc-50 to-white rounded-3xl border border-zinc-100 shadow-inner">
               <div className="flex items-center justify-between mb-2">
                  <label className="text-[12px] font-black text-[#1B2559] uppercase tracking-[0.1em]">Subject Control Panel</label>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">Live Sync</span>
               </div>

               <div className="space-y-2 min-h-[60px]">
                  {teacherAssignments.length > 0 ? teacherAssignments.map(a => (
                    <div key={a.id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600"><BookOpen size={14}/></div>
                          <div className="flex flex-col">
                             <span className="text-[13px] font-bold text-[#1B2559]">{a.subject?.name}</span>
                             <span className="text-[11px] text-[#A3AED0] flex items-center gap-1"><GraduationCap size={10}/> {a.class?.name}</span>
                          </div>
                       </div>
                       <button 
                          type="button" 
                          onClick={() => handleDeleteAssignment(a.id)}
                          className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <X size={16} />
                       </button>
                    </div>
                  )) : (
                    <div className="py-4 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
                       <p className="text-[11px] text-[#A3AED0] font-medium italic">No subjects assigned to this faculty member yet.</p>
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-zinc-100/50">
                  <div className="relative">
                    <select
                        className="w-full h-[44px] px-3 rounded-xl bg-white border border-zinc-200 text-[12px] text-[#1B2559] outline-none appearance-none font-bold"
                        value={newAssignment.subjectId}
                        onChange={(e) => setNewAssignment({ ...newAssignment, subjectId: e.target.value })}
                    >
                        <option value="" disabled>Subject Cluster</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <select
                        className="w-full h-[44px] px-3 rounded-xl bg-white border border-zinc-200 text-[12px] text-[#1B2559] outline-none appearance-none font-bold"
                        value={newAssignment.classId}
                        onChange={(e) => setNewAssignment({ ...newAssignment, classId: e.target.value })}
                    >
                        <option value="" disabled>Class Unit</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
               </div>
               <Button
                  type="button"
                  onClick={handleAddAssignment}
                  className="w-full h-[48px] bg-white text-[#1B2559] border border-zinc-200 rounded-2xl text-[13px] font-bold hover:bg-[#F4F7FF] hover:border-blue-200 transition-all shadow-sm"
               >
                  Authorize Assignment
               </Button>
            </div>
          )}

          <div className="flex items-center justify-between p-5 bg-[#F4F7FF]/50 rounded-[28px] border border-blue-100/50">
            <div className="flex items-center gap-3">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                  <Shield size={20} />
               </div>
               <div>
                  <p className="text-[14px] font-bold text-[#1B2559]">Faculty Status</p>
                  <p className="text-[11px] text-[#A3AED0]">Control workspace access permissions.</p>
               </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, active: !formData.active })}
              className={`w-14 h-7 rounded-full relative transition-all duration-300 ${formData.active ? 'bg-emerald-500' : 'bg-zinc-300'}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${formData.active ? 'left-8' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex gap-4 pt-4 sticky bottom-0 bg-white pb-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-[60px] rounded-2xl text-[#6b7280] font-bold hover:bg-zinc-50"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-[60px] rounded-2xl bg-[#1B2559] text-white font-bold shadow-xl shadow-blue-900/20"
              isLoading={isSubmitting}
            >
              {editingTeacher ? (
                <span className="flex items-center gap-2"><Check size={20}/> Save Changes</span>
              ) : (
                <span className="flex items-center gap-2"><Plus size={20}/> Complete Enrollment</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}