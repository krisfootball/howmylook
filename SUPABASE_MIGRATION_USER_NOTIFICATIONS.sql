create table if not exists user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  post_id uuid references posts(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists user_notifications_user_created_idx
  on user_notifications (user_id, created_at desc);

alter table user_notifications enable row level security;

create policy "users can read their own notifications"
on user_notifications
for select
using (auth.uid() = user_id);
