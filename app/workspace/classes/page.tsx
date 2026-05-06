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
  Database
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

  const handleDelete = async (id: number) => {
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
      // For now we assume workspaceId 1 or similar if not found. 
      // In a real app, this should come from context.
      const workspaceId = 1; 
      
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

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-zinc-200/60 shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3AED0] group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by class nomenclature (e.g. Grade 10, JSS1)..."
            className="w-full pl-12 pr-4 h-[52px] rounded-xl bg-[#F4F7FF]/50 border border-transparent focus:border-blue-200 focus:bg-white text-[15px] text-[#1B2559] outline-none transition-all placeholder:text-[#A3AED0]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            variant="ghost" 
            onClick={fetchClasses}
            className="flex-1 md:flex-none h-[52px] px-5 rounded-xl text-[#1B2559] flex items-center gap-2 hover:bg-[#F4F7FF] border border-zinc-100"
          >
            <Database size={18} className="text-[#A3AED0]" /> Refresh Sync
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="h-[220px] bg-white rounded-3xl border border-zinc-100 animate-pulse flex flex-col p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-gray-100 rounded" />
                  <div className="w-16 h-3 bg-gray-50 rounded" />
                </div>
              </div>
              <div className="flex-1" />
              <div className="h-10 bg-gray-50 rounded-xl w-full" />
            </div>
          ))
        ) : filteredClasses.length > 0 ? (
          filteredClasses.map((cls) => (
            <Card key={cls.id} className="group transition-all duration-300 border border-zinc-200/60 bg-white rounded-3xl hover:shadow-xl hover:shadow-blue-900/5 hover:border-blue-200 relative overflow-hidden">
              <CardContent className="p-7">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-600 rounded-2xl flex items-center justify-center border border-purple-100/50 group-hover:scale-110 transition-transform duration-300">
                      <GraduationCap size={28} />
                    </div>
                    <div>
                      <h3 className="text-[19px] text-[#1B2559] font-bold tracking-tight">{cls.name}</h3>
                      <p className="text-[12px] text-[#A3AED0] font-medium uppercase tracking-wider">Level Registry</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                      onClick={() => handleOpenModal(cls)}
                      className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors"
                     >
                        <Edit3 size={16} />
                     </button>
                     <button 
                      onClick={() => handleDelete(cls.id)}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                     >
                        <Trash2 size={16} />
                     </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#F4F7FF]/50 rounded-2xl border border-transparent group-hover:border-blue-100 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-500 shadow-sm">
                        <Users size={16} />
                      </div>
                      <span className="text-[14px] text-[#1B2559] font-medium">Students</span>
                    </div>
                    <span className="text-[16px] font-bold text-blue-600">--</span>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 py-3 text-[14px] font-semibold text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all group/btn">
                    View Class Details
                    <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </CardContent>
              
              {/* Subtle accent line */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-white rounded-[32px] border border-dashed border-[#E0E5F2] flex flex-col items-center">
            <div className="w-20 h-20 bg-[#F4F7FF] rounded-full flex items-center justify-center mb-6">
              <GraduationCap size={40} className="text-[#A3AED0]" />
            </div>
            <h3 className="text-[22px] font-bold text-[#1B2559] mb-2">No classes defined</h3>
            <p className="text-[#A3AED0] max-w-sm mx-auto mb-8 text-[15px]">
              Start by organizing your academic structure. Create classes to assign students and exams.
            </p>
            <Button 
              onClick={() => handleOpenModal()}
              className="bg-[#1B2559] h-[52px] px-8 rounded-xl font-bold"
            >
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
            <label className="text-[14px] text-[#1B2559] font-semibold ml-1">Class Nomenclature</label>
            <Input
              placeholder="e.g. JSS1, GRADE 10-A, FINAL YEAR"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
              required
              className="h-[52px] rounded-xl bg-[#F4F7FF] border-none focus:ring-2 focus:ring-blue-500/20 text-[15px]"
            />
            <p className="text-[11px] text-[#A3AED0] ml-1">This name will be visible to students and teachers.</p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-[56px] rounded-2xl text-[#6b7280] font-bold"
              onClick={() => setIsModalOpen(false)}
            >
              Discard
            </Button>
            <Button
              type="submit"
              className="flex-1 h-[56px] rounded-2xl bg-[#1B2559] text-white font-bold shadow-lg shadow-blue-900/20"
              isLoading={isSubmitting}
            >
              {editingClass ? (
                <span className="flex items-center gap-2"><Check size={18}/> Update Class</span>
              ) : (
                <span className="flex items-center gap-2"><Plus size={18}/> Register Class</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
