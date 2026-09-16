"use client";

import { ArrowLeft, Clock, ListChecks, Target, ShieldCheck } from "lucide-react";
import type { MockTest } from "./testData";

export default function TestInstructions({
  test,
  onStart,
  onBack,
}: {
  test: MockTest;
  onStart: () => void;
  onBack: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-purple"
      >
        <ArrowLeft size={15} />
        Back to all tests
      </button>

      <div className="rounded-xl3 border border-ink/5 bg-white p-7 shadow-soft sm:p-9">
        <h3 className="font-display text-xl font-bold text-ink">{test.title}</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">{test.description}</p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-surface p-4 text-center">
            <ListChecks size={18} className="mx-auto text-purple" />
            <div className="font-display mt-2 text-lg font-bold text-ink">
              {test.questions.length}
            </div>
            <div className="text-[11px] text-muted">Questions</div>
          </div>
          <div className="rounded-2xl bg-surface p-4 text-center">
            <Clock size={18} className="mx-auto text-purple" />
            <div className="font-display mt-2 text-lg font-bold text-ink">
              {test.durationMinutes}
            </div>
            <div className="text-[11px] text-muted">Minutes</div>
          </div>
          <div className="rounded-2xl bg-surface p-4 text-center">
            <Target size={18} className="mx-auto text-purple" />
            <div className="font-display mt-2 text-lg font-bold text-ink">
              {test.passPercentage}%
            </div>
            <div className="text-[11px] text-muted">To Pass</div>
          </div>
        </div>

        <div className="mt-7 rounded-2xl border border-ink/5 bg-surface p-5">
          <div className="flex items-center gap-2 text-[13.5px] font-bold text-ink">
            <ShieldCheck size={16} className="text-purple" />
            Before you begin
          </div>
          <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-muted">
            <li>• Each question has exactly one correct option. There is no negative marking.</li>
            <li>• Use &ldquo;Mark for Review&rdquo; to flag questions and revisit them before submitting.</li>
            <li>• The test auto-submits when the timer reaches zero &mdash; keep an eye on the clock.</li>
            <li>• You can navigate freely between questions using the question palette on the right.</li>
            <li>• Once submitted, you&rsquo;ll get an instant score with a full answer-by-answer review.</li>
          </ul>
        </div>

        <button
          onClick={onStart}
          className="mt-8 w-full rounded-full px-7 py-4 text-[15px] font-semibold text-white shadow-glow shimmer-btn animate-shimmer"
        >
          Start Test
        </button>
      </div>
    </div>
  );
}
