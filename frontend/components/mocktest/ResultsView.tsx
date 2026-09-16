"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  MinusCircle,
  RotateCcw,
  ArrowLeft,
  ListFilter,
} from "lucide-react";
import Link from "next/link";
import type { MockTest } from "@/lib/mockTestData";
import type { Attempt } from "@/lib/mockTestAttempts";

type FilterKey = "all" | "correct" | "incorrect" | "skipped";

function formatDuration(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}m ${s}s`;
}

export default function ResultsView({
  test,
  attempt,
  history,
  onRetake,
}: {
  test: MockTest;
  attempt: Attempt;
  history: Attempt[];
  onRetake: () => void;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const topicBreakdown = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>();
    for (const q of test.questions) {
      const entry = map.get(q.topic) ?? { correct: 0, total: 0 };
      entry.total += 1;
      if (attempt.answers[q.id] === q.correctIndex) entry.correct += 1;
      map.set(q.topic, entry);
    }
    return Array.from(map.entries()).map(([topic, v]) => ({ topic, ...v }));
  }, [test.questions, attempt.answers]);

  const filteredQuestions = useMemo(() => {
    return test.questions.filter((q) => {
      const given = attempt.answers[q.id];
      if (filter === "all") return true;
      if (filter === "skipped") return given === null || given === undefined;
      if (filter === "correct") return given === q.correctIndex;
      if (filter === "incorrect") return given !== null && given !== undefined && given !== q.correctIndex;
      return true;
    });
  }, [test.questions, attempt.answers, filter]);

  return (
    <div className="space-y-8">
      {/* score summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl4 border border-ink/5 bg-white p-7 shadow-card md:p-9"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
                attempt.passed ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
              }`}
            >
              <Trophy size={28} />
            </div>
            <div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                  attempt.passed ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                }`}
              >
                {attempt.passed ? "Passed" : "Not Passed"}
              </span>
              <h2 className="font-display mt-1.5 text-2xl font-bold text-ink">
                {test.title} — Result
              </h2>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display mono-num text-4xl font-bold text-ink">
              <CountUp end={attempt.score} duration={1.2} />
              <span className="text-lg text-muted">/{attempt.maxScore}</span>
            </div>
            <div className="text-[12.5px] font-medium text-muted">
              {attempt.percentage}% score · pass mark {test.passPercentage}%
            </div>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { icon: CheckCircle2, label: "Correct", value: attempt.correctCount, color: "text-emerald-600" },
            { icon: XCircle, label: "Incorrect", value: attempt.incorrectCount, color: "text-red-500" },
            { icon: MinusCircle, label: "Skipped", value: attempt.unattemptedCount, color: "text-charcoal/50" },
            { icon: Target, label: "Accuracy", value: `${attempt.accuracy}%`, color: "text-purple" },
            { icon: Clock, label: "Time Taken", value: formatDuration(attempt.timeTakenSec), color: "text-gold" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-ink/5 bg-surface p-4 text-center">
              <s.icon size={18} className={`mx-auto ${s.color}`} />
              <div className="font-display mono-num mt-2 text-base font-bold text-ink">{s.value}</div>
              <div className="text-[11px] font-medium text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            onClick={onRetake}
            className="group flex items-center gap-2 rounded-full px-6 py-3 text-[13.5px] font-semibold text-white shadow-glow shimmer-btn animate-shimmer"
          >
            <RotateCcw size={15} />
            Retake Test
          </button>
          <Link
            href="/mock-tests"
            className="flex items-center gap-2 rounded-full border border-ink/10 px-6 py-3 text-[13.5px] font-semibold text-charcoal transition-colors hover:border-purple/30"
          >
            <ArrowLeft size={15} />
            All Mock Tests
          </Link>
        </div>
      </motion.div>

      {/* topic-wise breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        className="rounded-xl3 border border-ink/5 bg-white p-7 shadow-soft"
      >
        <h3 className="font-display text-base font-bold text-ink">Topic-wise Breakdown</h3>
        <div className="mt-5 space-y-4">
          {topicBreakdown.map((t) => (
            <div key={t.topic}>
              <div className="flex items-center justify-between text-[13px] font-semibold text-charcoal">
                <span>{t.topic}</span>
                <span className="mono-num text-muted">
                  {t.correct}/{t.total}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/5">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple to-gold"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(t.correct / t.total) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* attempt history */}
      {history.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="rounded-xl3 border border-ink/5 bg-white p-7 shadow-soft"
        >
          <h3 className="font-display text-base font-bold text-ink">Your Attempt History</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-[13px]">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wide text-muted">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Accuracy</th>
                  <th className="pb-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((a, i) => (
                  <tr key={i} className="border-t border-ink/5">
                    <td className="py-2.5 text-charcoal/70">
                      {new Date(a.completedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 font-semibold text-ink">
                      {a.score}/{a.maxScore}
                    </td>
                    <td className="py-2.5 text-charcoal/70">{a.accuracy}%</td>
                    <td className="py-2.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          a.passed ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {a.passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* answer review */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        className="rounded-xl3 border border-ink/5 bg-white p-7 shadow-soft"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-base font-bold text-ink">Answer Review</h3>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: "all", label: "All" },
                { key: "correct", label: "Correct" },
                { key: "incorrect", label: "Incorrect" },
                { key: "skipped", label: "Skipped" },
              ] as { key: FilterKey; label: string }[]
            ).map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                  filter === f.key ? "bg-ink text-white" : "bg-surface text-charcoal/70 hover:text-purple"
                }`}
              >
                {f.key === "all" && <ListFilter size={13} />}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {filteredQuestions.map((q) => {
            const given = attempt.answers[q.id];
            const isSkipped = given === null || given === undefined;
            const isCorrect = given === q.correctIndex;
            return (
              <div key={q.id} className="rounded-2xl border border-ink/5 bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-[14.5px] font-semibold leading-snug text-ink">
                    {q.text}
                  </p>
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                      isSkipped
                        ? "bg-charcoal/10 text-charcoal/60"
                        : isCorrect
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {isSkipped ? <MinusCircle size={12} /> : isCorrect ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {isSkipped ? "Skipped" : isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {q.options.map((opt, i) => {
                    const isCorrectOpt = i === q.correctIndex;
                    const isGivenOpt = i === given;
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px] font-medium ${
                          isCorrectOpt
                            ? "border-emerald-300 bg-emerald-500/8 text-emerald-700"
                            : isGivenOpt
                            ? "border-red-300 bg-red-500/8 text-red-600"
                            : "border-ink/10 bg-white text-charcoal/70"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                            isCorrectOpt
                              ? "border-emerald-400 bg-emerald-500 text-white"
                              : isGivenOpt
                              ? "border-red-400 bg-red-500 text-white"
                              : "border-ink/20 text-muted"
                          }`}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                        {isCorrectOpt && <span className="ml-auto text-[11px] font-bold">Correct answer</span>}
                        {isGivenOpt && !isCorrectOpt && <span className="ml-auto text-[11px] font-bold">Your answer</span>}
                      </div>
                    );
                  })}
                </div>

                <p className="mt-3.5 rounded-xl bg-purple/5 px-4 py-3 text-[12.5px] leading-relaxed text-charcoal/70">
                  <span className="font-bold text-purple">Why: </span>
                  {q.explanation}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
