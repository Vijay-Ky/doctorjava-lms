'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Award } from 'lucide-react';
import PageShell from '@/components/lms/PageShell';
import { getCurrentUser, lmsFetch } from '@/lib/lms/api';

type C = {
  course_id: string;
  course_name: string;
  description: string;
  instructor: string;
  price?: number;
};

type ProgressMap = Record<string, number>;

export default function Learnings() {
  const [courses, setCourses] = useState<C[]>([]);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u?.id) {
      location.href = '/login';
      return;
    }
    (async () => {
      try {
        const list = await lmsFetch<C[]>(`/api/learning/${u.id}`);
        setCourses(list);
        const map: ProgressMap = {};
        await Promise.all(
          list.map(async (c) => {
            try {
              const p = await lmsFetch<number>(`/api/progress/${u.id}/${c.course_id}`);
              map[c.course_id] = typeof p === 'number' ? p : 0;
            } catch {
              map[c.course_id] = 0;
            }
          })
        );
        setProgress(map);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <PageShell>
      <main className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-purple">Learning</p>
            <h1 className="mt-2 font-display text-3xl font-bold">My Learning</h1>
            <p className="mt-2 text-sm text-slate-500">
              Your enrolled courses and learning progress.
            </p>
          </div>
          <Link
            href="/courses"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold"
          >
            Browse courses
          </Link>
        </div>

        {loading ? (
          <div className="mt-8 text-sm text-slate-500">Loading…</div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => {
              const pct = Math.min(100, Math.round(progress[c.course_id] || 0));
              const done = pct >= 100;
              return (
                <div
                  key={c.course_id}
                  className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple/10 text-purple">
                      <BookOpen size={18} />
                    </div>
                    {done && (
                      <Link
                        href={`/certificate/${c.course_id}`}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"
                      >
                        <Award size={12} /> Certificate
                      </Link>
                    )}
                  </div>
                  <h2 className="mt-4 font-display text-xl font-bold">{c.course_name}</h2>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-slate-500">
                    {c.description}
                  </p>
                  <div className="mt-4 text-xs font-semibold text-slate-500">{c.instructor}</div>

                  <div className="mt-5">
                    <div className="mb-1.5 flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-purple">{pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple to-indigo-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/course/${c.course_id}`}
                    className="mt-5 text-sm font-bold text-purple"
                  >
                    {done ? 'Review course →' : 'Continue learning →'}
                  </Link>
                </div>
              );
            })}

            {courses.length === 0 && (
              <div className="col-span-full rounded-3xl border border-dashed p-12 text-center text-sm text-slate-500">
                No enrolled courses.{' '}
                <Link className="font-semibold text-purple" href="/courses">
                  Browse courses
                </Link>
                .
              </div>
            )}
          </div>
        )}
      </main>
    </PageShell>
  );
}
