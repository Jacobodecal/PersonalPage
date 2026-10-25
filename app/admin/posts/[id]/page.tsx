import { notFound, redirect } from 'next/navigation';
import { hasAdminSession } from '@/lib/adminSession';
import { getAdminPost } from '@/lib/posts';
import PostEditor from '@/components/admin/PostEditor';

export const metadata = { title: 'Editor | Jacobo De Cal', robots: { index: false } };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  if (!(await hasAdminSession())) redirect('/admin/login');

  const id = Number((await params).id);
  const post = Number.isInteger(id) ? await getAdminPost(id) : null;
  if (!post) notFound();

  return <PostEditor initialPost={post} />;
}
