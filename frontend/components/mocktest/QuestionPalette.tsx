"use client";

import { CheckCircle2, Flag, HelpCircle, Circle } from "lucide-react";
import type { QuestionStatus } from "@/lib/useMockTestEngine";

const STATUS_STYLES: Record<QuestionStatus, string> = {
  unvisited: "bg-white border-ink/10 text-charcoal/50",
  unanswered: "bg-red-50 border-red-200 text-red-600",
  answered: "bg-emerald-500 border-emerald-500 text-white",
  marked: "bg-purple border-purple text-white",
  "answered-marked": "bg-purple border-purple text-white",
};

export default function QuestionPalette({
  total,
  currentIndex,
  getStatus,
  onJump,
}: {
  total: number;
  currentIndex: number;
  getStatus: (index: number) => QuestionStatus;
  onJump: (index: number) => void;
}) {
  return (
    <div className="rounded-xl3 border border-ink/5 bg-surface p-5">
      <h3 className="font-display text-sm font-bold text-ink">Question Palette</h3>

      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5">
        {Array.from({ length: total }).map((_, i) => {
          const status = getStatus(i);
          return (
            <button
              key={i}
              onClick={() => onJump(i)}
              aria-label={`Go to question ${i + 1}`}
              aria-current={currentIndex === i}
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg border text-[12.5px] font-bold transition-transform hover:-translate-y-0.5 ${
                STATUS_STYLES[status]
              } ${currentIndex === i ? "ring-2 ring-offset-2 ring-ink/70" : ""}`}
            >
              {i + 1}
              {status === "answered-marked" && (
                <CheckCircle2 size={11} className="absolute -bottom-1 -right-1 rounded-full bg-white text-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-2 border-t border-ink/5 pt-4 text-[11.5px] font-medium text-charcoal/70">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-emerald-500" /> Answered
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-red-200 bg-red-50" /> Not Answered
        </div>
        <div className="flex items-center gap-2">
          <Flag size={12} className="text-purple" /> Marked for Review
        </div>
        <div className="flex items-center gap-2">
          <Circle size={12} className="text-charcoal/30" /> Not Visited
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl bg-purple/5 p-3 text-[11px] leading-relaxed text-charcoal/60">
        <HelpCircle size={14} className="mt-0.5 shrink-0 text-purple" />
        Answering questions marked for review still counts them toward your score — the flag is just a personal reminder to revisit.
      </div>
    </div>
  );
}
