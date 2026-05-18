'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/layout/PageHeader';
import { Table } from '@/components/ui/Table';
import { Spinner } from '@/components/ui/Spinner';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { AuditLog } from '@/lib/types';
import { formatDate } from '@/lib/utils/format';
import { History, Eye, ChevronLeft, ChevronRight, Search } from 'lucide-react';

const PAGE_SIZE = 50;

export default function AuditLogsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  
  // Filters
  const [actionFilter, setActionFilter] = useState('all');
  const [targetFilter, setTargetFilter] = useState('all');
  
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*, user:user_id(*)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (actionFilter !== 'all') query = query.eq('action', actionFilter);
      if (targetFilter !== 'all') query = query.eq('target_type', targetFilter);

      const { data, count, error } = await query;
      
      if (error) throw error;
      setLogs(data || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      toast('error', 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, actionFilter, targetFilter]);

  useEffect(() => {
    if (profile) fetchLogs();
  }, [profile, fetchLogs]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Terminal Audit Trail" 
        description="Immutable record of all system operations and user activities." 
      />

      {/* Filters */}
      <div className="card p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select 
          label="Action Type" 
          value={actionFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setActionFilter(e.target.value)}
          options={[
            { label: 'All Actions', value: 'all' },
            { label: 'Create Incident', value: 'CREATE_INCIDENT' },
            { label: 'Update Status', value: 'UPDATE_STATUS' },
            { label: 'Assign Incident', value: 'ASSIGN_INCIDENT' },
            { label: 'User Login', value: 'LOGIN' },
          ]}
        />
        <Select 
          label="Target Type" 
          value={targetFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTargetFilter(e.target.value)}
          options={[
            { label: 'All Targets', value: 'all' },
            { label: 'Incident', value: 'incident' },
            { label: 'User', value: 'user' },
            { label: 'Public Report', value: 'public_report' },
          ]}
        />
        <div className="flex items-end">
          <Button variant="secondary" className="w-full" onClick={() => { setActionFilter('all'); setTargetFilter('all'); }}>
            Reset Filters
          </Button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="p-20"><Spinner size="lg" /></div>
        ) : (
          <>
            <Table headers={['Timestamp', 'User', 'Action', 'Target', 'Details']}>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="mono text-xs text-muted">{formatDate(log.created_at)}</td>
                  <td>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{log.user?.full_name || 'System'}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted">{log.user?.role || 'Service'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-[10px] font-mono border border-border px-1.5 py-0.5 bg-surface-raised">
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs uppercase tracking-widest text-muted">{log.target_type}</span>
                  </td>
                  <td>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                      <Eye size={14} className="mr-2" /> View Data
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-xs text-muted">
                Record {page * PAGE_SIZE + 1} - {Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={16} />
                </Button>
                <Button variant="secondary" size="sm" disabled={(page + 1) * PAGE_SIZE >= totalCount} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      <Modal 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
        title="Audit Entry Details"
      >
        {selectedLog && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-border">
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Execution Time</h4>
                <p className="text-sm font-mono text-primary">{formatDate(selectedLog.created_at)}</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">IP Address</h4>
                <p className="text-sm font-mono text-primary">{selectedLog.ip_address || 'Internal'}</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Initiator ID</h4>
                <p className="text-sm font-mono text-primary truncate">{selectedLog.user_id}</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase tracking-widest text-muted font-bold mb-1">Target ID</h4>
                <p className="text-sm font-mono text-primary truncate">{selectedLog.target_id}</p>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-muted font-bold mb-2">Payload Details</h4>
              <pre className="bg-black p-4 text-[11px] font-mono text-status-resolved overflow-auto max-h-60 border border-border">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
