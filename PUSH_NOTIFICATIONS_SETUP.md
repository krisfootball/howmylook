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
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
4. After a successful post create, the app calls `/api/notify-post`
5. The server route:
   - finds `follows` where `following_id = new post user_id` and `notifications_enabled = true`
   - loads browser `push_subscriptions`
   - loads Android `android_push_devices`
   - sends Web Push to browser subscribers
   - sends Firebase Cloud Messaging notifications to Android devices
   - removes expired browser subscriptions and invalid Android tokens

If these env vars are missing, some follower notification delivery paths will fail even though posting still succeeds.

## SQL to run

Run this in Supabase:

- `SUPABASE_MIGRATION_PUSH_NOTIFICATIONS.sql`
- `SUPABASE_MIGRATION_ANDROID_PUSH.sql`

## Notes

- iPhone support depends on PWA/browser support and user permission.
- Browser push delivery is handled in `/api/notify-post`.
- Android push delivery is also handled in `/api/notify-post` via Firebase Admin.
- If you want later, this can still move into a dedicated worker or Supabase Edge Function.
