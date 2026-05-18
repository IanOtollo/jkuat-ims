'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  PlusSquare, 
  UserCheck, 
  FileText, 
  BarChart3, 
  History, 
  Users, 
  User, 
  LogOut,
  X 
} from 'lucide-react';

export const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const { profile, signOut, loading } = useAuth();
  const pathname = usePathname();
  const role = profile?.role;

  const navItems = [
    { label: 'Dashboard',      href: '/dashboard',      icon: LayoutDashboard, roles: ['guard', 'supervisor', 'head', 'admin'] },
    { label: 'Incidents',      href: '/incidents',      icon: AlertTriangle,   roles: ['guard', 'supervisor', 'head', 'admin'] },
    { label: 'New Incident',   href: '/incidents/new',  icon: PlusSquare,      roles: ['guard', 'supervisor', 'head', 'admin'] },
    { label: 'Assignments',    href: '/assignments',    icon: UserCheck,       roles: ['supervisor', 'head', 'admin'] },
    { label: 'Public Reports', href: '/public-reports', icon: FileText,        roles: ['supervisor', 'head', 'admin'] },
    { label: 'Analytics',      href: '/analytics',      icon: BarChart3,       roles: ['head', 'admin'] },
    { label: 'Audit Logs',     href: '/audit-logs',     icon: History,         roles: ['head', 'admin'] },
    { label: 'Users',          href: '/users',          icon: Users,           roles: ['admin'] },
    { label: 'Profile',        href: '/profile',        icon: User,            roles: ['guard', 'supervisor', 'head', 'admin'] },
  ];

  const filteredItems = navItems.filter(item => role && item.roles.includes(role));

  return (
    <aside className="h-full w-60 border-r border-border bg-surface flex flex-col">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="Logo" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight">JKUAT <span className="text-accent">IMS</span></h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted font-medium">Security Dept</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-muted hover:text-primary p-1">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors border-l-2 ${
                    isActive 
                      ? 'border-accent bg-surface-raised text-primary' 
                      : 'border-transparent text-muted hover:text-primary hover:bg-surface-raised/50'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 bg-border flex items-center justify-center text-xs font-bold">
            {profile?.full_name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.full_name}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted truncate">{profile?.role}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 px-2 py-2 text-sm font-medium text-muted hover:text-destructive transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
