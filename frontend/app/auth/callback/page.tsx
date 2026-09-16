'use client';
import { useEffect, useState } from 'react';
import { lmsFetch } from '@/lib/lms/api';

export default function AuthCallbackPage() {
  const [msg, setMsg] = useState('Completing sign-in…');
  useEffect(() => {
    lmsFetch<{ message: string; data: { id: string; email: string; name: string; role: string } }>('/api/auth/session')
      .then((r) => {
        if (r.data) {
          localStorage.setItem('id', r.data.id);
          localStorage.setItem('email', r.data.email);
          localStorage.setItem('name', r.data.name);
          localStorage.setItem('role', r.data.role);
        }
        location.href = '/dashboard';
      })
      .catch(() => {
        setMsg('Sign-in failed. Redirecting to login…');
        setTimeout(() => (location.href = '/login'), 1500);
      });
  }, []);
  return <main className="grid min-h-screen place-items-center text-sm text-slate-600">{msg}</main>;
}
