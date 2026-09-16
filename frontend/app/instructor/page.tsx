'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageShell from '@/components/lms/PageShell';
import { lmsFetch, isInstructorOnly, hasInstructorAccess, getCurrentUser, isLoggedIn } from '@/lib/lms/api';

type Course = { course_id: string; course_name: string; price: number; instructor?: string };

export default function InstructorHome() {
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => {
    if (!isLoggedIn() || !hasInstructorAccess(getCurrentUser()?.role)) {
      location.href = '/login?next=/instructor';
      return;
    }
    lmsFetch<Course[]>('/api/instructor/courses').then(setCourses).catch(() => {});
  }, []);
  return (
    <PageShell>
      <main className="mx-auto max-w-5xl px-5 py-8">
        <h1 className="font-display text-3xl font-bold text-ink">Instructor workspace</h1>
        <p className="mt-1 text-sm text-muted">Courses assigned to you — curriculum, students, analytics, grading.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <div key={c.course_id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">{c.course_name}</h2>
              <p className="mt-1 text-xs text-muted">₹{c.price}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                <Link href={`/admin/courses/${c.course_id}/curriculum`} className="rounded-full bg-ink px-3 py-1.5 text-white">
                  Curriculum
                </Link>
                <Link href={`/admin/courses/${c.course_id}/analytics`} className="rounded-full border border-slate-200 px-3 py-1.5">
                  Analytics
                </Link>
                <Link href={`/course/${c.course_id}`} className="rounded-full border border-slate-200 px-3 py-1.5">
                  Learner view
                </Link>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-sm text-muted col-span-2">No courses assigned yet. Ask an admin to set you as instructor.</p>
          )}
        </div>
      </main>
    </PageShell>
  );
}
