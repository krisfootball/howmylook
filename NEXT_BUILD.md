# Next build target

## Goal
Move HowMyLook from mock screens to a real gated app flow.

## Completed recently
- Added Supabase auth forms
- Added username setup form
- Added session state card
- Added locked sections for profile/posting/following
- Added vote persistence to votes table
- Added unlock progress tracking
- Added client-side flow redirects
- Seeded demo profiles and demo posts in Supabase

## Next engineering tasks
1. Improve redirect polish and loading states
2. Improve post counts consistency
3. Add real post creation with photo storage
4. Add public profile browsing and profile editing
5. Move vote and counter updates into RPC or DB-side logic for reliability

## Desired flow
- visitor opens app
- sign up / sign in
- choose username
- enter rating queue
- complete 5 ratings
- unlock rest of app
