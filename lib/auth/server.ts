import { createClient, createAdminClient } from '@/lib/supabase/server';
import { Profile } from '@/lib/types';

// This function handles the dynamic part (cookies)
export async function getProfile() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return profile as Profile | null;
}

export async function getSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
