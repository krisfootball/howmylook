# Admin moderation plan

## Goal
Keep HowMyLook focused on its mission: real outfit photos for quick yes/no feedback.

Kristaps wants to see every new post quickly on phone, then be able to review and remove content that does not fit the product.

## Recommended approach

### Phase 1 (recommended now)
- New posts publish immediately
- Every new post sends an admin alert to Kristaps on Telegram
- Alert includes the uploaded image, username, occasion text, timestamp, and a direct admin review link
- Add a private in-app admin moderation queue for fast review and removal
- Public app queries only show posts where moderation status is approved
- New posts can still default to approved in phase 1, while admin can hide/delete them fast after alert

This keeps the user experience fast while giving strong editorial control.

## Why this approach
- Fastest feedback loop for normal users
- Kristaps sees every new post instantly on phone
- Keeps operations lightweight for MVP
- Creates a real moderation foundation without forcing full manual approval on every post

## Future phase 2
- Add trust levels
- New or low-trust users post into pending review
- Trusted users auto-publish
- Optional direct Telegram moderation actions (approve/hide/delete buttons)

---

# Product behavior

## Admin visibility
Kristaps should be able to review new posts in two ways:

1. Telegram alert on phone with image preview
2. In-app admin queue, e.g. `/admin/posts`

## Admin queue card should show
- Cover image / gallery preview
- Username
- Display name
- Occasion text
- Created time
- Current moderation status
- Quick actions

## Phase 1 moderation actions
- Keep approved
- Hide from app
- Delete post

Optional later:
- Re-approve hidden post
- Add moderation note
- Suspend user

---

# Database direction

## Add moderation fields to posts
- `moderation_status text not null default 'approved'`
  - allowed values initially: `approved`, `hidden`, `deleted`, `pending`
- `moderation_reason text null`
- `moderated_at timestamptz null`
- `moderated_by uuid null`
- `admin_alert_sent_at timestamptz null`

## Query rule
All public-facing post queries should only show:
- `is_active = true`
- `moderation_status = 'approved'`
- retention rule still applies (`keep_forever = true` or `expires_at > now()`)

## Delete behavior
For MVP, prefer soft delete first:
- set `moderation_status = 'deleted'`
- set `is_active = false`

This is safer than hard delete while product rules are still evolving.

---

# Telegram admin alerts

## What should happen on each new post
After a successful post is created:
1. App stores the post and post images
2. App sends admin alert through Telegram
3. Kristaps sees the image immediately on phone
4. Alert includes a direct link to the in-app admin review page for that post

## Alert content
- Title: `New HowMyLook post`
- Username / display name
- Occasion text
- Created time
- Link to review page
- Attached image (first photo is enough for phase 1)

## Why Telegram first
- Fast phone delivery
- Photo preview in chat
- Minimal friction
- Easier MVP than building a full mobile admin push workflow first

---

# Admin route direction

## Suggested routes
- `/admin/posts` → newest moderation queue
- `/admin/posts/[postId]` → single post review

## Access control
Only Kristaps/admin accounts should access admin routes.

Recommended MVP approach:
- add env-configured admin allowlist by user id or email
- server-side check on admin pages and admin actions

---

# Implementation order

## Step 1
Add post moderation columns and admin concept in schema.

## Step 2
Update all public post queries to require `moderation_status = 'approved'`.

## Step 3
Add admin queue page to review newest posts.

## Step 4
Send Telegram alert on every successful new post.

## Step 5
Add hide/delete admin actions.

## Step 6
Later, optionally add pending-first flow or trust levels.

---

# Recommendation summary
Best MVP:
- auto-publish posts
- Telegram alert for every new post
- private admin moderation queue in app
- quick hide/delete controls

This is the best balance of speed, control, and low operational drag.
