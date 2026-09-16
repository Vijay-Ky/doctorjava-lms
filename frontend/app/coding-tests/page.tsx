'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Code2, Clock, ListOrdered } from 'lucide-react';
import PageShell from '@/components/lms/PageShell';
import { codingApi, type CodingTestCard } from '@/lib/codingApi';
import { getCurrentUser } from '@/lib/lms/api';

export default function CodingTestsPage() {
  const [tests, setTests] = useState<CodingTestCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    codingApi
      .listTests()
      .then(setTests)
      .catch(() => setTests([]))
      .finally(() => setLoading(false));
  }, []);

  async function start(id: number) {
    const u = getCurrentUser();
    if (!u?.id) {
      location.href = '/login?next=/coding-tests';
      return;
    }
    try {
      const attempt = await codingApi.start(id);
      sessionStorage.setItem(`coding-attempt-${attempt.attemptId}`, JSON.stringify(attempt));
      location.href = `/coding-assessment/${attempt.attemptId}`;
    } catch (e: any) {
      alert(e.message || 'Could not start test');
    }
  }

  return (
    <PageShell>
      <main className="mx-auto max-w-5xl px-5 py-10">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-purple">Practice</p>
        <h1 className="font-display mt-2 text-3xl font-bold text-ink">Coding assessments</h1>
        <p className="mt-2 text-sm text-muted">
          HackerRank-style problems — write Java, run against samples, submit for hidden tests.
        </p>

        {loading && <p className="mt-8 text-sm text-muted">Loading…</p>}
        {!loading && tests.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-muted">
            No published coding tests yet. Ask an admin to create one under Admin → Coding tests.
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {tests.map((t) => (
            <div
              key={t.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-purple">
                    {t.subject || 'Coding'} · {t.difficulty}
                  </div>
                  <h2 className="font-display mt-2 text-lg font-bold text-ink">{t.title}</h2>
                  {t.description && (
                    <p className="mt-2 text-sm leading-6 text-muted line-clamp-3">{t.description}</p>
                  )}
                </div>
                <Code2 className="text-purple" size={22} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1.5">
                  <ListOrdered size={12} /> {t.totalQuestions} problems
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1.5">
                  <Clock size={12} /> {t.durationMinutes} min
                </span>
                <span className="rounded-full bg-purple/5 px-3 py-1.5 text-purple">
                  Pass {t.passPercentage}%
                </span>
              </div>
              <button
                onClick={() => start(t.id)}
                className="mt-5 w-full rounded-full bg-ink py-2.5 text-sm font-bold text-white hover:bg-purple"
              >
                Start coding test
              </button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          Looking for MCQ practice?{' '}
          <Link href="/practice" className="font-semibold text-purple hover:underline">
            Topic MCQs
          </Link>
        </p>
      </main>
    </PageShell>
  );
}
