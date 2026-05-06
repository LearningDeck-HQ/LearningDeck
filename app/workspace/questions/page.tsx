"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { 
  Plus, 
  Search, 
  Filter, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Type, 
  LayoutGrid,
  Trash2,
  Edit3,
  ChevronDown,
  BookOpen,
  FileText,
  GraduationCap,
  Check
} from 'lucide-react';
import { questionApi } from '@/lib/api/questions';
import { examApi } from '@/lib/api/exams';
import { subjectApi } from '@/lib/api/subjects';
import { classApi } from '@/lib/api/classes';
import { Question, Exam, Subject, Class, QuestionType } from '@/types';

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Modal States
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
    img: null as string | null
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [qRes, eRes, sRes, cRes] = await Promise.all([
        questionApi.list(),
        examApi.list(),
        subjectApi.list(),
        classApi.list()
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

  useEffect(() => {
    fetchData();
  }, []);

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
        img: q.img
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
        img: null
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
        examId: formData.examId,
        subjectId: formData.subjectId,
        classId: formData.classId,
        incorrect_answers: formData.type === 'MULTIPLE_CHOICE' ? formData.incorrect_answers.filter(a => a.trim() !== '') : []
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DashboardHeader
        title="Question Repository"
        description="Build and organize your multi-dimensional question banks with AI-ready structuring."
      >
        <Button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#1B2559] hover:bg-[#2B3674] h-[48px] px-6 rounded-xl shadow-lg shadow-blue-900/10 transition-all active:scale-[0.98]"
        >
          <Plus size={18} />
          Add Question
        </Button>
      </DashboardHeader>

      <div className="bg-white p-5 rounded border border-zinc-200/60 space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center text-blue-600">
              <Filter size={14} />
            </div>
            <h2 className="workspace text-[#1B2559]">Query Filter Hub</h2>
          </div>
          <button
            onClick={() => { setSearchTerm(''); setSelectedExam('all'); setSelectedSubject('all'); setSelectedClass('all'); }}
            className="workspace text-blue-600 hover:underline text-[13px]"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3AED0] group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search question text..."
              className="w-full pl-12 pr-4 py-2 mt-2 rounded bg-[#F4F7FF]/50 border border-transparent focus:border-blue-200 focus:bg-white workspace text-[#1B2559] outline-none transition-all placeholder:text-[#A3AED0]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <select
              className="w-full px-4 py-2 mt-2 rounded bg-[#F4F7FF]/50 border border-transparent focus:border-blue-200 focus:bg-white workspace text-[#1B2559] outline-none appearance-none cursor-pointer"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              <option value="all">All Examinations</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.exam_name}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3AED0] pointer-events-none" size={16} />
          </div>

          <div className="relative">
            <select
              className="w-full px-4 py-2 mt-2 rounded bg-[#F4F7FF]/50 border border-transparent focus:border-blue-200 focus:bg-white workspace text-[#1B2559] outline-none appearance-none cursor-pointer"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3AED0] pointer-events-none" size={16} />
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
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-[140px] bg-white rounded-3xl animate-pulse border border-zinc-100" />
          ))
        ) : filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => (
            <div key={q.id} className="group transition-all duration-300 border border-zinc-200/60 bg-white rounded overflow-hidden hover: hover:shadow-blue-900/5 hover:border-blue-200">
              <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5 flex-1 w-full">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm ${
                    q.type === 'MULTIPLE_CHOICE' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    q.type === 'TRUE_FALSE' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                    'bg-orange-50 text-orange-600 border-orange-100'
                  }`}>
                    {q.type === 'MULTIPLE_CHOICE' ? <LayoutGrid size={24} /> :
                     q.type === 'TRUE_FALSE' ? <CheckCircle2 size={24} /> :
                     <Type size={24} />}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="workspace text-[#A3AED0] uppercase  tracking-widest">{q.type.replace(/_/g, ' ')}</span>
                      <div className="w-1 h-1 bg-zinc-300 rounded-full" />
                      <span className="workspace  text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px]">ID: #{q.id.slice(0, 8)}</span>
                    </div>
                    
                    <h3 className="workspace  text-[#1B2559] tracking-tight">
                        {q.question}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-8">
                  <div className="flex flex-col items-center mr-6">
                    <span className="workspace text-[#A3AED0] uppercase  tracking-widest mb-1">Source</span>
                    <span className="workspace  text-blue-500 bg-blue-50 px-3 py-1 rounded">{exams.find(e => e.id === q.examId)?.exam_name || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button onClick={() => handleOpenModal(q)} variant="ghost" className="text-black">
                      <Edit3 size={16} />
                    </Button>
                    <Button onClick={() => handleDelete(q.id)} variant="ghost" className="text-black">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="px-6 pb-6 pt-0">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#A3AED0] font-medium border-t border-zinc-50 pt-4">
                    <span className="flex items-center gap-1.5"><BookOpen size={14}/> Subject: {subjects.find(s => s.id === q.subjectId)?.name || 'N/A'}</span>
                    <span className="flex items-center gap-1.5"><GraduationCap size={14}/> Class: {classes.find(c => c.id === q.classId)?.name || 'N/A'}</span>
                    <div className="flex items-center gap-3 bg-emerald-50/50 px-3 py-1 rounded border border-emerald-100/50 ml-auto">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="text-[12px] text-emerald-700 font-bold">{q.correct_answer}</span>
                    </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-[#E0E5F2] flex flex-col items-center">
            <HelpCircle size={64} className="text-[#A3AED0] mb-6" />
            <h3 className="text-[22px] font-bold text-[#1B2559] mb-2">No questions in repository</h3>
            <p className="text-[#A3AED0] max-w-sm mb-8 text-[15px]">Select filters above or create your first question to populate this view.</p>
            <Button onClick={() => handleOpenModal()} className="h-[52px] px-8 bg-[#1B2559] rounded-xl font-bold">Create Question</Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Modify Question Structure' : 'Compose New Question'}
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#1B2559] ml-1">Question Type</label>
                <div className="relative">
                    <select 
                        className="w-full h-[52px] px-4 rounded-xl bg-[#F4F7FF] border-none text-[14px] text-[#1B2559] outline-none appearance-none cursor-pointer"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as QuestionType })}
                    >
                        <option value="MULTIPLE_CHOICE">Multiple Choice (MCQ)</option>
                        <option value="TRUE_FALSE">True / False</option>
                        <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3AED0] pointer-events-none" size={16} />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#1B2559] ml-1">Subject Assignment</label>
                <div className="relative">
                    <select 
                        className="w-full h-[52px] px-4 rounded-xl bg-[#F4F7FF] border-none text-[14px] text-[#1B2559] outline-none appearance-none cursor-pointer"
                        value={formData.subjectId}
                        onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                        required
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3AED0] pointer-events-none" size={16} />
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#1B2559] ml-1">Question Content</label>
            <textarea
              placeholder="Enter the query or problem statement..."
              className="w-full p-4 min-h-[120px] rounded-2xl bg-[#F4F7FF] border-none focus:ring-2 focus:ring-blue-500/20 text-[15px] text-[#1B2559] outline-none transition-all placeholder:text-[#A3AED0] resize-none font-medium"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              required
            />
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
                <label className="text-[13px] font-bold text-[#1B2559]">Correct Answer / Resolution</label>
                {formData.type === 'TRUE_FALSE' && (
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setFormData({...formData, correct_answer: 'TRUE'})} className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${formData.correct_answer === 'TRUE' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>TRUE</button>
                        <button type="button" onClick={() => setFormData({...formData, correct_answer: 'FALSE'})} className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${formData.correct_answer === 'FALSE' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>FALSE</button>
                    </div>
                )}
             </div>
             <Input
                placeholder={formData.type === 'TRUE_FALSE' ? 'TRUE or FALSE' : 'Provide the definite correct answer'}
                value={formData.correct_answer}
                onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                required
                className="h-[52px] rounded-xl bg-[#F4F7FF] border-none focus:ring-2 focus:ring-emerald-500/20 text-[15px] font-bold text-emerald-600"
             />
          </div>

          {formData.type === 'MULTIPLE_CHOICE' && (
            <div className="space-y-3">
              <label className="text-[13px] font-bold text-[#1B2559] ml-1">Incorrect Distractors (At least 1)</label>
              {formData.incorrect_answers.map((ans, idx) => (
                <Input
                  key={idx}
                  placeholder={`Distractor #${idx + 1}`}
                  value={ans}
                  onChange={(e) => handleIncorrectAnswerChange(idx, e.target.value)}
                  className="h-[48px] rounded-xl bg-zinc-50 border-none focus:ring-2 focus:ring-red-500/10 text-[14px]"
                  required={idx === 0}
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#1B2559] ml-1">Examination Hub</label>
                <div className="relative">
                    <select 
                        className="w-full h-[52px] px-4 rounded-xl bg-[#F4F7FF] border-none text-[14px] text-[#1B2559] outline-none appearance-none cursor-pointer"
                        value={formData.examId}
                        onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
                        required
                    >
                        <option value="">Select Exam</option>
                        {exams.map(e => <option key={e.id} value={e.id}>{e.exam_name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3AED0] pointer-events-none" size={16} />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#1B2559] ml-1">Class Target</label>
                <div className="relative">
                    <select 
                        className="w-full h-[52px] px-4 rounded-xl bg-[#F4F7FF] border-none text-[14px] text-[#1B2559] outline-none appearance-none cursor-pointer"
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                        required
                    >
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3AED0] pointer-events-none" size={16} />
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#1B2559] ml-1">Pedagogical Explanation (Optional)</label>
            <textarea
              placeholder="Provide reasoning for the correct answer to help students learn..."
              className="w-full p-4 h-[80px] rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-blue-500/10 text-[14px] text-[#1B2559] outline-none transition-all placeholder:text-[#A3AED0] resize-none"
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            />
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
              className="flex-1 h-12 rounded bg-[#1B2559] text-white font-bold shadow-xl shadow-blue-900/20"
              isLoading={isSubmitting}
            >
              {editingQuestion ? (
                <span className="flex items-center gap-2"><Check size={20}/> Update</span>
              ) : (
                <span className="flex items-center gap-2"><Plus size={20}/> Commit</span>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}