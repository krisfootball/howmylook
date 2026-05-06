alter table posts
  add column if not exists moderation_status text not null default 'approved',
  add column if not exists moderation_reason text,
  add column if not exists moderated_at timestamptz,
  add column if not exists moderated_by uuid references profiles(id) on delete set null,
  add column if not exists admin_alert_sent_at timestamptz;

alter table posts
  drop constraint if exists posts_moderation_status_check;

alter table posts
  add constraint posts_moderation_status_check
  check (moderation_status in ('approved', 'hidden', 'deleted', 'pending'));

create index if not exists posts_moderation_status_idx on posts (moderation_status, created_at desc);
create index if not exists posts_user_id_moderation_status_idx on posts (user_id, moderation_status, created_at desc);
