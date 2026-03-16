-- RosterTracker Supabase Schema
-- Run this in your Supabase SQL Editor

-- Profiles table (extends Supabase Auth)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  email text,
  clearance text default 'viewer',
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

-- Company data table (recruitment metrics)
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

-- Enable Row Level Security
alter table profiles enable row level security;
alter table company_data enable row level security;

-- RLS Policies
create policy "Authenticated users can view profiles" on profiles for select to authenticated using (true);
create policy "Users can update own profile" on profiles for update to authenticated using (auth.uid() = id);

create policy "Authenticated users can view company_data" on company_data for select to authenticated using (true);
create policy "Authenticated users can insert company_data" on company_data for insert to authenticated with check (true);
create policy "Authenticated users can update company_data" on company_data for update to authenticated using (true);
