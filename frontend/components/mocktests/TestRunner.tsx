"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
  Send,
  X,
} from "lucide-react";
import type { MockTest, AttemptAnswer, AttemptResult } from "./testData";

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

type PaletteStatus = "not-visited" | "not-answered" | "answered" | "review" | "review-answered";

export default function TestRunner({
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have an in-progress test. Progress will be saved if you leave.";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  test,
  onSubmit,
}: {
  test: MockTest;
  onSubmit: (result: AttemptResult) => void;
}) {
  const totalSeconds = test.durationMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AttemptAnswer>>(() => {
    const init: Record<string, AttemptAnswer> = {};
    test.questions.forEach((q, i) => {
      init[q.id] = {
        questionId: q.id,
        selectedIndex: null,
        markedForReview: false,
        visited: i === 0,
      };
    });
    return init;
  });
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const startTimeRef = useRef(Date.now());
  const submittedRef = useRef(false);

  const currentQuestion = test.questions[currentIndex];

  const buildResult = useCallback((): AttemptResult => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    const topicBreakdown: Record<string, { correct: number; total: number }> = {};

    test.questions.forEach((q) => {
      const a = answers[q.id];
      if (!topicBreakdown[q.topic]) topicBreakdown[q.topic] = { correct: 0, total: 0 };
      topicBreakdown[q.topic].total += 1;

      if (a.selectedIndex === null) {
        unattempted += 1;
      } else if (a.selectedIndex === q.correctIndex) {
        correct += 1;
        topicBreakdown[q.topic].correct += 1;
      } else {
        incorrect += 1;
      }
    });

    const timeTakenSeconds = Math.min(
      totalSeconds,
      Math.round((Date.now() - startTimeRef.current) / 1000)
    );

    return {
      testId: test.id,
      testTitle: test.title,
      submittedAt: new Date().toISOString(),
      timeTakenSeconds,
      totalQuestions: test.questions.length,
      correct,
      incorrect,
      unattempted,
      scorePercentage: Math.round((correct / test.questions.length) * 100),
      topicBreakdown,
      answers: test.questions.map((q) => answers[q.id]),
    };
  }, [answers, test, totalSeconds]);

  const handleFinalSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    onSubmit(buildResult());
  }, [buildResult, onSubmit]);

  // Countdown timer — auto-submits at zero.
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
    const id = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timeLeft === 0) handleFinalSubmit();
  }, [timeLeft, handleFinalSubmit]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
    setAnswers((prev) => {
      const q = test.questions[index];
      if (prev[q.id].visited) return prev;
      return { ...prev, [q.id]: { ...prev[q.id], visited: true } };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test.questions]);

  const selectOption = (optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], selectedIndex: optionIndex, visited: true },
    }));
  };

  const clearResponse = () => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...prev[currentQuestion.id], selectedIndex: null },
    }));
  };

  const toggleMarkForReview = () => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        markedForReview: !prev[currentQuestion.id].markedForReview,
      },
    }));
  };

  const saveAndNext = () => {
    if (currentIndex < test.questions.length - 1) goTo(currentIndex + 1);
  };

  const markAndNext = () => {
    toggleMarkForReview();
    if (currentIndex < test.questions.length - 1) goTo(currentIndex + 1);
  };

  const stats = useMemo(() => {
    let answered = 0;
    let notAnswered = 0;
    let notVisited = 0;
    let review = 0;
    test.questions.forEach((q) => {
      const a = answers[q.id];
      if (a.markedForReview) review += 1;
      else if (!a.visited) notVisited += 1;
      else if (a.selectedIndex === null) notAnswered += 1;
      else answered += 1;
    });
    return { answered, notAnswered, notVisited, review };
  }, [answers, test.questions]);

  const getStatus = (questionId: string): PaletteStatus => {
    const a = answers[questionId];
    if (a.markedForReview) return a.selectedIndex !== null ? "review-answered" : "review";
    if (!a.visited) return "not-visited";
    if (a.selectedIndex === null) return "not-answered";
    return "answered";
  };

  const paletteStyles: Record<PaletteStatus, string> = {
    "not-visited": "bg-white text-charcoal border border-ink/10",
    "not-answered": "bg-rose-500 text-white",
    answered: "bg-emerald-500 text-white",
    review: "bg-purple text-white",
    "review-answered": "bg-purple text-white ring-2 ring-emerald-400 ring-offset-1",
  };

  const isLowTime = timeLeft <= 60;

  return (
    <div>
      {/* header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/5 bg-white px-5 py-4 shadow-soft">
        <div>
          <h3 className="font-display text-[15px] font-bold text-ink">{test.title}</h3>
          <p className="text-[12px] text-muted">
            Question {currentIndex + 1} of {test.questions.length}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-bold mono-num ${
            isLowTime ? "animate-pulse bg-rose-100 text-rose-600" : "bg-purple/10 text-purple"
          }`}
        >
          <Clock size={16} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        {/* question panel */}
        <div className="rounded-xl3 border border-ink/5 bg-white p-6 shadow-soft sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22 }}
            >
              <span className="rounded-full bg-purple/8 px-3 py-1 text-[11px] font-bold text-purple">
                {currentQuestion.topic}
              </span>
              <h4 className="font-display mt-4 text-[16.5px] font-semibold leading-relaxed text-ink">
                {currentIndex + 1}. {currentQuestion.text}
              </h4>

              <div className="mt-6 space-y-3">
                {currentQuestion.options.map((opt, i) => {
                  const selected = answers[currentQuestion.id].selectedIndex === i;
                  return (
                    <button
                      key={i}
                      onClick={() => selectOption(i)}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-[14px] font-medium transition-all ${
                        selected
                          ? "border-purple bg-purple/6 text-ink"
                          : "border-ink/10 bg-surface text-charcoal hover:border-purple/30"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold ${
                          selected
                            ? "border-purple bg-purple text-white"
                            : "border-ink/20 text-muted"
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* action row */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink/5 pt-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={clearResponse}
                className="flex items-center gap-1.5 rounded-full border border-ink/10 px-4 py-2.5 text-[13px] font-semibold text-charcoal transition-colors hover:border-purple/30"
              >
                <RotateCcw size={14} />
                Clear
              </button>
              <button
                onClick={toggleMarkForReview}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                  answers[currentQuestion.id].markedForReview
                    ? "bg-purple text-white"
                    : "border border-ink/10 text-charcoal hover:border-purple/30"
                }`}
              >
                <Flag size={14} />
                {answers[currentQuestion.id].markedForReview ? "Marked" : "Mark for Review"}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => goTo(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 rounded-full border border-ink/10 px-4 py-2.5 text-[13px] font-semibold text-charcoal transition-colors hover:border-purple/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Prev
              </button>
              {currentIndex < test.questions.length - 1 ? (
                <>
                  <button
                    onClick={markAndNext}
                    className="rounded-full border border-ink/10 px-4 py-2.5 text-[13px] font-semibold text-charcoal transition-colors hover:border-purple/30"
                  >
                    Mark &amp; Next
                  </button>
                  <button
                    onClick={saveAndNext}
                    className="flex items-center gap-1 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-purple"
                  >
                    Save &amp; Next
                    <ChevronRight size={15} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white shimmer-btn animate-shimmer"
                >
                  <Send size={14} />
                  Submit Test
                </button>
              )}
            </div>
          </div>
        </div>

        {/* palette sidebar */}
        <div className="rounded-xl3 border border-ink/5 bg-white p-5 shadow-soft">
          <h5 className="text-[13px] font-bold text-ink">Question Palette</h5>
          <div className="mt-4 grid grid-cols-6 gap-2 lg:grid-cols-5">
            {test.questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => goTo(i)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-[12.5px] font-bold transition-transform hover:scale-105 ${
                  paletteStyles[getStatus(q.id)]
                } ${i === currentIndex ? "outline outline-2 outline-offset-1 outline-ink" : ""}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-2 text-[12px] text-charcoal">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-emerald-500" /> Answered</span>
              <span className="font-semibold">{stats.answered}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-rose-500" /> Not Answered</span>
              <span className="font-semibold">{stats.notAnswered}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-purple" /> Marked for Review</span>
              <span className="font-semibold">{stats.review}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-ink/20 bg-white" /> Not Visited</span>
              <span className="font-semibold">{stats.notVisited}</span>
            </div>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="mt-6 w-full rounded-full bg-ink px-4 py-3 text-[13px] font-semibold text-white transition-colors hover:bg-purple"
          >
            Submit Test
          </button>
        </div>
      </div>

      {/* submit confirmation modal */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="w-full max-w-sm rounded-xl3 bg-white p-6 shadow-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <AlertTriangle size={19} />
                </div>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  aria-label="Close"
                  className="text-muted hover:text-ink"
                >
                  <X size={18} />
                </button>
              </div>
              <h4 className="font-display mt-4 text-[16px] font-bold text-ink">
                Submit the test now?
              </h4>
              <div className="mt-3 space-y-1.5 text-[13px] text-muted">
                <p>Answered: <span className="font-semibold text-emerald-600">{stats.answered}</span></p>
                <p>Not Answered: <span className="font-semibold text-rose-600">{stats.notAnswered + stats.notVisited}</span></p>
                <p>Marked for Review: <span className="font-semibold text-purple">{stats.review}</span></p>
              </div>
              <p className="mt-3 text-[12.5px] text-muted">
                Once submitted, you cannot change your answers.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 rounded-full border border-ink/10 px-4 py-2.5 text-[13.5px] font-semibold text-charcoal"
                >
                  Continue Test
                </button>
                <button
                  onClick={handleFinalSubmit}
                  className="flex-1 rounded-full bg-purple px-4 py-2.5 text-[13.5px] font-semibold text-white"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
