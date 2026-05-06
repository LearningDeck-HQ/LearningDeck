"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { 
  GraduationCap, 
  Plus, 
  Users, 
  Search, 
  Loader2, 
  X, 
  Check, 
  Edit3, 
  Trash2,
  MoreVertical,
  ChevronRight,
  Database,
  Filter
} from 'lucide-react';
import { classApi } from '@/lib/api/classes';
import { Class } from '@/types';

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const res = await classApi.list();
      if (res.data) setClasses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const filteredClasses = useMemo(() => {
    return classes.filter(cls =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [classes, searchTerm]);

  const handleOpenModal = (cls: Class | null = null) => {
    if (cls) {
      setEditingClass(cls);
      setFormData({ name: cls.name });
    } else {
      setEditingClass(null);
      setFormData({ name: '' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await classApi.delete(id);
      if (response.success) {
        await fetchClasses();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete class');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const userStr = localStorage.getItem('user');
      const workspaceId = userStr ? JSON.parse(userStr).workspaceId : '1';
      
      const payload = { ...formData, workspaceId };
      const response = editingClass
        ? await classApi.update(editingClass.id, payload)
        : await classApi.create(payload);

      if (response.success) {
        await fetchClasses();
        setIsModalOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 selection:bg-blue-100">
      <DashboardHeader
        title="Class Registry"
        description="Manage your student groups and academic year structures with precision."
      >
        <Button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#1B2559] hover:bg-[#2B3674] h-[48px] px-5 rounded-xl shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          Add New Class
        </Button>
      </DashboardHeader>

      {/* Filter Section */}
      <div className="bg-white p-5 rounded border border-zinc-200/60 space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center text-blue-600">
              <Filter size={14} />
            </div>
            <h2 className="workspace text-[#1B2559]">Class Filter Hub</h2>
          </div>
          <button
            onClick={() => setSearchTerm('')}
            className="workspace text-blue-600 hover:underline text-[13px]"
          >
            Reset Filters
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3AED0] group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by class nomenclature (e.g. Grade 10, JSS1)..."
            className="w-full pl-12 pr-4 py-2 mt-2 rounded bg-[#F4F7FF]/50 border border-transparent focus:border-blue-200 focus:bg-white workspace text-[#1B2559] outline-none transition-all placeholder:text-[#A3AED0]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="animate-pulse border-none h-[100px] rounded bg-white" />
          ))
        ) : filteredClasses.length > 0 ? (
          filteredClasses.map((cls) => (
            <div key={cls.id} className="group transition-all duration-300 border border-zinc-200/60 bg-white rounded overflow-hidden hover: hover:shadow-blue-900/5 hover:border-blue-200">
              <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5 flex-1 w-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100/50 group-hover:scale-110 transition-transform duration-300 shrink-0">
                    <GraduationCap size={28} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="workspace text-[#1B2559] tracking-tight">{cls.name}</h3>
                    <div className="flex items-center gap-4 workspace text-[#A3AED0]">
                      <span className="flex items-center gap-1.5 uppercase text-[10px] font-black tracking-widest">Level Registry</span>
                      <div className="w-1 h-1 bg-zinc-300 rounded-full" />
                      <span className="workspace text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px]">ID: #{cls.id.slice(0, 8)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-8">
                  <div className="flex flex-col items-center mr-6">
                    <span className="workspace text-[#A3AED0] uppercase tracking-widest mb-1">Students</span>
                    <span className="workspace text-blue-500 bg-blue-50 px-3 py-1 rounded">--</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleOpenModal(cls)} variant="ghost" className="text-black">
                      <Edit3 size={16} />
                    </Button>
                    <Button onClick={() => handleDelete(cls.id)} variant="ghost" className="text-black">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-white rounded border border-dashed border-[#E0E5F2] flex flex-col items-center">
            <div className="w-24 h-24 bg-[#F4F7FF] rounded flex items-center justify-center mb-8 shadow-inner">
              <GraduationCap size={48} className="text-[#A3AED0]" />
            </div>
            <h3 className="text-[#1B2559] mb-3">No classes defined</h3>
            <p className="text-[#A3AED0] max-w-sm mx-auto mb-10 workspace leading-relaxed">
              Start by organizing your academic structure. Create classes to assign students and exams.
            </p>
            <Button onClick={() => handleOpenModal()} className="py-2 px-10 bg-[#1B2559] text-white rounded hover:opacity-90 transition-all workspace shadow-blue-900/20">
              Add Your First Class
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? 'Modify Class Parameters' : 'Register New Class'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="workspace text-[#1B2559] font-bold">Class Nomenclature</label>
            <Input
              placeholder="e.g. JSS1, GRADE 10-A, FINAL YEAR"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
              required
              className="h-12 rounded bg-[#F4F7FF] border-none focus:ring-2 focus:ring-blue-500/20 workspace"
            />
            <p className="text-[11px] text-[#A3AED0]">This name will be visible to students and teachers.</p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-12 rounded text-[#6b7280] font-bold hover:bg-zinc-50"
              onClick={() => setIsModalOpen(false)}
            >
              Discard
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 rounded bg-[#1B2559] text-white font-bold shadow-lg shadow-blue-900/20"
              isLoading={isSubmitting}
            >
              {editingClass ? (
                <span className="flex items-center gap-2"><Check size={18}/> Update</span>
              ) : (
                <span className="flex items-center gap-2"><Plus size={18}/> Register</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
