export const unstable_instant = { prefetch: 'static' };

import React, { Suspense } from 'react';
import { getProfile } from '@/lib/auth/server';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import { Incident } from '@/lib/types';
import { formatDate, formatType, formatZone } from '@/lib/utils/format';
import Link from 'next/link';
import { MetricCard } from '@/components/analytics/MetricCard';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Activity, 
  ShieldAlert 
} from 'lucide-react';

async function DashboardStats({ role, userId }: { role: string, userId: string }) {
  'use cache'
  const supabase = createClient();
  
  const [
    { count: total },
    { count: open },
    { count: resolved }
  ] = await Promise.all([
    supabase.from('incidents').select('*', { count: 'exact', head: true }),
    supabase.from('incidents').select('*', { count: 'exact', head: true }).in('status', ['pending', 'assigned', 'in_progress']),
    supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('status', 'resolved')
  ]);

  const rate = total ? Math.round((resolved! / total!) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard 
        title={role === 'guard' ? 'My Open Tasks' : 'Total Open'} 
        value={open || 0} 
        icon={AlertCircle} 
      />
      <MetricCard 
        title="Resolved (Month)" 
        value={resolved || 0} 
        icon={CheckCircle2} 
      />
      <MetricCard 
        title="Avg. Resolution" 
        value="4.2h" 
        icon={Clock} 
      />
      <MetricCard 
        title="Resolution Rate" 
        value={`${rate}%`} 
        icon={Activity} 
      />
    </div>
  );
}

async function RecentIncidents({ role, userId }: { role: string, userId: string }) {
  const supabase = createClient();
  
  let query = supabase.from('incidents').select('*').order('created_at', { ascending: false }).limit(10);
  
  if (role === 'guard') {
    query = query.or(`reported_by.eq.${userId},assigned_to.eq.${userId}`);
  }
  
  const { data: incidents } = await query;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-medium text-primary">Recent Incident Activity</h2>
        <Link href="/incidents" className="text-xs uppercase tracking-widest text-accent hover:underline">
          View All Terminal Logs
        </Link>
      </div>
      
      <div className="card">
        <Table headers={['Reference', 'Type', 'Zone', 'Severity', 'Status', 'Logged Date', 'Actions']}>
          {(incidents || []).map((inc: Incident) => (
            <tr key={inc.id}>
              <td className="mono font-medium text-accent">{inc.reference_number}</td>
              <td>{formatType(inc.incident_type)}</td>
              <td>{formatZone(inc.campus_zone)}</td>
              <td><SeverityBadge severity={inc.severity} /></td>
              <td><StatusBadge status={inc.status} /></td>
              <td className="text-muted">{formatDate(inc.created_at)}</td>
              <td>
                <Link href={`/incidents/${inc.id}`}>
                  <Button variant="ghost" size="sm">Review</Button>
                </Link>
              </td>
            </tr>
          ))}
        </Table>
        {(!incidents || incidents.length === 0) && (
          <div className="p-12 text-center text-muted">
            No recent activity recorded in this terminal.
          </div>
        )}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const profile = await getProfile();
  
  if (!profile) return null;

  return (
    <div className="space-y-8">
      <PageHeader 
        title={`Operations Terminal: ${profile.full_name}`}
        description={`Standard operating mode active. Viewing system overview for ${profile.role} role.`}
        actions={
          profile.role !== 'admin' && (
            <Link href="/incidents/new">
              <Button>Log New Incident</Button>
            </Link>
          )
        }
      />

      {/* Metric Grid */}
      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="card p-6 h-32 animate-pulse bg-surface-raised" />)}
      </div>}>
        <DashboardStats role={profile.role} userId={profile.id} />
      </Suspense>

      {/* Recent Incidents Table */}
      <Suspense fallback={<div className="card p-12 h-64 animate-pulse bg-surface-raised" />}>
        <RecentIncidents role={profile.role} userId={profile.id} />
      </Suspense>

      {/* System Status / Quick Info (Bottom Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-display font-medium text-primary mb-4">Security Advisory</h3>
          <div className="flex gap-4 p-4 bg-severity-high/10 border border-severity-high/30">
            <ShieldAlert size={24} className="text-severity-high shrink-0" />
            <div>
              <p className="text-sm font-medium text-severity-high uppercase tracking-wider mb-1">Heightened Alert</p>
              <p className="text-xs text-primary/80">Campus-wide theft reports have increased by 12% in the Science Labs zone. All personnel are advised to increase patrols in Science Blocks A and B during evening shifts.</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-display font-medium text-primary mb-4">On Duty Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Personnel Active</span>
              <span className="text-sm font-mono text-primary">24 / 32</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Zones Covered</span>
              <span className="text-sm font-mono text-primary">10 / 10</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">System Uptime</span>
              <span className="text-sm font-mono text-status-resolved">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
