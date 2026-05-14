export const unstable_instant = { prefetch: 'static' };

import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { UserManagement } from '@/components/users/UserManagement';
import { Profile } from '@/lib/types';
import { getProfile } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export default async function UsersPage() {
  const profile = await getProfile();
  
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  const supabase = createClient();
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true });

  return <UserManagement initialUsers={(users || []) as Profile[]} />;
}
