# Notifications env setup in Vercel

Add these environment variables in Vercel:

## Public
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` = your VAPID public key

## Server only
- `VAPID_PRIVATE_KEY` = your VAPID private key
- `VAPID_SUBJECT` = for example `mailto:hello@howmylook.app`
- `SUPABASE_SERVICE_ROLE_KEY` = from Supabase project settings
- `ADMIN_EMAILS` = comma-separated admin login emails allowed to open `/admin/posts`
- `TELEGRAM_BOT_TOKEN` = Telegram bot token for admin alerts later
- `TELEGRAM_ADMIN_CHAT_ID` = your Telegram chat id for admin alerts later (current discovered id: `8011654004`)

## Notes
- The app asks for notification permission only when a user taps **Notify me** on a followed profile.
- The server route sends pushes only to followers where `notifications_enabled = true` for that specific account.
- If a browser subscription is expired, the route removes it from `push_subscriptions` automatically.
- Admin moderation now uses `/admin/posts` and `/admin/posts/[postId]`.
- New post uploads also call an admin alert placeholder route now so Telegram delivery can be connected later without changing upload flow again.
