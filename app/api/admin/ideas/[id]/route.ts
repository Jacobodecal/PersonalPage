import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminSession';
import { archiveIdea, ideaToDraft } from '@/lib/posts';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// { action: 'archive' } archives the idea; { action: 'draft' } turns it into a draft post
export async function POST(request: NextRequest, { params }: RouteContext) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const id = Number((await params).id);
  const { action } = await request.json().catch(() => ({}));

  if (action === 'archive') {
    const idea = Number.isInteger(id) ? await archiveIdea(id) : null;
    return idea
      ? NextResponse.json(idea)
      : NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  if (action === 'draft') {
    const draft = Number.isInteger(id) ? await ideaToDraft(id) : null;
    return draft
      ? NextResponse.json(draft, { status: 201 })
      : NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
