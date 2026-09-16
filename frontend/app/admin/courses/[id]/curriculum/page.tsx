'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import PageShell from '@/components/lms/PageShell';
import { lmsFetch } from '@/lib/lms/api';

type Lecture = {
  id: string;
  title: string;
  durationMinutes: number;
  contentType?: string;
  contentUrl?: string;
  videoUrl?: string;
  preview: boolean;
  unlockType?: string;
  locked?: boolean;
};
type Section = { id: string; title: string; lectures: Lecture[] };

const CONTENT_TYPES = ['VIDEO', 'PDF', 'AUDIO', 'TEXT', 'DOWNLOAD', 'LIVE_CLASS', 'ASSIGNMENT'];
const UNLOCK_TYPES = ['IMMEDIATE', 'SCHEDULED_DATE', 'AFTER_PREVIOUS_LECTURE', 'DAYS_AFTER_ENROLLMENT'];

export default function CurriculumCMS() {
  const { id } = useParams<{ id: string }>();
  const [sections, setSections] = useState<Section[]>([]);
  const [secTitle, setSecTitle] = useState('');
  const [lec, setLec] = useState({
    sectionId: '',
    title: '',
    durationMinutes: 10,
    contentType: 'VIDEO',
    contentUrl: '',
    textContent: '',
    unlockType: 'IMMEDIATE',
    unlockValue: '',
    preview: false,
  });
  const [live, setLive] = useState({ title: '', scheduledStart: '', meetingUrl: '', durationMinutes: 60 });
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await lmsFetch<Section[]>(`/api/curriculum/course/${id}`);
    setSections(data);
    if (data[0] && !lec.sectionId) setLec((l) => ({ ...l, sectionId: data[0].id }));
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [id]);

  async function addSection() {
    await lmsFetch('/api/curriculum/sections', {
      method: 'POST',
      body: JSON.stringify({ courseId: id, title: secTitle, sortOrder: sections.length }),
    });
    setSecTitle('');
    await load();
  }

  async function addLecture() {
    await lmsFetch('/api/curriculum/lectures', {
      method: 'POST',
      body: JSON.stringify({
        ...lec,
        videoUrl: lec.contentUrl,
        unlockValue: lec.unlockValue || null,
      }),
    });
    setLec((l) => ({ ...l, title: '', contentUrl: '', textContent: '', preview: false }));
    await load();
  }

  async function addLive() {
    await lmsFetch('/api/curriculum/live', {
      method: 'POST',
      body: JSON.stringify({ courseId: id, ...live }),
    });
    setLive({ title: '', scheduledStart: '', meetingUrl: '', durationMinutes: 60 });
    alert('Live class scheduled');
  }

  async function removeSection(sid: string) {
    if (!confirm('Delete section and its lectures?')) return;
    await lmsFetch(`/api/curriculum/sections/${sid}`, { method: 'DELETE' });
    await load();
  }

  async function removeLecture(lid: string) {
    if (!confirm('Delete lecture?')) return;
    await lmsFetch(`/api/curriculum/lectures/${lid}`, { method: 'DELETE' });
    await load();
  }

  return (
    <PageShell>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <Link href="/admin/courses" className="text-sm font-semibold text-slate-500">
          ← Courses
        </Link>
        <h1 className="mt-3 font-display text-3xl font-bold">Curriculum CMS</h1>
        <p className="mt-2 text-sm text-slate-500">
          Multi-format lectures (video, PDF, audio, text, downloads), drip unlock rules, and live classes.
        </p>
        {error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold">Add section</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              value={secTitle}
              onChange={(e) => setSecTitle(e.target.value)}
              placeholder="Section title"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <button onClick={addSection} className="rounded-xl bg-ink px-4 py-2 text-sm font-bold text-white">
              <Plus size={16} className="mr-1 inline" /> Section
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold">Add lecture</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <select
              value={lec.sectionId}
              onChange={(e) => setLec({ ...lec, sectionId: e.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <input
              value={lec.title}
              onChange={(e) => setLec({ ...lec, title: e.target.value })}
              placeholder="Lecture title"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <select
              value={lec.contentType}
              onChange={(e) => setLec({ ...lec, contentType: e.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={lec.durationMinutes}
              onChange={(e) => setLec({ ...lec, durationMinutes: Number(e.target.value) })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Minutes"
            />
            {lec.contentType !== 'TEXT' && (
              <input
                value={lec.contentUrl}
                onChange={(e) => setLec({ ...lec, contentUrl: e.target.value })}
                placeholder="Content URL (video/pdf/audio/file)"
                className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            )}
            {lec.contentType === 'TEXT' && (
              <textarea
                value={lec.textContent}
                onChange={(e) => setLec({ ...lec, textContent: e.target.value })}
                placeholder="Lesson text / HTML"
                className="sm:col-span-2 min-h-[100px] rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            )}
            <select
              value={lec.unlockType}
              onChange={(e) => setLec({ ...lec, unlockType: e.target.value })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              {UNLOCK_TYPES.map((t) => (
                <option key={t} value={t}>
                  Unlock: {t}
                </option>
              ))}
            </select>
            <input
              value={lec.unlockValue}
              onChange={(e) => setLec({ ...lec, unlockValue: e.target.value })}
              placeholder="Unlock value (date ISO or days number)"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={lec.preview} onChange={(e) => setLec({ ...lec, preview: e.target.checked })} />
              Free preview
            </label>
            <button onClick={addLecture} className="rounded-xl bg-purple px-4 py-2 text-sm font-bold text-white">
              Add lecture
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold">Schedule live class</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              value={live.title}
              onChange={(e) => setLive({ ...live, title: e.target.value })}
              placeholder="Session title"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              type="datetime-local"
              value={live.scheduledStart}
              onChange={(e) => setLive({ ...live, scheduledStart: e.target.value ? e.target.value + ':00' : '' })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={live.meetingUrl}
              onChange={(e) => setLive({ ...live, meetingUrl: e.target.value })}
              placeholder="Zoom / Meet / YouTube Live URL"
              className="sm:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <button onClick={addLive} className="rounded-xl bg-ink px-4 py-2 text-sm font-bold text-white">
              Schedule
            </button>
          </div>
        </section>

        <div className="mt-8 space-y-4">
          {sections.map((s) => (
            <div key={s.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">{s.title}</h3>
                <button onClick={() => removeSection(s.id)} className="text-rose-600">
                  <Trash2 size={16} />
                </button>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {(s.lectures || []).map((l) => (
                  <li key={l.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                    <span>
                      <span className="mr-2 rounded bg-purple/10 px-1.5 py-0.5 text-[10px] font-bold text-purple">
                        {l.contentType || 'VIDEO'}
                      </span>
                      {l.title}
                      {l.preview && <span className="ml-2 text-xs text-emerald-600">preview</span>}
                    </span>
                    <button onClick={() => removeLecture(l.id)} className="text-rose-500">
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </PageShell>
  );
}
