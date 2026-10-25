'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { renderMarkdown } from '@/lib/markdown';
import { slugify } from '@/lib/slug';
import type { AdminPost } from '@/lib/posts';

type Fields = Pick<AdminPost, 'title' | 'slug' | 'excerpt' | 'body_md'>;
type SaveState = 'saved' | 'unsaved' | 'saving' | 'error';

const AUTOSAVE_DELAY_MS = 800;

// New drafts get "<slug>-<6 hex>" so they stay unique until a real slug is chosen
const isPlaceholderSlug = (slug: string) => /-[0-9a-f]{6}$/.test(slug);

export default function PostEditor({ initialPost }: { initialPost: AdminPost }) {
  const [post, setPost] = useState(initialPost);
  const [fields, setFields] = useState<Fields>({
    title: initialPost.title,
    slug: initialPost.slug,
    excerpt: initialPost.excerpt,
    body_md: initialPost.body_md,
  });
  // Slug follows the title until it is edited by hand or the post goes live
  const [slugTouched, setSlugTouched] = useState(
    initialPost.status === 'published' || !isPlaceholderSlug(initialPost.slug)
  );
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [busy, setBusy] = useState(false);

  // Title wraps onto multiple lines (long titles on phones) instead of scrolling sideways
  const titleRef = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [fields.title]);

  const latest = useRef(fields);
  const version = useRef(0);
  const savedVersion = useRef(0);
  latest.current = fields;

  const save = useCallback(async (): Promise<boolean> => {
    const thisVersion = version.current;
    if (thisVersion === savedVersion.current) return true;

    setSaveState('saving');
    try {
      const response = await fetch(`/api/admin/posts/${initialPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(latest.current),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save');

      savedVersion.current = Math.max(savedVersion.current, thisVersion);
      setPost(data);
      // Only mark saved if nothing changed while the request was in flight
      if (thisVersion === version.current) {
        setSaveState('saved');
        setMessage('');
      }
      return true;
    } catch (e) {
      setSaveState('error');
      setMessage(e instanceof Error ? e.message : 'Failed to save');
      return false;
    }
  }, [initialPost.id]);

  const update = (patch: Partial<Fields>) => {
    setFields((current) => {
      const next = { ...current, ...patch };
      if (patch.title !== undefined && !slugTouched && slugify(patch.title)) {
        next.slug = slugify(patch.title);
      }
      return next;
    });
    version.current += 1;
    setSaveState('unsaved');
  };

  // Debounced autosave
  useEffect(() => {
    if (saveState !== 'unsaved') return;
    const timer = setTimeout(save, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [fields, saveState, save]);

  // ⌘S / Ctrl+S saves immediately; warn before leaving with unsaved changes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (version.current !== savedVersion.current) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [save]);

  const setStatus = async (status: AdminPost['status']) => {
    if (status === 'published' && !confirm(`Publish "${fields.title || 'Untitled'}" at /blog/${fields.slug}?`)) return;
    if (status === 'draft' && !confirm('Unpublish this post? It will disappear from the site.')) return;

    setBusy(true);
    setMessage('');
    try {
      if (!(await save())) return;
      const response = await fetch(`/api/admin/posts/${initialPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update status');
      setPost(data);
      setSlugTouched(true);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to update status');
    } finally {
      setBusy(false);
    }
  };

  // Same newsletter flow as before: emails every subscriber about this post
  const emailSubscribers = async () => {
    if (!confirm(`Send "${post.title}" to all subscribers?`)) return;

    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/notify-subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postTitle: post.title, postExcerpt: post.excerpt, postSlug: post.slug }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send emails');
      setMessage(
        data.successful !== undefined
          ? `Sent to ${data.successful} subscriber(s)${data.failed ? ` (${data.failed} failed)` : ''}.`
          : data.message
      );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to send emails');
    } finally {
      setBusy(false);
    }
  };

  const previewHtml = useMemo(() => renderMarkdown(fields.body_md), [fields.body_md]);
  const isPublished = post.status === 'published';

  const saveLabel = {
    saved: 'Saved',
    unsaved: 'Unsaved changes',
    saving: 'Saving…',
    error: 'Not saved',
  }[saveState];

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/admin" className="text-sm text-text-light hover:text-foreground">
            ← Writing
          </Link>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isPublished ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isPublished ? 'Published' : 'Draft'}
          </span>
          <span className={`text-xs ${saveState === 'error' ? 'text-red-600' : 'text-text-light'}`}>
            {saveLabel}
          </span>
          <div className="ml-auto flex items-center gap-3 text-sm">
            {isPublished && (
              <>
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-light hover:text-foreground"
                >
                  View
                </a>
                <button
                  onClick={emailSubscribers}
                  disabled={busy}
                  className="text-text-light hover:text-foreground disabled:opacity-50"
                >
                  Email subscribers
                </button>
              </>
            )}
            <button
              onClick={() => setStatus(isPublished ? 'draft' : 'published')}
              disabled={busy}
              className={`px-4 py-2 rounded-lg font-medium disabled:opacity-50 ${
                isPublished
                  ? 'border border-border hover:border-foreground'
                  : 'bg-foreground text-white hover:opacity-90'
              }`}
            >
              {isPublished ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>
        {message && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3 text-sm text-text-secondary">{message}</div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Meta fields */}
        <textarea
          ref={titleRef}
          value={fields.title}
          onChange={(e) => update({ title: e.target.value.replace(/\n/g, ' ') })}
          onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
          placeholder="Title"
          rows={1}
          className="w-full text-3xl sm:text-4xl font-bold text-foreground placeholder:text-slate-300 focus:outline-none resize-none overflow-hidden mb-3"
        />
        <div className="flex items-center gap-1 text-sm text-text-light mb-3">
          <span>/blog/</span>
          <input
            value={fields.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update({ slug: e.target.value });
            }}
            onBlur={() => setFields((f) => ({ ...f, slug: slugify(f.slug) || post.slug }))}
            className="flex-1 min-w-0 bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none"
          />
        </div>
        <textarea
          value={fields.excerpt}
          onChange={(e) => update({ excerpt: e.target.value })}
          placeholder="Excerpt (shown in the essays list and link previews)"
          rows={2}
          className="w-full text-lg text-text-secondary placeholder:text-slate-300 focus:outline-none resize-none mb-6"
        />

        {/* Write / preview tabs on small screens; side by side on large */}
        <div className="flex gap-2 mb-3 lg:hidden">
          {(['write', 'preview'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                tab === t ? 'bg-foreground text-white' : 'text-text-light'
              }`}
            >
              {t === 'write' ? 'Write' : 'Preview'}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <textarea
            value={fields.body_md}
            onChange={(e) => update({ body_md: e.target.value })}
            placeholder="Write in markdown…"
            className={`${tab === 'write' ? 'block' : 'hidden'} lg:block w-full min-h-[60vh] p-4 border border-border rounded-lg font-mono text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary resize-y`}
          />
          <div
            className={`${tab === 'preview' ? 'block' : 'hidden'} lg:block min-h-[60vh] p-4 border border-border rounded-lg overflow-auto`}
          >
            {fields.body_md.trim() ? (
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <p className="text-text-light">Preview appears here.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
