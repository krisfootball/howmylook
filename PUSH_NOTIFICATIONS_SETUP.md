# Push notifications for followed accounts

This adds an app-level option for: a follower can follow an account, tap **Notify me**, and receive a push notification when that account posts.

## What is included

- Follow-level notification toggle in the UI
- Browser/device push permission request
- Service worker at `public/sw.js`
- Supabase table for push subscriptions
- Extra columns on `follows` to track notification preference

## Delivery status

The app now includes a **Next.js server route** at `/api/notify-post` and triggers it after successful post creation.

Production path in use:

1. Generate VAPID keys
2. Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in the app env
3. Set server env vars:
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. After a successful post create, the app calls `/api/notify-post`
5. The server route:
   - finds `follows` where `following_id = new post user_id` and `notifications_enabled = true`
   - loads each follower's `push_subscriptions`
   - sends a Web Push payload
   - removes expired subscriptions when the push service returns 404/410

If these env vars are missing, follower notification delivery will fail even though posting still succeeds.

## SQL to run

Run this in Supabase:

- `SUPABASE_MIGRATION_PUSH_NOTIFICATIONS.sql`

## Notes

- iPhone support depends on PWA/browser support and user permission.
- This implementation stores subscriptions and preferences, but does not yet send pushes by itself.
- If you want, next step I can add the actual send pipeline too (best via Supabase Edge Function).
