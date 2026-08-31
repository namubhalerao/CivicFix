-- ==============================================================================
-- CIVICFIX SUPABASE PRODUCTION DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null unique,
  role text not null check (role in ('citizen', 'admin')) default 'citizen',
  points integer not null default 0,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 2. TEAMS TABLE (Municipal Work Crews)
-- ------------------------------------------------------------------------------
create table if not exists public.teams (
  id text primary key,
  name text not null unique,
  leader_name text not null,
  mobile_number text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed default municipal teams if not exists
insert into public.teams (id, name, leader_name, mobile_number, is_active)
values
  ('team-road', 'Road & Pothole Team', 'Amol Patil', '9876543210', true),
  ('team-garbage', 'Garbage & Sanitation Team', 'Sagar Jadhav', '9876543211', true),
  ('team-streetlight', 'Streetlight Team', 'Nikhil Shinde', '9876543212', true),
  ('team-water', 'Water & Leakage Team', 'Rohit Deshmukh', '9876543213', true),
  ('team-traffic', 'Traffic Management Team', 'Akash Pawar', '9876543214', true),
  ('team-tree', 'Tree & Environment Team', 'Pratik More', '9876543215', true),
  ('team-electrical', 'Electrical Team', 'Mahesh Chavan', '9876543216', true),
  ('team-general', 'General Civic Team', 'Kunal Bhosale', '9876543217', true)
on conflict (name) do nothing;

-- ------------------------------------------------------------------------------
-- 3. ISSUES TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.issues (
  id text primary key,
  report_id text not null unique,
  citizen_id uuid references public.profiles(id) on delete set null,
  citizen_name text,
  citizen_email text,
  category text not null,
  title text not null,
  description text not null,
  address text not null,
  landmark text,
  latitude double precision not null,
  longitude double precision not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  people_affected integer not null default 10,
  priority_score integer not null default 50,
  priority_level text not null check (priority_level in ('low', 'medium', 'high', 'critical')),
  priority_explanation text,
  status text not null check (status in ('Submitted', 'Under Review', 'Verified', 'Assigned', 'Work Started', 'Resolved', 'Closed', 'Rejected', 'Duplicate')) default 'Submitted',
  assigned_team_id text references public.teams(id) on delete set null,
  assigned_team_name text,
  assigned_team_leader text,
  assigned_team_phone text,
  assigned_at timestamptz,
  assigned_by text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 3. ISSUE IMAGES TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.issue_images (
  id text primary key,
  issue_id text not null references public.issues(id) on delete cascade,
  image_url text not null,
  image_type text not null check (image_type in ('REPORT', 'BEFORE', 'AFTER')) default 'REPORT',
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 4. ISSUE STATUS HISTORY TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.issue_status_history (
  id text primary key,
  issue_id text not null references public.issues(id) on delete cascade,
  old_status text,
  new_status text not null,
  changed_by uuid references public.profiles(id) on delete set null,
  changed_by_name text,
  note text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 5. CITIZEN FEEDBACK TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.feedback (
  id text primary key,
  issue_id text not null references public.issues(id) on delete cascade,
  citizen_id uuid references public.profiles(id) on delete set null,
  citizen_name text,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 6. NOTIFICATIONS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.notifications (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  issue_id text references public.issues(id) on delete cascade,
  report_id text,
  title text not null,
  message text not null,
  type text not null default 'status_update',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------------
-- 7. AUTOMATIC USER PROFILE TRIGGER
-- ------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, points, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    case
      when lower(new.email) = 'sanjanadhere61@gmail.com' then 'admin'
      else 'citizen'
    end,
    case
      when lower(new.email) = 'sanjanadhere61@gmail.com' then 2500
      else 50
    end,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    name = excluded.name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.issues enable row level security;
alter table public.issue_images enable row level security;
alter table public.issue_status_history enable row level security;
alter table public.feedback enable row level security;
alter table public.notifications enable row level security;

-- PROFILES POLICIES
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- TEAMS POLICIES
create policy "Teams are viewable by everyone"
  on public.teams for select
  using (true);

create policy "Admins can insert and update teams"
  on public.teams for all
  using (true)
  with check (true);

-- ISSUES POLICIES (Public Ledger)
create policy "Issues are publicly viewable"
  on public.issues for select
  using (true);

create policy "Authenticated or anonymous citizens can insert issues"
  on public.issues for insert
  with check (true);

create policy "Admins and reporters can update issues"
  on public.issues for update
  using (
    auth.uid() = citizen_id or
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- ISSUE IMAGES POLICIES
create policy "Issue images are publicly viewable"
  on public.issue_images for select
  using (true);

create policy "Anyone can insert issue images"
  on public.issue_images for insert
  with check (true);

-- ISSUE STATUS HISTORY POLICIES
create policy "Issue history is publicly viewable"
  on public.issue_status_history for select
  using (true);

create policy "Admins and system can insert status history"
  on public.issue_status_history for insert
  with check (true);

-- FEEDBACK POLICIES
create policy "Feedback is publicly viewable"
  on public.feedback for select
  using (true);

create policy "Citizens can insert feedback"
  on public.feedback for insert
  with check (true);

-- NOTIFICATIONS POLICIES
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id or user_id is null);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "System and admins can insert notifications"
  on public.notifications for insert
  with check (true);

-- ------------------------------------------------------------------------------
-- 9. REALTIME PUBLICATION SETUP
-- ------------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.teams, public.issues, public.issue_status_history, public.notifications;

-- ------------------------------------------------------------------------------
-- 10. STORAGE BUCKET (issue-images)
-- ------------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('issue-images', 'issue-images', true)
on conflict (id) do update set public = true;

create policy "Public can view issue images"
  on storage.objects for select
  using (bucket_id = 'issue-images');

create policy "Anyone can upload issue images"
  on storage.objects for insert
  with check (bucket_id = 'issue-images');
