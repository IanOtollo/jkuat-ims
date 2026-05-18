'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select, Textarea } from '@/components/ui/Input';
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { Incident, IncidentNote, Evidence, Profile, IncidentStatus } from '@/lib/types';
import { formatDate, formatType, formatZone, formatFileSize } from '@/lib/utils/format';
import { IncidentNotes } from '@/components/incidents/IncidentNotes';
import { 
  FileText, 
  Download, 
  Plus, 
  User as UserIcon, 
  MapPin, 
  Shield, 
  Clock, 
  Paperclip 
} from 'lucide-react';
import { differenceInHours } from 'date-fns';

const resolutionHours = (start: string, end: string | null) => {
  if (!end) return 'N/A';
  return `${differenceInHours(new Date(end), new Date(start))}h`;
};

export default function IncidentDetailPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [notes, setNotes] = useState<IncidentNote[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [officers, setOfficers] = useState<Profile[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Incident
      const { data: inc, error: incError } = await supabase
        .from('incidents')
        .select(`*, reporter:reported_by(*), assignee:assigned_to(*)`)
        .eq('id', id)
        .single();
      
      if (incError) throw incError;
      setIncident(inc);

      // Fetch Notes
      const { data: nts } = await supabase
        .from('incident_notes')
        .select('*, author:author_id(*)')
        .eq('incident_id', id)
        .order('created_at', { ascending: true });
      setNotes(nts || []);

      // Fetch Evidence
      const { data: evd } = await supabase
        .from('evidence')
        .select('*, uploader:uploaded_by(*)')
        .eq('incident_id', id);
      setEvidence(evd || []);

      // Fetch Officers (for assignment)
      if (profile?.role === 'supervisor' || profile?.role === 'head') {
        const { data: profs } = await supabase
          .from('profiles')
          .select('*')
          .in('role', ['guard', 'supervisor'])
          .eq('is_active', true);
        setOfficers(profs || []);
      }
    } catch (error: any) {
      toast('error', error.message || 'Failed to fetch incident details');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, profile]);

  useEffect(() => {
    if (profile && id) fetchData();
  }, [profile, id, fetchData]);

  const handleStatusUpdate = async (status: string) => {
    if (!incident) return;
    setStatusLoading(true);
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ status: status as IncidentStatus, updated_at: new Date().toISOString() })
        .eq('id', incident.id);
      
      if (error) throw error;
      
      await supabase.from('audit_logs').insert({
        user_id: profile?.id,
        action: 'UPDATE_STATUS',
        target_type: 'incident',
        target_id: incident.id,
        details: { status },
      });

      toast('success', `Status updated to ${status}`);
      fetchData();
    } catch (error: any) {
      toast('error', error.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAssignment = async (officerId: string) => {
    if (!incident) return;
    setStatusLoading(true);
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ 
          assigned_to: officerId, 
          status: 'assigned', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', incident.id);
      
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: profile?.id,
        action: 'ASSIGN_INCIDENT',
        target_type: 'incident',
        target_id: incident.id,
        details: { officer_id: officerId },
      });

      toast('success', 'Incident assigned');
      fetchData();
    } catch (error: any) {
      toast('error', error.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !incident) return;
    setNoteLoading(true);
    try {
      const { error } = await supabase
        .from('incident_notes')
        .insert({
          incident_id: incident.id,
          author_id: profile?.id,
          content: newNote,
        });
      
      if (error) throw error;
      setNewNote('');
      fetchData();
    } catch (error: any) {
      toast('error', error.message);
    } finally {
      setNoteLoading(false);
    }
  };

  const handleDownload = async (path: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage.from('evidence').download(path);
      if (error) throw error;
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      toast('error', 'Failed to download file');
    }
  };

  if (loading) return <Spinner size="lg" />;
  if (!incident) return <p className="text-center text-muted">Incident not found.</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-mono font-bold text-accent">{incident.reference_number}</h1>
            <StatusBadge status={incident.status} />
            <SeverityBadge severity={incident.severity} />
          </div>
          <p className="text-sm text-muted">Logged on {formatDate(incident.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.back()}>Back to Terminal</Button>
          {(profile?.role === 'supervisor' || profile?.role === 'head') && incident.status !== 'closed' && (
            <Button variant="destructive" onClick={() => handleStatusUpdate('closed')}>Close Case</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (Left Column) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Incident Data */}
          <div className="card p-8 space-y-8">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-muted font-medium mb-4">Case Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Shield size={18} className="text-muted mt-1" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Type</p>
                    <p className="text-sm font-medium">{formatType(incident.incident_type)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-muted mt-1" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Location</p>
                    <p className="text-sm font-medium">{incident.location} ({formatZone(incident.campus_zone)})</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UserIcon size={18} className="text-muted mt-1" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Reported By</p>
                    <p className="text-sm font-medium">
                      {incident.is_public_report 
                        ? (incident.is_anonymous ? 'Anonymous Citizen' : incident.reporter_name) 
                        : (incident.reporter?.full_name || 'System')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-muted mt-1" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Last Updated</p>
                    <p className="text-sm font-medium">{formatDate(incident.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-widest text-muted font-medium mb-4">Official Description</h3>
              <p className="text-sm text-primary leading-relaxed whitespace-pre-wrap bg-surface-raised p-6 border border-border">
                {incident.description}
              </p>
            </div>
          </div>

          {/* Timeline / Notes */}
          <IncidentNotes 
            notes={notes}
            newNote={newNote}
            onNoteChange={setNewNote}
            onSubmit={handleAddNote}
            isLoading={noteLoading}
          />
        </div>

        {/* Sidebar (Right Column) */}
        <div className="space-y-8">
          {/* Operations Panel */}
          {(profile?.role === 'supervisor' || profile?.role === 'head') && (
            <div className="card p-8 space-y-6 bg-accent/5 border-accent/20">
              <h3 className="text-sm uppercase tracking-widest text-accent font-bold">Control Panel</h3>
              
              <div className="space-y-4">
                <Select 
                  label="Update Status" 
                  value={incident.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleStatusUpdate(e.target.value)}
                  disabled={statusLoading}
                  options={[
                    { label: 'Pending', value: 'pending' },
                    { label: 'Assigned', value: 'assigned' },
                    { label: 'In Progress', value: 'in_progress' },
                    { label: 'Resolved', value: 'resolved' },
                  ]}
                />

                <Select 
                  label="Assign Personnel" 
                  value={incident.assigned_to || ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleAssignment(e.target.value)}
                  disabled={statusLoading}
                  options={[
                    { label: 'Unassigned', value: '' },
                    ...officers.map(o => ({ label: `${o.full_name} (${o.role})`, value: o.id }))
                  ]}
                />
              </div>

              {incident.assignee && (
                <div className="pt-4 border-t border-border mt-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted font-bold mb-2">Primary Assignee</p>
                  <div className="flex items-center gap-3 p-3 bg-surface border border-border">
                    <UserIcon size={16} className="text-muted" />
                    <div>
                      <p className="text-xs font-bold text-primary">{incident.assignee.full_name}</p>
                      <p className="text-[10px] text-muted">{incident.assignee.badge_number || 'No Badge'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Evidence Panel */}
          <div className="card p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm uppercase tracking-widest text-primary font-medium flex items-center gap-2">
                <Paperclip size={16} /> Evidence Vault
              </h3>
              <span className="text-[10px] text-muted font-mono">{evidence.length} files</span>
            </div>

            <div className="space-y-3">
              {evidence.map((ev) => (
                <div key={ev.id} className="p-4 bg-surface border border-border group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText size={18} className="text-muted shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-primary truncate">{ev.file_name}</p>
                        <p className="text-[10px] text-muted uppercase font-mono">{formatFileSize(ev.file_size)} • {ev.file_type.split('/')[1]}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownload(ev.file_path, ev.file_name)}
                      className="text-muted hover:text-accent p-1 transition-colors"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                  <div className="text-[9px] text-muted flex items-center justify-between">
                    <span>Uploaded by {ev.uploader?.full_name || 'System'}</span>
                    <span>{formatDate(ev.created_at)}</span>
                  </div>
                </div>
              ))}
              
              {evidence.length === 0 && (
                <p className="text-xs text-muted text-center py-4 border border-dashed border-border">
                  No visual evidence recorded.
                </p>
              )}

              <Button variant="secondary" size="sm" className="w-full mt-4">
                <Plus size={14} className="mr-2" /> Upload New Evidence
              </Button>
            </div>
          </div>

          {/* Activity Metadata */}
          <div className="card p-6 bg-surface-raised/50">
            <h3 className="text-[10px] uppercase tracking-widest text-muted font-bold mb-4">Metadata</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-muted">INTERNAL_ID</span>
                <span className="text-primary truncate ml-4">{incident.id}</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-muted">PUBLIC_REPORT</span>
                <span className="text-primary">{incident.is_public_report ? 'TRUE' : 'FALSE'}</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-muted">RESOLUTION_TIME</span>
                <span className="text-primary">{resolutionHours(incident.created_at, incident.resolved_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
