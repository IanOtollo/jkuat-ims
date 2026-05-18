'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { PublicReport } from '@/lib/types';
import { formatDate, formatType, formatZone } from '@/lib/utils/format';
import { Eye, CheckCircle, XCircle, FilePlus, ChevronDown, ChevronUp } from 'lucide-react';

export default function PublicReportsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<PublicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('public_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      toast('error', 'Failed to fetch public reports');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile) fetchReports();
  }, [profile, fetchReports]);

  const handleStatusUpdate = async (id: string, status: string) => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('public_reports')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      toast('success', `Report marked as ${status}`);
      fetchReports();
    } catch (error: any) {
      toast('error', error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const convertToIncident = async (report: PublicReport) => {
    setProcessingId(report.id);
    try {
      // 1. Generate reference
      const { count, error: countError } = await supabase
        .from('incidents')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      const ref = `INC-${new Date().getFullYear()}-${((count || 0) + 1).toString().padStart(4, '0')}`;

      // 2. Insert Incident
      const { data: incident, error: incError } = await supabase
        .from('incidents')
        .insert({
          reference_number: ref,
          incident_type: report.incident_type as any,
          campus_zone: report.campus_zone as any,
          location: report.location,
          severity: 'medium',
          description: `[PUBLIC REPORT] ${report.description}`,
          is_public_report: true,
          reporter_name: report.is_anonymous ? 'Anonymous' : report.reporter_name,
          reporter_contact: report.reporter_contact,
          status: 'pending',
        })
        .select()
        .single();

      if (incError) throw incError;

      // 3. Update Report
      const { error: updError } = await supabase
        .from('public_reports')
        .update({ status: 'converted', incident_id: incident.id })
        .eq('id', report.id);

      if (updError) throw updError;

      toast('success', `Incident created: ${ref}`);
      fetchReports();
    } catch (error: any) {
      toast('error', error.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Public Submissions" 
        description="Review and triage incident reports submitted by students and staff via the public portal." 
      />

      <div className="card">
        <Table headers={['Reference', 'Type', 'Zone', 'Reporter', 'Submitted', 'Status', 'Actions']}>
          {reports.map((report) => {
            const isExpanded = expandedId === report.id;
            const isProcessing = processingId === report.id;
            
            return (
              <React.Fragment key={report.id}>
                <tr className={isExpanded ? 'bg-surface-raised/50' : ''}>
                  <td className="mono font-medium text-accent">{report.reference_number}</td>
                  <td>{report.incident_type}</td>
                  <td>{formatZone(report.campus_zone as any)}</td>
                  <td>
                    {report.is_anonymous ? (
                      <span className="text-muted italic">Anonymous</span>
                    ) : (
                      <span>{report.reporter_name}</span>
                    )}
                  </td>
                  <td className="text-muted">{formatDate(report.created_at)}</td>
                  <td>
                    <Badge 
                      color={
                        report.status === 'pending' ? 'var(--color-status-pending)' : 
                        report.status === 'converted' ? 'var(--color-status-resolved)' : 
                        'var(--color-text-muted)'
                      }
                    >
                      {report.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setExpandedId(isExpanded ? null : report.id)}>
                        {isExpanded ? <ChevronUp size={16} /> : <Eye size={16} />}
                      </Button>
                      {report.status === 'pending' && !isProcessing && (
                        <>
                          <Button size="sm" onClick={() => convertToIncident(report)}>
                            <FilePlus size={14} className="mr-1" /> Triage
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleStatusUpdate(report.id, 'dismissed')}>
                            <XCircle size={14} />
                          </Button>
                        </>
                      )}
                      {isProcessing && <Spinner size="sm" />}
                    </div>
                  </td>
                </tr>
                {isExpanded && (
                  <tr>
                    <td colSpan={7} className="p-0 border-b border-border">
                      <div className="p-8 bg-surface-raised/30 border-l-2 border-accent ml-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <h4 className="text-[10px] uppercase tracking-widest text-muted font-bold mb-2">Detailed Account</h4>
                            <p className="text-sm text-primary leading-relaxed whitespace-pre-wrap">{report.description}</p>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-[10px] uppercase tracking-widest text-muted font-bold mb-2">Location Specifics</h4>
                              <p className="text-sm text-primary">{report.location}</p>
                            </div>
                            <div>
                              <h4 className="text-[10px] uppercase tracking-widest text-muted font-bold mb-2">Contact Intelligence</h4>
                              <p className="text-sm text-primary">{report.reporter_contact || 'None provided'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </Table>
        {reports.length === 0 && (
          <div className="p-20 text-center text-muted">
            No public reports requiring triage.
          </div>
        )}
      </div>
    </div>
  );
}
