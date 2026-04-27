# HowMyLook setup notes

## Current environment
- Local code path: `/home/ubuntu/.openclaw/workspace/howmylook`
- Supabase URL configured
- Supabase publishable / anon key configured

## Next founder tasks
1. Connect the GitHub repo to this local codebase and later to Vercel
2. In Supabase SQL editor, run these files in order:
   - `supabase-schema.sql`
   - `SUPABASE_MIGRATION_NEXT.sql`
   - `SUPABASE_MIGRATION_VOTES.sql`
   - `SUPABASE_RLS_SETUP.sql`
   - `SUPABASE_RPC_CAST_VOTE.sql`
   - `SUPABASE_STORAGE_SETUP.sql`
3. Test sign up, username save, voting, follow/unfollow, and image upload
4. Be ready to connect Vercel later

## Current Supabase values
- Project URL: `https://kivvtomgajzzgcjcuyqd.supabase.co`
- Frontend key stored in `.env.local`

## Security note
`.env.local` should not be committed publicly if it later contains private secrets. For now it only contains the frontend public values.

## Why this matters
The app now depends on working RLS policies for:
- creating a profile after signup
- saving votes
- following and unfollowing people
- creating posts
- reading public profiles/posts/follows

If those SQL files are not applied, the UI may build correctly but fail at runtime with Supabase permission errors.
