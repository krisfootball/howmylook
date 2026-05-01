alter table posts
  add column if not exists expires_at timestamptz,
  add column if not exists keep_forever boolean not null default false;

update posts
set expires_at = coalesce(expires_at, created_at + interval '30 days');

alter table posts
  alter column expires_at set not null;

create index if not exists posts_user_keep_forever_idx
  on posts (user_id, keep_forever);

create index if not exists posts_expires_at_idx
  on posts (expires_at);

create or replace function enforce_keep_forever_limit()
returns trigger
language plpgsql
as $$
declare
  kept_count integer;
begin
  if new.keep_forever then
    select count(*)
      into kept_count
    from posts
    where user_id = new.user_id
      and keep_forever = true
      and id <> coalesce(new.id, gen_random_uuid());

    if kept_count >= 10 then
      raise exception 'You can keep at most 10 posts on your profile.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_keep_forever_limit_on_posts on posts;

create trigger enforce_keep_forever_limit_on_posts
before insert or update of keep_forever on posts
for each row
execute function enforce_keep_forever_limit();
