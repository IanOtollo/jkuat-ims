'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Menu } from 'lucide-react';
import { Profile } from '@/lib/types';
import { AuthProvider } from '@/lib/auth/context';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  profile: Profile;
}

export function DashboardLayoutClient({ children, profile }: DashboardLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AuthProvider initialProfile={profile}>
      <div className="flex min-h-screen bg-background w-full">
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Responsive */}
        <div className={`
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden text-muted hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu size={24} />
              </button>
              <h2 className="text-lg font-display font-medium text-primary truncate">Security Terminal</h2>
            </div>
            
            <Topbar hideTitle />
          </header>

          <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
