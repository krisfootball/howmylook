create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  total_yes_given integer not null default 0,
  total_no_given integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  image_url text not null,
  caption text,
  yes_count integer not null default 0,
  no_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_active boolean not null default true
);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  value text not null check (value in ('yes', 'no')),
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create table if not exists follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);
