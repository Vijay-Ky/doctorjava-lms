'use client';
import Link from 'next/link';
import PageShell from '@/components/lms/PageShell';

export default function PaymentCancel() {
  return (
    <PageShell>
      <main className="mx-auto max-w-lg px-5 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">Payment cancelled</h1>
        <p className="mt-4 text-slate-600">No charge was made. You can try again from the course page.</p>
        <Link href="/courses" className="mt-8 inline-block text-sm font-bold text-purple">
          ← Back to courses
        </Link>
      </main>
    </PageShell>
  );
}
