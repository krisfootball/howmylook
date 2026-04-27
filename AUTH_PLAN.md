# Auth plan

## v1 auth decision
- email + password only
- social login later if needed

## Next implementation steps
1. Add client auth forms
2. Sign up with Supabase Auth
3. Sign in with Supabase Auth
4. Read current session
5. If no profile row exists, redirect to username setup
6. After username setup, redirect to rating queue
7. After 5 votes, unlock app sections
