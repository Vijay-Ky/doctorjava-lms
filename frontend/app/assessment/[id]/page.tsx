'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Award, CheckCircle2, RotateCcw, Trophy } from 'lucide-react';
import PageShell from '@/components/lms/PageShell';
import { getCurrentUser, lmsFetch } from '@/lib/lms/api';

type Q = {
  id: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: string;
};

export default function Assessment() {
  const { id } = useParams<{ id: string }>();
  const [qs, setQs] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lmsFetch<Q[]>(`/api/questions/course/${id}`)
      .then(setQs)
      .finally(() => setLoading(false));
  }, [id]);

  async function submit() {
    const correct = qs.reduce((n, q) => n + (answers[q.id] === q.answer ? 1 : 0), 0);
    setScore(correct);
    setSubmitted(true);
    const u = getCurrentUser();
    if (u?.id) {
      await lmsFetch(`/api/assessments/add/${u.id}/${id}`, {
        method: 'POST',
        body: JSON.stringify({
          marks: Math.round(qs.length ? (correct / qs.length) * 100 : 0),
        }),
      }).catch(() => {});
    }
  }

  function retake() {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  }

  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-5xl px-5 py-20 text-center text-slate-500">
          Loading assessment…
        </div>
      </PageShell>
    );
  }

  const pct = qs.length ? Math.round((score / qs.length) * 100) : 0;
  const passed = pct >= 60;

  return (
    <PageShell>
      <main className="mx-auto max-w-5xl px-5 py-10 md:px-8">
        <Link href={`/course/${id}`} className="text-sm font-semibold text-slate-500">
          ← Back to course
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-purple">Assessment</p>
            <h1 className="mt-2 font-display text-3xl font-bold">Course assessment</h1>
            <p className="mt-2 text-sm text-slate-500">
              Answer all questions. Score 60% or higher to unlock your certificate.
            </p>
          </div>
          {submitted && (
            <div
              className={`rounded-2xl px-4 py-3 text-sm font-bold ${
                passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              Score: {pct}%
            </div>
          )}
        </div>

        <div className="mt-7 space-y-5">
          {qs.map((q, i) => (
            <section
              key={q.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
            >
              <h2 className="font-semibold leading-7">
                {i + 1}. {q.question}
              </h2>
              <div className="mt-4 grid gap-2">
                {[q.option1, q.option2, q.option3, q.option4].map((o, n) => {
                  const selected = answers[q.id] === o;
                  const isCorrect = submitted && o === q.answer;
                  const isWrong = submitted && selected && o !== q.answer;
                  return (
                    <label
                      key={n}
                      className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm transition ${
                        isCorrect
                          ? 'border-emerald-400 bg-emerald-50'
                          : isWrong
                          ? 'border-rose-300 bg-rose-50'
                          : selected
                          ? 'border-purple bg-purple/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        disabled={submitted}
                        type="radio"
                        name={q.id}
                        checked={selected}
                        onChange={() => setAnswers({ ...answers, [q.id]: o })}
                      />
                      <span>
                        {String.fromCharCode(65 + n)}. {o}
                      </span>
                      {isCorrect && (
                        <CheckCircle2 className="ml-auto text-emerald-600" size={16} />
                      )}
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {!submitted && qs.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={submit}
              disabled={Object.keys(answers).length < qs.length}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              Submit assessment
            </button>
          </div>
        )}

        {submitted && (
          <div className="mx-auto mt-8 max-w-md space-y-4">
            <div
              className={`rounded-3xl p-7 text-center text-white ${
                passed
                  ? 'bg-gradient-to-br from-purple to-indigo-600'
                  : 'bg-gradient-to-br from-slate-600 to-slate-800'
              }`}
            >
              {passed ? <Trophy className="mx-auto" size={34} /> : <Award className="mx-auto" size={34} />}
              <div className="mt-3 text-4xl font-bold">{pct}%</div>
              <p className="mt-2 text-white/80">
                {score} of {qs.length} answers correct.
              </p>
              {passed ? (
                <p className="mt-3 text-sm text-white/90">Congratulations! You passed.</p>
              ) : (
                <p className="mt-3 text-sm text-white/90">
                  You need 60% to unlock the certificate. Try again!
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={retake}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold"
              >
                <RotateCcw size={15} /> Retake
              </button>
              {passed && (
                <Link
                  href={`/certificate/${id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-purple px-5 py-2.5 text-sm font-bold text-white"
                >
                  <Award size={15} /> Get certificate
                </Link>
              )}
              <Link
                href={`/course/${id}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold"
              >
                Back to course
              </Link>
            </div>
          </div>
        )}

        {qs.length === 0 && (
          <div className="mt-12 rounded-3xl border border-dashed p-12 text-center text-sm text-slate-500">
            No assessment questions available for this course yet.
          </div>
        )}
      </main>
    </PageShell>
  );
}
