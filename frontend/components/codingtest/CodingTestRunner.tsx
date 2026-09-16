'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Play,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  codingApi,
  type AttemptStart,
  type CodingQuestionView,
  type CaseResult,
  type FinishResponse,
} from '@/lib/codingApi';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type QStatus = 'not-attempted' | 'attempted' | 'samples-ok' | 'submitted';

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function CodingTestRunner({
  attempt,
  onFinished,
}: {
  attempt: AttemptStart;
  onFinished: (r: FinishResponse) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [question, setQuestion] = useState<CodingQuestionView | null>(null);
  const [loadingQ, setLoadingQ] = useState(true);
  const [language, setLanguage] = useState('JAVA');
  const [codeByQ, setCodeByQ] = useState<Record<number, string>>({});
  const [statusByQ, setStatusByQ] = useState<Record<number, QStatus>>({});
  const [runResults, setRunResults] = useState<CaseResult[] | null>(null);
  const [submitResults, setSubmitResults] = useState<CaseResult[] | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'run' | 'submit' | 'finish' | null>(null);
  const [consoleTab, setConsoleTab] = useState<'samples' | 'submit' | 'custom'>('samples');
  const [customInput, setCustomInput] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const exp = new Date(attempt.expiresAt).getTime();
    return Math.max(0, Math.floor((exp - Date.now()) / 1000));
  });
  const [confirmFinish, setConfirmFinish] = useState(false);

  const currentSummary = attempt.questions[idx];

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'You have an in-progress coding test. Progress is kept until time expires.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          void doFinish(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadQuestion = useCallback(async (attemptQuestionId: number) => {
    setLoadingQ(true);
    setRunResults(null);
    setSubmitResults(null);
    setCompileError(null);
    try {
      const q = await codingApi.getQuestion(attempt.attemptId, attemptQuestionId);
      setQuestion(q);
      const lang = q.allowedLanguages[0] || 'JAVA';
      setLanguage(lang);
      setCodeByQ((prev) => {
        if (prev[attemptQuestionId] != null) return prev;
        return { ...prev, [attemptQuestionId]: q.starterCode[lang] || q.starterCode['JAVA'] || '' };
      });
    } finally {
      setLoadingQ(false);
    }
  }, [attempt.attemptId]);

  useEffect(() => {
    if (currentSummary) void loadQuestion(currentSummary.attemptQuestionId);
  }, [currentSummary, loadQuestion]);

  const sourceCode = useMemo(() => {
    if (!currentSummary) return '';
    return codeByQ[currentSummary.attemptQuestionId] ?? '';
  }, [codeByQ, currentSummary]);

  function setSource(code: string) {
    if (!currentSummary) return;
    setCodeByQ((prev) => ({ ...prev, [currentSummary.attemptQuestionId]: code }));
    setStatusByQ((prev) => ({
      ...prev,
      [currentSummary.attemptQuestionId]: prev[currentSummary.attemptQuestionId] === 'submitted'
        ? 'submitted'
        : 'attempted',
    }));
  }

  async function doRun() {
    if (!currentSummary) return;
    setBusy('run');
    setCompileError(null);
    try {
      const res = await codingApi.run(
        attempt.attemptId,
        currentSummary.attemptQuestionId,
        language,
        sourceCode
      );
      setRunResults(res.cases);
      setCompileError(res.compileError || null);
      setConsoleTab('samples');
      if (res.status === 'ACCEPTED') {
        setStatusByQ((prev) => ({
          ...prev,
          [currentSummary.attemptQuestionId]:
            prev[currentSummary.attemptQuestionId] === 'submitted' ? 'submitted' : 'samples-ok',
        }));
      }
    } catch (e: any) {
      setCompileError(e.message || 'Run failed');
    } finally {
      setBusy(null);
    }
  }

  async function doSubmit() {
    if (!currentSummary) return;
    setBusy('submit');
    setCompileError(null);
    try {
      const accepted = await codingApi.submit(
        attempt.attemptId,
        currentSummary.attemptQuestionId,
        language,
        sourceCode
      );
      const polled = await codingApi.poll(accepted.submissionId);
      setSubmitResults(polled.cases);
      setCompileError(polled.compileError || null);
      setConsoleTab('submit');
      setStatusByQ((prev) => ({ ...prev, [currentSummary.attemptQuestionId]: 'submitted' }));
    } catch (e: any) {
      setCompileError(e.message || 'Submit failed');
    } finally {
      setBusy(null);
    }
  }

  async function doFinish(auto = false) {
    if (!auto && !confirmFinish) {
      setConfirmFinish(true);
      return;
    }
    setBusy('finish');
    try {
      const r = await codingApi.finish(attempt.attemptId);
      onFinished(r);
    } catch (e: any) {
      alert(e.message || 'Finish failed');
    } finally {
      setBusy(null);
      setConfirmFinish(false);
    }
  }

  const lowTime = secondsLeft <= 60;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-50">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex flex-wrap items-center gap-2">
          {attempt.questions.map((q, i) => {
            const st = statusByQ[q.attemptQuestionId] || 'not-attempted';
            const colors =
              st === 'submitted'
                ? 'bg-emerald-500 text-white'
                : st === 'samples-ok'
                  ? 'bg-sky-500 text-white'
                  : st === 'attempted'
                    ? 'bg-amber-400 text-ink'
                    : 'bg-slate-200 text-slate-600';
            return (
              <button
                key={q.attemptQuestionId}
                onClick={() => setIdx(i)}
                className={`h-8 w-8 rounded-full text-xs font-bold ${colors} ${
                  i === idx ? 'ring-2 ring-purple ring-offset-2' : ''
                }`}
                title={q.title}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold tabular-nums ${
              lowTime ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-ink'
            }`}
          >
            <Clock size={14} /> {formatTime(secondsLeft)}
          </span>
          <button
            onClick={() => doFinish(false)}
            disabled={busy === 'finish'}
            className="rounded-full bg-ink px-4 py-1.5 text-xs font-bold text-white hover:bg-purple disabled:opacity-50"
          >
            Finish test
          </button>
        </div>
      </div>

      {confirmFinish && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Submit the entire test now?{' '}
          <button onClick={() => doFinish(true)} className="font-bold underline">
            Yes, finish
          </button>{' '}
          ·{' '}
          <button onClick={() => setConfirmFinish(false)} className="underline">
            Cancel
          </button>
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
        {/* Problem pane */}
        <div className="min-h-0 overflow-y-auto border-r border-slate-200 bg-white p-5">
          {loadingQ || !question ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader2 className="animate-spin" size={16} /> Loading problem…
            </div>
          ) : (
            <>
              <h1 className="font-display text-xl font-bold text-ink">{question.title}</h1>
              <p className="mt-1 text-xs text-muted">
                Marks: {question.marks} · Time limit: {question.timeLimitMs}ms · Memory:{' '}
                {Math.round(question.memoryLimitKb / 1024)}MB
              </p>
              <div className="prose prose-sm mt-4 max-w-none prose-pre:bg-slate-900 prose-pre:text-slate-100">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {question.problemStatementMarkdown}
                </ReactMarkdown>
              </div>
              {question.inputFormat && (
                <section className="mt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Input format</h3>
                  <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs">
                    {question.inputFormat}
                  </pre>
                </section>
              )}
              {question.outputFormat && (
                <section className="mt-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Output format</h3>
                  <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs">
                    {question.outputFormat}
                  </pre>
                </section>
              )}
              {question.constraintsText && (
                <section className="mt-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Constraints</h3>
                  <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs">
                    {question.constraintsText}
                  </pre>
                </section>
              )}
              {question.sampleCases.length > 0 && (
                <section className="mt-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted">Sample test cases</h3>
                  {question.sampleCases.map((c, i) => (
                    <div key={c.id} className="rounded-xl border border-slate-200 p-3">
                      <div className="text-[11px] font-bold text-purple">Sample {i + 1}</div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <div>
                          <div className="text-[10px] font-semibold uppercase text-muted">Input</div>
                          <pre className="mt-0.5 overflow-x-auto rounded bg-slate-50 p-2 text-xs">{c.input}</pre>
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold uppercase text-muted">Output</div>
                          <pre className="mt-0.5 overflow-x-auto rounded bg-slate-50 p-2 text-xs">
                            {c.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </>
          )}
        </div>

        {/* Editor + console */}
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
            <select
              value={language}
              onChange={(e) => {
                const lang = e.target.value;
                setLanguage(lang);
                if (currentSummary && question?.starterCode[lang] && !codeByQ[currentSummary.attemptQuestionId]) {
                  setSource(question.starterCode[lang]);
                }
              }}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold"
            >
              {(question?.allowedLanguages || ['JAVA']).map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <div className="flex-1" />
            <button
              onClick={doRun}
              disabled={!!busy || !question}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
            >
              {busy === 'run' ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              Run
            </button>
            <button
              onClick={doSubmit}
              disabled={!!busy || !question}
              className="inline-flex items-center gap-1.5 rounded-lg bg-purple px-3 py-1.5 text-xs font-bold text-white hover:bg-ink disabled:opacity-50"
            >
              {busy === 'submit' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Submit
            </button>
          </div>

          <div className="min-h-0 flex-1">
            <MonacoEditor
              height="100%"
              language={language === 'JAVA' ? 'java' : language.toLowerCase()}
              theme="vs-dark"
              value={sourceCode}
              onChange={(v) => setSource(v || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          <div className="flex h-56 flex-col border-t border-slate-200 bg-white">
            <div className="flex gap-1 border-b border-slate-100 px-2 pt-2">
              {(['samples', 'submit', 'custom'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setConsoleTab(t)}
                  className={`rounded-t-lg px-3 py-1.5 text-xs font-bold ${
                    consoleTab === t ? 'bg-slate-100 text-ink' : 'text-muted'
                  }`}
                >
                  {t === 'samples' ? 'Sample results' : t === 'submit' ? 'Submit results' : 'Custom input'}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3 text-xs">
              {compileError && (
                <pre className="mb-2 whitespace-pre-wrap rounded-lg bg-red-50 p-2 text-red-700">
                  {compileError}
                </pre>
              )}
              {consoleTab === 'custom' && (
                <div>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs"
                    placeholder="Paste custom stdin…"
                  />
                  <p className="mt-1 text-muted">
                    Custom input runs use the same Run button (samples path). Prefer sample cases for
                    verification.
                  </p>
                </div>
              )}
              {consoleTab === 'samples' && (
                <CaseList cases={runResults} empty="Click Run to execute against sample test cases." />
              )}
              {consoleTab === 'submit' && (
                <CaseList
                  cases={submitResults}
                  empty="Click Submit to grade against all (including hidden) test cases."
                />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2">
            <button
              disabled={idx === 0}
              onClick={() => setIdx((i) => i - 1)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-ink disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              disabled={idx >= attempt.questions.length - 1}
              onClick={() => setIdx((i) => i + 1)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-ink disabled:opacity-40"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CaseList({ cases, empty }: { cases: CaseResult[] | null; empty: string }) {
  if (!cases) return <p className="text-muted">{empty}</p>;
  if (cases.length === 0) return <p className="text-muted">No cases.</p>;
  return (
    <ul className="space-y-2">
      {cases.map((c, i) => (
        <li key={c.testCaseId} className="rounded-lg border border-slate-100 p-2">
          <div className="flex items-center gap-2 font-semibold">
            {c.passed ? (
              <CheckCircle2 size={14} className="text-emerald-600" />
            ) : (
              <XCircle size={14} className="text-red-600" />
            )}
            Case {i + 1}
            {c.sample ? ' (sample)' : ' (hidden)'}
            {c.runtimeMs != null && <span className="text-muted">· {c.runtimeMs}ms</span>}
          </div>
          {(c.input != null || c.actualOutput != null) && (
            <div className="mt-1 grid gap-1 sm:grid-cols-3">
              {c.input != null && (
                <pre className="overflow-x-auto rounded bg-slate-50 p-1.5">{c.input}</pre>
              )}
              {c.expectedOutput != null && (
                <pre className="overflow-x-auto rounded bg-slate-50 p-1.5">{c.expectedOutput}</pre>
              )}
              {c.actualOutput != null && (
                <pre className="overflow-x-auto rounded bg-slate-50 p-1.5">{c.actualOutput}</pre>
              )}
            </div>
          )}
          {c.stderr && <pre className="mt-1 text-red-600">{c.stderr}</pre>}
        </li>
      ))}
    </ul>
  );
}
