import React from 'react';
import { IncidentStatus, IncidentSeverity } from '@/lib/types';

interface StatusBadgeProps {
  status: IncidentStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles: Record<IncidentStatus, string> = {
    pending: 'border-status-pending text-status-pending',
    assigned: 'border-status-assigned text-status-assigned',
    in_progress: 'border-status-in-progress text-status-in-progress',
    resolved: 'border-status-resolved text-status-resolved',
    closed: 'border-status-closed text-status-closed',
  };

  return (
    <span className={`inline-block border-2 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

interface SeverityBadgeProps {
  severity: IncidentSeverity;
}

export const SeverityBadge = ({ severity }: SeverityBadgeProps) => {
  const styles: Record<IncidentSeverity, string> = {
    low: 'border-severity-low text-severity-low',
    medium: 'border-severity-medium text-severity-medium',
    high: 'border-severity-high text-severity-high',
  };

  return (
    <span className={`inline-block border-2 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest ${styles[severity]}`}>
      {severity}
    </span>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
}

export const Badge = ({ children, color = 'var(--color-border)' }: BadgeProps) => {
  return (
    <span 
      className="inline-block border-2 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest"
      style={{ borderColor: color, color: color }}
    >
      {children}
    </span>
  );
};
