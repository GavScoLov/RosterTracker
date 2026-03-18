-- RosterTracker Supabase Schema
-- Run this in your Supabase SQL Editor

-- ============================================================
-- 1. PROFILES TABLE (extends Supabase Auth)
-- ============================================================
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  email text,
  role text default 'viewer',
  allowed_pages text[] default '{}',
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, new.email, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. COMPANY DATA TABLE (recruitment metrics)
-- ============================================================
create table if not exists company_data (
  id serial primary key,
  company text default 'TRC',
  week integer not null,
  date date,
  open_order integer default 0,
  scheduled integer default 0,
  interviewed integer default 0,
  accepted integer default 0,
  rom integer default 0,
  car integer default 0,
  aus integer default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- 3. COMPANIES TABLE
-- ============================================================
create table if not exists companies (
  id serial primary key,
  name text unique not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- ============================================================
-- 4. USER-COMPANY ASSIGNMENTS (many-to-many)
-- ============================================================
create table if not exists user_companies (
  id serial primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  company_id integer references companies(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, company_id)
);

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================
alter table profiles enable row level security;
alter table company_data enable row level security;
alter table companies enable row level security;
alter table user_companies enable row level security;

-- Profiles RLS
create policy "Authenticated users can view profiles" on profiles for select to authenticated using (true);
create policy "Users can insert own profile" on profiles for insert to authenticated with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update to authenticated using (auth.uid() = id);
create policy "Admins can update any profile" on profiles for update to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can delete profiles" on profiles for delete to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Company Data RLS
create policy "Authenticated users can view company_data" on company_data for select to authenticated using (true);
create policy "Authenticated users can insert company_data" on company_data for insert to authenticated with check (true);
create policy "Authenticated users can update company_data" on company_data for update to authenticated using (true);
create policy "Authenticated users can delete company_data" on company_data for delete to authenticated using (true);

-- Companies RLS
create policy "Authenticated users can view companies" on companies for select to authenticated using (true);
create policy "Admins can insert companies" on companies for insert to authenticated
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can update companies" on companies for update to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can delete companies" on companies for delete to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- User-Companies RLS
create policy "Authenticated users can view user_companies" on user_companies for select to authenticated using (true);
create policy "Admins can insert user_companies" on user_companies for insert to authenticated
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can delete user_companies" on user_companies for delete to authenticated
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ============================================================
-- SEED: Companies
-- ============================================================
insert into companies (name, slug) values ('TRC', 'trc');

-- ============================================================
-- SEED: Company Data (from CSV export)
-- ============================================================
insert into company_data (company, week, date, open_order, scheduled, interviewed, accepted, rom, car, aus) values
  ('TRC', 1,  '2025-05-23', 21,  18, 14, 10, 8, 1,  1),
  ('TRC', 2,  '2025-05-30', 61,  19, 16, 8,  5, 2,  1),
  ('TRC', 3,  '2025-06-06', 72,  39, 38, 17, 10, 3, 4),
  ('TRC', 4,  '2025-06-13', 48,  14, 13, 10, 0, 5,  5),
  ('TRC', 5,  '2025-06-20', 41,  42, 34, 17, 4, 12, 1),
  ('TRC', 6,  '2025-06-27', 56,  43, 35, 14, 5, 8,  1),
  ('TRC', 7,  '2025-07-04', 81,  37, 22, 23, 9, 13, 1),
  ('TRC', 8,  '2025-07-11', 60,  42, 40, 12, 5, 6,  1),
  ('TRC', 9,  '2025-07-18', 59,  29, 22, 16, 4, 9,  3),
  ('TRC', 10, '2025-07-25', 71,  41, 21, 11, 7, 4,  0),
  ('TRC', 11, '2025-08-01', 32,  29, 34, 13, 5, 4,  4),
  ('TRC', 12, '2025-08-08', 98,  35, 13, 12, 5, 5,  2),
  ('TRC', 13, '2025-08-15', 59,  35, 32, 17, 7, 2,  4),
  ('TRC', 14, '2025-08-22', 72,  26, 18, 13, 4, 6,  3),
  ('TRC', 15, '2025-08-29', 96,  0,  0,  0,  0, 0,  0),
  ('TRC', 16, '2025-09-05', 143, 0,  0,  0,  0, 0,  0),
  ('TRC', 17, '2025-09-12', 80,  14, 13, 3,  0, 3,  0),
  ('TRC', 18, '2025-09-19', 105, 21, 10, 3,  1, 1,  1),
  ('TRC', 19, '2025-09-26', 145, 20, 19, 9,  3, 3,  3),
  ('TRC', 20, '2025-10-03', 0,   0,  0,  0,  0, 0,  0),
  ('TRC', 21, '2025-10-10', 0,   0,  0,  0,  0, 0,  0),
  ('TRC', 22, '2025-10-17', 0,   0,  0,  0,  0, 0,  0),
  ('TRC', 23, '2025-10-24', 0,   0,  0,  0,  0, 0,  0),
  ('TRC', 24, '2025-10-31', 0,   0,  0,  0,  0, 0,  0),
  ('TRC', 25, '2025-11-07', 0,   0,  0,  0,  0, 0,  0),
  ('TRC', 26, '2025-11-17', 0,   0,  0,  0,  0, 0,  0),
  ('TRC', 27, '2025-11-21', 0,   0,  0,  0,  0, 0,  0),
  ('TRC', 28, '2025-11-28', 0,   0,  0,  0,  0, 0,  0),
  ('TRC', 29, '2025-12-05', 11,  14, 12, 1,  0, 1,  0),
  ('TRC', 30, '2025-12-12', 32,  18, 16, 2,  1, 1,  0),
  ('TRC', 31, '2025-12-19', 35,  25, 17, 4,  0, 4,  0),
  ('TRC', 32, '2025-12-26', 0,   0,  0,  0,  0, 0,  0),
  ('TRC', 33, '2026-01-02', 22,  14, 12, 6,  3, 3,  0),
  ('TRC', 34, '2026-01-09', 88,  45, 40, 18, 7, 7,  4),
  ('TRC', 35, '2026-01-16', 112, 53, 21, 16, 3, 4,  9),
  ('TRC', 36, '2026-01-23', 120, 34, 24, 7,  4, 1,  2),
  ('TRC', 37, '2026-01-30', 72,  27, 19, 2,  0, 0,  0),
  ('TRC', 38, '2026-02-06', 63,  21, 20, 8,  2, 3,  2),
  ('TRC', 39, '2026-02-13', 79,  25, 22, 7,  4, 3,  0),
  ('TRC', 40, '2026-02-20', 52,  14, 14, 3,  0, 3,  0),
  ('TRC', 41, '2026-02-27', 88,  34, 28, 11, 1, 8,  2),
  ('TRC', 42, '2026-03-06', 120, 37, 31, 10, 2, 8,  0);
