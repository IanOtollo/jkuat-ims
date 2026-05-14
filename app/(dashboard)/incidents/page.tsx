
import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { IncidentRepository } from '@/components/incidents/IncidentRepository';
import { Incident, Profile } from '@/lib/types';
import { getProfile } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

const PAGE_SIZE = 25;

export default async function IncidentsPage() {
  const profile = await getProfile();
  
  if (!profile) {
    redirect('/login');
  }

  const supabase = await createClient();
  
  let query = supabase
    .from('incidents')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, PAGE_SIZE - 1);

  if (profile.role === 'guard') {
    query = query.or(`reported_by.eq.${profile.id},assigned_to.eq.${profile.id}`);
  }

  const { data: incidents, count } = await query;

  return (
    <IncidentRepository 
      initialIncidents={(incidents || []) as Incident[]} 
      initialCount={count || 0} 
      profile={profile as Profile} 
    />
  );
}
