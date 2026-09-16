'use client';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api/client';
import { isLoggedIn } from '@/lib/lms/api';
import type { AttemptStart, Result, TestCard } from '@/types/practice';
import {
  ArrowRight, Search, Clock3, FileQuestion, ShieldCheck, RotateCcw, Flag,
  ChevronLeft, ChevronRight, BookOpen, Layers, History, LogIn,
} from 'lucide-react';
import { QuestionRenderer } from './QuestionRenderer';

function formatTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = Math.max(0, s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

type Screen = 'hub' | 'instructions' | 'running' | 'result';
type Tab = 'mock' | 'mcq' | 'history';

type McqTopic = {
  topicId: number;
  topicName: string;
  subjectName: string;
  questionCount: number;
};

type AttemptHistory = {
  attemptId: number;
  attemptCode: string;
  title: string;
  status: string;
  startedAt: string;
  submittedAt?: string;
  score?: number;
  maxScore?: number;
  percentage?: number;
  correctCount?: number;
  incorrectCount?: number;
  unansweredCount?: number;
};

export default function PracticeClient() {
  const [tab, setTab] = useState<Tab>('mock');
  const [tests, setTests] = useState<TestCard[]>([]);
  const [topics, setTopics] = useState<McqTopic[]>([]);
  const [history, setHistory] = useState<AttemptHistory[]>([]);
  const [screen, setScreen] = useState<Screen>('hub');
  const [active, setActive] = useState<TestCard | null>(null);
  const [activeTopic, setActiveTopic] = useState<McqTopic | null>(null);
  const [attempt, setAttempt] = useState<AttemptStart | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [review, setReview] = useState<Record<number, boolean>>({});
  const [visited, setVisited] = useState<Record<number, boolean>>({});
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    apiFetch<TestCard[]>('/practice/tests').then(setTests).catch((e) => setError(e.message));
    apiFetch<McqTopic[]>('/practice/mcq/topics').then(setTopics).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === 'history' && isLoggedIn()) {
      apiFetch<AttemptHistory[]>('/practice/attempts/mine')
        .then(setHistory)
        .catch((e) => {
          if (e.message === 'AUTH_REQUIRED' || e.message.includes('Sign in')) {
            window.location.href = '/login?next=/practice';
          } else setError(e.message);
        });
    }
  }, [tab]);

  useEffect(() => {
    if (screen !== 'running' || remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [screen, remaining]);

  useEffect(() => {
    if (screen === 'running' && remaining === 0 && attempt) {
      submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  const filtered = useMemo(
    () => tests.filter((t) => `${t.title} ${t.subject}`.toLowerCase().includes(query.toLowerCase())),
    [tests, query]
  );
  const filteredTopics = useMemo(
    () =>
      topics.filter((t) =>
        `${t.topicName} ${t.subjectName}`.toLowerCase().includes(query.toLowerCase())
      ),
    [topics, query]
  );

  function requireAuth(): boolean {
    if (!isLoggedIn()) {
      window.location.href = '/login?next=/practice';
      return false;
    }
    return true;
  }

  const openMock = (t: TestCard) => {
    if (!requireAuth()) return;
    setActive(t);
    setActiveTopic(null);
    setScreen('instructions');
  };

  const openTopic = (t: McqTopic) => {
    if (!requireAuth()) return;
    setActiveTopic(t);
    setActive(null);
    setScreen('instructions');
  };

  const start = async () => {
    if (!requireAuth()) return;
    setBusy(true);
    setError('');
    try {
      let a: AttemptStart;
      if (active) {
        a = await apiFetch<AttemptStart>(`/practice/tests/${active.id}/attempts`, { method: 'POST' });
      } else if (activeTopic) {
        a = await apiFetch<AttemptStart>(`/practice/mcq/topics/${activeTopic.topicId}/attempts`, {
          method: 'POST',
        });
      } else return;
      setAttempt(a);
      setRemaining(Math.max(0, Math.floor((Date.parse(a.expiresAt) - Date.now()) / 1000)));
      setVisited({ [a.questions[0].id]: true });
      setSelected({});
      setReview({});
      setCurrent(0);
      setScreen('running');
    } catch (e: any) {
      if (e.message === 'AUTH_REQUIRED' || (e.message || '').includes('Sign in')) {
        window.location.href = '/login?next=/practice';
        return;
      }
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const save = async (qid: number, optionId: number | null, nextReview = review[qid] || false) => {
    if (!attempt) return;
    setSelected((s) =>
      optionId === null
        ? Object.fromEntries(Object.entries(s).filter(([k]) => Number(k) !== qid))
        : { ...s, [qid]: optionId }
    );
    try {
      await apiFetch(`/practice/attempts/${attempt.attemptId}/questions/${qid}`, {
        method: 'PUT',
        body: JSON.stringify({
          selectedOptionId: optionId,
          markedForReview: nextReview,
          visited: true,
          timeSpentSeconds: 0,
        }),
      });
    } catch {
      /* ignore transient */
    }
  };

  const submit = async () => {
    if (!attempt) return;
    setBusy(true);
    try {
      const r = await apiFetch<Result>(`/practice/attempts/${attempt.attemptId}/submit`, {
        method: 'POST',
      });
      setResult(r);
      setScreen('result');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (screen === 'instructions') {
    const title = active?.title || (activeTopic ? `${activeTopic.subjectName} · ${activeTopic.topicName}` : '');
    const meta = active
      ? `${active.totalQuestions} questions · ${active.durationMinutes} min`
      : activeTopic
        ? `${activeTopic.questionCount} published MCQs · timed practice`
        : '';
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-ink/5 bg-white p-8 shadow-soft">
        <button onClick={() => setScreen('hub')} className="text-xs font-semibold text-muted hover:text-purple">
          ← Back
        </button>
        <h2 className="font-display mt-4 text-2xl font-bold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-muted">{meta}</p>
        <ul className="mt-6 space-y-2 text-sm text-charcoal">
          <li className="flex gap-2"><ShieldCheck size={16} className="mt-0.5 text-purple" /> Login required — your score is saved to your dashboard.</li>
          <li className="flex gap-2"><Clock3 size={16} className="mt-0.5 text-purple" /> Timer starts when you begin. Auto-submit on timeout.</li>
          <li className="flex gap-2"><FileQuestion size={16} className="mt-0.5 text-purple" /> Negative marking may apply where shown.</li>
        </ul>
        {error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        <button
          disabled={busy}
          onClick={start}
          className="mt-8 w-full rounded-xl bg-ink py-3.5 font-bold text-white hover:bg-purple disabled:opacity-50"
        >
          {busy ? 'Starting…' : 'Start test'}
        </button>
      </div>
    );
  }

  if (screen === 'running' && attempt) {
    const q = attempt.questions[current];
    return (
      <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
        <div className="rounded-3xl border border-ink/5 bg-white p-6 shadow-soft md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-purple">{attempt.title}</p>
              <p className="mt-1 text-sm text-muted">
                Question {current + 1} of {attempt.questions.length}
              </p>
            </div>
            <div className="rounded-full bg-purple/10 px-4 py-2 font-display text-lg font-bold text-purple">
              {formatTime(remaining)}
            </div>
          </div>
          <div className="mt-6">
            <QuestionRenderer
              question={q}
              selected={selected[q.id] ?? null}
              onSelect={(oid) => save(q.id, oid)}
            />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <button
              disabled={current === 0}
              onClick={() => {
                setCurrent((c) => c - 1);
                setVisited((v) => ({ ...v, [attempt.questions[current - 1].id]: true }));
              }}
              className="inline-flex items-center gap-1 rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              onClick={() => {
                const next = !review[q.id];
                setReview((r) => ({ ...r, [q.id]: next }));
                save(q.id, selected[q.id] ?? null, next);
              }}
              className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold ${
                review[q.id] ? 'bg-amber-100 text-amber-800' : 'border border-ink/10'
              }`}
            >
              <Flag size={14} /> {review[q.id] ? 'Marked' : 'Mark for review'}
            </button>
            {current < attempt.questions.length - 1 ? (
              <button
                onClick={() => {
                  setCurrent((c) => c + 1);
                  setVisited((v) => ({ ...v, [attempt.questions[current + 1].id]: true }));
                }}
                className="inline-flex items-center gap-1 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                disabled={busy}
                onClick={submit}
                className="rounded-full bg-purple px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {busy ? 'Submitting…' : 'Submit'}
              </button>
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-ink/5 bg-white p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Palette</p>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {attempt.questions.map((qq, i) => (
              <button
                key={qq.id}
                onClick={() => {
                  setCurrent(i);
                  setVisited((v) => ({ ...v, [qq.id]: true }));
                }}
                className={`aspect-square rounded-lg text-xs font-bold ${
                  i === current
                    ? 'bg-purple text-white'
                    : review[qq.id]
                      ? 'bg-amber-100 text-amber-800'
                      : selected[qq.id]
                        ? 'bg-emerald-100 text-emerald-800'
                        : visited[qq.id]
                          ? 'bg-slate-100'
                          : 'bg-surface border border-ink/5'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={submit}
            disabled={busy}
            className="mt-6 w-full rounded-xl bg-ink py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            Submit test
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'result' && result) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-ink/5 bg-white p-8 text-center shadow-soft">
          <div
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
              result.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {result.passed ? 'Passed' : 'Not cleared'}
          </div>
          <div className="font-display mt-4 text-5xl font-bold text-purple">
            {Math.round(result.percentage)}%
          </div>
          <p className="mt-2 text-sm text-muted">
            Score {result.score} / {result.maxScore} · Time {formatTime(result.timeTakenSeconds)}
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Metric label="Correct" value={result.correct} />
            <Metric label="Incorrect" value={result.incorrect} />
            <Metric label="Unanswered" value={result.unanswered} />
          </div>
          <button
            onClick={() => {
              setScreen('hub');
              setAttempt(null);
              setResult(null);
              setTab('history');
            }}
            className="mt-8 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white"
          >
            View my history
          </button>
        </div>
      </div>
    );
  }

  // Hub
  return (
    <div>
      {!loggedIn && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple/20 bg-purple/5 px-5 py-4">
          <p className="text-sm text-charcoal">
            <LogIn size={16} className="mr-1 inline text-purple" />
            Sign in to take MCQ practice or mock tests. Your attempts are saved to your dashboard.
          </p>
          <a
            href="/login?next=/practice"
            className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-purple"
          >
            Sign in
          </a>
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        <TabBtn active={tab === 'mock'} onClick={() => setTab('mock')} icon={<Layers size={15} />} label="Mock Tests" />
        <TabBtn active={tab === 'mcq'} onClick={() => setTab('mcq')} icon={<BookOpen size={15} />} label="Topic MCQs" />
        <TabBtn active={tab === 'history'} onClick={() => setTab('history')} icon={<History size={15} />} label="My History" />
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === 'mcq' ? 'Search topics…' : 'Search tests…'}
            className="w-full rounded-full border border-ink/10 bg-white py-2.5 pl-10 pr-4 text-sm outline-none"
          />
        </div>
        <p className="text-xs font-semibold text-muted">
          {tab === 'mock' && `${filtered.length} mock tests`}
          {tab === 'mcq' && `${filteredTopics.length} topics`}
          {tab === 'history' && `${history.length} attempts`}
        </p>
      </div>

      {error && <div className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}

      {tab === 'mock' && (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => openMock(t)}
              className="group rounded-3xl border border-ink/5 bg-white p-6 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-purple/20"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-purple">{t.subject}</p>
                  <h3 className="font-display mt-1 text-lg font-bold text-ink group-hover:text-purple">{t.title}</h3>
                  <p className="mt-2 text-sm text-muted line-clamp-2">{t.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-muted">
                    <span className="rounded-full bg-surface px-2.5 py-1">{t.totalQuestions} Questions</span>
                    <span className="rounded-full bg-surface px-2.5 py-1">{t.durationMinutes} min</span>
                    <span className="rounded-full bg-purple/5 px-2.5 py-1 text-purple">
                      +{t.marksPerQuestion} / -{t.negativeMarks}
                    </span>
                  </div>
                </div>
                <ArrowRight className="text-purple opacity-40 transition group-hover:opacity-100" size={18} />
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted col-span-2">No mock tests found.</p>
          )}
        </div>
      )}

      {tab === 'mcq' && (
        <div>
          <p className="mb-4 text-sm text-muted">
            Practice published questions by topic. (Admin builds the bank in <b>Question Bank</b>; you practice here.)
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTopics.map((t) => (
              <button
                key={t.topicId}
                onClick={() => openTopic(t)}
                className="rounded-3xl border border-ink/5 bg-white p-5 text-left shadow-soft transition hover:border-purple/20"
              >
                <p className="text-[11px] font-bold uppercase tracking-wide text-purple">{t.subjectName}</p>
                <h3 className="font-display mt-1 text-base font-bold text-ink">{t.topicName}</h3>
                <p className="mt-3 text-xs font-semibold text-muted">{t.questionCount} published questions</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-purple">
                  Start topic practice <ArrowRight size={14} />
                </span>
              </button>
            ))}
            {filteredTopics.length === 0 && (
              <p className="text-sm text-muted col-span-3">No topic MCQs available yet.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-3">
          {!loggedIn ? (
            <p className="text-sm text-muted">
              <a href="/login?next=/practice" className="font-semibold text-purple">Sign in</a> to see your attempt history.
            </p>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted">No attempts yet. Take a mock test or topic MCQ to get started.</p>
          ) : (
            history.map((h) => (
              <div key={h.attemptId} className="rounded-2xl border border-ink/5 bg-white p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-ink">{h.title}</h3>
                    <p className="mt-1 text-xs text-muted">
                      {h.status} · Started {h.startedAt ? new Date(h.startedAt).toLocaleString() : '—'}
                    </p>
                  </div>
                  {h.percentage != null && (
                    <div className="text-right">
                      <div className="font-display text-xl font-bold text-purple">{Math.round(Number(h.percentage))}%</div>
                      <p className="text-xs text-muted">
                        {h.score}/{h.maxScore} · ✓{h.correctCount} ✕{h.incorrectCount}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
        active ? 'bg-ink text-white' : 'border border-ink/10 bg-white text-charcoal hover:border-purple/30'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-surface p-4 text-center">
      <div className="font-display text-xl font-bold text-ink">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
