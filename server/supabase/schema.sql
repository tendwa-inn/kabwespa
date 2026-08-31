-- The Kabwe Spa — Supabase schema
-- Run this once in Supabase Dashboard → SQL Editor → New query → Run.
-- RLS is disabled on every table: the Express server is the only client
-- that talks to Supabase (using the anon key server-side only), and it
-- already enforces its own JWT-based authorization for every request.

create extension if not exists "pgcrypto";

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  display_name text not null default 'Admin',
  password_hash text not null,
  created_at timestamptz not null default now()
);
alter table admins disable row level security;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  full_name text not null default '',
  phone text not null default '',
  area text not null default '',
  photo text,
  role text not null default 'user',
  password_hash text not null,
  created_at timestamptz not null default now()
);
alter table users disable row level security;

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  price numeric not null,
  photo text,
  description text not null default '',
  video_url text
);
alter table services disable row level security;

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  username text not null,
  full_name text not null default '',
  phone text not null default '',
  service_id uuid,
  service_name text not null,
  category text not null,
  original_price numeric not null,
  price numeric not null,
  promo_code text,
  date text not null,
  time text not null,
  notes text not null default '',
  status text not null default 'booked',
  created_at timestamptz not null default now()
);
alter table appointments disable row level security;

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  service_id uuid,
  service_name text,
  standard_price numeric,
  amount numeric not null,
  is_discounted boolean not null default false,
  description text,
  notes text not null default '',
  created_at timestamptz not null default now(),
  created_by text not null
);
alter table transactions disable row level security;

create table if not exists carried_forward_entries (
  id uuid primary key default gen_random_uuid(),
  amount numeric not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  created_by text not null
);
alter table carried_forward_entries disable row level security;

create table if not exists promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null,
  value numeric not null,
  service_id uuid,
  service_name text not null default 'All services',
  expires_at timestamptz,
  max_uses int,
  uses_count int not null default 0,
  created_at timestamptz not null default now()
);
alter table promo_codes disable row level security;

create table if not exists assistant_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'general'
);
alter table assistant_questions disable row level security;

create table if not exists welcome_slides (
  id uuid primary key default gen_random_uuid(),
  caption text not null,
  photo text,
  sort_order int not null default 0
);
alter table welcome_slides disable row level security;

create table if not exists location_photos (
  id uuid primary key default gen_random_uuid(),
  photo text not null,
  caption text not null default '',
  created_at timestamptz not null default now()
);
alter table location_photos disable row level security;

create table if not exists settings (
  id int primary key default 1,
  logo text,
  hero_photo text,
  center_phone text not null default '+26077686722',
  whatsapp_numbers text[] not null default array['+260974068912','+260772180359'],
  whatsapp_bubble_number text not null default '+260974068912',
  location text not null default 'Highridge, Kabwe',
  location_lat numeric,
  location_lng numeric,
  constraint settings_singleton check (id = 1)
);
alter table settings disable row level security;
insert into settings (id) values (1) on conflict (id) do nothing;

-- Storage bucket for uploaded photos (logo, hero, service, welcome slide, location).
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

drop policy if exists "Public read uploads" on storage.objects;
create policy "Public read uploads" on storage.objects
  for select using (bucket_id = 'uploads');

drop policy if exists "Anon write uploads" on storage.objects;
create policy "Anon write uploads" on storage.objects
  for insert with check (bucket_id = 'uploads');
