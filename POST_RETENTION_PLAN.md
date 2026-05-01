# Post Retention Plan

## Target behavior
- Every normal post expires after 30 days.
- Users may keep up to 10 posts on profile for longer.
- Expired non-kept posts should be fully removed from the system, including storage files.

## Implemented foundation
- SQL migration: `SUPABASE_MIGRATION_POST_RETENTION.sql`
  - adds `expires_at`
  - adds `keep_forever`
  - enforces max 10 kept posts per user
- New posts now default to:
  - `keep_forever = false`
  - `expires_at = created_at + 30 days`
- App queries now filter out expired non-kept posts in key surfaces.
- Cleanup script added: `npm run cleanup:expired-posts`

## Required before full rollout
1. Run `SUPABASE_MIGRATION_POST_RETENTION.sql` in Supabase.
2. Add `SUPABASE_SERVICE_ROLE_KEY` to the environment where cleanup script will run.
3. Run `npm run cleanup:expired-posts` manually first to verify behavior.
4. Later schedule it via cron / server job.

## Suggested cron schedule
- Once per day is enough.
- Example: every night around 02:00 UTC.

## Important note
The cleanup script is intentionally separate from client UI because full deletion requires privileged storage cleanup, not just hiding posts in the frontend.
