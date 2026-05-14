'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { Incident, Profile, IncidentStatus } from '@/lib/types';
import { formatDate, formatType, formatZone } from '@/lib/utils/format';
import Link from 'next/link';
import { UserCheck, ShieldAlert, Clock, RefreshCw } from 'lucide-react';

export default function AssignmentsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [pendingIncidents, setPendingIncidents] = useState<Incident[]>([]);
  const [activeIncidents, setActiveIncidents] = useState<Incident[]>([]);
  const [officers, setOfficers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<string>('');
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Pending Incidents
      const { data: pending } = await supabase
        .from('incidents')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      // Active Incidents (Assigned/In Progress)
      const { data: active } = await supabase
        .from('incidents')
        .select('*, assignee:assigned_to(*)')
        .in('status', ['assigned', 'in_progress'])
        .order('updated_at', { ascending: false });

      // Active Officers
      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['guard', 'supervisor'])
        .eq('is_active', true);

      setPendingIncidents(pending || []);
      setActiveIncidents(active || []);
      setOfficers(profs || []);
    } catch (error: any) {
      toast('error', 'Failed to fetch assignment data');
    } finally {
      setLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    if (profile) fetchData();
  }, [profile, fetchData]);

  const handleAssign = async (incidentId: string) => {
    if (!selectedOfficer) return;
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ 
          assigned_to: selectedOfficer, 
          status: 'assigned', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', incidentId);
      
      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: profile?.id,
        action: 'ASSIGN_INCIDENT',
        target_type: 'incident',
        target_id: incidentId,
        details: { officer_id: selectedOfficer },
      });

      toast('success', 'Incident assigned successfully');
      setAssigningId(null);
      setSelectedOfficer('');
      fetchData();
    } catch (error: any) {
      toast('error', error.message);
    }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="space-y-12">
      <PageHeader 
        title="Command & Control" 
        description="Allocate personnel to pending incidents and manage active operational tasks."
        actions={<Button variant="secondary" onClick={fetchData}><RefreshCw size={16} className="mr-2" /> Refresh Queue</Button>}
      />

      {/* Pending Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-status-pending" size={24} />
          <h2 className="text-xl font-display font-medium text-primary">Pending Assignment</h2>
          <span className="bg-status-pending/20 text-status-pending px-2 py-0.5 text-[10px] font-mono font-bold">
            {pendingIncidents.length} REQUIRED
          </span>
        </div>

        <div className="card">
          <Table headers={['Reference', 'Type', 'Zone', 'Severity', 'Logged', 'Action']}>
            {pendingIncidents.map((inc) => (
              <tr key={inc.id}>
                <td className="mono font-medium text-accent">{inc.reference_number}</td>
                <td>{formatType(inc.incident_type)}</td>
                <td>{formatZone(inc.campus_zone)}</td>
                <td><SeverityBadge severity={inc.severity} /></td>
                <td className="text-muted">{formatDate(inc.created_at)}</td>
                <td>
                  {assigningId === inc.id ? (
                    <div className="flex items-center gap-2">
                      <Select 
                        className="w-48"
                        value={selectedOfficer}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedOfficer(e.target.value)}
                        options={[
                          { label: 'Select Officer', value: '' },
                          ...officers.map(o => ({ label: `${o.full_name} (${o.role})`, value: o.id }))
                        ]}
                      />
                      <Button size="sm" onClick={() => handleAssign(inc.id)}>Confirm</Button>
                      <Button variant="ghost" size="sm" onClick={() => setAssigningId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => setAssigningId(inc.id)}>
                      <UserCheck size={14} className="mr-2" /> Assign Officer
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
          {pendingIncidents.length === 0 && (
            <div className="p-12 text-center text-muted border-t border-border">
              All logged incidents have been assigned to personnel.
            </div>
          )}
        </div>
      </section>

      {/* Active Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Clock className="text-status-assigned" size={24} />
          <h2 className="text-xl font-display font-medium text-primary">Active Operations</h2>
          <span className="bg-status-assigned/20 text-status-assigned px-2 py-0.5 text-[10px] font-mono font-bold">
            {activeIncidents.length} IN PROGRESS
          </span>
        </div>

        <div className="card">
          <Table headers={['Reference', 'Assignee', 'Status', 'Zone', 'Last Update', 'Actions']}>
            {activeIncidents.map((inc) => (
              <tr key={inc.id}>
                <td className="mono font-medium text-accent">{inc.reference_number}</td>
                <td className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-border flex items-center justify-center text-[10px] font-bold">
                    {inc.assignee?.full_name?.charAt(0)}
                  </div>
                  <span>{inc.assignee?.full_name}</span>
                </td>
                <td><StatusBadge status={inc.status} /></td>
                <td>{formatZone(inc.campus_zone)}</td>
                <td className="text-muted">{formatDate(inc.updated_at)}</td>
                <td>
                  <Link href={`/incidents/${inc.id}`}>
                    <Button variant="ghost" size="sm">Manage Case</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
          {activeIncidents.length === 0 && (
            <div className="p-12 text-center text-muted border-t border-border">
              No active security operations at this time.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
