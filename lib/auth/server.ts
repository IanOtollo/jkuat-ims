import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Profile } from '@/lib/types';

// This function handles the dynamic part (cookies)
export async function getProfile() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;

  return getCachedProfile(session.user.id);
}

// This function handles the cached part
async function getCachedProfile(userId: string) {
  'use cache'
  const adminClient = createAdminClient();
  
  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return profile as Profile | null;
}

export async function getSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
