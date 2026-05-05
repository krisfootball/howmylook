# Push notifications for followed accounts

This adds an app-level option for: a follower can follow an account, tap **Notify me**, and receive a push notification when that account posts.

## What is included

- Follow-level notification toggle in the UI
- Browser/device push permission request
- Service worker at `public/sw.js`
- Supabase table for push subscriptions
- Extra columns on `follows` to track notification preference

## Still required for real delivery

The app also needs a **server-side push sender** that runs when a new post is created.

Recommended production path:

1. Generate VAPID keys
2. Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY` in the app env
3. Create a Supabase Edge Function or Next.js server route that:
   - receives a new post event
   - finds `follows` where `following_id = new post user_id` and `notifications_enabled = true`
   - loads each follower's `push_subscriptions`
   - sends a Web Push payload like:
     - title: `<display_name> posted a new look`
     - body: `Tap to open it in HowMyLook`
     - url: `/people/<profileId>` or the post route
4. Trigger that sender after successful post creation

## SQL to run

Run this in Supabase:

- `SUPABASE_MIGRATION_PUSH_NOTIFICATIONS.sql`

## Notes

- iPhone support depends on PWA/browser support and user permission.
- This implementation stores subscriptions and preferences, but does not yet send pushes by itself.
- If you want, next step I can add the actual send pipeline too (best via Supabase Edge Function).
