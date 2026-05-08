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
  Layers,
  Search,
  Filter,
  Check,
  ChevronDown,
} from 'lucide-react';
import { examApi } from '@/lib/api/exams';
import { classApi } from '@/lib/api/classes';
import { Exam, Class, Subject, User, Result } from '@/types';
import { MdOutlineControlPointDuplicate, MdOutlineDeleteOutline, MdOutlineModeEditOutline } from 'react-icons/md';
import { workspaceApi } from '@/lib/api/workspaces';
import { ScaleLoader } from 'react-spinners';
import { questionApi } from '@/lib/api/questions';
import { Question } from '@/types';
import { subjectApi } from '@/lib/api/subjects';
import { userApi } from '@/lib/api/users';
import { resultApi } from '@/lib/api/results';

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [results, setResults] = useState<Result[]>([]);
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
      const [examsRes, classesRes, questionRes, subjectsRes, usersRes, resultsRes, workspacesRes] = await Promise.all([
        examApi.list(),
        classApi.list(),
        questionApi.list(),
        subjectApi.list(),
        userApi.list(),
        resultApi.list(),
        workspaceApi.list()
      ]);
      if (examsRes.data) setExams(examsRes.data);
      if (classesRes.data) setClasses(classesRes.data);
      if (questionRes.data) setQuestions(questionRes.data);
      if (subjectsRes.data) setSubjects(subjectsRes.data);
      if (usersRes.data) setUsers(usersRes.data);
      if (resultsRes.data) setResults(resultsRes.data);

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

      let workspaceId = formData.classId
        ? classes.find(c => c.id === formData.classId)?.workspaceId
        : null;

      if (!workspaceId) {
        const userStr = localStorage.getItem('user');
        if (userStr) workspaceId = JSON.parse(userStr).workspaceId;
      }

      const payload = {
        ...formData,
        workspaceId: workspaceId || '1',
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
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <DashboardHeader
        title="Exams"
        description="Create and manage your exams or tests here."
      >
        {/* ── Create button: sidebar-style rounded-sm, zinc bg ── */}
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-sm hover:bg-zinc-700 transition-all active:scale-[0.98]"
        >
          <Plus size={14} />
          Create New Exam
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
            onClick={() => { setSearchTerm(''); setSelectedClass('all'); }}
            className="text-xs text-[#6b6b6b] hover:text-[#0e0f10] transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b6b]" size={13} />
            <input
              type="text"
              placeholder="Search by exam name..."
              className="w-full pl-8 pr-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none transition-all placeholder:text-[#6b6b6b]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Class filter */}
          <div className="relative">
            <select
              className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none appearance-none cursor-pointer"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
          </div>

          <button
            onClick={fetchInitialData}
            className="px-3 py-1 text-xs rounded-sm bg-zinc-100 text-[#0e0f10] hover:bg-zinc-200 transition-colors border border-zinc-400/20"
          >
            Apply
          </button>
        </div>
      </div>

      {/* ── Exam List ── */}
      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <ScaleLoader barCount={3} color="#a7a7a7ff" height={18} width={4} />
          </div>
        ) : filteredExams.length > 0 ? (
          filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="group border border-zinc-400/20 bg-white rounded-sm overflow-hidden hover:bg-zinc-300/10 transition-all duration-200"
            >
              <div className="px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Exam info */}
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-[#0e0f10] tracking-tight">
                      {exam.exam_name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#6b6b6b]">
                      <span className="flex items-center gap-1.5 bg-zinc-300/20 px-2 py-0.5 rounded-sm text-[#0e0f10]">
                        <Clock size={11} /> {exam.minutes} min
                      </span>
                      <span className="flex items-center gap-1.5">
                        <GraduationCap size={13} />
                        {classes.find(c => c.id === exam.classId)?.name || `ID: ${exam.classId}`}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers size={13} /> Questions: {questions.filter(q => q.examId === exam.id).length}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers size={13} /> Subjects: {subjects.filter(s => s.classes?.find(c => c.id === exam.classId)).length}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers size={13} /> Users: {users.filter(u => u.classId === exam.classId).length}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers size={13} /> Results: {results.filter(r => r.examId === exam.id).length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-400/20 pt-3 md:pt-0 md:pl-6">
                  <button
                    onClick={() => handleOpenModal(exam)}
                    className="px-2 py-1 text-xs text-[#6b6b6b] hover:bg-zinc-300/20 hover:text-[#0e0f10] rounded-sm transition-all"
                    title="Edit"
                  >
                    <MdOutlineModeEditOutline size={15} />
                  </button>
                  <button
                    onClick={() => handleDuplicate(exam)}
                    className="px-2 py-1 text-xs text-[#6b6b6b] hover:bg-zinc-300/20 hover:text-[#0e0f10] rounded-sm transition-all"
                    title="Duplicate"
                  >
                    <MdOutlineControlPointDuplicate size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id)}
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
              <FileText size={28} className="text-[#6b6b6b]" />
            </div>
            <h3 className="text-sm font-medium text-[#0e0f10] mb-2">No exams yet</h3>
            <p className="text-xs text-[#6b6b6b] max-w-xs mx-auto mb-8 leading-relaxed">
              Start creating your first digital assessment. Add multiple choice, true/false, or fill-in-the-blank questions.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-1.5 text-xs font-medium bg-[#0e0f10] text-white rounded-sm hover:bg-zinc-700 transition-all"
            >
              Create First Exam
            </button>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExam ? 'Edit Exam' : 'New Exam'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Exam name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Exam Title</label>
            <Input
              placeholder="e.g. Mid-Term Physics Assessment"
              value={formData.exam_name}
              onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
              required
              className="text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10] placeholder:text-[#6b6b6b]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Duration (mins)</label>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  value={formData.minutes}
                  onChange={(e) => setFormData({ ...formData, minutes: parseInt(e.target.value) })}
                  required
                  className="text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10] pr-8"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b]" size={13} />
              </div>
            </div>

            {/* Class */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Class</label>
              <div className="relative">
                <select
                  className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10] outline-none appearance-none cursor-pointer"
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  required
                >
                  <option value="" disabled>Select a class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
              </div>
            </div>
          </div>

          {/* Visibility toggle */}
          <div className="hidden flex items-center justify-between px-3 py-2.5 bg-zinc-50 rounded-sm border border-zinc-400/20">
            <div>
              <p className="text-xs font-medium text-[#0e0f10]">Visible to students</p>
              <p className="text-[11px] text-[#6b6b6b] mt-0.5">Students can see and take this exam</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, visible: !formData.visible })}
              className={`w-10 h-5 rounded-full relative transition-colors duration-200 focus:outline-none ${formData.visible ? 'bg-[#0e0f10]' : 'bg-zinc-300'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${formData.visible ? 'translate-x-5' : 'translate-x-0'}`} />
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
              {editingExam ? (
                <span className="flex items-center justify-center gap-1.5"><Check size={13} /> Save Changes</span>
              ) : (
                <span className="flex items-center justify-center gap-1.5"><Plus size={13} /> Create Exam</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}