insert into storage.buckets (id, name, public)
values ('profile-avatars', 'profile-avatars', true)
on conflict (id) do nothing;

create policy "public can view profile avatars"
on storage.objects
for select
to public
using (bucket_id = 'profile-avatars');

create policy "authenticated users can upload profile avatars"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'profile-avatars');

create policy "authenticated users can update profile avatars"
on storage.objects
for update
to authenticated
using (bucket_id = 'profile-avatars')
with check (bucket_id = 'profile-avatars');
