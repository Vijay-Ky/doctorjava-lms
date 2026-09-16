export type QuestionType = 'CODE_OUTPUT' | 'TECHNICAL_MCQ';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Option { id: number; key: string; text: string; }
export interface AdminOption extends Option { correct: boolean; }
export interface PracticeQuestion {
  id: number; type: QuestionType; topic: string; difficulty: string; questionText?: string | null;
  codeContent?: string | null; codeLanguage?: string | null; options: Option[];
}
export interface TestCard {
  id: number; testCode: string; title: string; description?: string | null; subject: string;
  difficulty: Difficulty; durationMinutes: number; totalQuestions: number; marksPerQuestion: number;
  negativeMarks: number; passPercentage: number; published: boolean;
}
export interface TestDetail extends TestCard { instructions?: string | null; questions: PracticeQuestion[]; }
export interface AttemptStart { attemptId: number; attemptCode: string; startedAt: string; expiresAt: string; durationSeconds: number; title: string; questions: PracticeQuestion[]; }
export interface AnswerReview extends PracticeQuestion { selectedOptionId?: number | null; correctOptionId?: number | null; correct: boolean; explanation: string; awardedMarks: number; }
export interface Result {
  attemptId: number; score: number; maxScore: number; percentage: number; correct: number; incorrect: number;
  unanswered: number; passed: boolean; timeTakenSeconds: number; answers: AnswerReview[];
}
export interface AdminQuestion {
  id: number; questionCode: string; type: QuestionType; subjectId: number; subject: string; topicId: number;
  topic: string; subtopic?: string | null; difficulty: Difficulty; questionText?: string | null; codeContent?: string | null;
  codeLanguage?: string | null; explanation: string; marks: number; negativeMarks: number; status: QuestionStatus; options: AdminOption[];
}
export interface PageResponse<T> { content: T[]; number: number; size: number; totalElements: number; totalPages: number; }
export interface Subject { id: number; name: string; }
export interface Topic { id: number; name: string; subject: Subject; }
