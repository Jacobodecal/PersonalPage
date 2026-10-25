// Pure helpers shared by lib/posts.ts (server) and the /admin editor (browser).

export interface EditableFields {
  slug: string;
  title: string;
  excerpt: string;
  body_md: string;
}

// What the editor should show: pending edits of a published post when there
// are any (JSON in pending_changes), otherwise the live fields
export function editableFields(post: EditableFields & { pending_changes: string | null }): EditableFields {
  const live = { slug: post.slug, title: post.title, excerpt: post.excerpt, body_md: post.body_md };
  return post.pending_changes ? { ...live, ...JSON.parse(post.pending_changes) } : live;
}
