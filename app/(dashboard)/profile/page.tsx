'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { User, Shield, Badge as BadgeIcon, Phone, MapPin, Key } from 'lucide-react';

export default function ProfilePage() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    zone: profile?.zone || '',
  });

  const [passData, setPassData] = useState({
    new_password: '',
    confirm_password: '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          zone: formData.zone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      toast('success', 'Profile updated successfully');
    } catch (error: any) {
      toast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new_password !== passData.confirm_password) {
      return toast('error', 'Passwords do not match');
    }
    setPassLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passData.new_password,
      });

      if (error) throw error;
      toast('success', 'Password updated successfully');
      setPassData({ new_password: '', confirm_password: '' });
    } catch (error: any) {
      toast('error', error.message);
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PageHeader 
        title="Personal Profile" 
        description="Manage your account information and terminal access credentials." 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="card p-8 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-surface-raised border-2 border-accent flex items-center justify-center text-3xl font-bold mb-4">
            {profile?.full_name.charAt(0)}
          </div>
          <h2 className="text-xl font-display font-medium text-primary">{profile?.full_name}</h2>
          <p className="text-xs uppercase tracking-widest text-accent font-bold mt-1 mb-6">{profile?.role}</p>
          
          <div className="w-full space-y-3 pt-6 border-t border-border">
            <div className="flex items-center gap-3 text-sm text-muted">
              <BadgeIcon size={16} />
              <span className="font-mono">{profile?.badge_number || 'NO_BADGE'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted">
              <Shield size={16} />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Edit Forms */}
        <div className="md:col-span-2 space-y-8">
          <section className="card p-8">
            <h3 className="text-sm uppercase tracking-widest text-primary font-medium mb-6 flex items-center gap-2">
              <User size={16} /> Account Details
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input 
                label="Full Name" 
                value={formData.full_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, full_name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Phone Number" 
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, phone: e.target.value})}
                />
                <Input 
                  label="Assigned Zone" 
                  value={formData.zone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, zone: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" isLoading={loading}>Save Changes</Button>
              </div>
            </form>
          </section>

          <section className="card p-8">
            <h3 className="text-sm uppercase tracking-widest text-primary font-medium mb-6 flex items-center gap-2">
              <Key size={16} /> Terminal Authentication
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="New Password" 
                  type="password" 
                  value={passData.new_password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassData({...passData, new_password: e.target.value})}
                />
                <Input 
                  label="Confirm New Password" 
                  type="password" 
                  value={passData.confirm_password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassData({...passData, confirm_password: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="secondary" isLoading={passLoading}>Update Password</Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
