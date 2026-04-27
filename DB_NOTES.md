# HowMyLook database notes

## Current schema status
The initial Supabase schema has been created in the project.

Tables currently created:
- profiles
- posts
- votes
- follows
- reports

RLS needs to match the current app behavior. Use these SQL files:
- `supabase-schema.sql` — base tables
- `SUPABASE_MIGRATION_NEXT.sql` — adds `unlock_votes_completed`
- `SUPABASE_MIGRATION_VOTES.sql` — legacy profile counter update policy
- `SUPABASE_STORAGE_SETUP.sql` — creates the `post-images` storage bucket and policies
- `SUPABASE_RLS_SETUP.sql` — adds practical read/write policies for profiles, posts, votes, follows, and reports
- `SUPABASE_RPC_CAST_VOTE.sql` — adds one safer DB-side vote function that inserts the vote and updates counters together

## Expected app flow
1. User signs up with Supabase Auth
2. App creates a matching row in `profiles`
3. User enters rating flow
4. User can vote yes/no on posts
5. After 5 ratings, full app unlocks
6. User can upload posts and follow people

## Next backend tasks
- Verify all SQL files have been run in Supabase in the right order
- Test follow/unfollow with current RLS policies
- Test real post upload after storage bucket setup
- Verify `SUPABASE_RPC_CAST_VOTE.sql` is applied and working in Supabase
- Test end-to-end voting with the DB-side cast function
- Test real post upload after storage bucket setup
- Build public profile browsing and profile editing
- Consider moving more write paths into RPC or DB triggers

## Later improvements
- DB triggers for broader counter maintenance
- RPC/functions for more write flows beyond vote casting
- More restrictive vote visibility rules
- Admin moderation roles
- Soft delete / moderation review states
