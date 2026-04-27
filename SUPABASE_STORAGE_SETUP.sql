insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "public can view post images"
on storage.objects
for select
to public
using (bucket_id = 'post-images');

create policy "authenticated users can upload post images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'post-images');

create policy "authenticated users can update their own post images"
on storage.objects
for update
to authenticated
using (bucket_id = 'post-images')
with check (bucket_id = 'post-images');
