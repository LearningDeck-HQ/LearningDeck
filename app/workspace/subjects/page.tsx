"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Layers, 
  Hash, 
  MessageSquare,
  Loader2,
  Database,
  ChevronRight
} from 'lucide-react';
import { subjectApi } from '@/lib/api/subjects';
import { classApi } from '@/lib/api/classes';
import { Subject, Class } from '@/types';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection states
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    description: string;
    classIds: number[];
  }>({
    name: '',
    code: '',
    description: '',
    classIds: []
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const workspaceId = 1; // Real app should use context
      const [subjectsRes, classesRes] = await Promise.all([
        subjectApi.list(workspaceId),
        classApi.list(workspaceId)
      ]);

      if (subjectsRes.data) setSubjects(subjectsRes.data);
      if (classesRes.data) setAllClasses(classesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredSubjects = useMemo(() => {
    return subjects.filter(s =>
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
        classIds: subject.classes?.map(c => c.id) || []
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        classIds: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const workspaceId = 1;
      const payload = {
        ...formData,
        workspaceId
      };

      let response;
      if (editingSubject) {
        response = await subjectApi.update(editingSubject.id, payload);
      } else {
        response = await subjectApi.create(payload);
      }

      if (response.success) {
        await fetchData();
        setIsModalOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      setIsLoading(true);
      await subjectApi.delete(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete subject');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSubjects.length === 0) return;
    if (!window.confirm(`Delete ${selectedSubjects.length} subjects?`)) return;
    try {
      setIsLoading(true);
      await Promise.all(selectedSubjects.map(id => subjectApi.delete(id)));
      await fetchData();
      setSelectedSubjects([]);
    } catch (err: any) {
      alert(err.message || 'Bulk delete failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleClass = (classId: number) => {
    setFormData(prev => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter(id => id !== classId)
        : [...prev.classIds, classId]
    }));
  };

  const toggleSelect = (id: number) => {
    setSelectedSubjects(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DashboardHeader
        title="Subjects & Curriculum"
        description="Define your learning domains, subject codes, and curriculum structure."
      >
        <div className="flex gap-3">
            {selectedSubjects.length > 0 && (
                <Button 
                    variant="ghost" 
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 text-red-500 hover:bg-red-50 h-12 px-6 rounded-xl border border-red-100"
                >
                    <Trash2 size={18} />
                    Delete ({selectedSubjects.length})
                </Button>
            )}
            <Button 
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 bg-[#1B2559] hover:bg-[#2B3674] h-12 px-6 rounded-xl shadow-lg shadow-blue-900/10"
            >
                <Plus size={18} />
                Create Subject
            </Button>
        </div>
      </DashboardHeader>

      <div className="bg-white p-6 rounded-4xl border border-zinc-200/60 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold text-[#1B2559] flex items-center gap-2">
                <Search size={18} className="text-blue-500" />
                Curriculum Explorer
            </h2>
            <Button variant="ghost" onClick={fetchData} className="text-[#A3AED0] hover:text-blue-600">
                <Database size={16} className="mr-2" /> Sync Records
            </Button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3AED0] group-focus-within:text-blue-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by subject name or catalog code..."
            className="w-full pl-12 pr-4 h-14 rounded-2xl bg-[#F4F7FF]/50 border border-transparent focus:border-blue-200 focus:bg-white text-[15px] text-[#1B2559] outline-none transition-all placeholder:text-[#A3AED0]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-4xl border border-zinc-200/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F7FF]/50 border-b border-zinc-100">
                <th className="p-6 w-12">
                   <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-lg border-zinc-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                      checked={subjects.length > 0 && selectedSubjects.length === subjects.length}
                      onChange={() => setSelectedSubjects(selectedSubjects.length === subjects.length ? [] : subjects.map(s => s.id))}
                   />
                </th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#A3AED0] uppercase tracking-wider">Subject Identity</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#A3AED0] uppercase tracking-wider">Associated Units</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#A3AED0] uppercase tracking-wider text-center">Resources</th>
                <th className="px-8 py-5 text-[12px] font-bold text-[#A3AED0] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-6"><div className="w-5 h-5 bg-gray-100 rounded" /></td>
                    <td className="px-8 py-6"><div className="h-10 bg-gray-100 rounded-xl w-48" /></td>
                    <td className="px-8 py-6"><div className="h-6 bg-gray-100 rounded-lg w-32" /></td>
                    <td className="px-8 py-6 text-center"><div className="h-8 bg-gray-100 rounded-full w-12 mx-auto" /></td>
                    <td className="px-8 py-6 text-right"><div className="h-8 bg-gray-100 rounded-lg w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="group hover:bg-[#F4F7FF]/30 transition-colors">
                    <td className="p-6">
                        <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded-lg border-zinc-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                            checked={selectedSubjects.includes(subject.id)}
                            onChange={() => toggleSelect(subject.id)}
                        />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                          <BookOpen size={24} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[16px] font-bold text-[#1B2559]">{subject.name}</span>
                          <span className="text-[12px] font-black text-blue-500 uppercase tracking-widest">{subject.code || 'UNCODED'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2 max-w-70">
                        {subject.classes && subject.classes.length > 0 ? (
                            subject.classes.map(cls => (
                                <span key={cls.id} className="text-[11px] font-bold text-zinc-600 bg-white border border-zinc-200 px-3 py-1 rounded-lg">
                                    {cls.name}
                                </span>
                            ))
                        ) : (
                            <span className="text-[11px] text-[#A3AED0] italic">No active class units</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className="inline-flex items-center gap-2 bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100/50">
                          <Layers size={14} className="text-blue-500" />
                          <span className="text-[14px] font-bold text-[#1B2559]">{subject._count?.questions || 0}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                          <button 
                              onClick={() => handleOpenModal(subject)}
                              className="p-2 hover:bg-blue-50 text-blue-500 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                          >
                              <Edit3 size={18} />
                          </button>
                          <button 
                              onClick={() => handleDelete(subject.id)}
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
                  <td colSpan={5} className="py-32 text-center">
                     <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-[#F4F7FF] rounded-full flex items-center justify-center mb-6">
                            <Layers size={40} className="text-[#A3AED0]" />
                        </div>
                        <h3 className="text-[20px] font-bold text-[#1B2559] mb-2">Curriculum Domain Empty</h3>
                        <p className="text-[#A3AED0] max-w-xs mx-auto mb-8">Start building your question bank by creating subject categories.</p>
                        <Button onClick={() => handleOpenModal()} className="bg-[#1B2559] rounded-xl px-8 h-12">Initialize Subject</Button>
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
        title={editingSubject ? 'Update Subject Cluster' : 'Define New Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#1B2559] ml-1 flex items-center gap-2">
                    <BookOpen size={14} className="text-blue-500" /> Subject Name
                </label>
                <Input
                placeholder="e.g. APPLIED PHYSICS"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                required
                className="h-13 rounded-xl bg-[#F4F7FF] border-none focus:ring-2 focus:ring-blue-500/20 text-[15px]"
                />
            </div>

            <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#1B2559] ml-1 flex items-center gap-2">
                    <Hash size={14} className="text-blue-500" /> Catalog Code
                </label>
                <Input
                placeholder="e.g. PHY-202"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="h-13 rounded-xl bg-[#F4F7FF] border-none focus:ring-2 focus:ring-blue-500/20 text-[15px] font-mono"
                />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#1B2559] ml-1 flex items-center gap-2">
                <MessageSquare size={14} className="text-blue-500" /> Curriculum Overview
            </label>
            <textarea
              className="w-full px-4 py-3 bg-[#F4F7FF] border-none rounded-xl text-[15px] text-[#1B2559] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all min-h-25 placeholder:text-[#A3AED0]"
              placeholder="Outline the core learning objectives and scope..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div className="space-y-4 p-5 bg-[#F4F7FF]/30 rounded-3xl border border-blue-100/30">
            <label className="text-[12px] font-black text-[#1B2559] uppercase tracking-widest block mb-4">Target Academic Units</label>
            <div className="flex flex-wrap gap-2">
                {allClasses.map(cls => (
                    <button
                        key={cls.id}
                        type="button"
                        onClick={() => toggleClass(cls.id)}
                        className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${
                            formData.classIds.includes(cls.id)
                            ? 'bg-[#1B2559] text-white border-[#1B2559] shadow-md shadow-blue-900/10'
                            : 'bg-white text-[#A3AED0] border-zinc-200 hover:border-blue-200 hover:text-blue-500'
                        }`}
                    >
                        {cls.name}
                    </button>
                ))}
                {allClasses.length === 0 && (
                    <div className="w-full py-4 text-center border-2 border-dashed border-zinc-100 rounded-2xl bg-white/50">
                        <p className="text-[11px] text-[#A3AED0] font-medium">No class units available for assignment.</p>
                    </div>
                )}
            </div>
          </div>

          <div className="flex gap-4 pt-4 sticky bottom-0 bg-white pb-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-15 rounded-2xl text-[#6b7280] font-bold hover:bg-zinc-50"
              onClick={() => setIsModalOpen(false)}
            >
              Discard
            </Button>
            <Button
              type="submit"
              className="flex-1 h-[60px] rounded-2xl bg-[#1B2559] text-white font-bold shadow-xl shadow-blue-900/20"
              isLoading={isSubmitting}
            >
              {editingSubject ? (
                <span className="flex items-center gap-2"><Check size={20}/> Sync Changes</span>
              ) : (
                <span className="flex items-center gap-2"><Plus size={20}/> Deploy Subject</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
