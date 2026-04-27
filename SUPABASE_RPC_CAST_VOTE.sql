create or replace function public.cast_vote(target_post_id uuid, vote_value text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  post_owner_id uuid;
  existing_vote_id uuid;
  updated_profile profiles%rowtype;
  updated_post posts%rowtype;
  next_unlock_votes integer;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if vote_value not in ('yes', 'no') then
    raise exception 'Invalid vote value';
  end if;

  select user_id
  into post_owner_id
  from posts
  where id = target_post_id
    and is_active = true;

  if post_owner_id is null then
    raise exception 'Post not found';
  end if;

  if post_owner_id = current_user_id then
    raise exception 'You cannot rate your own post';
  end if;

  select id
  into existing_vote_id
  from votes
  where user_id = current_user_id
    and post_id = target_post_id;

  if existing_vote_id is not null then
    raise exception 'You already rated this look';
  end if;

  insert into votes (user_id, post_id, value)
  values (current_user_id, target_post_id, vote_value);

  update profiles
  set total_yes_given = total_yes_given + case when vote_value = 'yes' then 1 else 0 end,
      total_no_given = total_no_given + case when vote_value = 'no' then 1 else 0 end,
      unlock_votes_completed = unlock_votes_completed + 1,
      updated_at = now()
  where id = current_user_id
  returning * into updated_profile;

  update posts
  set yes_count = yes_count + case when vote_value = 'yes' then 1 else 0 end,
      no_count = no_count + case when vote_value = 'no' then 1 else 0 end,
      updated_at = now()
  where id = target_post_id
  returning * into updated_post;

  next_unlock_votes := updated_profile.unlock_votes_completed;

  return json_build_object(
    'postId', updated_post.id,
    'yesCount', updated_post.yes_count,
    'noCount', updated_post.no_count,
    'totalYesGiven', updated_profile.total_yes_given,
    'totalNoGiven', updated_profile.total_no_given,
    'unlockVotesCompleted', next_unlock_votes
  );
end;
$$;

grant execute on function public.cast_vote(uuid, text) to authenticated;
