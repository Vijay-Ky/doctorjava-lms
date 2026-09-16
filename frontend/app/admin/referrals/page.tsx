'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageShell from '@/components/lms/PageShell';
import { lmsFetch, hasAdminAccess, getCurrentUser, isLoggedIn } from '@/lib/lms/api';

type Row = {
  referrerUserId: string;
  referrerName?: string;
  referrerEmail?: string;
  signups: number;
  convertedPayers: number;
  revenuePaise: number;
};

export default function ReferralsAdminPage() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    if (!isLoggedIn() || !hasAdminAccess(getCurrentUser()?.role)) {
      location.href = '/login?next=/admin/referrals';
      return;
    }
    lmsFetch<Row[]>('/api/admin/referrals/summary').then(setRows).catch(() => {});
  }, []);
  return (
    <PageShell>
      <main className="mx-auto max-w-5xl px-5 py-8">
        <Link href="/admin" className="text-sm font-semibold text-muted">
          ← Admin
        </Link>
        <h1 className="font-display mt-3 text-3xl font-bold">Referral attribution</h1>
        <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          Attribution only — signups and revenue from <code>?ref=userId</code>. Payout/commission automation is a future
          phase.
        </p>
        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Referrer</th>
                <th className="px-4 py-3">Signups</th>
                <th className="px-4 py-3">Converted</th>
                <th className="px-4 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.referrerUserId} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{r.referrerName || r.referrerUserId.slice(0, 8)}</div>
                    <div className="text-xs text-muted">{r.referrerEmail}</div>
                  </td>
                  <td className="px-4 py-3">{r.signups}</td>
                  <td className="px-4 py-3">{r.convertedPayers}</td>
                  <td className="px-4 py-3">₹{(r.revenuePaise / 100).toLocaleString('en-IN')}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No referral data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </PageShell>
  );
}
