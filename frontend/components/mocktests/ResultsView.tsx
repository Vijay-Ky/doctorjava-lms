"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Clock,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import type { MockTest, AttemptResult } from "./testData";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function ResultsView({
  test,
  result,
  onRetake,
  onBackToList,
}: {
  test: MockTest;
  result: AttemptResult;
  onRetake: () => void;
  onBackToList: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const passed = result.scorePercentage >= test.passPercentage;

  const grade =
    result.scorePercentage >= 90
      ? "Outstanding"
      : result.scorePercentage >= 75
      ? "Excellent"
      : result.scorePercentage >= test.passPercentage
      ? "Good"
      : "Needs Improvement";

  return (
    <div>
      {/* score summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl3 border border-ink/5 bg-gradient-to-br from-surface2 to-white p-7 shadow-card sm:p-9"
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold ${
                passed ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
              }`}
            >
              <Trophy size={13} />
              {passed ? "Passed" : "Not Cleared"} · {grade}
            </div>
            <h3 className="font-display mt-3 text-xl font-bold text-ink">{test.title}</h3>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-[12.5px] text-muted sm:justify-start">
              <Clock size={13} />
              Completed in {formatDuration(result.timeTakenSeconds)}
            </p>
          </div>

          <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="42" strokeWidth="10" className="fill-none stroke-ink/5" />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                strokeWidth="10"
                strokeLinecap="round"
                className={`fill-none ${passed ? "stroke-emerald-500" : "stroke-purple"}`}
                strokeDasharray={2 * Math.PI * 42}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 42 * (1 - result.scorePercentage / 100),
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <span className="font-display absolute text-xl font-bold text-ink">
              <CountUp end={result.scorePercentage} duration={1.4} />%
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white p-4 text-center shadow-soft">
            <CheckCircle2 size={17} className="mx-auto text-emerald-500" />
            <div className="font-display mono-num mt-1.5 text-lg font-bold text-ink">
              {result.correct}
            </div>
            <div className="text-[11px] text-muted">Correct</div>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-soft">
            <XCircle size={17} className="mx-auto text-rose-500" />
            <div className="font-display mono-num mt-1.5 text-lg font-bold text-ink">
              {result.incorrect}
            </div>
            <div className="text-[11px] text-muted">Incorrect</div>
          </div>
          <div className="rounded-2xl bg-white p-4 text-center shadow-soft">
            <MinusCircle size={17} className="mx-auto text-muted" />
            <div className="font-display mono-num mt-1.5 text-lg font-bold text-ink">
              {result.unattempted}
            </div>
            <div className="text-[11px] text-muted">Unattempted</div>
          </div>
        </div>

        {/* topic breakdown */}
        <div className="mt-7">
          <h4 className="text-[13px] font-bold text-ink">Topic-wise performance</h4>
          <div className="mt-3 space-y-3">
            {Object.entries(result.topicBreakdown).map(([topic, stat]) => {
              const pct = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={topic}>
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="font-medium text-charcoal">{topic}</span>
                    <span className="text-muted">
                      {stat.correct}/{stat.total}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink/5">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-purple to-purple-400"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onRetake}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ink/10 px-5 py-3 text-[13.5px] font-semibold text-charcoal transition-colors hover:border-purple/30"
          >
            <RotateCcw size={15} />
            Retake Test
          </button>
          <button
            onClick={onBackToList}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-ink px-5 py-3 text-[13.5px] font-semibold text-white transition-colors hover:bg-purple"
          >
            <ArrowLeft size={15} />
            Back to All Tests
          </button>
        </div>
      </motion.div>

      {/* detailed review */}
      <div className="mt-6">
        <h4 className="font-display text-[15px] font-bold text-ink">Answer Review</h4>
        <div className="mt-4 space-y-3">
          {test.questions.map((q, i) => {
            const a = result.answers.find((ans) => ans.questionId === q.id);
            const isCorrect = a?.selectedIndex === q.correctIndex;
            const isOpen = expanded === q.id;

            return (
              <div key={q.id} className="overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-soft">
                <button
                  onClick={() => setExpanded(isOpen ? null : q.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    {a?.selectedIndex === null || a?.selectedIndex === undefined ? (
                      <MinusCircle size={18} className="shrink-0 text-muted" />
                    ) : isCorrect ? (
                      <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
                    ) : (
                      <XCircle size={18} className="shrink-0 text-rose-500" />
                    )}
                    <span className="text-[13.5px] font-semibold text-ink">
                      {i + 1}. {q.text}
                    </span>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-muted"
                  >
                    <ChevronDown size={16} />
                  </motion.span>
                </button>

                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="border-t border-ink/5 px-5 pb-5 pt-4"
                  >
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => {
                        const isYourAnswer = a?.selectedIndex === oi;
                        const isCorrectAnswer = q.correctIndex === oi;
                        return (
                          <div
                            key={oi}
                            className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px] ${
                              isCorrectAnswer
                                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                : isYourAnswer
                                ? "border-rose-300 bg-rose-50 text-rose-800"
                                : "border-ink/5 bg-surface text-charcoal"
                            }`}
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-bold">
                              {String.fromCharCode(65 + oi)}
                            </span>
                            {opt}
                            {isCorrectAnswer && (
                              <span className="ml-auto text-[11px] font-bold">Correct</span>
                            )}
                            {isYourAnswer && !isCorrectAnswer && (
                              <span className="ml-auto text-[11px] font-bold">Your Answer</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-3 rounded-xl bg-purple/5 px-3.5 py-3 text-[12.5px] leading-relaxed text-charcoal">
                      <span className="font-bold text-purple">Explanation: </span>
                      {q.explanation}
                    </p>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
