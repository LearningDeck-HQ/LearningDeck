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
  HelpCircle,
  CheckCircle2,
  Type,
  LayoutGrid,
  ChevronDown,
  BookOpen,
  GraduationCap,
  Check,
} from 'lucide-react';
import { questionApi } from '@/lib/api/questions';
import { examApi } from '@/lib/api/exams';
import { subjectApi } from '@/lib/api/subjects';
import { classApi } from '@/lib/api/classes';
import { Question, Exam, Subject, Class, QuestionType } from '@/types';
import { MdOutlineDelete, MdOutlineModeEditOutline } from 'react-icons/md';
import { ScaleLoader } from 'react-spinners';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    type: 'MULTIPLE_CHOICE' as QuestionType,
    question: '',
    correct_answer: '',
    incorrect_answers: ['', '', ''],
    explanation: '',
    examId: '',
    subjectId: '',
    classId: '',
    img: null as string | null,
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [qRes, eRes, sRes, cRes] = await Promise.all([
        questionApi.list(),
        examApi.list(),
        subjectApi.list(),
        classApi.list(),
      ]);
      if (qRes.data) setQuestions(qRes.data);
      if (eRes.data) setExams(eRes.data);
      if (sRes.data) setSubjects(sRes.data);
      if (cRes.data) setClasses(cRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesExam = selectedExam === 'all' || q.examId === selectedExam;
      const matchesSubject = selectedSubject === 'all' || q.subjectId === selectedSubject;
      const matchesClass = selectedClass === 'all' || q.classId === selectedClass;
      return matchesSearch && matchesExam && matchesSubject && matchesClass;
    });
  }, [questions, searchTerm, selectedExam, selectedSubject, selectedClass]);

  const handleOpenModal = (q: Question | null = null) => {
    if (q) {
      setEditingQuestion(q);
      setFormData({
        type: q.type,
        question: q.question,
        correct_answer: q.correct_answer,
        incorrect_answers: q.incorrect_answers.length > 0 ? q.incorrect_answers : ['', '', ''],
        explanation: q.explanation || '',
        examId: q.examId,
        subjectId: q.subjectId,
        classId: q.classId,
        img: q.img,
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        type: 'MULTIPLE_CHOICE',
        question: '',
        correct_answer: '',
        incorrect_answers: ['', '', ''],
        explanation: '',
        examId: exams[0]?.id || '',
        subjectId: subjects[0]?.id || '',
        classId: classes[0]?.id || '',
        img: null,
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      setIsLoading(true);
      await questionApi.delete(id);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete question');
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
      const payload = {
        ...formData,
        workspaceId,
        incorrect_answers:
          formData.type === 'MULTIPLE_CHOICE'
            ? formData.incorrect_answers.filter(a => a.trim() !== '')
            : [],
      };
      const response = editingQuestion
        ? await questionApi.update(editingQuestion.id, payload)
        : await questionApi.create(payload);
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

  const handleIncorrectAnswerChange = (index: number, value: string) => {
    const newAnswers = [...formData.incorrect_answers];
    newAnswers[index] = value;
    setFormData({ ...formData, incorrect_answers: newAnswers });
  };

  const typeIcon = (type: QuestionType) => {
    if (type === 'MULTIPLE_CHOICE') return <LayoutGrid size={11} />;
    if (type === 'TRUE_FALSE') return <CheckCircle2 size={11} />;
    return <Type size={11} />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <DashboardHeader
        title="Question Bank"
        description="Manage your collection of questions across exams, subjects, and classes."
      >
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-sm hover:bg-zinc-700 transition-all active:scale-[0.98]"
        >
          <Plus size={14} />
          Add Question
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
            onClick={() => {
              setSearchTerm('');
              setSelectedExam('all');
              setSelectedSubject('all');
              setSelectedClass('all');
            }}
            className="text-xs text-[#6b6b6b] hover:text-[#0e0f10] transition-colors"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="md:col-span-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b6b]" size={13} />
            <input
              type="text"
              placeholder="Search questions..."
              className="w-full pl-8 pr-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none transition-all placeholder:text-[#6b6b6b]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Exam filter */}
          <div className="relative">
            <select
              className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none appearance-none cursor-pointer"
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
            >
              <option value="all">All Exams</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.exam_name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
          </div>

          {/* Subject filter */}
          <div className="relative">
            <select
              className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none appearance-none cursor-pointer"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
          </div>

          {/* Class filter */}
          <div className="relative">
            <select
              className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none appearance-none cursor-pointer"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
            >
              <option value="all">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
          </div>
        </div>
      </div>

      {/* ── Question List ── */}
      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <ScaleLoader barCount={3} color="#a7a7a7ff" height={18} width={4} />
          </div>
        ) : filteredQuestions.length > 0 ? (
          filteredQuestions.map(q => (
            <div
              key={q.id}
              className="group border border-zinc-400/20 bg-white rounded-sm overflow-hidden hover:bg-zinc-300/10 transition-all duration-200"
            >
              <div className="px-4 py-3 flex flex-col md:flex-row items-start justify-between gap-4">
                {/* Left: question info */}
                <div className="flex items-start gap-3 flex-1 w-full">
                  <span className="mt-0.5 flex items-center justify-center bg-zinc-300/20 text-[#0e0f10] rounded-sm px-1.5 py-0.5">
                    {typeIcon(q.type)}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-xs font-medium text-[#0e0f10] tracking-tight leading-snug">
                      {q.question}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6b6b6b]">
                      <span className="flex items-center gap-1.5 bg-zinc-300/20 px-2 py-0.5 rounded-sm text-[#0e0f10]">
                        {q.type.replace(/_/g, ' ')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={11} />
                        {subjects.find(s => s.id === q.subjectId)?.name || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <GraduationCap size={11} />
                        {classes.find(c => c.id === q.classId)?.name || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 size={11} />
                        {q.correct_answer}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: exam tag + actions */}
                <div className="flex items-center gap-1 w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-400/20 pt-3 md:pt-0 md:pl-6">
                  <span className="mr-2 text-xs text-[#6b6b6b] bg-zinc-300/20 px-2 py-0.5 rounded-sm hidden md:block">
                    {exams.find(e => e.id === q.examId)?.exam_name || 'N/A'}
                  </span>
                  <button
                    onClick={() => handleOpenModal(q)}
                    className="px-2 py-1 text-xs text-[#6b6b6b] hover:bg-zinc-300/20 hover:text-[#0e0f10] rounded-sm transition-all"
                    title="Edit"
                  >
                    <MdOutlineModeEditOutline size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="px-2 py-1 text-xs text-[#6b6b6b] hover:bg-red-50 hover:text-red-500 rounded-sm transition-all"
                    title="Delete"
                  >
                    <MdOutlineDelete size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-sm border border-dashed border-zinc-400/30 flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-sm flex items-center justify-center mb-6">
              <HelpCircle size={28} className="text-[#6b6b6b]" />
            </div>
            <h3 className="text-sm font-medium text-[#0e0f10] mb-2">No questions yet</h3>
            <p className="text-xs text-[#6b6b6b] max-w-xs mx-auto mb-8 leading-relaxed">
              Build your question bank by adding multiple choice, true/false, or fill-in-the-blank questions.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-1.5 text-xs font-medium bg-[#0e0f10] text-white rounded-sm hover:bg-zinc-700 transition-all"
            >
              Add First Question
            </button>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'New Question'}
      >
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Type + Subject */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Question Type</label>
              <div className="relative">
                <select
                  className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10] outline-none appearance-none cursor-pointer"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as QuestionType })}
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Subject</label>
              <div className="relative">
                <select
                  className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10] outline-none appearance-none cursor-pointer"
                  value={formData.subjectId}
                  onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
              </div>
            </div>
          </div>

          {/* Question text */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Question</label>
            <textarea
              placeholder="Enter the question or problem statement..."
              className="w-full px-3 py-2 text-xs min-h-[80px] rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none transition-all placeholder:text-[#6b6b6b] resize-none"
              value={formData.question}
              onChange={e => setFormData({ ...formData, question: e.target.value })}
              required
            />
          </div>

          {/* Correct answer */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-0.5">
              <label className="text-xs font-medium text-[#0e0f10]">Correct Answer</label>
              {formData.type === 'TRUE_FALSE' && (
                <div className="flex gap-1">
                  {['TRUE', 'FALSE'].map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setFormData({ ...formData, correct_answer: v })}
                      className={`px-2 py-0.5 text-xs rounded-sm transition-all ${formData.correct_answer === v ? 'bg-[#0e0f10] text-white' : 'bg-zinc-100 text-[#6b6b6b] hover:bg-zinc-200'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Input
              placeholder={formData.type === 'TRUE_FALSE' ? 'TRUE or FALSE' : 'Correct answer'}
              value={formData.correct_answer}
              onChange={e => setFormData({ ...formData, correct_answer: e.target.value })}
              required
              className="text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10]"
            />
          </div>

          {/* Incorrect answers (MCQ only) */}
          {formData.type === 'MULTIPLE_CHOICE' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Incorrect Options (min. 1)</label>
              {formData.incorrect_answers.map((ans, idx) => (
                <Input
                  key={idx}
                  placeholder={`Option ${idx + 1}`}
                  value={ans}
                  onChange={e => handleIncorrectAnswerChange(idx, e.target.value)}
                  className="text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10]"
                  required={idx === 0}
                />
              ))}
            </div>
          )}

          {/* Exam + Class */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Exam</label>
              <div className="relative">
                <select
                  className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10] outline-none appearance-none cursor-pointer"
                  value={formData.examId}
                  onChange={e => setFormData({ ...formData, examId: e.target.value })}
                  required
                >
                  <option value="">Select Exam</option>
                  {exams.map(e => <option key={e.id} value={e.id}>{e.exam_name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Class</label>
              <div className="relative">
                <select
                  className="w-full px-3 py-1 text-xs rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 text-[#0e0f10] outline-none appearance-none cursor-pointer"
                  value={formData.classId}
                  onChange={e => setFormData({ ...formData, classId: e.target.value })}
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b6b] pointer-events-none" size={13} />
              </div>
            </div>
          </div>

          {/* Explanation */}
          <div className="hidden space-y-1.5">
            <label className="text-xs font-medium text-[#0e0f10] ml-0.5">Explanation (optional)</label>
            <textarea
              placeholder="Provide reasoning for the correct answer..."
              className="w-full px-3 py-2 text-xs h-[60px] rounded-sm bg-zinc-50 border border-zinc-400/20 focus:border-zinc-400/60 focus:bg-white text-[#0e0f10] outline-none transition-all placeholder:text-[#6b6b6b] resize-none"
              value={formData.explanation}
              onChange={e => setFormData({ ...formData, explanation: e.target.value })}
            />
          </div>

          {/* Footer */}
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
              {editingQuestion ? (
                <span className="flex items-center justify-center gap-1.5"><Check size={13} /> Save Changes</span>
              ) : (
                <span className="flex items-center justify-center gap-1.5"><Plus size={13} /> Add Question</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}