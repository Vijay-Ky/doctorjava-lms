'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import PageShell from '@/components/lms/PageShell';
import { lmsFetch } from '@/lib/lms/api';

type Analytics = {
  enrollments: { total: number; last30Days: number; trend: { date: string; count: number }[] };
  completion: { averagePercent: number; distribution: { bucket: string; count: number }[] };
  assessment: { averageMarks: number; passRatePercent: number; attempts: number };
  revenue: { totalPaise: number; couponsRedeemed: number };
  dropOffByLecture: { lectureId: string; title: string; reachedCount: number; completedCount: number }[];
};

export default function CourseAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    lmsFetch<Analytics>(`/api/admin/analytics/courses/${id}`)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [id]);
  return (
    <PageShell>
      <main className="mx-auto max-w-5xl px-5 py-8">
        <Link href="/admin/courses" className="text-sm font-semibold text-muted">
          ← Courses
        </Link>
        <h1 className="font-display mt-3 text-3xl font-bold">Course analytics</h1>
        {error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        {data && (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              <Card label="Enrollments" value={String(data.enrollments.total)} />
              <Card label="Avg completion" value={`${data.completion.averagePercent}%`} />
              <Card label="Pass rate" value={`${data.assessment.passRatePercent}%`} />
              <Card label="Revenue" value={`₹${(data.revenue.totalPaise / 100).toLocaleString('en-IN')}`} />
            </div>
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">Enrollment trend (7d)</h2>
              <div className="mt-4 flex items-end gap-2 h-32">
                {data.enrollments.trend.map((t) => (
                  <div key={t.date} className="flex flex-1 flex-col items-center justify-end">
                    <div
                      className="w-full rounded-t bg-purple/80"
                      style={{ height: `${Math.max(4, t.count * 20)}px` }}
                    />
                    <span className="mt-1 text-[9px] text-muted">{t.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">Drop-off by lecture</h2>
              <ul className="mt-4 space-y-2 text-sm">
                {data.dropOffByLecture.map((d) => (
                  <li key={d.lectureId} className="flex justify-between border-b border-slate-50 py-2">
                    <span>{d.title}</span>
                    <span className="text-muted">
                      reached {d.reachedCount} · completed {d.completedCount}
                    </span>
                  </li>
                ))}
                {data.dropOffByLecture.length === 0 && (
                  <li className="text-muted">No lecture progress recorded yet.</li>
                )}
              </ul>
            </section>
          </>
        )}
      </main>
    </PageShell>
  );
}
function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
      <p className="text-[11px] font-bold uppercase text-muted">{label}</p>
      <p className="font-display mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
