insert into profiles (id, username, display_name, total_yes_given, total_no_given, unlock_votes_completed)
values
  ('00000000-0000-0000-0000-000000000001', 'miastyles', 'Mia', 0, 0, 0),
  ('00000000-0000-0000-0000-000000000002', 'elenafits', 'Elena', 0, 0, 0),
  ('00000000-0000-0000-0000-000000000003', 'noralooks', 'Nora', 0, 0, 0)
on conflict (id) do nothing;

insert into posts (id, user_id, image_url, caption, yes_count, no_count, is_active)
values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'seed://look-1', 'Dinner date look. Is the blazer working with the satin skirt?', 128, 17, true),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'seed://look-2', 'Trying this for a gallery opening. Too much black or just enough?', 76, 21, true),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000003', 'seed://look-3', 'Weekend shopping fit. White sneakers or ankle boots instead?', 93, 28, true)
on conflict (id) do nothing;
