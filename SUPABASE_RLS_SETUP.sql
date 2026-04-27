alter table profiles enable row level security;
alter table posts enable row level security;
alter table votes enable row level security;
alter table follows enable row level security;
alter table reports enable row level security;

create policy "profiles are viewable by everyone"
on profiles
for select
to public
using (true);

create policy "users can insert their own profile"
on profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "users can update their own profile"
on profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "posts are viewable by everyone"
on posts
for select
to public
using (is_active = true);

create policy "users can create their own posts"
on posts
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update their own posts"
on posts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "votes are viewable by the voter"
on votes
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can create their own votes"
on votes
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "follows are viewable by everyone"
on follows
for select
to public
using (true);

create policy "users can follow from their own account"
on follows
for insert
to authenticated
with check (auth.uid() = follower_id);

create policy "users can unfollow from their own account"
on follows
for delete
to authenticated
using (auth.uid() = follower_id);

create policy "users can create their own reports"
on reports
for insert
to authenticated
with check (auth.uid() = reporter_id);
