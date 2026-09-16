import { lmsFetch } from '@/lib/lms/api';

export type CodingTestCard = {
  id: number;
  testCode: string;
  title: string;
  description?: string;
  subject?: string;
  difficulty?: string;
  durationMinutes: number;
  totalQuestions: number;
  passPercentage: number;
  published: boolean;
};

export type QuestionSummary = {
  attemptQuestionId: number;
  codingQuestionId: number;
  title: string;
  order: number;
};

export type AttemptStart = {
  attemptId: number;
  attemptCode: string;
  durationMinutes: number;
  expiresAt: string;
  questionCount: number;
  questions: QuestionSummary[];
};

export type SampleCase = {
  id: number;
  input: string;
  expectedOutput: string;
  displayOrder: number;
};

export type CodingQuestionView = {
  attemptQuestionId: number;
  codingQuestionId: number;
  title: string;
  problemStatementMarkdown: string;
  constraintsText?: string;
  inputFormat?: string;
  outputFormat?: string;
  timeLimitMs: number;
  memoryLimitKb: number;
  allowedLanguages: string[];
  starterCode: Record<string, string>;
  sampleCases: SampleCase[];
  marks: number;
};

export type CaseResult = {
  testCaseId: number;
  sample: boolean;
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  stderr?: string;
  runtimeMs?: number;
};

export type RunResponse = {
  status: string;
  passed: number;
  total: number;
  cases: CaseResult[];
  compileError?: string;
};

export type SubmitAccepted = { submissionId: number; status: string };

export type SubmissionPoll = {
  submissionId: number;
  status: string;
  isFinal: boolean;
  passed: number;
  total: number;
  runtimeMs?: number;
  memoryKb?: number;
  awardedMarks?: number;
  compileError?: string;
  cases: CaseResult[];
};

export type FinishResponse = {
  attemptId: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeTakenSeconds: number;
  questionScores: {
    attemptQuestionId: number;
    title: string;
    status: string;
    passed: number;
    total: number;
    awardedMarks: number;
    maxMarks: number;
  }[];
};

export const codingApi = {
  listTests: () => lmsFetch<CodingTestCard[]>('/api/v1/practice/coding-tests', {}, false),
  start: (testId: number) =>
    lmsFetch<AttemptStart>(`/api/v1/practice/coding-tests/${testId}/attempts`, { method: 'POST' }),
  getQuestion: (attemptId: number, questionId: number) =>
    lmsFetch<CodingQuestionView>(
      `/api/v1/practice/coding-attempts/${attemptId}/questions/${questionId}`
    ),
  run: (attemptId: number, questionId: number, language: string, sourceCode: string) =>
    lmsFetch<RunResponse>(
      `/api/v1/practice/coding-attempts/${attemptId}/questions/${questionId}/run`,
      { method: 'POST', body: JSON.stringify({ language, sourceCode }) }
    ),
  submit: (attemptId: number, questionId: number, language: string, sourceCode: string) =>
    lmsFetch<SubmitAccepted>(
      `/api/v1/practice/coding-attempts/${attemptId}/questions/${questionId}/submit`,
      { method: 'POST', body: JSON.stringify({ language, sourceCode }) }
    ),
  poll: (submissionId: number) =>
    lmsFetch<SubmissionPoll>(`/api/v1/practice/coding-submissions/${submissionId}`),
  finish: (attemptId: number) =>
    lmsFetch<FinishResponse>(`/api/v1/practice/coding-attempts/${attemptId}/finish`, {
      method: 'POST',
    }),
};
