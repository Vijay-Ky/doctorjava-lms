'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, UserPlus, Shield } from 'lucide-react';
import PageShell from '@/components/lms/PageShell';
import { getCurrentUser, lmsFetch, hasAdminAccess, isLoggedIn } from '@/lib/lms/api';

type U = {
  id: string;
  username: string;
  email: string;
  mobileNumber?: string;
  role: string;
  isActive?: boolean;
};

const ROLES = ['USER', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'] as const;

export default function AdminUsers() {
  const me = getCurrentUser();
  const [users, setUsers] = useState<U[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    mobileNumber: '',
    role: 'USER',
  });
  const [busy, setBusy] = useState(false);

  const isSuper = hasAdminAccess(me?.role);

  async function load() {
    const list = await lmsFetch<U[]>('/api/users');
    setUsers(list);
  }

  useEffect(() => {
    if (!isLoggedIn() || !hasAdminAccess(getCurrentUser()?.role)) {
      location.href = '/login?next=/admin/users';
      return;
    }
    load().catch((e) => setError(e.message));
  }, []);

  async function createUser() {
    setBusy(true);
    setError(null);
    try {
      await lmsFetch('/api/users/admin-create', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ username: '', email: '', password: '', mobileNumber: '', role: 'USER' });
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(id: string, role: string) {
    try {
      await lmsFetch(`/api/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    try {
      await lmsFetch(`/api/users/${id}/active`, {
        method: 'PATCH',
        body: JSON.stringify({ active }),
      });
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await lmsFetch(`/api/users/${id}`, { method: 'DELETE' });
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <PageShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-5 md:px-8 md:py-10">
        <Link href="/admin/lms" className="text-sm font-semibold text-slate-500">
          ← Admin
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">User access</h1>
            <p className="mt-2 text-sm text-slate-500">
              Create users and assign roles. Super admin can grant ADMIN access.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
        )}

        <div className="mt-7 grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* Create form */}
          <section className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-soft sm:p-6">
            <div className="flex items-center gap-2">
              <UserPlus size={18} className="text-purple" />
              <h2 className="font-display text-lg font-bold sm:text-xl">Add user</h2>
            </div>
            <div className="mt-4 space-y-3">
              {(
                [
                  ['username', 'Full name', 'text'],
                  ['email', 'Email', 'email'],
                  ['password', 'Password', 'password'],
                  ['mobileNumber', 'Mobile', 'tel'],
                ] as const
              ).map(([k, label, type]) => (
                <label key={k} className="block">
                  <span className="mb-1.5 block text-xs font-semibold">{label}</span>
                  <input
                    type={type}
                    className="input w-full"
                    value={(form as any)[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  />
                </label>
              ))}
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold">Role</span>
                <select
                  className="input w-full"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              onClick={createUser}
              disabled={busy || !form.email || !form.password || !form.username}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              <Plus size={15} /> {busy ? 'Creating…' : 'Create user'}
            </button>
          </section>

          {/* User list */}
          <section className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-display text-lg font-bold">{u.username}</h2>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          String(u.role).includes('SUPER')
                            ? 'bg-purple/10 text-purple'
                            : String(u.role).includes('ADMIN')
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Shield size={10} /> {u.role?.replace('ROLE_', '')}
                      </span>
                      {u.isActive === false && (
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-slate-500">{u.email}</p>
                    {u.mobileNumber && (
                      <p className="mt-0.5 text-xs text-slate-400">{u.mobileNumber}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {isSuper && (
                      <select
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold"
                        value={String(u.role).replace('ROLE_', '')}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => toggleActive(u.id, u.isActive === false)}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold"
                    >
                      {u.isActive === false ? 'Activate' : 'Deactivate'}
                    </button>
                    <button
                      onClick={() => remove(u.id)}
                      className="rounded-full border border-slate-200 p-1.5 text-rose-600"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="rounded-3xl border border-dashed p-10 text-center text-sm text-slate-500">
                No users yet.
              </div>
            )}
          </section>
        </div>
      </main>
    </PageShell>
  );
}
