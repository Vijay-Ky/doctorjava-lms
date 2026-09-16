'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PageShell from '@/components/lms/PageShell';
import CodingTestRunner from '@/components/codingtest/CodingTestRunner';
import CodingResultsView from '@/components/codingtest/CodingResultsView';
import type { AttemptStart, FinishResponse } from '@/lib/codingApi';

export default function CodingAssessmentPage() {
  const params = useParams();
  const attemptId = Number(params.attemptId);
  const [attempt, setAttempt] = useState<AttemptStart | null>(null);
  const [result, setResult] = useState<FinishResponse | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`coding-attempt-${attemptId}`);
    if (raw) {
      try {
        setAttempt(JSON.parse(raw));
      } catch {
        setAttempt(null);
      }
    }
  }, [attemptId]);

  if (result) {
    return (
      <PageShell>
        <CodingResultsView result={result} />
      </PageShell>
    );
  }

  if (!attempt) {
    return (
      <PageShell>
        <main className="mx-auto max-w-lg px-5 py-20 text-center">
          <h1 className="font-display text-xl font-bold">Attempt not found</h1>
          <p className="mt-2 text-sm text-muted">
            Start a coding test from the list — attempts are tied to your current session.
          </p>
          <a href="/coding-tests" className="mt-6 inline-block text-sm font-bold text-purple">
            ← Coding tests
          </a>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <CodingTestRunner attempt={attempt} onFinished={setResult} />
    </PageShell>
  );
}
