-- Migration for WebPicks Database Schema in Supabase

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Users / Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  plan_tier text not null default 'free',
  imports_count integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Projects Table
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  url text not null,
  screenshot_url text,
  tokens_json jsonb not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.projects enable row level security;

-- Policies for Profiles
create policy "Allow user to read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Allow user to update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Policies for Projects
create policy "Allow public read access to projects"
  on public.projects for select
  using (true);

create policy "Allow authenticated user to insert project"
  on public.projects for insert
  with check (true);

create policy "Allow project owner to update project"
  on public.projects for update
  using (auth.uid() = user_id or user_id is null);
