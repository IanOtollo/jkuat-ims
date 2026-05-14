import { createClient } from '@/lib/supabase/client';

export async function generateIncidentReference(): Promise<string> {
  const supabase = createClient();
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('incidents')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`);
  
  const seq = (count || 0) + 1;
  return `INC-${year}-${seq.toString().padStart(4, '0')}`;
}

export async function generatePublicReference(): Promise<string> {
  const supabase = createClient();
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('public_reports')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`);
  
  const seq = (count || 0) + 1;
  return `PUB-${year}-${seq.toString().padStart(4, '0')}`;
}
