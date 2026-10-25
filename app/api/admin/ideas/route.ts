import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminSession';
import { createIdea, listIdeas } from '@/lib/posts';

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  return NextResponse.json(await listIdeas());
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { text } = await request.json().catch(() => ({}));
  if (typeof text !== 'string' || !text.trim()) {
    return NextResponse.json({ error: 'Idea text is required' }, { status: 400 });
  }
  return NextResponse.json(await createIdea(text.trim()), { status: 201 });
}
