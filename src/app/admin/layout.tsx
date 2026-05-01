import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminLayoutClient from './AdminLayoutClient';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Protect all /admin routes except /admin/login
  // The layout doesn't know the exact pathname in App Router, so we pass session to Client or rely on middleware.
  // Actually, wait, layouts in App Router don't have access to pathname!
  // It's better to use AuthGuard per page or in a layout if we don't care about /admin/login.
  // BUT /admin/login is inside /admin/login/page.tsx, which ALSO uses this layout!
  // If we redirect to /admin/login here, and /admin/login uses this layout, it causes an infinite redirect loop!

