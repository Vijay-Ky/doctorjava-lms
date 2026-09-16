'use client';
import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import PageShell from '@/components/lms/PageShell';
import { lmsFetch } from '@/lib/lms/api';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    mobileNumber: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const referredBy = typeof document !== 'undefined'
        ? (document.cookie.match(/(?:^|; )dj_ref=([^;]*)/) || [])[1]
        : null;
      await lmsFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...form, referredBy: referredBy ? decodeURIComponent(referredBy) : undefined }),
      }, false);
      location.href = '/login?registered=1';
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <main className="mx-auto flex max-w-6xl items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple text-white">
              <UserPlus />
            </div>
            <h1 className="font-display text-3xl font-bold">Create your account</h1>
            <p className="mt-2 text-sm text-slate-500">Join Doctor Java and start practicing.</p>
          </div>
          
          <div className="mb-5 grid gap-2">
            <button type="button" onClick={() => (window.location.href = `${API_BASE}/oauth2/authorization/google`)}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-ink hover:bg-slate-50">
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.5 7.1l.1.1 6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.5-.4-3.5z"/>
              </svg>
              Continue with Google
            </button>
            <button type="button" onClick={() => (window.location.href = `${API_BASE}/oauth2/authorization/facebook`)}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#1877F2] py-3 text-sm font-bold text-white hover:bg-[#166fe5]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.79-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z"/>
              </svg>
              Continue with Facebook
            </button>
            <p className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">or register with email</p>
          </div>
<form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-7 shadow-soft">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Full name</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
                <User size={17} className="text-slate-400" />
                <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full py-3 outline-none" placeholder="Your name" />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Email</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
                <Mail size={17} className="text-slate-400" />
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full py-3 outline-none" placeholder="you@example.com" />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Password (min 8 characters)</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3">
                <Lock size={17} className="text-slate-400" />
                <input required type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full py-3 outline-none" placeholder="Create a password" />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Mobile (optional)</span>
              <input value={form.mobileNumber} onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none" placeholder="10-digit mobile" />
            </label>
            {error && <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
            <button disabled={busy} className="w-full rounded-xl bg-ink py-3.5 font-bold text-white hover:bg-purple disabled:opacity-50">
              {busy ? 'Creating…' : 'Create account'}
            </button>
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-purple">Sign in</Link>
            </p>
          </form>
        </div>
      </main>
    </PageShell>
  );
}
