'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { StatusBadge, SeverityBadge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { Incident, Profile } from '@/lib/types';
import { formatDate, formatType, formatZone } from '@/lib/utils/format';
import { exportIncidentsToPDF } from '@/lib/utils/export';
import Link from 'next/link';
import { Download, FilterX, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const PAGE_SIZE = 25;

interface IncidentRepositoryProps {
  initialIncidents: Incident[];
  initialCount: number;
  profile: Profile;
}

export const IncidentRepository = ({ initialIncidents, initialCount, profile }: IncidentRepositoryProps) => {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [page, setPage] = useState(0);
  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('incidents')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (profile.role === 'guard') {
      query = query.or(`reported_by.eq.${profile.id},assigned_to.eq.${profile.id}`);
    }

    if (searchTerm) {
      query = query.or(`reference_number.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);
    if (typeFilter !== 'all') query = query.eq('incident_type', typeFilter);
    if (severityFilter !== 'all') query = query.eq('severity', severityFilter);
    if (zoneFilter !== 'all') query = query.eq('campus_zone', zoneFilter);

    const { data, count, error } = await query;

    if (error) {
      toast('error', 'Failed to fetch incidents');
    } else {
      setIncidents(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [page, searchTerm, statusFilter, typeFilter, severityFilter, zoneFilter, profile, supabase, toast]);

  // Use an effect to trigger fetch when filters change, except for the initial render
  const [isInitial, setIsInitial] = useState(true);
  useEffect(() => {
    if (isInitial) {
      setIsInitial(false);
      return;
    }
    fetchIncidents();
  }, [fetchIncidents]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setSeverityFilter('all');
    setZoneFilter('all');
    setPage(0);
  };

  const handleExport = () => {
    if (incidents.length === 0) {
      toast('info', 'No incidents to export');
      return;
    }
    exportIncidentsToPDF(incidents, `Incidents Report - ${new Date().toLocaleDateString()}`);
    toast('success', 'PDF report generated');
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Incident Repository" 
        description="Search and filter through all security terminal logs."
        actions={
          <>
            {(profile.role === 'supervisor' || profile.role === 'head') && (
              <Button variant="secondary" onClick={handleExport}>
                <Download size={16} className="mr-2" /> Export PDF
              </Button>
            )}
            <Link href="/incidents/new">
              <Button>Log New Incident</Button>
            </Link>
          </>
        }
      />

      <div className="card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1">
            <Input 
              label="Search" 
              placeholder="Ref or description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            label="Status" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Statuses', value: 'all' },
              { label: 'Pending', value: 'pending' },
              { label: 'Assigned', value: 'assigned' },
              { label: 'In Progress', value: 'in_progress' },
              { label: 'Resolved', value: 'resolved' },
              { label: 'Closed', value: 'closed' },
            ]}
          />
          <Select 
            label="Type" 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { label: 'All Types', value: 'all' },
              { label: 'Theft', value: 'theft' },
              { label: 'Suspicious Activity', value: 'suspicious_activity' },
              { label: 'Vandalism', value: 'vandalism' },
              { label: 'Lost & Found', value: 'lost_found' },
              { label: 'Facility Issue', value: 'facility_issue' },
              { label: 'Noise Complaint', value: 'noise_complaint' },
              { label: 'Trespass', value: 'trespass' },
              { label: 'Other', value: 'other' },
            ]}
          />
          <Select 
            label="Severity" 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            options={[
              { label: 'All Severities', value: 'all' },
              { label: 'Low', value: 'low' },
              { label: 'Medium', value: 'medium' },
              { label: 'High', value: 'high' },
            ]}
          />
          <div className="flex items-end gap-2">
            <Select 
              label="Zone" 
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              options={[
                { label: 'All Zones', value: 'all' },
                { label: 'Main Gate', value: 'main_gate' },
                { label: 'Hostels', value: 'hostels' },
                { label: 'Admin Block', value: 'admin_block' },
                { label: 'Library', value: 'library' },
                { label: 'Engineering Block', value: 'engineering_block' },
                { label: 'Science Labs', value: 'science_labs' },
                { label: 'Sports Ground', value: 'sports_ground' },
                { label: 'Cafeteria', value: 'cafeteria' },
                { label: 'Parking', value: 'parking' },
                { label: 'Other', value: 'other' },
              ]}
            />
            <Button variant="ghost" size="md" onClick={clearFilters} title="Clear Filters">
              <FilterX size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-20 flex justify-center"><Spinner size="lg" /></div>
        ) : incidents.length > 0 ? (
          <>
            <Table headers={['Reference', 'Type', 'Zone', 'Severity', 'Status', 'Logged At', 'Actions']}>
              {incidents.map((inc) => (
                <tr key={inc.id}>
                  <td className="mono font-medium text-accent">{inc.reference_number}</td>
                  <td>{formatType(inc.incident_type)}</td>
                  <td>{formatZone(inc.campus_zone)}</td>
                  <td><SeverityBadge severity={inc.severity} /></td>
                  <td><StatusBadge status={inc.status} /></td>
                  <td className="text-muted">{formatDate(inc.created_at)}</td>
                  <td>
                    <Link href={`/incidents/${inc.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </Table>
            
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-xs text-muted">
                Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount} records
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  disabled={page === 0} 
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  disabled={(page + 1) * PAGE_SIZE >= totalCount} 
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState 
            title="No incidents found" 
            description="Adjust your search or filters to find what you're looking for, or log a new incident."
            action={<Button onClick={clearFilters}>Clear All Filters</Button>}
          />
        )}
      </div>
    </div>
  );
};
