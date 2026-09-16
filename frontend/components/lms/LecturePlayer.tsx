'use client';
import { useEffect, useState } from 'react';
import { lmsFetch, getCurrentUser, isLoggedIn } from '@/lib/lms/api';
import { Lock, Download, FileText, Radio } from 'lucide-react';

type Props = {
  lectureId: string;
  contentType?: string;
  locked?: boolean;
  lockReason?: string | null;
  textContent?: string | null;
  title: string;
};

/**
 * Fetches access-checked content URL and renders by type.
 * VIDEO includes a moving name/email watermark (deterrent only — not DRM).
 */
export default function LecturePlayer({ lectureId, contentType, locked, lockReason, textContent, title }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [type, setType] = useState(contentType || 'VIDEO');
  const [text, setText] = useState(textContent || '');
  const [error, setError] = useState('');
  const [wmPos, setWmPos] = useState({ x: 10, y: 10 });
  const user = getCurrentUser();

  useEffect(() => {
    if (!locked && isLoggedIn()) {
      lmsFetch(`/api/progress/lecture/${lectureId}`, {
        method: 'POST',
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      }).catch(() => {});
    }
  }, [lectureId, locked]);

  useEffect(() => {
    if (locked) return;
    if (contentType === 'TEXT' && textContent) {
      setText(textContent);
      setType('TEXT');
      return;
    }
    lmsFetch<{ url?: string; contentType?: string; textContent?: string }>(`/api/curriculum/lectures/${lectureId}/content-url`)
      .then((r) => {
        setType(r.contentType || contentType || 'VIDEO');
        if (r.textContent) setText(r.textContent);
        if (r.url) setUrl(r.url);
      })
      .catch((e) => setError(e.message));
  }, [lectureId, locked, contentType, textContent]);

  useEffect(() => {
    if (type !== 'VIDEO') return;
    const t = setInterval(() => {
      setWmPos({
        x: 8 + Math.random() * 60,
        y: 8 + Math.random() * 70,
      });
    }, 4000);
    return () => clearInterval(t);
  }, [type]);

  if (locked) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center rounded-2xl bg-slate-900 text-white">
        <Lock className="mb-3 text-white/70" size={28} />
        <p className="text-sm font-semibold">{lockReason || 'Locked'}</p>
      </div>
    );
  }

  if (error) {
    return <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>;
  }

  if (type === 'TEXT') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 prose max-w-none">
        <h3 className="font-display text-lg font-bold">{title}</h3>
        <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{text || 'No content'}</div>
      </div>
    );
  }

  if (type === 'PDF' && url) {
    return (
      <iframe title={title} src={url} className="aspect-[4/3] w-full rounded-2xl border border-slate-200 bg-white" />
    );
  }

  if (type === 'AUDIO' && url) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="mb-3 text-sm font-semibold">{title}</p>
        <audio controls className="w-full" src={url} />
      </div>
    );
  }

  if (type === 'DOWNLOAD' && url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-ink hover:border-purple/40"
      >
        <Download size={18} className="text-purple" /> Download resource
      </a>
    );
  }

  if (type === 'LIVE_CLASS') {
    return (
      <div className="rounded-2xl border border-purple/20 bg-purple/5 p-6 text-sm">
        <Radio className="mb-2 text-purple" size={20} />
        <p className="font-semibold text-ink">Live class</p>
        <p className="mt-1 text-muted">Join link appears when the session is active (see course live schedule).</p>
      </div>
    );
  }

  if (type === 'ASSIGNMENT') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm">
        <FileText className="mb-2 text-purple" size={20} />
        <p className="font-semibold">Assignment lecture</p>
        <p className="mt-1 text-muted">Open the assignments panel for this course to submit your work.</p>
      </div>
    );
  }

  // VIDEO default
  if (!url) {
    return <div className="aspect-video animate-pulse rounded-2xl bg-slate-200" />;
  }

  const isYt = /youtube|youtu\.be/.test(url);
  const watermark = [user?.name, user?.email].filter(Boolean).join(' · ') || 'Doctor Java learner';

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
      {isYt ? (
        <iframe
          title={title}
          src={url.includes('embed') ? url : url.replace('watch?v=', 'embed/')}
          className="h-full w-full"
          allowFullScreen
        />
      ) : (
        <video src={url} controls controlsList="nodownload" className="h-full w-full" onContextMenu={(e) => e.preventDefault()} />
      )}
      <div
        className="pointer-events-none absolute text-[11px] font-semibold text-white/40"
        style={{ left: `${wmPos.x}%`, top: `${wmPos.y}%` }}
      >
        {watermark}
      </div>
      {isLoggedIn() && (
        <button
          type="button"
          className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-ink"
          onClick={() =>
            lmsFetch(`/api/progress/lecture/${lectureId}`, {
              method: 'POST',
              body: JSON.stringify({ status: 'COMPLETED' }),
            }).catch(() => {})
          }
        >
          Mark complete
        </button>
      )}
    </div>
  );
}
