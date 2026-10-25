'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AdminPostSummary, Idea } from '@/lib/posts';

interface Props {
  initialPosts: AdminPostSummary[];
  initialIdeas: Idea[];
}

// UTC, like the public site (Worker runtime): "2026-02-21" must not show as Feb 20 in São Paulo
const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
    : '';

const sectionLabel = 'font-mono text-xs uppercase tracking-[0.08em] text-muted mb-3';

export default function AdminDashboard({ initialPosts, initialIdeas }: Props) {
  const router = useRouter();
  const [ideas, setIdeas] = useState(initialIdeas);
  const [ideaText, setIdeaText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const drafts = initialPosts.filter((p) => p.status === 'draft');
  const published = initialPosts
    .filter((p) => p.status === 'published')
    .sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''));

  const call = async (url: string, body: unknown) => {
    setError('');
    setBusy(true);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      return null;
    } finally {
      setBusy(false);
    }
  };

  const newDraft = async () => {
    const draft = await call('/api/admin/posts', {});
    if (draft) router.push(`/admin/posts/${draft.id}`);
  };

  const addIdea = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!ideaText.trim()) return;
    const idea = await call('/api/admin/ideas', { text: ideaText });
    if (idea) {
      setIdeas([idea, ...ideas]);
      setIdeaText('');
    }
  };

  const archive = async (id: number) => {
    if (await call(`/api/admin/ideas/${id}`, { action: 'archive' })) {
      setIdeas(ideas.filter((idea) => idea.id !== id));
    }
  };

  const draftFromIdea = async (id: number) => {
    const draft = await call(`/api/admin/ideas/${id}`, { action: 'draft' });
    if (draft) router.push(`/admin/posts/${draft.id}`);
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[720px] mx-auto px-5 sm:px-6 py-10 sm:py-16">
        <div className="flex justify-between items-center gap-4 mb-10">
          <h1 className="text-xl font-semibold text-strong">Writing</h1>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted hover:text-foreground">
              Site
            </Link>
            <button onClick={logout} className="text-sm text-muted hover:text-foreground">
              Logout
            </button>
            <button
              onClick={newDraft}
              disabled={busy}
              className="px-3.5 py-2 bg-foreground text-black rounded-lg hover:bg-white transition-colors disabled:opacity-50 text-sm font-medium"
            >
              New draft
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 border border-danger/40 bg-danger/10 rounded-lg text-danger text-sm">
            {error}
          </div>
        )}

        {/* Ideas inbox */}
        <section className="mb-12">
          <h2 className={sectionLabel}>Ideas</h2>
          <form onSubmit={addIdea} className="mb-4">
            <textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addIdea();
              }}
              rows={2}
              placeholder="Jot down an idea… (⌘↵ to save)"
              className="w-full px-3.5 py-3 bg-surface border border-line rounded-lg text-foreground placeholder:text-[#5a5a5a] focus:outline-none focus:border-accent text-base resize-y"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={busy || !ideaText.trim()}
                className="px-3.5 py-2 border border-line-strong rounded-lg text-sm font-medium text-foreground hover:border-muted disabled:opacity-40"
              >
                Save idea
              </button>
            </div>
          </form>
          {ideas.length === 0 ? (
            <p className="text-muted text-sm">No ideas yet.</p>
          ) : (
            <ul className="divide-y divide-line border border-line rounded-lg">
              {ideas.map((idea) => (
                <li key={idea.id} className="p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                  <p className="flex-1 text-foreground whitespace-pre-wrap">{idea.text}</p>
                  <div className="flex gap-3 text-sm shrink-0">
                    <button
                      onClick={() => draftFromIdea(idea.id)}
                      disabled={busy}
                      className="text-accent hover:underline font-medium disabled:opacity-50"
                    >
                      Turn into draft
                    </button>
                    <button
                      onClick={() => archive(idea.id)}
                      disabled={busy}
                      className="text-muted hover:text-foreground disabled:opacity-50"
                    >
                      Archive
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <PostList title="Drafts" posts={drafts} empty="No drafts." dateOf={(p) => `Edited ${formatDate(p.updated_at)}`} />
        <PostList title="Published" posts={published} empty="Nothing published yet." dateOf={(p) => formatDate(p.published_at)} />
      </div>
    </div>
  );
}

function PostList({
  title,
  posts,
  empty,
  dateOf,
}: {
  title: string;
  posts: AdminPostSummary[];
  empty: string;
  dateOf: (post: AdminPostSummary) => string;
}) {
  return (
    <section className="mb-12">
      <h2 className={sectionLabel}>{title}</h2>
      {posts.length === 0 ? (
        <p className="text-muted text-sm">{empty}</p>
      ) : (
        <ul className="divide-y divide-line border border-line rounded-lg">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/admin/posts/${post.id}`}
                className="block p-4 hover:bg-surface transition-colors"
              >
                <div className="font-medium text-strong">
                  {post.title || <span className="text-muted">Untitled</span>}
                </div>
                <div className="text-sm text-muted mt-1">
                  {dateOf(post)}
                  {post.has_pending_changes ? <span className="text-accent"> · Unpublished changes</span> : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
