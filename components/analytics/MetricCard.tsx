import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export const MetricCard = ({ title, value, icon: Icon, trend, color = 'var(--color-accent)' }: MetricCardProps) => (
  <div className="card p-6 flex items-start justify-between" style={{ borderLeftColor: color, borderLeftWidth: trend ? '4px' : '1px' }}>
    <div>
      <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">{title}</p>
      <h3 className="text-3xl font-display font-medium text-primary">{value}</h3>
      {trend && (
        <p className={`text-[10px] mt-2 flex items-center gap-1 ${trend.startsWith('+') ? 'text-status-resolved' : 'text-destructive'}`}>
          {trend} from last month
        </p>
      )}
    </div>
    <div className="p-3 bg-surface-raised border border-border">
      <Icon size={24} style={{ color }} />
    </div>
  </div>
);
