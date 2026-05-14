'use client';

import React from 'react';
import { Phone, AlertCircle } from 'lucide-react';

export const EmergencyBanner = () => {
  return (
    <a 
      href="tel:0793824968"
      className="bg-destructive hover:bg-destructive/90 text-white w-full py-2 px-4 flex items-center justify-center gap-3 transition-colors animate-pulse-slow z-[100]"
    >
      <AlertCircle size={18} className="animate-bounce" />
      <span className="text-sm font-bold uppercase tracking-widest">
        Emergency Line: 0793824968
      </span>
      <Phone size={16} />
      <span className="text-[10px] font-medium opacity-80 hidden md:inline ml-2">
        (Click to Call)
      </span>
    </a>
  );
};
