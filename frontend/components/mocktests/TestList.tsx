"use client";

import { Clock, ListChecks, TrendingUp, ChevronRight, History } from "lucide-react";
import type { MockTest, AttemptResult } from "./testData";

const DIFFICULTY_STYLES: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-rose-100 text-rose-700",
};

export default function TestList({
  tests,
  history,
  onSelect,
}: {
  tests: MockTest[];
  history: AttemptResult[];
  onSelect: (test: MockTest) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold text-ink">Choose a mock test</h3>
          <p className="mt-1 text-[13.5px] text-muted">
            Objective-type assessments, auto-graded instantly with a full performance report.
          </p>
        </div>
        {history.length > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-purple/8 px-3.5 py-1.5 text-[12.5px] font-semibold text-purple">
            <History size={14} />
            {history.length} past attempt{history.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {tests.map((t) => {
          const best = history
            .filter((h) => h.testId === t.id)
            .reduce<number | null>(
              (max, h) => (max === null ? h.scorePercentage : Math.max(max, h.scorePercentage)),
              null
            );

          return (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              className="group flex flex-col rounded-xl3 border border-ink/5 bg-white p-6 text-left shadow-soft transition-all hover:-translate-y-1 hover:border-purple/30 hover:shadow-card"
            >
              <div className="flex items-start justify-between">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${DIFFICULTY_STYLES[t.difficulty]}`}
                >
                  {t.difficulty}
                </span>
                <ChevronRight
                  size={18}
                  className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-purple"
                />
              </div>

              <h4 className="font-display mt-4 text-[16px] font-bold text-ink">{t.title}</h4>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{t.description}</p>

              <div className="mt-5 flex items-center gap-4 text-[12.5px] text-muted">
                <span className="flex items-center gap-1.5">
                  <ListChecks size={14} />
                  {t.questions.length} Qs
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {t.durationMinutes} min
                </span>
              </div>

              {best !== null && (
                <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-surface px-3 py-2 text-[12px] font-semibold text-charcoal">
                  <TrendingUp size={13} className="text-purple" />
                  Best score: {best}%
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
