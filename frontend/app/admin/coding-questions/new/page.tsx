'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { apiFetch } from '@/lib/api/client';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type TestCase = {
  input: string;
  expectedOutput: string;
  sample: boolean;
  displayOrder: number;
  weight: number;
};

const DEFAULT_STARTER = `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // TODO
    }
}
`;

export default function NewCodingQuestionPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [statement, setStatement] = useState('## Problem\n\nDescribe the problem here.\n');
  const [subjectId, setSubjectId] = useState('1');
  const [difficulty, setDifficulty] = useState('EASY');
  const [constraints, setConstraints] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [marks, setMarks] = useState('100');
  const [starter, setStarter] = useState(DEFAULT_STARTER);
  const [reference, setReference] = useState('');
  const [cases, setCases] = useState<TestCase[]>([
    { input: '', expectedOutput: '', sample: true, displayOrder: 1, weight: 1 },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function addCase(sample: boolean) {
    setCases((prev) => [
      ...prev,
      {
        input: '',
        expectedOutput: '',
        sample,
        displayOrder: prev.length + 1,
        weight: 1,
      },
    ]);
  }

  async function save(publish: boolean) {
    setBusy(true);
    setError('');
    try {
      const body = {
        title,
        problemStatementMarkdown: statement,
        subjectId: Number(subjectId),
        difficulty,
        constraintsText: constraints,
        inputFormat,
        outputFormat,
        marks: Number(marks),
        partialCreditAllowed: true,
        allowedLanguages: 'JAVA',
        status: publish ? 'PUBLISHED' : 'DRAFT',
        testCases: cases,
        templates: [
          {
            language: 'JAVA',
            starterCode: starter,
            referenceSolution: reference || null,
          },
        ],
      };
      const created = await apiFetch<{ id: number }>('/admin/coding-questions', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      router.push(`/admin/coding-questions/${created.id}`);
    } catch (e: any) {
      setError(e.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface px-5 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin/coding-questions" className="text-xs font-semibold text-muted hover:text-purple">
          ← Coding questions
        </Link>
        <h1 className="font-display mt-2 text-3xl font-bold text-ink">New coding question</h1>

        <div className="mt-6 space-y-5 rounded-3xl border border-ink/5 bg-white p-6 shadow-soft">
          <label className="block text-xs font-bold uppercase text-muted">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-bold uppercase text-muted">
            Problem statement (Markdown)
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              rows={8}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-xs font-bold uppercase text-muted">
              Subject ID
              <input
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
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
            <label className="text-xs font-bold uppercase text-muted">
              Marks
              <input
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block text-xs font-bold uppercase text-muted">
            Input format
            <textarea
              value={inputFormat}
              onChange={(e) => setInputFormat(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-bold uppercase text-muted">
            Output format
            <textarea
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-xs font-bold uppercase text-muted">
            Constraints
            <textarea
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>

          <div>
            <div className="text-xs font-bold uppercase text-muted">Java starter code</div>
            <div className="mt-1 h-48 overflow-hidden rounded-xl border border-slate-200">
              <MonacoEditor
                height="100%"
                language="java"
                theme="vs-dark"
                value={starter}
                onChange={(v) => setStarter(v || '')}
                options={{ minimap: { enabled: false }, fontSize: 12 }}
              />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase text-muted">
              Reference solution (server-only, for validate)
            </div>
            <div className="mt-1 h-40 overflow-hidden rounded-xl border border-slate-200">
              <MonacoEditor
                height="100%"
                language="java"
                theme="vs-dark"
                value={reference}
                onChange={(v) => setReference(v || '')}
                options={{ minimap: { enabled: false }, fontSize: 12 }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase text-muted">Test cases</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addCase(true)}
                  className="text-xs font-bold text-purple"
                >
                  + Sample
                </button>
                <button
                  type="button"
                  onClick={() => addCase(false)}
                  className="text-xs font-bold text-purple"
                >
                  + Hidden
                </button>
              </div>
            </div>
            <div className="mt-2 space-y-3">
              {cases.map((c, i) => (
                <div key={i} className="rounded-xl border border-slate-100 p-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold">{c.sample ? 'Sample' : 'Hidden'}</span>
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() => setCases((prev) => prev.filter((_, j) => j !== i))}
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <textarea
                      placeholder="Input"
                      value={c.input}
                      onChange={(e) =>
                        setCases((prev) =>
                          prev.map((x, j) => (j === i ? { ...x, input: e.target.value } : x))
                        )
                      }
                      rows={3}
                      className="rounded-lg border border-slate-200 p-2 font-mono text-xs"
                    />
                    <textarea
                      placeholder="Expected output"
                      value={c.expectedOutput}
                      onChange={(e) =>
                        setCases((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, expectedOutput: e.target.value } : x
                          )
                        )
                      }
                      rows={3}
                      className="rounded-lg border border-slate-200 p-2 font-mono text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              disabled={busy}
              onClick={() => save(false)}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-xs font-bold"
            >
              Save draft
            </button>
            <button
              disabled={busy}
              onClick={() => save(true)}
              className="rounded-full bg-ink px-5 py-2.5 text-xs font-bold text-white hover:bg-purple"
            >
              Save & publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
