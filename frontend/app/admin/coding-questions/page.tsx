'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Code2 } from 'lucide-react';
import { apiFetch } from '@/lib/api/client';

type Card = {
  id: number;
  questionCode: string;
  title: string;
  difficulty: string;
  subjectName?: string;
  marks: number;
  status: string;
  sampleCount: number;
  hiddenCount: number;
};

export default function AdminCodingQuestionsPage() {
  const [items, setItems] = useState<Card[]>([]);

  useEffect(() => {
    apiFetch<Card[]>('/admin/coding-questions')
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  async function remove(id: number) {
    if (!confirm('Delete this coding question?')) return;
    try {
      await apiFetch(`/admin/coding-questions/${id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      alert(e.message || 'Delete failed');
    }
  }

  return (
    <div className="min-h-screen bg-surface px-5 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/admin" className="text-xs font-semibold text-muted hover:text-purple">
              ← Admin
            </Link>
            <h1 className="font-display mt-2 text-3xl font-bold text-ink">Coding questions</h1>
            <p className="mt-1 text-sm text-muted">
              Problem bank for HackerRank-style coding assessments (Java).
            </p>
          </div>
          <Link
            href="/admin/coding-questions/new"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-white hover:bg-purple"
          >
            <Plus size={15} /> New coding question
          </Link>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {items.map((q) => (
            <div key={q.id} className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-purple">
                    {q.questionCode} · {q.difficulty}
                  </div>
                  <h2 className="font-display mt-2 text-lg font-bold text-ink">{q.title}</h2>
                  <p className="mt-1 text-xs text-muted">
                    {q.subjectName} · {q.sampleCount} sample / {q.hiddenCount} hidden · {q.marks} marks ·{' '}
                    {q.status}
                  </p>
                </div>
                <Code2 size={20} className="text-purple" />
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/admin/coding-questions/${q.id}`}
                  className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-ink hover:bg-purple/10"
                >
                  Edit
                </Link>
                <button
                  onClick={() => remove(q.id)}
                  className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        {items.length === 0 && (
          <div className="mt-5 rounded-3xl border border-dashed border-ink/10 bg-white p-12 text-center text-sm text-muted">
            No coding questions yet.
          </div>
        )}
      </div>
    </div>
  );
}
