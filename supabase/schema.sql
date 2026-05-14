-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('guard', 'supervisor', 'head', 'admin')),
  badge_number text unique,
  phone text,
  zone text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Incidents
create table public.incidents (
  id uuid default uuid_generate_v4() primary key,
  reference_number text unique not null,
  incident_type text not null check (incident_type in ('theft', 'suspicious_activity', 'vandalism', 'lost_found', 'facility_issue', 'noise_complaint', 'trespass', 'other')),
  location text not null,
  campus_zone text not null check (campus_zone in ('main_gate', 'hostels', 'admin_block', 'library', 'engineering_block', 'science_labs', 'sports_ground', 'cafeteria', 'parking', 'other')),
  severity text not null check (severity in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'assigned', 'in_progress', 'resolved', 'closed')),
  description text not null,
  reported_by uuid references public.profiles(id),
  assigned_to uuid references public.profiles(id),
  is_public_report boolean default false,
  reporter_name text,
  reporter_contact text,
  is_anonymous boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  resolved_at timestamptz
);

-- Incident Notes (updates, observations, follow-ups)
create table public.incident_notes (
  id uuid default uuid_generate_v4() primary key,
  incident_id uuid references public.incidents(id) on delete cascade not null,
  author_id uuid references public.profiles(id),
  content text not null,
  created_at timestamptz default now()
);

-- Evidence
create table public.evidence (
  id uuid default uuid_generate_v4() primary key,
  incident_id uuid references public.incidents(id) on delete cascade not null,
  uploaded_by uuid references public.profiles(id),
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size integer not null,
  created_at timestamptz default now()
);

-- Audit Logs
create table public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  action text not null,
  target_type text not null,
  target_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- Public Reports (from unauthenticated portal)
create table public.public_reports (
  id uuid default uuid_generate_v4() primary key,
  reference_number text unique not null,
  incident_type text not null,
  location text not null,
  campus_zone text not null,
  description text not null,
  reporter_name text,
  reporter_contact text,
  is_anonymous boolean default false,
  status text default 'pending' check (status in ('pending', 'reviewed', 'converted', 'dismissed')),
  incident_id uuid references public.incidents(id),
  created_at timestamptz default now()
);

-- Reference number sequence function
create or replace function generate_reference_number()
returns text as $$
declare
  year_str text := to_char(now(), 'YYYY');
  seq_num integer;
  ref text;
begin
  select count(*) + 1 into seq_num from public.incidents where extract(year from created_at) = extract(year from now());
  ref := 'INC-' || year_str || '-' || lpad(seq_num::text, 4, '0');
  return ref;
end;
$$ language plpgsql;

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger incidents_updated_at before update on public.incidents for each row execute function update_updated_at();
create trigger profiles_updated_at before update on public.profiles for each row execute function update_updated_at();

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.incidents enable row level security;
alter table public.incident_notes enable row level security;
alter table public.evidence enable row level security;
alter table public.audit_logs enable row level security;
alter table public.public_reports enable row level security;

-- Profiles: authenticated users see all profiles (for assignment dropdowns)
create policy "Authenticated users can view profiles" on public.profiles for select to authenticated using (true);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Admins can insert profiles" on public.profiles for insert to authenticated with check (true);

-- Incidents: authenticated users can read all, create; restricted updates
create policy "Authenticated users can view incidents" on public.incidents for select to authenticated using (true);
create policy "Authenticated users can create incidents" on public.incidents for insert to authenticated with check (true);
create policy "Authenticated users can update incidents" on public.incidents for update to authenticated using (true);

-- Notes, Evidence, Audit: authenticated full access
create policy "Authenticated access to notes" on public.incident_notes for all to authenticated using (true);
create policy "Authenticated access to evidence" on public.evidence for all to authenticated using (true);
create policy "Authenticated access to audit logs" on public.audit_logs for all to authenticated using (true);

-- Public reports: anyone can insert, authenticated can read
create policy "Anyone can submit public reports" on public.public_reports for insert to anon, authenticated with check (true);
create policy "Authenticated users can view public reports" on public.public_reports for select to authenticated using (true);
create policy "Authenticated users can update public reports" on public.public_reports for update to authenticated using (true);

-- Storage bucket for evidence
insert into storage.buckets (id, name, public) values ('evidence', 'evidence', false);
create policy "Authenticated users can upload evidence" on storage.objects for insert to authenticated with check (bucket_id = 'evidence');
create policy "Authenticated users can view evidence" on storage.objects for select to authenticated using (bucket_id = 'evidence');
