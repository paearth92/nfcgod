'use client';

import { usePathname } from 'next/navigation';
import { AdminShell } from '@/components/site/admin-shell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/admin/sign-in') return <>{children}</>;
  return <AdminShell email={null}>{children}</AdminShell>;
}
