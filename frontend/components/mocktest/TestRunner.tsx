"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, ChevronLeft, ChevronRight, X, Timer as TimerIcon } from "lucide-react";
import type { MockTest } from "@/lib/mockTestData";
import type { useMockTestEngine } from "@/lib/useMockTestEngine";
import QuestionPalette from "./QuestionPalette";

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function TestRunner({
  test,
  engine,
  onSubmit,
}: {
  test: MockTest;
  engine: ReturnType<typeof useMockTestEngine>;
  onSubmit: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const q = engine.currentQuestion;
  const selected = engine.answers[q.id];
  const isMarked = engine.marked.has(q.id);
  const lowTime = engine.secondsLeft <= 60;

  // Prevent accidental leave during active attempt
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have an in-progress test. Leaving will auto-save progress. Are you sure?";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
      <div className="rounded-xl4 border border-ink/5 bg-white p-6 shadow-card md:p-8">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/5 pb-5">
          <div>
            <span className="rounded-full bg-purple/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-purple">
              {q.topic}
            </span>
            <p className="mt-2 text-[13px] font-semibold text-muted">
              Question {engine.currentIndex + 1} of {engine.totalQuestions}
            </p>
          </div>
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-bold ${
              lowTime ? "animate-pulse bg-red-50 text-red-600" : "bg-ink/5 text-ink"
            }`}
          >
            <TimerIcon size={16} />
            <span className="mono-num">{formatTime(engine.secondsLeft)}</span>
          </div>
        </div>

        {/* question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
            className="mt-6"
          >
            <p className="font-display text-[17px] font-semibold leading-snug text-ink">
              {q.text}
            </p>

            <div className="mt-6 space-y-3">
              {q.options.map((opt, i) => {
                const isSelected = selected === i;
                return (
                  <button
                    key={i}
                    onClick={() => engine.select(i)}
                    aria-pressed={isSelected}
                    className={`flex w-full items-center gap-3 rounded-xl2 border px-4 py-3.5 text-left text-[14.5px] font-medium transition-all ${
                      isSelected
                        ? "border-purple bg-purple/8 text-purple"
                        : "border-ink/10 bg-surface text-charcoal hover:border-purple/30"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                        isSelected ? "border-purple bg-purple text-white" : "border-ink/20 text-muted"
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

        {/* actions */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink/5 pt-6">
          <div className="flex gap-2">
            <button
              onClick={engine.clear}
              disabled={selected === null || selected === undefined}
              className="rounded-full border border-ink/10 px-4 py-2.5 text-[13px] font-semibold text-charcoal transition-colors hover:border-red-300 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear Response
            </button>
            <button
              onClick={engine.toggleMark}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-colors ${
                isMarked
                  ? "border-purple bg-purple/10 text-purple"
                  : "border-ink/10 text-charcoal hover:border-purple/30"
              }`}
            >
              <Flag size={14} />
              {isMarked ? "Unmark" : "Mark for Review"}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={engine.prev}
              disabled={engine.currentIndex === 0}
              className="flex items-center gap-1 rounded-full border border-ink/10 px-4 py-2.5 text-[13px] font-semibold text-charcoal disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} /> Previous
            </button>
            {engine.currentIndex === engine.totalQuestions - 1 ? (
              <button
                onClick={() => setConfirmOpen(true)}
                className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-white"
              >
                Submit Test
              </button>
            ) : (
              <button
                onClick={engine.next}
                className="flex items-center gap-1 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-white"
              >
                Save & Next <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setConfirmOpen(true)}
          className="mt-4 w-full rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-[13px] font-semibold text-red-600 lg:hidden"
        >
          Submit Test
        </button>
      </div>

      {/* palette - desktop sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          <QuestionPalette
            total={engine.totalQuestions}
            currentIndex={engine.currentIndex}
            getStatus={(i) => engine.questionStatus(test.questions[i].id)}
            onJump={engine.goto}
          />
          <button
            onClick={() => setConfirmOpen(true)}
            className="w-full rounded-full bg-red-500 px-5 py-3 text-[13.5px] font-bold text-white shadow-soft transition-transform hover:-translate-y-0.5"
          >
            Submit Test
          </button>
        </div>
      </div>

      {/* palette - mobile */}
      <div className="lg:hidden">
        <QuestionPalette
          total={engine.totalQuestions}
          currentIndex={engine.currentIndex}
          getStatus={(i) => engine.questionStatus(test.questions[i].id)}
          onJump={engine.goto}
        />
      </div>

      {/* submit confirmation modal */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              className="w-full max-w-sm rounded-xl3 bg-white p-6 shadow-card"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-display text-lg font-bold text-ink">Submit test?</h3>
                <button onClick={() => setConfirmOpen(false)} aria-label="Close">
                  <X size={18} className="text-muted" />
                </button>
              </div>
              <div className="mt-4 space-y-2 text-[13.5px] text-charcoal/80">
                <div className="flex justify-between">
                  <span>Answered</span>
                  <span className="font-bold text-emerald-600">{engine.summary.answeredCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Not Answered</span>
                  <span className="font-bold text-red-500">{engine.summary.notAnswered}</span>
                </div>
                <div className="flex justify-between">
                  <span>Marked for Review</span>
                  <span className="font-bold text-purple">{engine.summary.markedCount}</span>
                </div>
              </div>
              <p className="mt-4 text-[12.5px] text-muted">
                Once submitted, you can&rsquo;t change your answers. You&rsquo;ll see your full
                result and answer review immediately.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 rounded-full border border-ink/10 px-4 py-3 text-[13.5px] font-semibold text-charcoal"
                >
                  Keep Reviewing
                </button>
                <button
                  onClick={onSubmit}
                  className="flex-1 rounded-full bg-ink px-4 py-3 text-[13.5px] font-semibold text-white"
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
