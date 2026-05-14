import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { getProfile } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col">
        <Topbar title="Dashboard" />
        <main className="mt-14 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
