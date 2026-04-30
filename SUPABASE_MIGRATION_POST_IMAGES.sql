create table if not exists post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists post_images_post_id_sort_order_idx
  on post_images (post_id, sort_order);

alter table post_images enable row level security;

create policy "post images are viewable by everyone"
on post_images
for select
to public
using (true);

create policy "users can create images for their own posts"
on post_images
for insert
to authenticated
with check (
  exists (
    select 1
    from posts
    where posts.id = post_images.post_id
      and posts.user_id = auth.uid()
  )
);

create policy "users can update images for their own posts"
on post_images
for update
to authenticated
using (
  exists (
    select 1
    from posts
    where posts.id = post_images.post_id
      and posts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from posts
    where posts.id = post_images.post_id
      and posts.user_id = auth.uid()
  )
);

create policy "users can delete images for their own posts"
on post_images
for delete
to authenticated
using (
  exists (
    select 1
    from posts
    where posts.id = post_images.post_id
      and posts.user_id = auth.uid()
  )
);
