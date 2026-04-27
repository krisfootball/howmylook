# HowMyLook Plan

## Product summary
HowMyLook is a social photo app for quick outfit feedback. Users post outfit photos and other users vote **Yes** or **No**. The app opens into a TikTok-style one-photo rating queue. Users must rate 5 looks before unlocking the rest of the app.

## MVP scope

### In scope
- Sign up / log in
- User profiles
- Upload one photo per post
- Yes / No voting
- 5-vote unlock gate
- Post yes/no counters
- Profile stats (yes given / no given)
- Vote history (liked / disliked)
- Follow / unfollow
- Following feed
- Report post
- Basic admin moderation later in MVP

### Out of scope for v1
- Video
- Live video
- Comments
- Direct messages
- Notifications
- Monetization
- Advanced recommendation system
- Shopping links / affiliate features

## Recommended stack
- Next.js
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Vercel deployment

## Storage plan
- Codebase: local workspace now, Git repo next
- App database: Supabase Postgres
- User photos: Supabase Storage
- Production hosting: Vercel

## What the founder needs to do
- Create Supabase account/project
- Create Vercel account/project later
- Decide app branding and logo later
- Test flows on phone and desktop
- Give product direction in short daily sessions

## Immediate next build steps
1. Create project structure and reusable UI pieces
2. Add app routes for landing, auth, rating, profile
3. Add mock data layer and MVP type definitions
4. Add Supabase integration points
5. Create SQL schema for profiles, posts, votes, follows, reports
6. Add setup guide for non-technical founder
