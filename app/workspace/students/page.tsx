"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { 
  Users as UsersIcon, 
  Plus, 
  Mail, 
  Shield, 
  Search, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  Filter, 
  Download,
  GraduationCap,
  Check,
  X,
  ArrowRight,
  BookOpen,
  Loader2,
  Database,
  ChevronRight
} from 'lucide-react';
import { userApi } from '@/lib/api/users';
import { workspaceApi } from '@/lib/api/workspaces';
import { classApi } from '@/lib/api/classes';
import { subjectApi } from '@/lib/api/subjects';
import { User, Workspace, Class, Subject } from '@/types';

export default function StudentsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    user_password: '',
    classId: '',
    role: 'STUDENT' as const,
    active: true
  });

  // Assignment states
  const [studentAssignments, setStudentAssignments] = useState<any[]>([]);
  const [newAssignment, setNewAssignment] = useState({ subjectId: '', classId: '' });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const workspaceId = 1; 
      const [usersRes, clsRes, subRes] = await Promise.all([
        userApi.list({ role: 'STUDENT', workspaceId }),
        classApi.list(workspaceId),
        subjectApi.list(workspaceId)
      ]);
      if (usersRes.data) setUsers(usersRes.data);
      if (clsRes.data) setClasses(clsRes.data);
      if (subRes.data) setSubjects(subRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchAssignments = async (userId: number) => {
    try {
      const workspaceId = 1;
      const res = await workspaceApi.getAssignments(workspaceId, userId);
      if (res.data) setStudentAssignments(res.data);
    } catch (err) {
      console.error('Failed to fetch assignments', err);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.user_email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleOpenModal = async (u: User | null = null) => {
    if (u) {
      setEditingUser(u);
      setFormData({
        user_name: u.user_name,
        user_email: u.user_email,
        user_password: '',
        classId: u.classId?.toString() || '',
        role: u.role as any,
        active: u.active
      });
      await fetchAssignments(u.id);
    } else {
      setEditingUser(null);
      setFormData({
        user_name: '',
        user_email: '',
        user_password: 'password123',
        classId: classes[0]?.id.toString() || '',
        role: 'STUDENT',
        active: true
      });
      setStudentAssignments([]);
    }
    setNewAssignment({ 
      subjectId: subjects[0]?.id.toString() || '', 
      classId: classes[0]?.id.toString() || '' 
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    try {
      setIsLoading(true);
      await userApi.delete(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const workspaceId = 1;
      
      let response;
      if (editingUser) {
        response = await userApi.update(editingUser.id, {
          user_name: formData.user_name,
          user_email: formData.user_email,
          classId: formData.classId ? parseInt(formData.classId) : null,
          active: formData.active
        });
      } else {
        response = await workspaceApi.createStudent(workspaceId, {
          user_name: formData.user_name,
          user_email: formData.user_email,
          user_password: formData.user_password,
          classId: formData.classId ? parseInt(formData.classId) : null,
          active: formData.active
        });
      }

      if (response.success) {
        await fetchData();
        if (!editingUser) {
          setEditingUser(response.data);
          setStudentAssignments([]);
        } else {
          setIsModalOpen(false);
        }
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAssignment = async () => {
    if (!editingUser || !newAssignment.subjectId || !newAssignment.classId) return;
    try {
      const workspaceId = 1;
      const res = await workspaceApi.addAssignment(workspaceId, editingUser.id, {
        subjectId: parseInt(newAssignment.subjectId),
        classId: parseInt(newAssignment.classId)
      });
      if (res.success) {
        await fetchAssignments(editingUser.id);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    if (!editingUser) return;
    try {
      const workspaceId = 1;
      const res = await workspaceApi.deleteAssignment(workspaceId, editingUser.id, assignmentId);
      if (res.success) {
        await fetchAssignments(editingUser.id);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DashboardHeader
        title="Student Registry"
        description="Monitor student enrollments, class assignments, and academic performance."
      >
        <Button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#1B2559] hover:bg-[#2B3674] h-[48px] px-6 rounded-xl shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          Enroll New Student
        </Button>
      </DashboardHeader>

      <div className="bg-white p-6 rounded-[32px] border border-zinc-200/60 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#1B2559] flex items-center gap-2">
                <Search size={18} className="text-blue-500" />
                Student Search Interface
            </h2>
            <div className="flex gap-2">
                <Button variant="ghost" onClick={fetchData} className="text-[#A3AED0] hover:text-blue-600">
                    <Database size={16} className="mr-2" /> Refresh
                </Button>
            </div>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3AED0] group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search students by name, email or enrollment ID..."
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
                <th className="px-8 py-5 text-[12px] font-bold text-[#A3AED0] uppercase tracking-wider">Student Profile</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#A3AED0] uppercase tracking-wider">Base Class</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#A3AED0] uppercase tracking-wider text-center">Status</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#A3AED0] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                [1, 2, 3, 4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-10 bg-gray-100 rounded-xl w-48" /></td>
                    <td className="px-8 py-6"><div className="h-6 bg-gray-100 rounded-lg w-32" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 rounded w-24 mx-auto" /></td>
                    <td className="px-8 py-6 text-right"><div className="h-8 bg-gray-100 rounded-lg w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((student) => (
                  <tr key={student.id} className="group hover:bg-[#F4F7FF]/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-100">
                          {student.user_name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[16px] font-bold text-[#1B2559]">{student.user_name}</span>
                          <span className="text-[13px] text-[#A3AED0] flex items-center gap-1"><Mail size={12}/> {student.user_email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-[14px] font-bold text-[#1B2559] bg-[#F4F7FF] px-4 py-1.5 rounded-xl border border-blue-50">
                          {classes.find(c => c.id === student.classId)?.name || 'Unassigned'}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${student.active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-zinc-100'}`}>
                         <span className={`w-1.5 h-1.5 rounded-full ${student.active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                         {student.active ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                          <button 
                              onClick={() => handleOpenModal(student)}
                              className="p-2 hover:bg-blue-50 text-blue-500 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                          >
                              <Edit3 size={18} />
                          </button>
                          <button 
                              onClick={() => handleDelete(student.id)}
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
                  <td colSpan={4} className="py-32 text-center">
                     <div className="flex flex-col items-center">
                        <div className="w-24 h-24 bg-[#F4F7FF] rounded-full flex items-center justify-center mb-6">
                            <UsersIcon size={48} className="text-[#A3AED0]" />
                        </div>
                        <h3 className="text-[22px] font-bold text-[#1B2559] mb-2">No Students Enrolled</h3>
                        <p className="text-[#A3AED0] max-w-xs mx-auto mb-8">Start by enrolling your first student to organize their learning path.</p>
                        <Button onClick={() => handleOpenModal()} className="bg-[#1B2559] rounded-xl px-10 h-14 font-bold shadow-lg shadow-blue-900/10">Enroll Student</Button>
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
        title={editingUser ? 'Student Profile Analysis' : 'Student Enrollment Hub'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto px-1">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#1B2559] ml-1">Full Name</label>
            <Input
              placeholder="e.g. NIKOLA TESLA"
              value={formData.user_name}
              onChange={(e) => setFormData({ ...formData, user_name: e.target.value.toUpperCase() })}
              required
              className="h-[52px] rounded-xl bg-[#F4F7FF] border-none focus:ring-2 focus:ring-blue-500/20 text-[15px]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#1B2559] ml-1">Admission Email / ID</label>
            <Input
              type="email"
              placeholder="student@academy.com"
              value={formData.user_email}
              onChange={(e) => setFormData({ ...formData, user_email: e.target.value.toLowerCase() })}
              required
              className="h-[52px] rounded-xl bg-[#F4F7FF] border-none focus:ring-2 focus:ring-blue-500/20 text-[15px]"
            />
          </div>

          {!editingUser && (
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#1B2559] ml-1">Account Password</label>
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

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#1B2559] ml-1">Base Academic Class</label>
            <div className="relative">
              <select
                required
                className="w-full h-[52px] px-4 rounded-xl bg-[#F4F7FF] border-none text-[14px] text-[#1B2559] outline-none appearance-none cursor-pointer font-bold"
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              >
                <option value="" disabled>Assign Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3AED0] rotate-90 pointer-events-none" size={16} />
            </div>
          </div>

          {editingUser && (
            <div className="space-y-4 p-5 bg-gradient-to-br from-indigo-50 to-white rounded-3xl border border-indigo-100/50 shadow-inner">
               <div className="flex items-center justify-between mb-2">
                  <label className="text-[12px] font-black text-[#1B2559] uppercase tracking-[0.1em]">Course Assignments</label>
                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">Enrollment Logic</span>
               </div>

               <div className="space-y-2 min-h-[60px]">
                  {studentAssignments.length > 0 ? studentAssignments.map(a => (
                    <div key={a.id} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600"><BookOpen size={14}/></div>
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
                    <div className="py-4 text-center border-2 border-dashed border-indigo-100 rounded-2xl bg-white/50">
                       <p className="text-[11px] text-[#A3AED0] font-medium italic">No specific subject enrollments detected.</p>
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-indigo-100/30">
                  <div className="relative">
                    <select
                        className="w-full h-[44px] px-3 rounded-xl bg-white border border-zinc-200 text-[12px] text-[#1B2559] outline-none appearance-none font-bold"
                        value={newAssignment.subjectId}
                        onChange={(e) => setNewAssignment({ ...newAssignment, subjectId: e.target.value })}
                    >
                        <option value="" disabled>Add Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <select
                        className="w-full h-[44px] px-3 rounded-xl bg-white border border-zinc-200 text-[12px] text-[#1B2559] outline-none appearance-none font-bold"
                        value={newAssignment.classId}
                        onChange={(e) => setNewAssignment({ ...newAssignment, classId: e.target.value })}
                    >
                        <option value="" disabled>Specific Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
               </div>
               <Button
                  type="button"
                  onClick={handleAddAssignment}
                  className="w-full h-[48px] bg-white text-indigo-600 border border-indigo-200 rounded-2xl text-[13px] font-bold hover:bg-indigo-50 transition-all shadow-sm"
               >
                  Authorize Enrollment
               </Button>
            </div>
          )}

          <div className="flex items-center justify-between p-5 bg-[#F4F7FF]/50 rounded-[28px] border border-blue-100/50">
            <div className="flex items-center gap-3">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
                  <Shield size={20} />
               </div>
               <div>
                  <p className="text-[14px] font-bold text-[#1B2559]">Active Enrollment</p>
                  <p className="text-[11px] text-[#A3AED0]">Control student access to examinations.</p>
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
              className="flex-1 h-[60px] rounded-2xl text-[#6b7280] font-bold"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-[60px] rounded-2xl bg-[#1B2559] text-white font-bold shadow-xl shadow-blue-900/20"
              isLoading={isSubmitting}
            >
              {editingUser ? (
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
