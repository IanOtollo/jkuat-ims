'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';

interface TopbarProps {
  title: string;
}

export const Topbar = ({ title }: TopbarProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="fixed top-0 right-0 z-30 h-14 w-[calc(100%-240px)] border-b border-border bg-surface flex items-center justify-between px-6">
      <h2 className="text-lg font-display font-medium text-primary">{title}</h2>
      
      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-mono font-medium text-primary">
            {format(time, 'HH:mm:ss')}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted font-medium">
            {format(time, 'dd MMM yyyy')}
          </p>
        </div>
        
        <button className="relative text-muted hover:text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full border border-surface" />
        </button>
      </div>
    </header>
  );
};
