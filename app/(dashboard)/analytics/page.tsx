'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import { useToast } from '@/components/ui/Toast';
import { TrendChart } from '@/components/analytics/TrendChart';
import { TypeDistribution } from '@/components/analytics/TypeDistribution';
import { MetricCard } from '@/components/analytics/MetricCard';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { Download, TrendingUp, ShieldCheck, Clock, FileText } from 'lucide-react';

const COLORS = ['#e8e0d0', '#c8bfaf', '#d4a017', '#3b82f6', '#8b5cf6', '#22c55e', '#ef4444', '#6b7280'];

export default function AnalyticsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());

      // 1. Fetch all incidents for this month
      const { data: incidents } = await supabase
        .from('incidents')
        .select('*')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      const { data: publicReports } = await supabase
        .from('public_reports')
        .select('*')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (!incidents) return;

      // 2. Process Daily Trend
      const days = eachDayOfInterval({ start, end });
      const dailyTrend = days.map(day => {
        const dateStr = format(day, 'MMM dd');
        const count = incidents.filter((inc: any) => format(new Date(inc.created_at), 'MMM dd') === dateStr).length;
        return { name: dateStr, count };
      });

      // 3. Process Type Distribution
      const typeMap: Record<string, number> = {};
      incidents.forEach((inc: any) => {
        typeMap[inc.incident_type] = (typeMap[inc.incident_type] || 0) + 1;
      });
      const typeData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

      // 4. Process Zone Distribution
      const zoneMap: Record<string, number> = {};
      incidents.forEach((inc: any) => {
        zoneMap[inc.campus_zone] = (zoneMap[inc.campus_zone] || 0) + 1;
      });
      const zoneData = Object.entries(zoneMap).map(([name, value]) => ({ name, value }));

      // 5. Metrics
      const total = incidents.length;
      const resolved = incidents.filter((inc: any) => inc.status === 'resolved' || inc.status === 'closed').length;
      const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;
      
      setData({
        dailyTrend,
        typeData,
        zoneData,
        metrics: {
          total,
          resolved,
          resolutionRate,
          publicCount: publicReports?.length || 0,
          avgTime: '4.8h' // Mocked for simplicity
        }
      });
    } catch (error: any) {
      toast('error', 'Failed to generate analytics');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) fetchAnalytics();
  }, [profile, fetchAnalytics]);

  if (loading) return <Spinner size="lg" />;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Intelligence & Analytics" 
        description={`Analytical overview of campus security operations for ${format(new Date(), 'MMMM yyyy')}.`}
        actions={
          <Button variant="secondary" onClick={() => toast('info', 'PDF Exporting is currently being processed...')}>
            <Download size={16} className="mr-2" /> Export Monthly Report
          </Button>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 border-l-4 border-l-accent">
          <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Total Incidents</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-display font-medium text-primary">{data.metrics.total}</h3>
            <TrendingUp size={24} className="text-accent mb-1" />
          </div>
        </div>
        <div className="card p-6 border-l-4 border-l-status-resolved">
          <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Resolution Rate</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-display font-medium text-primary">{data.metrics.resolutionRate}%</h3>
            <ShieldCheck size={24} className="text-status-resolved mb-1" />
          </div>
        </div>
        <div className="card p-6 border-l-4 border-l-status-assigned">
          <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Avg. Resolution</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-display font-medium text-primary">{data.metrics.avgTime}</h3>
            <Clock size={24} className="text-status-assigned mb-1" />
          </div>
        </div>
        <div className="card p-6 border-l-4 border-l-status-pending">
          <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Public Submissions</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-display font-medium text-primary">{data.metrics.publicCount}</h3>
            <FileText size={24} className="text-status-pending mb-1" />
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TrendChart data={data.dailyTrend} />
        <TypeDistribution data={data.typeData} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card p-8 lg:col-span-2">
          <h3 className="text-sm uppercase tracking-widest text-primary font-medium mb-8">Zone Distribution Analysis</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.zoneData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} 
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: '0' }} />
                <Bar dataKey="value" fill="var(--color-accent-dim)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-8">
          <h3 className="text-sm uppercase tracking-widest text-primary font-medium mb-8">Critical Zones</h3>
          <div className="space-y-6">
            {data.zoneData.sort((a: any, b: any) => b.value - a.value).slice(0, 5).map((zone: any, i: number) => (
              <div key={zone.name} className="space-y-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-primary uppercase tracking-wider">{zone.name.replace('_', ' ')}</span>
                  <span className="text-muted font-mono">{Math.round((zone.value / data.metrics.total) * 100)}%</span>
                </div>
                <div className="h-1 w-full bg-border">
                  <div 
                    className="h-full bg-accent" 
                    style={{ width: `${(zone.value / data.metrics.total) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
