'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageShell from '@/components/lms/PageShell';
import { lmsFetch, hasAdminAccess, getCurrentUser, isLoggedIn } from '@/lib/lms/api';
import {
  Users, BookOpen, FileQuestion, IndianRupee, Layers, LayoutDashboard,
  ClipboardList, ArrowRight, Upload, Code2,
} from 'lucide-react';

type Summary = {
  totals: { users: number; courses: number; publishedQuestions: number; draftQuestions: number; mockTests: number };
  enrollments: { total: number; last7Days: number; last30Days: number; trend: { date: string; count: number }[] };
  revenue: { totalPaise: number; last30DaysPaise: number; byPaymentProvider: { razorpay: number; stripe: number } };
  assessments: { totalAttempts: number; passRatePercent: number; averageScorePercent: number };
  mockTests: { totalAttempts: number; mostAttempted: { testId: number; title?: string; attempts: number }[] };
  recentSignups: { userId: string; name: string; email: string; createdAt?: string }[];
};

const ACTIONS = [
  { href: '/admin/courses', title: 'Course Management', text: 'Create and edit courses, curriculum, pricing.', icon: BookOpen },
  { href: '/admin/users', title: 'User Management', text: 'Learners, roles, activate/deactivate accounts.', icon: Users },
  { href: '/admin/question-bank', title: 'Question Bank', text: 'Technical MCQ and code-output questions.', icon: FileQuestion },
  { href: '/admin/mcq-import', title: 'Bulk MCQ import', text: 'Import assignment-style .txt question banks.', icon: Upload },
  { href: '/admin/mock-tests', title: 'Mock Tests', text: 'Build timed MCQ tests from published questions.', icon: Layers },
  { href: '/admin/coding-questions', title: 'Coding questions', text: 'HackerRank-style problems (Java).', icon: Code2 },
  { href: '/admin/coding-tests', title: 'Coding tests', text: 'Timed coding assessments from coding questions.', icon: Code2 },
  { href: '/admin/course-questions', title: 'Course Assessment Questions', text: 'Questions attached to course assessments.', icon: ClipboardList },
  { href: '/admin/coupons', title: 'Coupons', text: 'Discount codes for checkout.', icon: IndianRupee },
  { href: '/admin/referrals', title: 'Referrals', text: 'Attribution report (no payouts yet).', icon: Users },
];

export default function AdminDashboardPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn() || !hasAdminAccess(getCurrentUser()?.role)) {
      location.href = '/login?next=/admin';
      return;
    }
    lmsFetch<Summary>('/api/dashboard/admin/summary')
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  const inr = (paise: number) => `₹${(paise / 100).toLocaleString('en-IN')}`;

  return (
    <PageShell>
      <main className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <div className="flex items-center gap-2 text-purple">
          <LayoutDashboard size={18} />
          <span className="text-xs font-bold uppercase tracking-[0.14em]">Admin</span>
        </div>
        <h1 className="font-display mt-2 text-3xl font-bold text-ink">Admin dashboard</h1>
        <p className="mt-1 text-sm text-muted">LMS, practice, users, and revenue in one place.</p>

        {error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

        {data && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Mini label="Users" value={String(data.totals.users)} />
              <Mini label="Courses" value={String(data.totals.courses)} />
              <Mini label="Published Qs" value={String(data.totals.publishedQuestions)} />
              <Mini label="Revenue" value={inr(data.revenue.totalPaise)} />
              <Mini label="Mock attempts" value={String(data.mockTests.totalAttempts)} />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                <p className="text-xs font-bold uppercase text-muted">Enrollments</p>
                <p className="font-display mt-2 text-2xl font-bold">{data.enrollments.total}</p>
                <p className="mt-1 text-xs text-muted">Pass rate {data.assessments.passRatePercent}%</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                <p className="text-xs font-bold uppercase text-muted">Assessments</p>
                <p className="font-display mt-2 text-2xl font-bold">{data.assessments.totalAttempts}</p>
                <p className="mt-1 text-xs text-muted">Avg score {data.assessments.averageScorePercent}</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
                <p className="text-xs font-bold uppercase text-muted">30d revenue</p>
                <p className="font-display mt-2 text-2xl font-bold">{inr(data.revenue.last30DaysPaise)}</p>
                <p className="mt-1 text-xs text-muted">
                  Razorpay {inr(data.revenue.byPaymentProvider.razorpay)} · Stripe{' '}
                  {inr(data.revenue.byPaymentProvider.stripe)}
                </p>
              </div>
            </div>
          </>
        )}

        <h2 className="font-display mt-10 text-xl font-bold text-ink">Quick actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition hover:border-purple/30"
            >
              <a.icon className="text-purple" size={22} />
              <h3 className="font-display mt-4 text-lg font-bold text-ink group-hover:text-purple">
                {a.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{a.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-purple">
                Open <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>

        {data && data.recentSignups.length > 0 && (
          <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold text-ink">Recent signups</h2>
            <ul className="mt-4 divide-y divide-slate-100 text-sm">
              {data.recentSignups.map((u) => (
                <li key={u.userId} className="flex justify-between gap-3 py-2">
                  <span>
                    <b>{u.name}</b> <span className="text-muted">{u.email}</span>
                  </span>
                  <span className="text-xs text-muted">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </PageShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="font-display mt-1 text-xl font-bold text-ink">{value}</p>
    </div>
  );
}
