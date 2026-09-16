'use client';
import { useEffect, useState } from 'react';
import PageShell from '@/components/lms/PageShell';
import { lmsFetch, isLoggedIn } from '@/lib/lms/api';

type Post = {
  id: string;
  title: string;
  body: string;
  userName?: string;
  courseId?: string;
  pinned?: boolean;
  replyCount?: number;
  createdAt?: string;
};

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [active, setActive] = useState<string | null>(null);
  const [replies, setReplies] = useState<{ body: string; userName?: string }[]>([]);
  const [reply, setReply] = useState('');

  function load() {
    lmsFetch<Post[]>('/api/community/posts', {}, false).then(setPosts).catch(() => {});
  }
  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!isLoggedIn()) {
      location.href = '/login?next=/community';
      return;
    }
    await lmsFetch('/api/community/posts', { method: 'POST', body: JSON.stringify({ title, body }) });
    setTitle('');
    setBody('');
    load();
  }

  async function open(id: string) {
    setActive(id);
    setReplies(await lmsFetch(`/api/community/posts/${id}/replies`, {}, false));
  }

  async function sendReply() {
    if (!active) return;
    await lmsFetch(`/api/community/posts/${active}/replies`, { method: 'POST', body: JSON.stringify({ body: reply }) });
    setReply('');
    open(active);
  }

  return (
    <PageShell>
      <main className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="font-display text-3xl font-bold">Community</h1>
        <p className="mt-1 text-sm text-muted">General Q&A and announcements. Keep it constructive.</p>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-display font-bold">New post</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="mt-3 w-full rounded-xl border px-3 py-2 text-sm"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's on your mind?"
            className="mt-2 w-full min-h-[80px] rounded-xl border px-3 py-2 text-sm"
          />
          <button onClick={create} className="mt-3 rounded-xl bg-ink px-4 py-2 text-sm font-bold text-white">
            Post
          </button>
        </section>

        <ul className="mt-6 space-y-3">
          {posts.map((p) => (
            <li key={p.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <button onClick={() => open(p.id)} className="w-full text-left">
                {p.pinned && <span className="mr-2 text-[10px] font-bold text-purple">PINNED</span>}
                <h3 className="font-display font-bold text-ink">{p.title}</h3>
                <p className="mt-1 text-sm text-slate-600 line-clamp-2">{p.body}</p>
                <p className="mt-2 text-xs text-muted">
                  {p.userName || 'Learner'} · {p.replyCount || 0} replies
                </p>
              </button>
              {active === p.id && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  {replies.map((r, i) => (
                    <div key={i} className="mb-2 text-sm">
                      <b>{r.userName || 'User'}:</b> {r.body}
                    </div>
                  ))}
                  <div className="mt-2 flex gap-2">
                    <input
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      className="flex-1 rounded-xl border px-3 py-2 text-sm"
                      placeholder="Reply…"
                    />
                    <button onClick={sendReply} className="rounded-xl bg-purple px-3 py-2 text-xs font-bold text-white">
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
    </PageShell>
  );
}
