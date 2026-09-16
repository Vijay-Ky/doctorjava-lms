'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PageShell from '@/components/lms/PageShell';
import { lmsFetch, getCurrentUser } from '@/lib/lms/api';

function SuccessInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [msg, setMsg] = useState('Confirming payment…');

  useEffect(() => {
    const u = getCurrentUser();
    if (!u?.token) {
      router.push('/login');
      return;
    }
    const sessionId = sp.get('session_id');
    const orderId = sp.get('orderId');
    (async () => {
      try {
        if (sessionId) {
          await lmsFetch('/api/payments/stripe/confirm', {
            method: 'POST',
            body: JSON.stringify({ sessionId }),
          });
          setMsg('Payment successful. You are enrolled!');
        } else if (orderId) {
          await lmsFetch('/api/payments/mock-complete', {
            method: 'POST',
            body: JSON.stringify({ orderId }),
          });
          setMsg('Enrollment completed.');
        } else {
          setMsg('Payment received. Open My Learning to continue.');
        }
      } catch (e: any) {
        setMsg(e.message || 'Could not confirm payment');
      }
    })();
  }, [sp, router]);

  return (
    <PageShell>
      <main className="mx-auto max-w-lg px-5 py-16 text-center">
        <h1 className="font-display text-3xl font-bold">Payment</h1>
        <p className="mt-4 text-slate-600">{msg}</p>
        <Link href="/learnings" className="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-white">
          Go to My Learning
        </Link>
      </main>
    </PageShell>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense>
      <SuccessInner />
    </Suspense>
  );
}
