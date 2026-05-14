'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Bell } from 'lucide-react';

interface TopbarProps {
  title?: string;
  hideTitle?: boolean;
}

export const Topbar = ({ title, hideTitle }: TopbarProps) => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-between gap-4 w-full">
      {!hideTitle && <h2 className="text-lg font-display font-medium text-primary">{title}</h2>}
      
      <div className="flex items-center gap-6">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-mono font-medium text-primary">
            {time ? format(time, 'HH:mm:ss') : '--:--:--'}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted font-medium">
            {time ? format(time, 'dd MMM yyyy') : 'Loading...'}
          </p>
        </div>
        
        <button className="relative text-muted hover:text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full border border-surface" />
        </button>
      </div>
    </div>
  );
};
