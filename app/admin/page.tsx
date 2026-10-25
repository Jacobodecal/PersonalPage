import { redirect } from 'next/navigation';
import { hasAdminSession } from '@/lib/adminSession';
import { listAdminPosts, listIdeas } from '@/lib/posts';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata = { title: 'Admin | Jacobo De Cal', robots: { index: false } };

export default async function AdminPage() {
  if (!(await hasAdminSession())) redirect('/admin/login');

  const [posts, ideas] = await Promise.all([listAdminPosts(), listIdeas()]);
  return <AdminDashboard initialPosts={posts} initialIdeas={ideas} />;
}
