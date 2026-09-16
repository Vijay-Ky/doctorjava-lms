'use client';
import PageShell from '@/components/lms/PageShell';
import PracticeClient from '@/components/practice/PracticeClient';

export default function PracticePage() {
  return (
    <PageShell>
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
        <div className="mb-8">
          <div className="inline-flex rounded-full bg-purple/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.14em] text-purple">
            Practice Center
          </div>
          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight text-ink md:text-4xl">Practice</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            <strong>Topic MCQs</strong> from the question bank and <strong>Mock Tests</strong> built by admin.
            Sign in to attempt — scores save to your dashboard history.
          </p>
        </div>
        <PracticeClient />
      </main>
    </PageShell>
  );
}
