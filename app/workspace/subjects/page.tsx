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
import { ScaleLoader } from 'react-spinners';
import { MdOutlineControlPointDuplicate, MdOutlineDeleteOutline, MdOutlineModeEditOutline } from 'react-icons/md';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection states
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    description: string;
    classIds: string[];
  }>({
    name: '',
    code: '',
    description: '',
    classIds: []
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const userStr = localStorage.getItem('user');
      const workspaceId = userStr ? JSON.parse(userStr).workspaceId : '1';
      
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
      const userStr = localStorage.getItem('user');
      const workspaceId = userStr ? JSON.parse(userStr).workspaceId : '1';
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

  const handleDelete = async (id: string) => {
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

  const toggleClass = (classId: string) => {
    setFormData(prev => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter(id => id !== classId)
        : [...prev.classIds, classId]
    }));
  };

  const toggleSelect = (id: string) => {
    setSelectedSubjects(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-xs">
      <DashboardHeader
        title="Subjects & Curriculum"
        description="Define your learning domains, subject codes, and curriculum structure."
      >
        <div className="flex gap-3">
            {selectedSubjects.length > 0 && (
                <Button 
                    variant="ghost" 
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 text-red-500 hover:bg-red-50  px-6 rounded border border-red-100"
                >
                  <MdOutlineDeleteOutline size={18} />
                    Delete ({selectedSubjects.length})
                </Button>
            )}
            <Button 
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 bg-[#1B2559] hover:bg-[#2B3674] px-6 rounded  shadow-blue-900/10"
            >
                <Plus size={18} />
                Create Subject
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
            <h2 className="workspace text-[#1B2559]">Curriculum Filter Hub</h2>
          </div>
          <button
            onClick={() => setSearchTerm('')}
            className="workspace text-blue-600 hover:underline "
          >
            Reset Filters
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3AED0] group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by subject name or catalog code..."
            className="w-full pl-12 pr-4 py-2 mt-2 rounded bg-[#F4F7FF]/50 border border-transparent focus:border-blue-200 focus:bg-white workspace text-[#1B2559] outline-none transition-all placeholder:text-[#A3AED0]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
       <div className='flex flex-col items-center justify-center w-full h-full'>
            <ScaleLoader barCount={3} color="#a7a7a7ff" height={20} width={5} />
               </div>)  : filteredSubjects.length > 0 ? (
          filteredSubjects.map((subject) => (
            <div key={subject.id} className="group transition-all duration-300 border border-zinc-200/60 bg-white rounded overflow-hidden hover: hover:shadow-blue-900/5 hover:border-blue-200">
              <div className="px-4 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5 flex-1 w-full">
                
                  <div className="flex items-center gap-4">
                    <h3 className="workspace text-[#1B2559] tracking-tight">{subject.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2  workspace text-[#A3AED0]">
                      <span className="flex items-center gap-2 bg-[#F4F7FF] px-3 py-1 rounded text-blue-600 uppercase text-[10px] ">
                        {subject.code || 'UNCODED'}
                      </span>
                      <span className="flex items-center gap-2">
                        <Layers size={16} /> Questions: {subject._count?.questions || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-8">
                  <div className="flex flex-wrap gap-2 max-w-[200px] mr-6">
                    {subject.classes && subject.classes.length > 0 ? (
                      subject.classes.map(cls => (
                        <span key={cls.id} className="text-[10px]  text-zinc-600 bg-white border border-zinc-200 px-2 py-1 rounded">
                          {cls.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-[#A3AED0] italic">No units</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 p-1">
                    <Button onClick={() => handleOpenModal(subject)} variant="ghost" className="text-black">
                      <MdOutlineModeEditOutline />  
                    </Button>
                    <Button onClick={() => handleDelete(subject.id)} variant="ghost" className="text-black">
                     <MdOutlineDeleteOutline />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-white rounded border border-dashed border-[#E0E5F2] flex flex-col items-center">
            <div className="w-24 h-24 bg-[#F4F7FF] rounded flex items-center justify-center mb-8 shadow-inner">
              <Layers size={48} className="text-[#A3AED0]" />
            </div>
            <h3 className="text-[#1B2559] mb-3">Curriculum Domain Empty</h3>
            <p className="text-[#A3AED0] max-w-sm mx-auto mb-10 workspace leading-relaxed">
              Start building your question bank by creating subject categories.
            </p>
            <Button onClick={() => handleOpenModal()} className="py-2 px-10 bg-[#1B2559] text-white rounded hover:opacity-90 transition-all workspace shadow-blue-900/20">
              Initialize Subject
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? 'Update Subject Cluster' : 'Define New Subject'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="  text-[#1B2559] ml-1 flex items-center gap-2">
                    <BookOpen size={14} className="text-blue-500" /> Subject Name
                </label>
                <Input
                placeholder="e.g. APPLIED PHYSICS"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                required
                className="h-13 rounded bg-[#F4F7FF] border-none focus:ring-2 focus:ring-blue-500/20 "
                />
            </div>

            <div className="space-y-2">
                <label className="  text-[#1B2559] ml-1 flex items-center gap-2">
                    <Hash size={14} className="text-blue-500" /> Catalog Code
                </label>
                <Input
                placeholder="e.g. PHY-202"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="h-13 rounded bg-[#F4F7FF] border-none focus:ring-2 focus:ring-blue-500/20  font-mono"
                />
            </div>
          </div>

          <div className="space-y-2">
            <label className="  text-[#1B2559] ml-1 flex items-center gap-2">
                <MessageSquare size={14} className="text-blue-500" /> Curriculum Overview
            </label>
            <textarea
              className="w-full px-4 py-3 bg-[#F4F7FF] border-none rounded  text-[#1B2559] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all min-h-25 placeholder:text-[#A3AED0]"
              placeholder="Outline the core learning objectives and scope..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div className="space-y-4 p-5 bg-[#F4F7FF]/30 rounded border border-blue-100/30">
            <label className="  text-[#1B2559] uppercase tracking-widest block mb-4">Target Academic Units</label>
            <div className="flex flex-wrap gap-2">
                {allClasses.map(cls => (
                    <button
                        key={cls.id}
                        type="button"
                        onClick={() => toggleClass(cls.id)}
                        className={`px-4 py-2 rounded   transition-all border ${
                            formData.classIds.includes(cls.id)
                            ? 'bg-[#1B2559] text-white border-[#1B2559]  shadow-blue-900/10'
                            : 'bg-white text-[#A3AED0] border-zinc-200 hover:border-blue-200 hover:text-blue-500'
                        }`}
                    >
                        {cls.name}
                    </button>
                ))}
                {allClasses.length === 0 && (
                    <div className="w-full py-4 text-center border-2 border-dashed border-zinc-100 rounded bg-white/50">
                        <p className="text-[11px] text-[#A3AED0] ">No class units available for assignment.</p>
                    </div>
                )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 rounded text-[#6b7280]  hover:bg-zinc-50"
              onClick={() => setIsModalOpen(false)}
            >
              Discard
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded bg-[#1B2559] text-white   shadow-blue-900/20"
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
