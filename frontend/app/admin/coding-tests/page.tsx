'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Code2 } from 'lucide-react';
import { apiFetch } from '@/lib/api/client';

type Card = {
  id: number;
  testCode: string;
  title: string;
  description?: string;
  subject?: string;
  difficulty?: string;
  durationMinutes: number;
  totalQuestions: number;
  passPercentage: number;
  published: boolean;
};

export default function AdminCodingTestsPage() {
  const [tests, setTests] = useState<Card[]>([]);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('1');
  const [duration, setDuration] = useState('60');
  const [passPct, setPassPct] = useState('50');
  const [questionIds, setQuestionIds] = useState('');
  const [busy, setBusy] = useState(false);

  function reload() {
    apiFetch<Card[]>('/admin/coding-tests')
      .then(setTests)
      .catch(() => setTests([]));
  }

  useEffect(() => {
    reload();
  }, []);

  async function create() {
    setBusy(true);
    try {
      const ids = questionIds
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => n > 0);
      await apiFetch('/admin/coding-tests', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: '',
          subjectId: Number(subjectId),
          difficulty: 'MEDIUM',
          durationMinutes: Number(duration),
          passPercentage: Number(passPct),
          instructions: 'Write correct Java solutions. Run samples before Submit.',
          published: true,
          codingQuestionIds: ids,
        }),
      });
      setTitle('');
      setQuestionIds('');
      reload();
    } catch (e: any) {
      alert(e.message || 'Create failed');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this coding test?')) return;
    try {
      await apiFetch(`/admin/coding-tests/${id}`, { method: 'DELETE' });
      reload();
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-surface px-5 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/admin" className="text-xs font-semibold text-muted hover:text-purple">
          ← Admin
        </Link>
        <h1 className="font-display mt-2 text-3xl font-bold text-ink">Coding tests</h1>
        <p className="mt-1 text-sm text-muted">
          Assemble published coding questions into timed assessments.
        </p>

        <div className="mt-6 rounded-3xl border border-ink/5 bg-white p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold">Create coding test</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              placeholder="Subject ID"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              placeholder="Duration minutes"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              placeholder="Pass %"
              value={passPct}
              onChange={(e) => setPassPct(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              placeholder="Coding question IDs (comma-separated)"
              value={questionIds}
              onChange={(e) => setQuestionIds(e.target.value)}
              className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <button
            disabled={busy || !title || !questionIds}
            onClick={create}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-white hover:bg-purple disabled:opacity-50"
          >
            <Plus size={14} /> Create & publish
          </button>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {tests.map((t) => (
            <div key={t.id} className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase text-purple">
                    {t.testCode} · {t.difficulty}
                  </div>
                  <h2 className="font-display mt-2 text-lg font-bold">{t.title}</h2>
                  <p className="mt-1 text-xs text-muted">
                    {t.totalQuestions} problems · {t.durationMinutes} min · Pass {t.passPercentage}% ·{' '}
                    {t.published ? 'Published' : 'Draft'}
                  </p>
                </div>
                <Code2 className="text-purple" size={20} />
              </div>
              <button
                onClick={() => remove(t.id)}
                className="mt-4 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
