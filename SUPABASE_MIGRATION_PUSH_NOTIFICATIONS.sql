create table if not exists push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  user_agent text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table follows add column if not exists notifications_enabled boolean not null default false;
alter table follows add column if not exists notifications_enabled_at timestamptz;

create index if not exists follows_following_notifications_idx
  on follows (following_id)
  where notifications_enabled = true;

create index if not exists push_subscriptions_user_id_idx
  on push_subscriptions (user_id);

alter table follows enable row level security;
alter table push_subscriptions enable row level security;

create policy if not exists "Users can read their follow rows"
  on follows for select
  using (auth.uid() = follower_id or auth.uid() = following_id);

create policy if not exists "Users can insert their follow rows"
  on follows for insert
  with check (auth.uid() = follower_id);

create policy if not exists "Users can delete their follow rows"
  on follows for delete
  using (auth.uid() = follower_id);

create policy if not exists "Users can update their follow notification settings"
  on follows for update
  using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);

create policy if not exists "Users can manage their own push subscriptions"
  on push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
