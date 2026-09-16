'use client';
import { useEffect, useState } from 'react';
import PageShell from '@/components/lms/PageShell';
import { lmsFetch } from '@/lib/lms/api';

type Row = { studentKey: string; learnerName?: string; averageScorePercent: number; attempts: number };

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    lmsFetch<Row[]>('/api/leaderboard/overall?limit=25', {}, false).then(setRows).catch(() => {});
  }, []);
  return (
    <PageShell>
      <main className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold text-ink">Leaderboard</h1>
        <p className="mt-2 text-sm text-muted">Top learners by average mock / practice score.</p>
        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Learner</th>
                <th className="px-4 py-3">Avg score</th>
                <th className="px-4 py-3">Attempts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.studentKey} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-bold text-purple">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-ink">{r.learnerName || r.studentKey.slice(0, 8) + "…"}</td>
                  <td className="px-4 py-3 font-semibold">{r.averageScorePercent}%</td>
                  <td className="px-4 py-3">{r.attempts}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No ranked attempts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </PageShell>
  );
}
