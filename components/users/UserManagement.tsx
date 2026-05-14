'use client';

import React, { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Profile, UserRole } from '@/lib/types';
import { UserPlus, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserManagementProps {
  initialUsers: Profile[];
}

export const UserManagement = ({ initialUsers }: UserManagementProps) => {
  const [users, setUsers] = useState<Profile[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'guard' as UserRole,
    badge_number: '',
    phone: '',
    zone: '',
  });

  const refreshUsers = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true });
    
    if (data) setUsers(data);
  }, [supabase]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to create user');
      }

      toast('success', 'User account created successfully');
      setIsModalOpen(false);
      refreshUsers();
      router.refresh();
    } catch (error: any) {
      toast('error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserStatus = async (user: Profile) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !user.is_active })
        .eq('id', user.id);
      
      if (error) throw error;
      toast('success', `User ${user.is_active ? 'deactivated' : 'activated'}`);
      refreshUsers();
      router.refresh();
    } catch (error: any) {
      toast('error', error.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Personnel Management" 
        description="Administer security department accounts, roles, and access permissions." 
        actions={
          <Button onClick={() => setIsModalOpen(true)}>
            <UserPlus size={16} className="mr-2" /> Provision New User
          </Button>
        }
      />

      <div className="card">
        <Table headers={['Full Name', 'Badge', 'Role', 'Zone', 'Status', 'Actions']}>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{u.full_name}</span>
                  <span className="text-xs text-muted font-mono">{u.phone || 'No Phone'}</span>
                </div>
              </td>
              <td className="mono text-accent">{u.badge_number || 'N/A'}</td>
              <td>
                <span className="text-[10px] uppercase tracking-widest border border-border px-1.5 py-0.5 bg-surface-raised">
                  {u.role}
                </span>
              </td>
              <td>{u.zone || 'Global'}</td>
              <td>
                {u.is_active ? (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-status-resolved">
                    <ShieldCheck size={12} /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-destructive">
                    <ShieldAlert size={12} /> Suspended
                  </span>
                )}
              </td>
              <td>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => toggleUserStatus(u)}>
                    {u.is_active ? 'Suspend' : 'Activate'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toast('info', 'Edit functionality placeholder')}>
                    Edit
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Provision New User"
      >
        <form onSubmit={handleCreateUser} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Full Name" 
              required 
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})}
            />
            <Input 
              label="Email Address" 
              type="email" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Badge Number" 
              value={formData.badge_number}
              onChange={(e) => setFormData({...formData, badge_number: e.target.value})}
            />
            <Input 
              label="Phone Number" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Departmental Role" 
              required 
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
              options={[
                { label: 'Guard', value: 'guard' },
                { label: 'Supervisor', value: 'supervisor' },
                { label: 'Head of Security', value: 'head' },
                { label: 'System Admin', value: 'admin' },
              ]}
            />
            <Input 
              label="Assigned Zone" 
              value={formData.zone}
              onChange={(e) => setFormData({...formData, zone: e.target.value})}
            />
          </div>
          <Input 
            label="Initial Password" 
            type="password" 
            required 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={submitting}>Create Account</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
