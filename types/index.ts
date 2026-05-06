export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export interface User {
  id: number;
  user_name: string;
  user_email: string;
  role: UserRole;
  active: boolean;
  workspaceId: number;
  classId: number | null;
  img: string | null;
  createdAt: string;
}

export interface Workspace {
  id: number;
  name: string;
  description?: string;
  _count?: {
    users: number;
    exams: number;
    subjects: number;
    classes: number;
    questions: number;
    teachers: number;
  };
}

export interface Class {
  id: number;
  name: string;
  workspaceId: number;
}

export interface Subject {
  id: number;
  name: string;
  code?: string;
  description?: string;
  workspaceId: number;
  classes?: Class[];
  _count?: {
    questions: number;
  };
}

export interface Exam {
  id: number;
  exam_name: string;
  minutes: number;
  workspaceId: number;
  classId: number;
}

export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_THE_BLANK";

export interface Question {
  id: number;
  type: QuestionType;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  explanation: string | null;
  img: string | null;
  examId: number;
  subjectId: number;
  classId: number;
}

export interface SubjectScore {
  correct: number;
  total: number;
}

export interface QuestionAttempt {
  questionId: number;
  userOption?: number;
  userTextAnswer?: string;
  options?: string[];
}

export interface Result {
  id: number;
  overallScore: number;
  subjectScores: Record<string, SubjectScore>;
  questionAttempts: QuestionAttempt[];
  attempted_questions: number;
  total_questions: number;
  date: string;
  userId: number;
  examId: number;
  exam?: Exam;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
