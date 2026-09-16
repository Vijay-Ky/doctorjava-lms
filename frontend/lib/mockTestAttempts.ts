"use client";

export type Attempt = {
  testId: string;
  score: number;
  maxScore: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  totalQuestions: number;
  accuracy: number; // % of attempted questions answered correctly
  percentage: number; // % of max score achieved (can be negative)
  passed: boolean;
  timeTakenSec: number;
  completedAt: string; // ISO timestamp
  answers: Record<string, number | null>;
};

const STORAGE_KEY = "djt_mock_attempts_v1";

function readAll(): Attempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(attempts: Attempt[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  } catch {
    // storage unavailable (private browsing, quota, etc) — fail silently
  }
}

export function getAttemptsForTest(testId: string): Attempt[] {
  return readAll()
    .filter((a) => a.testId === testId)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}

export function getBestAttempt(testId: string): Attempt | null {
  const attempts = getAttemptsForTest(testId);
  if (attempts.length === 0) return null;
  return attempts.reduce((best, a) => (a.score > best.score ? a : best), attempts[0]);
}

export function saveAttempt(attempt: Attempt) {
  const all = readAll();
  all.push(attempt);
  writeAll(all);
}

export function getAttemptCount(testId: string): number {
  return readAll().filter((a) => a.testId === testId).length;
}
