import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminSession';
import { getAdminPost, setPostStatus, SlugTakenError, updatePost } from '@/lib/posts';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const parseId = async ({ params }: RouteContext) => {
  const id = Number((await params).id);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const id = await parseId(context);
  const post = id ? await getAdminPost(id) : null;
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  return NextResponse.json(post);
}

// Autosave (slug/title/excerpt/body_md) and publish/unpublish (status)
export async function PATCH(request: NextRequest, context: RouteContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const id = await parseId(context);
  if (!id) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

  try {
    const body = await request.json();
    const fields: Record<string, string> = {};
    for (const key of ['slug', 'title', 'excerpt', 'body_md'] as const) {
      if (typeof body[key] === 'string') fields[key] = body[key];
    }

    let post = Object.keys(fields).length ? await updatePost(id, fields) : await getAdminPost(id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    if (body.status === 'published' || body.status === 'draft') {
      if (body.status === 'published' && !post.title.trim()) {
        return NextResponse.json({ error: 'Add a title before publishing' }, { status: 400 });
      }
      post = await setPostStatus(id, body.status);
    }

    return NextResponse.json(post);
  } catch (error) {
    if (error instanceof SlugTakenError) {
      return NextResponse.json({ error: `Slug "${error.message}" is already used by another post` }, { status: 409 });
    }
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 });
  }
}
