"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  FileText,
  Plus,
  Clock,
  GraduationCap,
  Calendar,
  MoreVertical,
  PlayCircle,
  Search,
  Filter,
  Loader2,
  X,
  Check,
  Edit3,
  Trash2,
  Copy,
  ChevronDown,
  AlertCircle,
  LayoutGrid,
  Layers
} from 'lucide-react';
import { examApi } from '@/lib/api/exams';
import { classApi } from '@/lib/api/classes';
import { Exam, Class } from '@/types';
import { MdOutlineControlPointDuplicate, MdOutlineDeleteOutline, MdOutlineModeEditOutline } from 'react-icons/md';
import { workspaceApi } from '@/lib/api/workspaces';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    exam_name: '',
    minutes: 60,
    classId: '',
    visible: true
  });

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [examsRes, classesRes, workspacesRes] = await Promise.all([
        examApi.list(),
        classApi.list(),
        workspaceApi.list()
      ]);
      if (examsRes.data) setExams(examsRes.data);
      if (classesRes.data) setClasses(classesRes.data);

      // Try to get workspaceId from user or first workspace
      const userStr = localStorage.getItem('user');
      const workspaces = workspacesRes.data || [];

      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.workspaceId) {
          setFormData(prev => ({ ...prev, workspaceId: user.workspaceId }));
        }
      } else if (workspaces.length > 0) {
        setFormData(prev => ({ ...prev, workspaceId: workspaces[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const filteredExams = useMemo(() => {
    return exams.filter(exam => {
      const matchesSearch = exam.exam_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = selectedClass === 'all' || exam.classId === selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [exams, searchTerm, selectedClass]);

  const handleOpenModal = (exam: Exam | null = null) => {
    if (exam) {
      setEditingExam(exam);
      setFormData({
        exam_name: exam.exam_name,
        minutes: exam.minutes,
        classId: exam.classId,
        visible: exam.visible ?? true
      });
    } else {
      setEditingExam(null);
      setFormData({
        exam_name: '',
        minutes: 60,
        classId: classes[0]?.id.toString() || '',
        visible: true
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
      setIsLoading(true);
      await examApi.delete(id);
      await fetchInitialData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete exam');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (exam: Exam) => {
    try {
      setIsLoading(true);
      const payload = {
        exam_name: `${exam.exam_name} (Copy)`,
        minutes: exam.minutes,
        classId: exam.classId,
        workspaceId: exam.workspaceId
      };
      await examApi.create(payload);
      await fetchInitialData();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate exam');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      let workspaceId = formData.classId ? classes.find(c => c.id === formData.classId)?.workspaceId : null;

      if (!workspaceId) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          workspaceId = JSON.parse(userStr).workspaceId;
        }
      }

      const payload = {
        ...formData,
        workspaceId: workspaceId || '1', // Fallback to '1' if absolutely nothing found
        classId: formData.classId,
        minutes: Number(formData.minutes)
      };

      const response = editingExam
        ? await examApi.update(editingExam.id, payload)
        : await examApi.create(payload);

      if (response.success) {
        await fetchInitialData();
        setIsModalOpen(false);
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <DashboardHeader
        title="Exams"
        description="Create and manage your exams or tests here."
      >
        <Button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#1B2559] truncate hover:bg-[#2B3674] py-2 px-4 rounded  shadow-blue-900/10 transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          Create New Exam
        </Button>
      </DashboardHeader>

      {/* Filter Section */}
      <div className="bg-white p-5 rounded border border-zinc-200/60  space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center text-blue-600">
              <Filter size={14} />
            </div>
            <h2 className="workspace  text-[#1B2559]">Global Filter Hub</h2>
          </div>
          <button
            onClick={() => { setSearchTerm(''); setSelectedClass('all'); }}
            className="workspace text-blue-600  hover:underline"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3AED0] group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by exam name..."
              className="w-full pl-12 pr-4 py-2 mt-2 rounded bg-[#F4F7FF]/50 border border-transparent focus:border-blue-200 focus:bg-white workspace text-[#1B2559] outline-none transition-all placeholder:text-[#A3AED0]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <select
              className="w-full px-4 py-2 mt-2 rounded bg-[#F4F7FF]/50 border border-transparent focus:border-blue-200 focus:bg-white workspace text-[#1B2559] outline-none appearance-none cursor-pointer"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3AED0] pointer-events-none" size={16} />
          </div>

          <Button
            onClick={fetchInitialData}
            className="py-2 rounded bg-zinc-100 text-[#1B2559] hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 border-none shadow-none "
          >
            Apply Criteria
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="animate-pulse border-none  h-[120px] rounded bg-white" />
          ))
        ) : filteredExams.length > 0 ? (
          filteredExams.map((exam) => (
            <div key={exam.id} className="group transition-all duration-300 border border-zinc-200/60 bg-white rounded overflow-hidden hover: hover:shadow-blue-900/5 hover:border-blue-200">
              <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5 flex-1 w-full">

                  <div className="space-y-1">
                    <h3 className="workspace  text-[#1B2559] tracking-tight">{exam.exam_name}</h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 workspace text-[#A3AED0] ">
                      <span className="flex items-center gap-2 bg-[#F4F7FF] px-3 py-1 rounded text-blue-600">
                        <Clock size={14} /> {exam.minutes} Minutes
                      </span>
                      <span className="flex items-center gap-2">
                        <GraduationCap size={16} /> Class: {classes.find(c => c.id === exam.classId)?.name || `ID: ${exam.classId}`}
                      </span>
                      <span className="flex items-center gap-2">
                        <Layers size={16} /> Questions: --
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-8">
                  <div className="flex flex-col items-center mr-6">
                    <span className="workspace text-[#A3AED0] uppercase  tracking-widest mb-1">Status</span>
                    <span className="workspace  text-emerald-500 bg-emerald-50 px-3 py-1 rounded">Active</span>
                  </div>

                  <div className="flex items-center gap-2 text-black">
                    <Button
                      onClick={() => handleOpenModal(exam)}
                      variant="ghost" className=""
                    >
                      <MdOutlineModeEditOutline size={16} />


                    </Button>
                    <Button
                      onClick={() => handleDuplicate(exam)}
                      variant="ghost" >
                      <MdOutlineControlPointDuplicate size={16} />
                    </Button>
                    <Button
                      onClick={() => handleDelete(exam.id)}
                      variant="ghost"
                    >
                      <MdOutlineDeleteOutline size={16} />
                    </Button>
                    <div className="w-[1px] h-8 bg-zinc-100 mx-2" />

                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-white rounded border border-dashed border-[#E0E5F2] flex flex-col items-center">
            <div className="w-24 h-24 bg-[#F4F7FF] rounded flex items-center justify-center mb-8 shadow-inner">
              <FileText size={48} className="text-[#A3AED0]" />
            </div>
            <h3 className="  text-[#1B2559] mb-3">Your exam vault is empty</h3>
            <p className="text-[#A3AED0] max-w-sm mx-auto mb-10 workspace leading-relaxed ">
              Start creating your first digital assessment. You can add multiple choice, true/false, or fill-in-the-blank questions.
            </p>
            <Button
              onClick={() => handleOpenModal()}
              className="py-2 px-10 bg-[#1B2559] text-white rounded hover:opacity-90 transition-all  workspace  shadow-blue-900/20"
            >
              Initialize First Exam
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? 'Edit Examination Profile' : 'New Examination Setup'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="workspace text-[#1B2559]  ml-1">Examination Title</label>
            <Input
              placeholder="e.g. Mid-Term Physics Assessment 2024"
              value={formData.exam_name}
              onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
              required
              className=" rounded bg-[#F4F7FF] mt-2 border border-zinc-400/20 focus:ring-2 focus:ring-blue-500/20 workspace"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="workspace text-[#1B2559]  ml-1">Duration (Minutes)</label>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  value={formData.minutes}
                  onChange={(e) => setFormData({ ...formData, minutes: parseInt(e.target.value) })}
                  required
                  className="py-2 mt-2 rounded bg-[#F4F7FF] border border-zinc-400/20 focus:ring-2 focus:ring-blue-500/20 "
                />
                <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3AED0]" size={18} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="workspace text-[#1B2559]  ml-1">Target Class</label>
              <div className="relative">
                <select
                  className="w-full py-2 mt-2 px-4 rounded bg-[#F4F7FF] border-none focus:ring-2 focus:ring-blue-500/20 workspace text-[#1B2559] outline-none appearance-none cursor-pointer"
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  required
                >
                  <option value="" disabled>Select Target Audience</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3AED0] pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#F4F7FF] rounded border border-zinc-200 mt-2">
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#1B2559]">Visibility Status</span>
              <span className="text-[11px] text-[#A3AED0] font-medium">Students can see this exam</span>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, visible: !formData.visible })}
              className={`w-11 h-6 rounded-full relative transition-colors duration-200 focus:outline-none ${formData.visible ? 'bg-[#1B2559]' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${formData.visible ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>



          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 py-2 rounded text-[#6b7280] "
              onClick={() => setIsModalOpen(false)}
            >
              Discard Changes
            </Button>
            <Button
              type="submit"
              className="flex-1 py-2 rounded bg-[#1B2559] text-white   shadow-blue-900/20"
              isLoading={isSubmitting}
            >
              {editingExam ? (
                <span className="flex items-center gap-2"><Check size={20} /> Save Changes</span>
              ) : (
                <span className="flex items-center gap-2"><Plus size={20} /> Create Exam</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
