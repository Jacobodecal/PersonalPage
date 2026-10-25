// Blog posts live in D1 (`posts` table) and are written in /admin.
import { getDb } from './db';
import { slugify } from './slug';

export type PostStatus = 'draft' | 'published';

export interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

export interface Post extends PostMetadata {
  content: string;
}

export interface AdminPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body_md: string;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export type AdminPostSummary = Omit<AdminPost, 'body_md'>;

export interface Idea {
  id: number;
  text: string;
  created_at: string;
  archived_at: string | null;
}

export class SlugTakenError extends Error {}

const now = () => new Date().toISOString();

const isUniqueViolation = (error: unknown) =>
  error instanceof Error && /UNIQUE constraint failed/i.test(error.message);

// --- Public ---

// Published posts, most recent first (for listing)
export async function getAllPosts(): Promise<PostMetadata[]> {
  const db = await getDb();
  const { results } = await db
    .prepare(
      "SELECT slug, title, excerpt, published_at AS date FROM posts WHERE status = 'published' ORDER BY published_at DESC, id DESC"
    )
    .all<PostMetadata>();
  return results;
}

// A single published post, or null when missing or still a draft
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const db = await getDb();
  return db
    .prepare(
      "SELECT slug, title, excerpt, published_at AS date, body_md AS content FROM posts WHERE slug = ? AND status = 'published'"
    )
    .bind(slug)
    .first<Post>();
}

// --- Admin ---

export async function listAdminPosts(): Promise<AdminPostSummary[]> {
  const db = await getDb();
  const { results } = await db
    .prepare(
      'SELECT id, slug, title, excerpt, status, published_at, created_at, updated_at FROM posts ORDER BY updated_at DESC'
    )
    .all<AdminPostSummary>();
  return results;
}

export async function getAdminPost(id: number): Promise<AdminPost | null> {
  const db = await getDb();
  return db.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first<AdminPost>();
}

export async function createDraft(input: { title?: string; body_md?: string } = {}): Promise<AdminPost> {
  const db = await getDb();
  const title = input.title?.trim() ?? '';
  // Random suffix keeps new draft slugs unique until a real one is chosen
  const slug = `${slugify(title) || 'untitled'}-${crypto.randomUUID().slice(0, 6)}`;
  const post = await db
    .prepare('INSERT INTO posts (slug, title, body_md) VALUES (?, ?, ?) RETURNING *')
    .bind(slug, title, input.body_md ?? '')
    .first<AdminPost>();
  return post!;
}

export async function updatePost(
  id: number,
  fields: Partial<Pick<AdminPost, 'slug' | 'title' | 'excerpt' | 'body_md'>>
): Promise<AdminPost | null> {
  const db = await getDb();
  const current = await getAdminPost(id);
  if (!current) return null;

  const next = {
    slug: fields.slug !== undefined ? slugify(fields.slug) || current.slug : current.slug,
    title: fields.title ?? current.title,
    excerpt: fields.excerpt ?? current.excerpt,
    body_md: fields.body_md ?? current.body_md,
  };

  try {
    return await db
      .prepare(
        'UPDATE posts SET slug = ?, title = ?, excerpt = ?, body_md = ?, updated_at = ? WHERE id = ? RETURNING *'
      )
      .bind(next.slug, next.title, next.excerpt, next.body_md, now(), id)
      .first<AdminPost>();
  } catch (error) {
    if (isUniqueViolation(error)) throw new SlugTakenError(next.slug);
    throw error;
  }
}

export async function setPostStatus(id: number, status: PostStatus): Promise<AdminPost | null> {
  const db = await getDb();
  // Keeps the original publish date when a post is unpublished and published again
  return db
    .prepare(
      "UPDATE posts SET status = ?, published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, ?) ELSE published_at END, updated_at = ? WHERE id = ? RETURNING *"
    )
    .bind(status, status, now(), now(), id)
    .first<AdminPost>();
}

export async function listIdeas(): Promise<Idea[]> {
  const db = await getDb();
  const { results } = await db
    .prepare('SELECT * FROM ideas WHERE archived_at IS NULL ORDER BY created_at DESC')
    .all<Idea>();
  return results;
}

export async function createIdea(text: string): Promise<Idea> {
  const db = await getDb();
  const idea = await db.prepare('INSERT INTO ideas (text) VALUES (?) RETURNING *').bind(text).first<Idea>();
  return idea!;
}

export async function archiveIdea(id: number): Promise<Idea | null> {
  const db = await getDb();
  return db
    .prepare('UPDATE ideas SET archived_at = ? WHERE id = ? RETURNING *')
    .bind(now(), id)
    .first<Idea>();
}

// Turns an idea into a draft (first line becomes the title) and archives the idea
export async function ideaToDraft(id: number): Promise<AdminPost | null> {
  const db = await getDb();
  const idea = await db.prepare('SELECT * FROM ideas WHERE id = ?').bind(id).first<Idea>();
  if (!idea) return null;

  const [firstLine, ...rest] = idea.text.trim().split('\n');
  const draft = await createDraft({ title: firstLine.slice(0, 120), body_md: rest.join('\n').trim() });
  await archiveIdea(id);
  return draft;
}
