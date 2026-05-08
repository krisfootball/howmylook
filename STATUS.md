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
- unlocked routing now lands on Home instead of profile
- rating flow now calls a DB-side `cast_vote` RPC for safer vote + counter updates
- post detail route has been cleaned up to `/post/[postId]`
- admin moderation foundation added with moderation statuses, admin queue route, and single-post review page
- public discovery/rating/profile surfaces now respect approved moderation status
- upload flow now triggers a dedicated admin alert placeholder route to support future Telegram delivery

## Progress toward testing
- 85% ready for testing

## Important known issue
Vercel deploy is showing stale/default content because the local workspace code has not yet been pushed to GitHub.

## Latest cleanup
- root route `/` now resolves to the real next app step server-side: `/auth`, `/welcome`, `/rate`, or `/home`

## Next engineering priorities
1. Apply the latest Supabase SQL files, especially `SUPABASE_RPC_CAST_VOTE.sql`, storage setup, and `SUPABASE_MIGRATION_ADMIN_MODERATION.sql`
2. Set `ADMIN_EMAILS` and verify `/admin/posts` access with a real admin account
3. Wire Telegram admin delivery using `TELEGRAM_BOT_TOKEN` and `TELEGRAM_ADMIN_CHAT_ID`
4. Verify live image uploads through storage bucket
5. Sync workspace code to GitHub somehow (export or authenticated push)
6. Make deployed preview reflect current app
7. Remove or refresh older planning docs that still describe `/following` as the primary unlocked destination
8. Finish removing or consolidating leftover legacy `/following` code paths now that the route is only an alias to `/home`
