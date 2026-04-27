create policy "users can update their own vote history counters"
on profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
