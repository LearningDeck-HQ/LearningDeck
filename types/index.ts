export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export interface User {
  id: string;
  user_name: string;
  user_email: string;
  role: UserRole;
  active: boolean;
  workspaceId: string;
  classId: string | null;
  img: string | null;
  createdAt: string;
}

export interface Workspace {
  id: string;
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
  id: string;
  name: string;
  workspaceId: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  workspaceId: string;
  classes?: Class[];
  _count?: {
    questions: number;
  };
}

export interface Exam {
  id: string;
  exam_name: string;
  minutes: number;
  workspaceId: string;
  classId: string;
  visible: boolean;
}

export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_IN_THE_BLANK";

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  explanation: string | null;
  img: string | null;
  examId: string;
  subjectId: string;
  classId: string;
}

export interface SubjectScore {
  correct: number;
  total: number;
}

export interface QuestionAttempt {
  questionId: string;
  userOption?: number;
  userTextAnswer?: string;
  options?: string[];
}

export interface Result {
  id: string;
  overallScore: number;
  subjectScores: Record<string, SubjectScore>;
  questionAttempts: QuestionAttempt[];
  attempted_questions: number;
  total_questions: number;
  date: string;
  userId: string;
  examId: string;
  exam?: Exam;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
