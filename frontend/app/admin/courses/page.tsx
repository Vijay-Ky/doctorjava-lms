'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, LayoutList, BookOpen } from 'lucide-react';
import PageShell from '@/components/lms/PageShell';
import { lmsFetch } from '@/lib/lms/api';

type Course = {
  course_id: string;
  course_name: string;
  instructor: string;
  price: number;
  description: string;
  p_link?: string;
  y_link?: string;
  level?: string;
  language?: string;
  thumbnailUrl?: string;
  whatYouLearn?: string;
  requirements?: string;
  published?: boolean;
};

const blank: Course = {
  course_id: '',
  course_name: '',
  instructor: 'Doctor Java Technologies',
  price: 2999,
  description: '',
  p_link: '',
  y_link: '',
  level: 'All Levels',
  language: 'English',
  thumbnailUrl: '',
  whatYouLearn: '',
  requirements: '',
  published: true,
};

export default function AdminCoursesPage() {
  const [items, setItems] = useState<Course[]>([]);
  const [form, setForm] = useState<Course>({ ...blank });
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function reload() {
    lmsFetch<any>('/api/courses')
      .then((r) => {
        const list = Array.isArray(r) ? r : r?.content || [];
        setItems(list);
      })
      .catch(() => setItems([]));
  }

  useEffect(() => {
    reload();
  }, []);

  async function save() {
    setBusy(true);
    setError('');
    try {
      const body = {
        course_name: form.course_name,
        instructor: form.instructor,
        price: Number(form.price) || 0,
        description: form.description,
        p_link: form.p_link,
        y_link: form.y_link,
        level: form.level,
        language: form.language,
        thumbnailUrl: form.thumbnailUrl,
        whatYouLearn: form.whatYouLearn,
        requirements: form.requirements,
        published: form.published !== false,
      };
      if (editing) {
        await lmsFetch(`/api/courses/${editing}`, { method: 'PUT', body: JSON.stringify(body) });
      } else {
        await lmsFetch('/api/courses', { method: 'POST', body: JSON.stringify(body) });
      }
      setEditing(null);
      setForm({ ...blank });
      reload();
    } catch (e: any) {
      setError(e.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this course and its curriculum?')) return;
    try {
      await lmsFetch(`/api/courses/${id}`, { method: 'DELETE' });
      reload();
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <PageShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm font-semibold text-slate-500">
              ← Admin
            </Link>
            <h1 className="mt-3 font-display text-3xl font-bold">Course management</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              Udemy-style builder: create a course, then open <strong>Curriculum</strong> to add
              sections and lectures (video, PDF, audio, text, preview free lessons, drip unlock).
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-6 lg:grid-cols-[400px_1fr]">
          <section className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="font-display text-xl font-bold">{editing ? 'Edit course' : 'Add course'}</h2>
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-semibold">
                Course name
                <input
                  value={form.course_name}
                  onChange={(e) => setForm({ ...form, course_name: e.target.value })}
                  className="input mt-1"
                />
              </label>
              <label className="block text-xs font-semibold">
                Instructor
                <input
                  value={form.instructor}
                  onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                  className="input mt-1"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-semibold">
                  Price (₹)
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="input mt-1"
                  />
                </label>
                <label className="block text-xs font-semibold">
                  Level
                  <select
                    value={form.level || 'All Levels'}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="input mt-1"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>All Levels</option>
                  </select>
                </label>
              </div>
              <label className="block text-xs font-semibold">
                Thumbnail URL
                <input
                  value={form.thumbnailUrl || ''}
                  onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
                  placeholder="https://..."
                  className="input mt-1"
                />
              </label>
              <label className="block text-xs font-semibold">
                Preview / promo video (YouTube)
                <input
                  value={form.y_link || ''}
                  onChange={(e) => setForm({ ...form, y_link: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="input mt-1"
                />
              </label>
              <label className="block text-xs font-semibold">
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input mt-1 min-h-24"
                />
              </label>
              <label className="block text-xs font-semibold">
                What you&apos;ll learn (one per line)
                <textarea
                  value={form.whatYouLearn || ''}
                  onChange={(e) => setForm({ ...form, whatYouLearn: e.target.value })}
                  className="input mt-1 min-h-20"
                  placeholder="Master OOP&#10;Build REST APIs with Spring Boot"
                />
              </label>
              <label className="block text-xs font-semibold">
                Requirements (one per line)
                <textarea
                  value={form.requirements || ''}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  className="input mt-1 min-h-16"
                  placeholder="Basic computer skills"
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={form.published !== false}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                />
                Published on catalog
              </label>
            </div>
            {error && <div className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
            <div className="mt-5 flex gap-2">
              <button
                disabled={busy || !form.course_name}
                onClick={save}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-bold text-white hover:bg-purple disabled:opacity-50"
              >
                <Plus size={15} />
                {editing ? 'Update' : 'Create course'}
              </button>
              {editing && (
                <button
                  onClick={() => {
                    setEditing(null);
                    setForm({ ...blank });
                  }}
                  className="rounded-full border px-4 text-sm font-bold"
                >
                  Cancel
                </button>
              )}
            </div>
          </section>

          <section className="space-y-3">
            {items.map((c) => (
              <div
                key={c.course_id}
                className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-bold">{c.course_name}</h2>
                    {c.level && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                        {c.level}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    ₹{(c.price || 0).toLocaleString('en-IN')} · {c.instructor}
                  </p>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 line-clamp-3">
                    {c.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/courses/${c.course_id}/curriculum`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-purple/10 px-3 py-2 text-xs font-bold text-purple hover:bg-purple/20"
                  >
                    <LayoutList size={14} /> Curriculum
                  </Link>
                  <Link
                    href={`/course/${c.course_id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold"
                  >
                    <BookOpen size={14} /> Preview
                  </Link>
                  <button
                    onClick={() => {
                      setEditing(c.course_id);
                      setForm({ ...blank, ...c });
                    }}
                    className="rounded-full border p-2"
                    title="Edit"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => remove(c.course_id)}
                    className="rounded-full border p-2 text-rose-600"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-muted">
                No courses yet — create one on the left, then build curriculum.
              </div>
            )}
          </section>
        </div>
      </main>
    </PageShell>
  );
}
