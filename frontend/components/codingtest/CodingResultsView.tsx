'use client';

import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { FinishResponse } from '@/lib/codingApi';

export default function CodingResultsView({ result }: { result: FinishResponse }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div
        className={`rounded-3xl border p-8 text-center shadow-soft ${
          result.passed
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-amber-200 bg-amber-50'
        }`}
      >
        <div className="flex justify-center">
          {result.passed ? (
            <CheckCircle2 className="text-emerald-600" size={40} />
          ) : (
            <XCircle className="text-amber-600" size={40} />
          )}
        </div>
        <h1 className="font-display mt-3 text-2xl font-bold text-ink">
          {result.passed ? 'Passed' : 'Not passed'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Score {result.score} / {result.maxScore} ({result.percentage}%) · Time{' '}
          {Math.floor(result.timeTakenSeconds / 60)}m {result.timeTakenSeconds % 60}s
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Question</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Cases</th>
              <th className="px-4 py-3">Marks</th>
            </tr>
          </thead>
          <tbody>
            {result.questionScores.map((q) => (
              <tr key={q.attemptQuestionId} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium">{q.title}</td>
                <td className="px-4 py-3 text-xs font-semibold">{q.status}</td>
                <td className="px-4 py-3">
                  {q.passed}/{q.total}
                </td>
                <td className="px-4 py-3">
                  {q.awardedMarks}/{q.maxMarks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/mock-tests"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-purple"
        >
          Back to tests
        </Link>
      </div>
    </div>
  );
}
