'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageShell from '@/components/lms/PageShell';
import { lmsFetch, getCurrentUser, isLoggedIn, hasAdminAccess } from '@/lib/lms/api';
import { BookOpen, Award, Target, TrendingUp, ArrowRight } from 'lucide-react';

type Dash = {
  profile: { name: string; email: string; role: string };
  enrolledCoursesCount: number;
  completedCoursesCount: number;
  overallProgressPercent: number;
  certificatesEarned: number;
  averageAssessmentScore: number;
  continueLearning: { courseId: string; courseName: string; progressPercent: number }[];
  recentAssessments: { courseName: string; marks: number }[];
  recentMockTests: { title: string; scorePercent: number; attemptedAt: string }[];
  practiceStats: { totalAttempts: number; averageScorePercent: number };
  upcomingOrRecommended: { courseId: string; courseName: string }[];
};

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null);
  const [error, setError] = useState('');
  const user = getCurrentUser();

  useEffect(() => {
    if (!isLoggedIn()) {
      location.href = '/login?next=/dashboard';
      return;
    }
    if (hasAdminAccess(user?.role)) {
      // admins still can view learner dashboard, or bounce to /admin
    }
    lmsFetch<Dash>('/api/dashboard/user/me')
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <PageShell>
        <main className="mx-auto max-w-6xl px-5 py-10">
          <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
        </main>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell>
        <main className="mx-auto max-w-6xl px-5 py-16 text-center text-sm text-slate-500">Loading your dashboard…</main>
      </PageShell>
    );
  }

  const first = data.continueLearning[0];

  return (
    <PageShell>
      <main className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-purple">Dashboard</p>
            <h1 className="font-display mt-2 text-3xl font-bold text-ink">
              Welcome back, {data.profile.name || 'Learner'}
            </h1>
            <p className="mt-1 text-sm text-muted">
              <span className="rounded-full bg-purple/10 px-2 py-0.5 text-xs font-semibold text-purple">
                {data.profile.role}
              </span>
            </p>
          </div>
          {first ? (
            <Link
              href={`/course/${first.courseId}`}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-purple"
            >
              Continue learning <ArrowRight size={16} />
            </Link>
          ) : (
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-purple"
            >
              Browse courses <ArrowRight size={16} />
            </Link>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={<BookOpen size={18} />} label="Enrolled" value={String(data.enrolledCoursesCount)} />
          <Stat icon={<TrendingUp size={18} />} label="Overall progress" value={`${data.overallProgressPercent}%`} />
          <Stat icon={<Award size={18} />} label="Certificates" value={String(data.certificatesEarned)} />
          <Stat icon={<Target size={18} />} label="Avg assessment" value={`${data.averageAssessmentScore}`} />
        </div>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-ink">My courses</h2>
            <Link href="/learnings" className="text-sm font-semibold text-purple">
              See all →
            </Link>
          </div>
          {data.continueLearning.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-muted">
              No enrollments yet.{' '}
              <Link href="/courses" className="font-semibold text-purple">
                Explore courses
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.continueLearning.slice(0, 6).map((c) => (
                <Link
                  key={c.courseId}
                  href={`/course/${c.courseId}`}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft transition hover:border-purple/30"
                >
                  <h3 className="font-display font-bold text-ink line-clamp-2">{c.courseName}</h3>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-purple" style={{ width: `${c.progressPercent}%` }} />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-muted">{c.progressPercent}% complete</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink">Recent activity</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {data.recentMockTests.map((m, i) => (
                <li key={i} className="flex justify-between gap-3 border-b border-slate-50 pb-2">
                  <span className="text-charcoal">{m.title}</span>
                  <span className="font-semibold text-purple">{Math.round(m.scorePercent)}%</span>
                </li>
              ))}
              {data.recentAssessments.map((a, i) => (
                <li key={`a-${i}`} className="flex justify-between gap-3 border-b border-slate-50 pb-2">
                  <span className="text-charcoal">{a.courseName} assessment</span>
                  <span className="font-semibold">{a.marks} marks</span>
                </li>
              ))}
              {data.recentMockTests.length === 0 && data.recentAssessments.length === 0 && (
                <li className="text-muted">No recent activity. Try a practice test.</li>
              )}
            </ul>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink">Practice snapshot</h2>
            <p className="mt-3 text-sm text-muted">
              {data.practiceStats.totalAttempts} attempts · avg score {data.practiceStats.averageScorePercent}%
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/practice" className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-white">
                Open Practice
              </Link>
              <Link href="/leaderboard" className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-ink">
                Leaderboard
              </Link>
              <Link href="/performance" className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-ink">
                Performance
              </Link>
              <Link href="/profile" className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-ink">
                Profile
              </Link>
            </div>
          </section>
        </div>
      </main>
    </PageShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center gap-2 text-purple">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</span>
      </div>
      <div className="font-display mt-2 text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}
