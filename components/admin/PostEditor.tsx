'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { renderMarkdown } from '@/lib/markdown';
import { slugify } from '@/lib/slug';
import { editableFields, type EditableFields } from '@/lib/postFields';
import type { AdminPost } from '@/lib/posts';

type SaveState = 'saved' | 'unsaved' | 'saving' | 'error';

const AUTOSAVE_DELAY_MS = 800;

// New drafts get "<slug>-<6 hex>" so they stay unique until a real slug is chosen
const isPlaceholderSlug = (slug: string) => /-[0-9a-f]{6}$/.test(slug);

const ghostButton =
  'px-3 py-1.5 rounded-lg border border-line-strong text-foreground hover:border-muted disabled:opacity-50';
const solidButton = 'px-3 py-1.5 rounded-lg bg-foreground text-black font-medium hover:bg-white disabled:opacity-50';

export default function PostEditor({ initialPost }: { initialPost: AdminPost }) {
  const router = useRouter();
  const [post, setPost] = useState(initialPost);
  // Published posts open with their pending edits, if any
  const [fields, setFields] = useState<EditableFields>(() => editableFields(initialPost));
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

  const update = (patch: Partial<EditableFields>) => {
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

  // Runs an action against this post after flushing any pending autosave
  const run = async (body: Record<string, unknown>, fallbackError: string) => {
    setBusy(true);
    setMessage('');
    try {
      if (!(await save())) return null;
      const response = await fetch(`/api/admin/posts/${initialPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || fallbackError);
      setPost(data);
      return data as AdminPost;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : fallbackError);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const setStatus = async (status: AdminPost['status']) => {
    if (status === 'published' && !confirm(`Publish "${fields.title || 'Untitled'}" at /blog/${fields.slug}?`)) return;
    if (status === 'draft' && !confirm('Unpublish this post? It will disappear from the site.')) return;
    if (await run({ status }, 'Failed to update status')) setSlugTouched(true);
  };

  // Makes the pending edits live
  const applyChanges = async () => {
    if (await run({ action: 'apply' }, 'Failed to update the post')) setMessage('Live post updated.');
  };

  // Drops the pending edits and goes back to what is live
  const discardChanges = async () => {
    if (!confirm('Discard your changes? The live post stays as it is.')) return;
    const data = await run({ action: 'discard' }, 'Failed to discard changes');
    if (data) {
      savedVersion.current = version.current;
      setFields(editableFields(data));
      setSaveState('saved');
    }
  };

  const deleteDraft = async () => {
    if (!confirm(`Delete "${fields.title || 'Untitled'}"? This can't be undone.`)) return;

    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/posts/${initialPost.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete');
      // Nothing left to save: skip the "unsaved changes" warning on the way out
      savedVersion.current = version.current;
      router.replace('/admin');
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Failed to delete');
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
  const hasPendingChanges = isPublished && post.pending_changes !== null;

  const saveLabel = {
    saved: 'Saved',
    unsaved: 'Unsaved',
    saving: 'Saving…',
    error: 'Not saved',
  }[saveState];

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/admin" className="text-sm text-muted hover:text-foreground">
            ← Writing
          </Link>
          <span
            className={`font-mono text-[11px] uppercase tracking-[0.06em] px-2 py-0.5 rounded-full border ${
              isPublished ? 'border-success/40 text-success' : 'border-line-strong text-muted'
            }`}
          >
            {isPublished ? 'Published' : 'Draft'}
          </span>
          <span className={`text-xs ${saveState === 'error' ? 'text-danger' : 'text-muted'}`}>{saveLabel}</span>
          {hasPendingChanges && <span className="text-xs text-accent">Unpublished changes</span>}

          <div className="ml-auto flex flex-wrap items-center gap-2 text-sm">
            {isPublished ? (
              <>
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 text-muted hover:text-foreground"
                >
                  View
                </a>
                <button onClick={emailSubscribers} disabled={busy} className="px-2 text-muted hover:text-foreground disabled:opacity-50">
                  Email subscribers
                </button>
                {hasPendingChanges && (
                  <>
                    <button onClick={discardChanges} disabled={busy} className={ghostButton}>
                      Discard changes
                    </button>
                    <button onClick={applyChanges} disabled={busy} className={solidButton}>
                      Update
                    </button>
                  </>
                )}
                <button onClick={() => setStatus('draft')} disabled={busy} className={ghostButton}>
                  Unpublish
                </button>
              </>
            ) : (
              <>
                <button onClick={deleteDraft} disabled={busy} className="px-2 text-muted hover:text-danger disabled:opacity-50">
                  Delete
                </button>
                <button onClick={() => setStatus('published')} disabled={busy} className={solidButton}>
                  Publish
                </button>
              </>
            )}
          </div>
        </div>
        {message && <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3 text-sm text-muted">{message}</div>}
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
          className="w-full bg-transparent text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-strong placeholder:text-[#3a3a3a] focus:outline-none resize-none overflow-hidden mb-3"
        />
        <div className="flex items-center gap-1 font-mono text-[13px] text-muted mb-3">
          <span>/blog/</span>
          <input
            value={fields.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update({ slug: e.target.value });
            }}
            onBlur={() => setFields((f) => ({ ...f, slug: slugify(f.slug) || post.slug }))}
            className="flex-1 min-w-0 bg-transparent border-b border-transparent hover:border-line-strong focus:border-accent focus:outline-none"
          />
        </div>
        <textarea
          value={fields.excerpt}
          onChange={(e) => update({ excerpt: e.target.value })}
          placeholder="Excerpt (shown in link previews and under the title)"
          rows={2}
          className="w-full bg-transparent text-lg text-muted placeholder:text-[#3a3a3a] focus:outline-none resize-none mb-6"
        />

        {/* Write / preview tabs on small screens; side by side on large */}
        <div className="flex gap-2 mb-3 lg:hidden">
          {(['write', 'preview'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                tab === t ? 'bg-foreground text-black' : 'text-muted'
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
            className={`${tab === 'write' ? 'block' : 'hidden'} lg:block w-full min-h-[60vh] p-4 bg-surface border border-line rounded-lg font-mono text-[14px] leading-relaxed text-foreground placeholder:text-[#4a4a4a] focus:outline-none focus:border-accent resize-y`}
          />
          <div
            className={`${tab === 'preview' ? 'block' : 'hidden'} lg:block min-h-[60vh] p-5 border border-line rounded-lg overflow-auto`}
          >
            {fields.body_md.trim() ? (
              <div className="prose" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            ) : (
              <p className="text-muted">Preview appears here.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
