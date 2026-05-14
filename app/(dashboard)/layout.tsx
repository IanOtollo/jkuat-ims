import { getProfile } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import { DashboardLayoutClient } from './DashboardLayoutClient';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  if (!profile) {
    redirect('/login');
  }

  return (
    <DashboardLayoutClient profile={profile}>
      {children}
    </DashboardLayoutClient>
  );
}
