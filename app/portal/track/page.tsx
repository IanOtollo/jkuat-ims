'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { PublicReport } from '@/lib/types';
import { formatDate } from '@/lib/utils/format';
import { Search, ChevronLeft, MapPin, Calendar, Activity } from 'lucide-react';
import Link from 'next/link';

export default function TrackReportPage() {
  const [refNumber, setRefNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<PublicReport | null>(null);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refNumber.trim()) return;
    
    setLoading(true);
    setNotFound(false);
    setReport(null);

    try {
      const { data, error } = await supabase
        .from('public_reports')
        .select('*')
        .eq('reference_number', refNumber.trim().toUpperCase())
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setReport(data);
      }
    } catch (error) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-body text-primary pb-20">
      <header className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center gap-6">
          <Link href="/portal" className="text-muted hover:text-primary transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <div className="flex items-center gap-4">
            <img src="/logo.jpeg" alt="JKUAT Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-lg font-display font-bold leading-tight uppercase tracking-tight">Report Tracker</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Verification Terminal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 pt-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-display font-medium mb-4">Track Status</h2>
          <p className="text-muted text-sm leading-relaxed">
            Enter your official report reference number to check the current operational status of your submission.
          </p>
        </div>

        <div className="card p-8 bg-surface-raised/30 mb-12">
          <form onSubmit={handleTrack} className="space-y-4">
            <Input 
              label="Reference Number" 
              placeholder="PUB-YYYY-XXXX" 
              className="mono text-center text-lg h-14"
              value={refNumber}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRefNumber(e.target.value)}
              required
            />
            <Button type="submit" className="w-full h-12" isLoading={loading}>
              Check Terminal Status
            </Button>
          </form>
        </div>

        {report && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="card p-8 space-y-8">
              <div className="flex items-start justify-between pb-6 border-b border-border">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-2">Current Status</p>
                  <Badge 
                    color={
                      report.status === 'pending' ? 'var(--color-status-pending)' : 
                      report.status === 'converted' ? 'var(--color-status-resolved)' : 
                      'var(--color-text-muted)'
                    }
                  >
                    {report.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-2">Official Ref</p>
                  <p className="font-mono text-accent font-bold">{report.reference_number}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted mb-1">
                    <Calendar size={12} />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Logged At</span>
                  </div>
                  <p className="text-sm font-medium">{formatDate(report.created_at)}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted mb-1">
                    <Activity size={12} />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Type</span>
                  </div>
                  <p className="text-sm font-medium">{report.incident_type}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <div className="flex items-center gap-2 text-muted mb-1">
                    <MapPin size={12} />
                    <span className="text-[10px] uppercase tracking-widest font-bold">Zone</span>
                  </div>
                  <p className="text-sm font-medium">{report.campus_zone.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-3">Submitted Description</p>
                <p className="text-sm text-primary/80 leading-relaxed italic bg-surface p-4 border border-border">
                  "{report.description}"
                </p>
              </div>

              {report.status === 'converted' && (
                <div className="p-4 bg-status-resolved/10 border border-status-resolved/30">
                  <p className="text-xs text-status-resolved font-medium">
                    This report has been formally triaged and escalated to a live security incident for departmental action.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {notFound && !loading && (
          <div className="text-center p-12 card border-destructive/30 bg-destructive/5 animate-in fade-in duration-300">
            <p className="text-sm text-destructive font-medium">Authentication Failed</p>
            <p className="text-xs text-muted mt-1">No operational record found with that reference number. Please verify and try again.</p>
          </div>
        )}
      </main>
    </div>
  );
}
