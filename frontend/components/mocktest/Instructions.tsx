"use client";

import { motion } from "framer-motion";
import { Clock, Target, AlertTriangle, ListChecks, ArrowRight } from "lucide-react";
import type { MockTest } from "@/lib/mockTestData";

export default function Instructions({
  test,
  onStart,
}: {
  test: MockTest;
  onStart: () => void;
}) {
  const maxScore = test.questions.length * test.marksPerQuestion;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-3xl"
    >
      <div className="rounded-xl4 border border-ink/5 bg-white p-8 shadow-card md:p-10">
        <span className="rounded-full bg-purple/10 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wide text-purple">
          {test.category}
        </span>
        <h1 className="font-display mt-4 text-2xl font-bold text-ink md:text-3xl">
          {test.title}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{test.description}</p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Clock, label: `${test.durationMinutes} min`, sub: "Duration" },
            { icon: ListChecks, label: `${test.questions.length}`, sub: "Questions" },
            { icon: Target, label: `${maxScore}`, sub: "Max Marks" },
            { icon: AlertTriangle, label: `-${test.negativeMarks}`, sub: "Per wrong answer" },
          ].map((s) => (
            <div key={s.sub} className="rounded-2xl border border-ink/5 bg-surface p-4 text-center">
              <s.icon size={18} className="mx-auto text-purple" />
              <div className="font-display mono-num mt-2 text-lg font-bold text-ink">{s.label}</div>
              <div className="text-[11px] font-medium text-muted">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-ink/5 bg-surface p-6">
          <h3 className="font-display text-sm font-bold text-ink">Instructions</h3>
          <ul className="mt-4 space-y-2.5 text-[13.5px] leading-relaxed text-charcoal/80">
            <li>• Each question has exactly one correct answer out of 4 options.</li>
            <li>
              • Scoring: +{test.marksPerQuestion} for a correct answer, −{test.negativeMarks} for
              a wrong answer, 0 for a skipped question.
            </li>
            <li>• You need {test.passPercentage}% of the maximum marks to pass.</li>
            <li>• The timer starts as soon as you click "Begin Test" and auto-submits at zero.</li>
            <li>
              • Use the question palette to jump between questions, mark items for review, and
              track your progress at any point.
            </li>
            <li>• You can change or clear your answer any number of times before submitting.</li>
          </ul>
        </div>

        <button
          onClick={onStart}
          className="group mt-8 flex w-full items-center justify-center gap-2 rounded-full px-7 py-4 text-[15px] font-semibold text-white shadow-glow shimmer-btn animate-shimmer sm:w-auto"
        >
          Begin Test
          <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}
