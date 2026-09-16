'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageShell from '@/components/lms/PageShell';
import { lmsFetch, hasAdminAccess, getCurrentUser, isLoggedIn } from '@/lib/lms/api';

type Coupon = {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  scope: string;
  maxRedemptions?: number;
  redemptionCount: number;
  active: boolean;
  expiresAt?: string;
};

export default function CouponsAdminPage() {
  const [list, setList] = useState<Coupon[]>([]);
  const [form, setForm] = useState({
    code: '',
    discountType: 'PERCENT',
    discountValue: 10,
    scope: 'ALL_COURSES',
    courseId: '',
    maxRedemptions: '',
  });
  const [error, setError] = useState('');

  async function load() {
    setList(await lmsFetch<Coupon[]>('/api/admin/coupons'));
  }

  useEffect(() => {
    if (!isLoggedIn() || !hasAdminAccess(getCurrentUser()?.role)) {
      location.href = '/login?next=/admin/coupons';
      return;
    }
    load().catch((e) => setError(e.message));
  }, []);

  async function create() {
    try {
      await lmsFetch('/api/admin/coupons', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
          courseId: form.courseId || null,
        }),
      });
      setForm({ code: '', discountType: 'PERCENT', discountValue: 10, scope: 'ALL_COURSES', courseId: '', maxRedemptions: '' });
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function toggle(id: string, active: boolean) {
    await lmsFetch(`/api/admin/coupons/${id}`, { method: 'PATCH', body: JSON.stringify({ active: !active }) });
    await load();
  }

  return (
    <PageShell>
      <main className="mx-auto max-w-5xl px-5 py-8">
        <Link href="/admin" className="text-sm font-semibold text-muted">
          ← Admin
        </Link>
        <h1 className="font-display mt-3 text-3xl font-bold">Coupons</h1>
        <p className="mt-1 text-sm text-muted">Discount codes applied server-side at checkout.</p>
        {error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-display font-bold">Create coupon</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              placeholder="CODE"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="rounded-xl border px-3 py-2 text-sm"
            />
            <select
              value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              className="rounded-xl border px-3 py-2 text-sm"
            >
              <option value="PERCENT">Percent</option>
              <option value="FLAT">Flat (₹)</option>
            </select>
            <input
              type="number"
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
              className="rounded-xl border px-3 py-2 text-sm"
            />
            <select
              value={form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value })}
              className="rounded-xl border px-3 py-2 text-sm"
            >
              <option value="ALL_COURSES">All courses</option>
              <option value="SPECIFIC_COURSE">Specific course</option>
            </select>
            {form.scope === 'SPECIFIC_COURSE' && (
              <input
                placeholder="Course UUID"
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                className="sm:col-span-2 rounded-xl border px-3 py-2 text-sm"
              />
            )}
            <input
              placeholder="Max redemptions (blank = unlimited)"
              value={form.maxRedemptions}
              onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })}
              className="rounded-xl border px-3 py-2 text-sm"
            />
            <button onClick={create} className="rounded-xl bg-ink px-4 py-2 text-sm font-bold text-white">
              Create
            </button>
          </div>
        </section>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                  <td className="px-4 py-3">
                    {c.discountType === 'PERCENT' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  </td>
                  <td className="px-4 py-3">
                    {c.redemptionCount}
                    {c.maxRedemptions != null ? ` / ${c.maxRedemptions}` : ''}
                  </td>
                  <td className="px-4 py-3">{c.active ? 'Active' : 'Off'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(c.id, c.active)} className="text-xs font-bold text-purple">
                      {c.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </PageShell>
  );
}
