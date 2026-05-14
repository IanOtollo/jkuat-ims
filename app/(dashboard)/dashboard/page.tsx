'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { createClient } from '@/lib/supabase/client';
import { Incident } from '@/lib/types';
import { formatDate, formatType, formatZone } from '@/lib/utils/format';
import Link from 'next/link';
import { MetricCard } from '@/components/analytics/MetricCard';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Users, 
  ShieldAlert 
} from 'lucide-react';

export default function DashboardPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      // Fetch incidents based on role
      let query = supabase.from('incidents').select('*').order('created_at', { ascending: false }).limit(10);
      
      if (profile?.role === 'guard') {
        query = query.or(`reported_by.eq.${profile.id},assigned_to.eq.${profile.id}`);
      }
      
      const { data: incidents } = await query;
      if (incidents) setRecentIncidents(incidents);

      // Simple stats (Mocked for now as per dashboard requirements, but in a real app these would be counts)
      const { count: total } = await supabase.from('incidents').select('*', { count: 'exact', head: true });
      const { count: open } = await supabase.from('incidents').select('*', { count: 'exact', head: true }).in('status', ['pending', 'assigned', 'in_progress']);
      const { count: resolved } = await supabase.from('incidents').select('*', { count: 'exact', head: true }).eq('status', 'resolved');
      
      setStats({
        total: total || 0,
        open: open || 0,
        resolved: resolved || 0,
        rate: total ? Math.round((resolved! / total!) * 100) : 0
      });
      
      setLoading(false);
    };

    if (profile) fetchDashboardData();
  }, [profile, supabase]);

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="space-y-8">
      <PageHeader 
        title={`Operations Terminal: ${profile?.full_name}`}
        description={`Standard operating mode active. Viewing system overview for ${profile?.role} role.`}
        actions={
          profile?.role !== 'admin' && (
            <Link href="/incidents/new">
              <Button>Log New Incident</Button>
            </Link>
          )
        }
      />

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title={profile?.role === 'guard' ? 'My Open Tasks' : 'Total Open'} 
          value={stats.open} 
          icon={AlertCircle} 
        />
        <MetricCard 
          title="Resolved (Month)" 
          value={stats.resolved} 
          icon={CheckCircle2} 
        />
        <MetricCard 
          title="Avg. Resolution" 
          value="4.2h" 
          icon={Clock} 
        />
        <MetricCard 
          title="Resolution Rate" 
          value={`${stats.rate}%`} 
          icon={Activity} 
        />
      </div>

      {/* Recent Incidents Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-medium text-primary">Recent Incident Activity</h2>
          <Link href="/incidents" className="text-xs uppercase tracking-widest text-accent hover:underline">
            View All Terminal Logs
          </Link>
        </div>
        
        <div className="card">
          <Table headers={['Reference', 'Type', 'Zone', 'Severity', 'Status', 'Logged Date', 'Actions']}>
            {recentIncidents.map((inc) => (
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
          {recentIncidents.length === 0 && (
            <div className="p-12 text-center text-muted">
              No recent activity recorded in this terminal.
            </div>
          )}
        </div>
      </div>

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
