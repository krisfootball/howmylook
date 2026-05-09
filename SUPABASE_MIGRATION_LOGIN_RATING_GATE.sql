alter table public.profiles
  add column if not exists login_rating_votes_completed integer not null default 0;
