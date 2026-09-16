"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { MockTest } from "./mockTestData";
import { saveAttempt, type Attempt } from "./mockTestAttempts";

type AnswerMap = Record<string, number | null>;

type EngineState = {
  currentIndex: number;
  answers: AnswerMap;
  visited: Set<string>;
  marked: Set<string>;
  secondsLeft: number;
  status: "running" | "submitted";
  startedAt: number;
};

type Action =
  | { type: "SELECT"; qid: string; optionIndex: number }
  | { type: "CLEAR"; qid: string }
  | { type: "TOGGLE_MARK"; qid: string }
  | { type: "GOTO"; index: number }
  | { type: "TICK" }
  | { type: "SUBMIT" };

function reducer(state: EngineState, action: Action, questions: MockTest["questions"]): EngineState {
  switch (action.type) {
    case "SELECT":
      return {
        ...state,
        answers: { ...state.answers, [action.qid]: action.optionIndex },
        visited: new Set(state.visited).add(action.qid),
      };
    case "CLEAR":
      return {
        ...state,
        answers: { ...state.answers, [action.qid]: null },
      };
    case "TOGGLE_MARK": {
      const marked = new Set(state.marked);
      if (marked.has(action.qid)) marked.delete(action.qid);
      else marked.add(action.qid);
      return { ...state, marked };
    }
    case "GOTO": {
      const clamped = Math.max(0, Math.min(questions.length - 1, action.index));
      const qid = questions[clamped].id;
      return {
        ...state,
        currentIndex: clamped,
        visited: new Set(state.visited).add(qid),
      };
    }
    case "TICK":
      return { ...state, secondsLeft: Math.max(0, state.secondsLeft - 1) };
    case "SUBMIT":
      return { ...state, status: "submitted" };
    default:
      return state;
  }
}

export type QuestionStatus = "unvisited" | "unanswered" | "answered" | "marked" | "answered-marked";

export function useMockTestEngine(test: MockTest) {
  const questions = test.questions;

  const [state, dispatch] = useReducer(
    (s: EngineState, a: Action) => reducer(s, a, questions),
    undefined,
    (): EngineState => ({
      currentIndex: 0,
      answers: Object.fromEntries(questions.map((q) => [q.id, null])),
      visited: new Set([questions[0].id]),
      marked: new Set(),
      secondsLeft: test.durationMinutes * 60,
      status: "running",
      startedAt: Date.now(),
    })
  );

  const savedRef = useRef(false);

  // countdown timer
  useEffect(() => {
    if (state.status !== "running") return;
    const id = setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => clearInterval(id);
  }, [state.status]);

  // auto-submit when time runs out
  useEffect(() => {
    if (state.status === "running" && state.secondsLeft === 0) {
      dispatch({ type: "SUBMIT" });
    }
  }, [state.secondsLeft, state.status]);

  const currentQuestion = questions[state.currentIndex];

  const questionStatus = useCallback(
    (qid: string): QuestionStatus => {
      const answered = state.answers[qid] !== null && state.answers[qid] !== undefined;
      const marked = state.marked.has(qid);
      const visited = state.visited.has(qid);
      if (marked && answered) return "answered-marked";
      if (marked) return "marked";
      if (answered) return "answered";
      if (visited) return "unanswered";
      return "unvisited";
    },
    [state.answers, state.marked, state.visited]
  );

  const summary = useMemo(() => {
    const answeredCount = Object.values(state.answers).filter((v) => v !== null && v !== undefined).length;
    const markedCount = state.marked.size;
    const notAnswered = questions.length - answeredCount;
    return { answeredCount, markedCount, notAnswered, total: questions.length };
  }, [state.answers, state.marked, questions.length]);

  const submit = useCallback((): Attempt => {
    if (!savedRef.current) {
      savedRef.current = true;
      dispatch({ type: "SUBMIT" });
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    let score = 0;

    for (const q of questions) {
      const given = state.answers[q.id];
      if (given === null || given === undefined) {
        unattemptedCount++;
        continue;
      }
      if (given === q.correctIndex) {
        correctCount++;
        score += test.marksPerQuestion;
      } else {
        incorrectCount++;
        score -= test.negativeMarks;
      }
    }

    const maxScore = questions.length * test.marksPerQuestion;
    const attemptedCount = correctCount + incorrectCount;
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
    const percentage = Math.round((score / maxScore) * 100);
    const timeTakenSec = Math.max(0, test.durationMinutes * 60 - state.secondsLeft);

    const attempt: Attempt = {
      testId: test.id,
      score,
      maxScore,
      correctCount,
      incorrectCount,
      unattemptedCount,
      totalQuestions: questions.length,
      accuracy,
      percentage,
      passed: percentage >= test.passPercentage,
      timeTakenSec,
      completedAt: new Date().toISOString(),
      answers: state.answers,
    };

    saveAttempt(attempt);
    return attempt;
  }, [questions, state.answers, state.secondsLeft, test]);

  return {
    currentQuestion,
    currentIndex: state.currentIndex,
    totalQuestions: questions.length,
    secondsLeft: state.secondsLeft,
    status: state.status,
    answers: state.answers,
    marked: state.marked,
    summary,
    questionStatus,
    select: (optionIndex: number) => dispatch({ type: "SELECT", qid: currentQuestion.id, optionIndex }),
    clear: () => dispatch({ type: "CLEAR", qid: currentQuestion.id }),
    toggleMark: () => dispatch({ type: "TOGGLE_MARK", qid: currentQuestion.id }),
    goto: (index: number) => dispatch({ type: "GOTO", index }),
    next: () => dispatch({ type: "GOTO", index: state.currentIndex + 1 }),
    prev: () => dispatch({ type: "GOTO", index: state.currentIndex - 1 }),
    submit,
  };
}
