import { redirect } from 'next/navigation';
import { hasAdminSession } from '@/lib/adminSession';
import LoginForm from '@/components/admin/LoginForm';

export const metadata = { title: 'Admin login | Jacobo De Cal', robots: { index: false } };

export default async function AdminLoginPage() {
  if (await hasAdminSession()) redirect('/admin');

  return <LoginForm />;
}
