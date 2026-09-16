'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Award, Download, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import PageShell from '@/components/lms/PageShell';
import { getCurrentUser, lmsFetch } from '@/lib/lms/api';

type Course = {
  course_id: string;
  course_name: string;
  instructor: string;
  description: string;
};

export default function CertificatePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const router = useRouter();
  const user = getCurrentUser();
  const certRef = useRef<HTMLDivElement>(null);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const certNumber = `DJ-${String(courseId).slice(0, 8).toUpperCase()}-${String(user?.id || 'GUEST').slice(0, 6).toUpperCase()}`;
  const issuedOn = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    if (!user?.id) {
      router.push('/login');
      return;
    }
    if (!courseId) return;

    (async () => {
      try {
        const c = await lmsFetch<Course>(`/api/courses/${courseId}`, {}, false);
        setCourse(c);
        setTimeout(() => setShowConfetti(true), 400);
      } catch (e: any) {
        setError(e.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, user?.id, router]);

  async function downloadPdf() {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(img, 'PNG', 0, 0, w, h);
      pdf.save(`DoctorJava-Certificate-${course?.course_name || 'course'}.pdf`);
    } catch (e) {
      console.error(e);
      setError('Could not generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-3 px-5 py-24 text-slate-500">
          <Loader2 className="animate-spin" size={20} /> Loading certificate…
        </div>
      </PageShell>
    );
  }

  if (error || !course) {
    return (
      <PageShell>
        <main className="mx-auto max-w-3xl px-5 py-16 text-center">
          <p className="text-rose-600">{error || 'Course not found'}</p>
          <Link href="/learnings" className="mt-6 inline-block text-sm font-bold text-purple">
            ← Back to My Learning
          </Link>
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className="mx-auto max-w-5xl px-5 py-10 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href={`/course/${courseId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
            <ArrowLeft size={16} /> Back to course
          </Link>
          <button
            onClick={downloadPdf}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {downloading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            {downloading ? 'Preparing PDF…' : 'Download PDF'}
          </button>
        </div>

        {/* Confetti burst */}
        {showConfetti && (
          <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <span
                key={i}
                className="absolute h-2 w-2 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 40}%`,
                  background: ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'][i % 5],
                  animationDelay: `${Math.random() * 0.8}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
          <div
            ref={certRef}
            id="certificate"
            className="relative bg-gradient-to-br from-slate-50 via-white to-violet-50 px-8 py-12 md:px-16 md:py-16"
          >
            {/* Decorative corners */}
            <div className="absolute left-4 top-4 h-16 w-16 border-l-4 border-t-4 border-purple/40 rounded-tl-2xl" />
            <div className="absolute right-4 top-4 h-16 w-16 border-r-4 border-t-4 border-purple/40 rounded-tr-2xl" />
            <div className="absolute bottom-4 left-4 h-16 w-16 border-b-4 border-l-4 border-purple/40 rounded-bl-2xl" />
            <div className="absolute bottom-4 right-4 h-16 w-16 border-b-4 border-r-4 border-purple/40 rounded-br-2xl" />

            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple/10 text-purple">
                <Award size={28} />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.25em] text-purple">
                Doctor Java Technologies
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold text-ink md:text-4xl">
                Certificate of Completion
              </h1>
              <p className="mt-4 text-sm text-slate-500">This is to certify that</p>
              <p className="mt-2 font-display text-2xl font-bold text-ink md:text-3xl">
                {user?.name || 'Learner'}
              </p>
              <p className="mt-4 text-sm text-slate-500">has successfully completed the course</p>
              <p className="mt-2 font-display text-xl font-bold text-purple md:text-2xl">
                {course.course_name}
              </p>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500">
                under the guidance of <span className="font-semibold text-ink">{course.instructor}</span>
              </p>

              <div className="mx-auto mt-10 grid max-w-lg grid-cols-2 gap-6 text-left">
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Issued on</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{issuedOn}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Certificate ID</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{certNumber}</p>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-center gap-2 text-emerald-600">
                <CheckCircle2 size={18} />
                <span className="text-sm font-semibold">Verified achievement</span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Share this certificate on LinkedIn or keep it for your records.
        </p>
      </main>
    </PageShell>
  );
}
