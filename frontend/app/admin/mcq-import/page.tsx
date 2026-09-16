'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Upload, FileText } from 'lucide-react';
import { apiFetch } from '@/lib/api/client';

type ImportResult = {
  imported: number;
  skipped: number;
  errors: string[];
  questionIds: number[];
};

export default function McqImportPage() {
  const [subjectId, setSubjectId] = useState('1');
  const [topicName, setTopicName] = useState('Core Java');
  const [difficulty, setDifficulty] = useState('EASY');
  const [publish, setPublish] = useState(true);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');

  async function runImport() {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('subjectId', subjectId);
      fd.append('topicName', topicName);
      fd.append('difficulty', difficulty);
      fd.append('publish', String(publish));
      if (text.trim()) fd.append('text', text);
      if (file) fd.append('file', file);

      // apiFetch assumes JSON — call fetch directly for multipart
      const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
      const tokenHint = typeof document !== 'undefined'
        ? document.cookie
        : '';
      const res = await fetch(`${base}/api/v1/admin/mcq-import`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || data.error || `Import failed (${res.status})`);
      }
      setResult(data as ImportResult);
    } catch (e: any) {
      setError(e.message || 'Import failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface px-5 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin/question-bank" className="text-xs font-semibold text-muted hover:text-purple">
          ← Question bank
        </Link>
        <h1 className="font-display mt-2 text-3xl font-bold text-ink">Bulk MCQ import</h1>
        <p className="mt-2 text-sm text-muted">
          Import Doctor Java assignment text files (
          <code className="rounded bg-slate-100 px-1">**Question N:**</code> / a) b) c) d) /{' '}
          <code className="rounded bg-slate-100 px-1">**Answer: c)**</code>). Prefer combined
          Answers files that include explanations. .txt only (paste or upload).
        </p>

        <div className="mt-6 space-y-4 rounded-3xl border border-ink/5 bg-white p-6 shadow-soft">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase text-muted">
              Subject ID
              <input
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-bold uppercase text-muted">
              Topic name (created if missing)
              <input
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-bold uppercase text-muted">
              Difficulty
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option>EASY</option>
                <option>MEDIUM</option>
                <option>HARD</option>
              </select>
            </label>
            <label className="flex items-end gap-2 text-sm font-semibold">
              <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
              Publish immediately
            </label>
          </div>

          <label className="block text-xs font-bold uppercase text-muted">
            Upload .txt
            <input
              type="file"
              accept=".txt,text/plain"
              className="mt-1 block w-full text-sm"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          <label className="block text-xs font-bold uppercase text-muted">
            Or paste text
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              placeholder={"**Question 1:**\n...\na) ...\nb) ...\nc) ...\nd) ...\n\n**Answer: c) ...**\nExplanation: ..."}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {result && (
            <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
              <p className="font-bold">
                Imported {result.imported}, skipped {result.skipped}
              </p>
              {result.errors?.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-xs text-amber-800">
                  {result.errors.slice(0, 10).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
              <Link href="/admin/question-bank" className="mt-2 inline-block font-semibold text-purple">
                Open question bank →
              </Link>
            </div>
          )}

          <button
            disabled={busy || (!text.trim() && !file)}
            onClick={runImport}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-white hover:bg-purple disabled:opacity-50"
          >
            {busy ? (
              'Importing…'
            ) : (
              <>
                <Upload size={14} /> Import MCQs
              </>
            )}
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-xs text-muted">
          <div className="flex items-center gap-2 font-bold text-ink">
            <FileText size={14} /> Tip
          </div>
          <p className="mt-2">
            From the Assignment zip, use files named like <code>*Answers*.txt</code> or combined QA
            that include both options and <strong>Answer:</strong> lines. Topic MCQ practice will
            pick up published questions automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
