'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageCircle,
  PlayCircle,
  Star,
  UserPlus,
} from 'lucide-react';
import PageShell from '@/components/lms/PageShell';
import { getCurrentUser, lmsFetch } from '@/lib/lms/api';
import LecturePlayer from '@/components/lms/LecturePlayer';

type Course = {
  course_id: string;
  course_name: string;
  price: number;
  instructor: string;
  description: string;
  p_link?: string;
  y_link?: string;
};

type Lecture = {
  id: string;
  title: string;
  durationMinutes: number;
  videoUrl?: string;
  contentType?: string;
  lockReason?: string | null;
  textContent?: string | null;
  hasContent?: boolean;
  preview: boolean;
  locked?: boolean;
  sortOrder: number;
};

type Section = {
  id: string;
  title: string;
  sortOrder: number;
  lectures: Lecture[];
};

type Discussion = { id: string; userName: string; content: string; time: string };

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const user = getCurrentUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [curriculum, setCurriculum] = useState<Section[]>([]);
  const [progress, setProgress] = useState(0);
  const [enrolled, setEnrolled] = useState(false);
  const [showPayOptions, setShowPayOptions] = useState(false);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponPreview, setCouponPreview] = useState<{ finalRupees: number; discountRupees: number; originalRupees: number } | null>(null);

  useEffect(() => {
    if (!id) return;
    lmsFetch<Course>(`/api/courses/${id}`, {}, false)
      .then((c) => {
        setCourse(c);
        if (c.y_link) setActiveVideo(c.y_link);
      })
      .catch((e) => setError(e.message));
    lmsFetch<Section[]>(`/api/curriculum/course/${id}`)
      .then((secs) => {
        setCurriculum(secs || []);
        if (secs?.[0]?.id) setOpenSections({ [secs[0].id]: true });
      })
      .catch(() => setCurriculum([]));
    lmsFetch<Discussion[]>(`/api/discussions/${id}`)
      .then(setDiscussions)
      .catch(() => {});
    if (user?.id) {
      lmsFetch<Course[]>(`/api/learning/${user.id}`)
        .then((cs) => setEnrolled(cs.some((c) => c.course_id === id)))
        .catch(() => {});
      lmsFetch<number>(`/api/progress/${user.id}/${id}`)
        .then(setProgress)
        .catch(() => {});
    }
  }, [id]);

  async function enrollFree() {
    if (!user?.id) { location.href = '/login'; return; }
    setBusy(true);
    try {
      await lmsFetch('/api/learning', { method: 'POST', body: JSON.stringify({ userId: user.id, courseId: id }) });
      setEnrolled(true);
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function payRazorpay() {
    if (!user?.id) { location.href = '/login'; return; }
    setBusy(true); setError(null);
    try {
      const order = await lmsFetch<any>('/api/payments/razorpay/create', { method: 'POST', body: JSON.stringify({ courseId: id, couponCode: couponCode || undefined }) });
      if (order.mock) {
        await lmsFetch('/api/payments/mock-complete', { method: 'POST', body: JSON.stringify({ orderId: order.orderId }) });
        setEnrolled(true);
        alert('Enrolled (Razorpay mock — set RAZORPAY_KEY_ID/SECRET for live payments)');
        return;
      }
      // @ts-ignore
      const rzp = new (window as any).Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Doctor Java Technologies',
        description: order.courseName || 'Course enrollment',
        order_id: order.orderId,
        handler: async function (response: any) {
          await lmsFetch('/api/payments/razorpay/verify', {
            method: 'POST',
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });
          setEnrolled(true);
          alert('Payment successful — you are enrolled!');
        },
      });
      rzp.open();
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function payStripe() {
    if (!user?.id) { location.href = '/login'; return; }
    setBusy(true); setError(null);
    try {
      const session = await lmsFetch<any>('/api/payments/stripe/create', { method: 'POST', body: JSON.stringify({ courseId: id, couponCode: couponCode || undefined }) });
      if (session.mock) {
        await lmsFetch('/api/payments/mock-complete', { method: 'POST', body: JSON.stringify({ orderId: session.sessionId }) });
        setEnrolled(true);
        alert('Enrolled (Stripe mock — set STRIPE_SECRET_KEY for live Checkout)');
        return;
      }
      if (session.url) window.location.href = session.url;
    } catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function saveProgress(value: number) {
    setProgress(value);
    if (user?.id) {
      await lmsFetch('/api/progress/update-progress', {
        method: 'PUT',
        body: JSON.stringify({
          userId: user.id,
          courseId: id,
          playedTime: value,
          duration: Math.max(value, 100),
        }),
      }).catch(() => {});
    }
  }

  async function postDiscussion() {
    if (!user?.name || !message.trim()) return;
    try {
      await lmsFetch('/api/discussions/addMessage', {
        method: 'POST',
        body: JSON.stringify({ course_id: id, name: user.name, content: message }),
      });
      setMessage('');
      setDiscussions(await lmsFetch<Discussion[]>(`/api/discussions/${id}`));
    } catch (e: any) {
      setError(e.message);
    }
  }

  const totalLectures = curriculum.reduce((n, s) => n + (s.lectures?.length || 0), 0);
  const totalMins = curriculum.reduce(
    (n, s) => n + (s.lectures || []).reduce((m, l) => m + (l.durationMinutes || 0), 0),
    0
  );

  if (error && !course) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-5 py-20 text-center text-rose-600">{error}</div>
      </PageShell>
    );
  }

  if (!course) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-5 py-20 text-center text-slate-500">Loading course…</div>
      </PageShell>
    );
  }

  function ytEmbed(url?: string | null) {
    if (!url) return null;
    const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{6,})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : null;
  }

  const embed = ytEmbed(activeVideo);
  const playerBlock = activeLecture ? (
    <LecturePlayer
      lectureId={activeLecture.id}
      contentType={activeLecture.contentType}
      locked={!!activeLecture.locked}
      lockReason={activeLecture.lockReason}
      textContent={activeLecture.textContent}
      title={activeLecture.title}
    />
  ) : null;

  return (
    <PageShell>
      {/* Dark Udemy-style header */}
      <div className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-5 md:grid-cols-[1fr_340px] md:px-8 md:py-10">
          <div>
            <Link href="/courses" className="text-xs font-semibold text-purple-300">
              ← All courses
            </Link>
            <h1 className="mt-3 font-display text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
              {course.course_name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">{course.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-300">
                Bestseller
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                <Star size={14} className="fill-amber-400" /> 4.8
              </span>
              <span className="text-white/50">(1,240 ratings)</span>
              <span className="text-white/70">Created by {course.instructor}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/60">
              <span className="inline-flex items-center gap-1">
                <PlayCircle size={14} /> {totalLectures || 12} lectures
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={14} /> {totalMins || 6} total minutes
              </span>
              <span>Self-paced · Lifetime access</span>
            </div>
          </div>

          {/* Sticky purchase card on desktop sits below on mobile */}
          <div className="md:hidden" />
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-5 md:grid-cols-[1fr_340px] md:px-8">
        <div className="space-y-8">
          {/* Video player */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-soft">
            {playerBlock ? (
              <div className="bg-white p-0">{playerBlock}</div>
            ) : embed ? (
              <div className="aspect-video w-full">
                <iframe
                  title="Course preview"
                  src={embed}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-slate-900 text-sm text-white/60">
                Select a lecture or preview video
              </div>
            )}
          </section>

          {/* What you'll learn */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="font-display text-xl font-bold">FAQ</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><b>Refund policy:</b> Contact support within 7 days if the course has not been substantially completed.</li>
              <li><b>Access:</b> Lifetime access to enrolled course materials including future curriculum updates.</li>
              <li><b>Certificate:</b> Issued on completing assessments above the pass threshold.</li>
            </ul>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="font-display text-xl font-bold">What you&apos;ll learn</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                'Build real projects with industry practices',
                'Master core concepts with hands-on demos',
                'Prepare for interviews with MCQs',
                'Earn a certificate after assessment',
              ].map((t) => (
                <li key={t} className="flex gap-2 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                  {t}
                </li>
              ))}
            </ul>
          </section>

          {/* Curriculum accordion */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-display text-xl font-bold">Course content</h2>
              <p className="text-xs text-slate-500">
                {curriculum.length} sections · {totalLectures} lectures · {totalMins}m
              </p>
            </div>
            <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
              {curriculum.length === 0 && (
                <p className="p-4 text-sm text-slate-500">
                  Curriculum will appear after database seed (Flyway V7).
                </p>
              )}
              {curriculum.map((sec) => {
                const open = openSections[sec.id];
                return (
                  <div key={sec.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenSections((s) => ({ ...s, [sec.id]: !s[sec.id] }))
                      }
                      className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left text-sm font-bold"
                    >
                      <span>{sec.title}</span>
                      {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {open && (
                      <ul className="bg-white">
                        {(sec.lectures || []).map((lec) => (
                          <li
                            key={lec.id}
                            className="flex items-center justify-between gap-3 border-t border-slate-50 px-4 py-2.5 text-sm"
                          >
                            <button
                              type="button"
                              className="flex min-w-0 items-center gap-2 text-left hover:text-purple"
                              onClick={() => {
                                if (!lec.locked && (lec.preview || enrolled || lec.hasContent || lec.videoUrl)) {
                                  setActiveLecture(lec);
                                  setActiveVideo(lec.videoUrl || course.y_link || null);
                                } else if (lec.locked) {
                                  alert('Enroll to unlock this lecture');
                                }
                              }}
                            >
                              <PlayCircle size={15} className="shrink-0 text-slate-400" />
                              <span className="truncate">{lec.title}</span>
                              {lec.preview && (
                                <span className="shrink-0 rounded bg-purple/10 px-1.5 py-0.5 text-[10px] font-bold text-purple">
                                  Preview
                                </span>
                              )}
                              {lec.locked && (
                                <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                                  Locked
                                </span>
                              )}
                            </button>
                            <span className="shrink-0 text-xs text-slate-400">
                              {lec.durationMinutes}m
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Progress (enrolled) */}
          {enrolled && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold">Your progress</h2>
                <span className="font-bold text-purple">{Math.round(progress)}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-purple transition-all"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => saveProgress(Math.min(100, progress + 10))}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
                >
                  Mark +10%
                </button>
                <Link
                  href={`/assessment/${id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white"
                >
                  <CheckCircle2 size={15} /> Take assessment
                </Link>
                {progress >= 100 && (
                  <Link
                    href={`/certificate/${id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
                  >
                    <Award size={15} /> Get certificate
                  </Link>
                )}
              </div>
            </section>
          )}

          {/* Discussion */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Q&A</h2>
              <MessageCircle size={18} className="text-purple" />
            </div>
            <div className="mt-4 space-y-3">
              {discussions.map((d) => (
                <div key={d.id} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex justify-between text-xs font-semibold text-slate-500">
                    <span>{d.userName}</span>
                    <span>{d.time ? new Date(d.time).toLocaleString() : ''}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6">{d.content}</p>
                </div>
              ))}
              {discussions.length === 0 && (
                <p className="text-sm text-slate-500">No questions yet — start the discussion.</p>
              )}
            </div>
            {user?.name && (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input flex-1"
                  placeholder="Ask a question…"
                />
                <button
                  onClick={postDiscussion}
                  className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white"
                >
                  Post
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar card */}
        <aside className="-mt-24 h-fit md:sticky md:top-24 md:mt-0">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="aspect-video bg-gradient-to-br from-slate-900 to-purple" />
            <div className="p-5">
              <div className="font-display text-3xl font-bold">
                ₹{course.price.toLocaleString('en-IN')}
              </div>

              {enrolled ? (
                <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                  You are enrolled — full syllabus unlocked
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <label className="text-xs font-bold uppercase text-muted">Coupon code</label>
                    <div className="mt-2 flex gap-2">
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onBlur={async () => {
                          if (!couponCode || !id) { setCouponPreview(null); return; }
                          try {
                            const r = await lmsFetch<any>('/api/payments/validate-coupon', {
                              method: 'POST',
                              body: JSON.stringify({ code: couponCode, courseId: id }),
                            });
                            setCouponPreview(r);
                          } catch (e: any) {
                            setCouponPreview(null);
                            setError(e.message);
                          }
                        }}
                        placeholder="SAVE10"
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      />
                    </div>
                    {couponPreview && (
                      <p className="mt-2 text-sm text-emerald-700">
                        ₹{couponPreview.originalRupees} → <b>₹{couponPreview.finalRupees}</b> (save ₹{couponPreview.discountRupees})
                      </p>
                    )}
                  </div>

                  {!showPayOptions ? (
                    <button
                      onClick={() => setShowPayOptions(true)}
                      disabled={busy}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-purple py-3 text-sm font-bold text-white hover:bg-ink disabled:opacity-50"
                    >
                      <UserPlus size={16} /> Enroll now
                    </button>
                  ) : (
                    <div className="space-y-2 rounded-xl border border-purple/20 bg-purple/5 p-3">
                      <p className="text-xs font-semibold text-ink">Choose payment method</p>
                      <button onClick={payRazorpay} disabled={busy}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-purple py-2.5 text-sm font-bold text-white hover:bg-ink disabled:opacity-50">
                        {busy ? 'Please wait…' : 'Pay with Razorpay'}
                      </button>
                      <button onClick={payStripe} disabled={busy}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-bold text-ink disabled:opacity-50">
                        Pay with Stripe
                      </button>
                      <button onClick={() => setShowPayOptions(false)} className="w-full text-xs text-muted underline">
                        Cancel
                      </button>
                    </div>
                  )}

                  {course.price === 0 && (
                    <button onClick={enrollFree} disabled={busy} className="w-full text-xs font-semibold text-slate-500 underline">
                      Free enroll
                    </button>
                  )}
                </div>
              )}

              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" /> Full lifetime access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" /> Assessment + certificate
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" /> Access on mobile & desktop
                </li>
              </ul>
              <Link
                href="/learnings"
                className="mt-4 block text-center text-sm font-semibold text-purple hover:underline"
              >
                Go to My Learning
              </Link>
            </div>
          </div>
        </aside>
      </main>
    </PageShell>
  );
}
