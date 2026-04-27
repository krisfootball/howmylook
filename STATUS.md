# HowMyLook status

## Current state
- Mobile-first Next.js MVP in progress
- Supabase connected
- Core schema created
- unlock_votes_completed added
- demo profiles/posts seeded in Supabase
- auth form connected
- username form connected
- vote saving connected to votes + profile progress
- profile/upload/following now gated behind unlock flow
- client-side automatic flow redirects added
- profile header now reads real data from Supabase
- profile posts grid now reads real user posts from Supabase
- upload page can now create a real post record
- upload flow prepared for real Supabase Storage image upload
- liked/disliked history now reads real vote/post data from Supabase
- following feed now reads real follow/post data from Supabase
- follow/unfollow actions added through real Supabase writes
- rating queue now excludes already-rated posts and the current user's own posts
- rating queue now has a real exhausted/empty state
- unlocked routing now lands on following instead of profile
- rating flow now calls a DB-side `cast_vote` RPC for safer vote + counter updates

## Progress toward testing
- 85% ready for testing

## Important known issue
Vercel deploy is showing stale/default content because the local workspace code has not yet been pushed to GitHub.

## Next engineering priorities
1. Apply the latest Supabase SQL files, especially `SUPABASE_RPC_CAST_VOTE.sql` and storage setup
2. Verify live image uploads through storage bucket
3. Sync workspace code to GitHub somehow (export or authenticated push)
4. Make deployed preview reflect current app
5. Add public profile browsing and profile editing
