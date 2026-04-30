const profiles = [
  { id: "00000000-0000-0000-0000-000000000001", username: "miastyles", displayName: "Mia" },
  { id: "00000000-0000-0000-0000-000000000002", username: "elenafits", displayName: "Elena" },
  { id: "00000000-0000-0000-0000-000000000003", username: "noralooks", displayName: "Nora" },
  { id: "00000000-0000-0000-0000-000000000004", username: "zoechic", displayName: "Zoe" },
  { id: "00000000-0000-0000-0000-000000000005", username: "linalooks", displayName: "Lina" },
  { id: "00000000-0000-0000-0000-000000000006", username: "avaedit", displayName: "Ava" },
  { id: "00000000-0000-0000-0000-000000000007", username: "chloefits", displayName: "Chloe" },
  { id: "00000000-0000-0000-0000-000000000008", username: "iriswardrobe", displayName: "Iris" },
  { id: "00000000-0000-0000-0000-000000000009", username: "mayaonlook", displayName: "Maya" },
  { id: "00000000-0000-0000-0000-000000000010", username: "siennastyle", displayName: "Sienna" },
];

const captions = [
  "Dinner date look. Is the blazer working with the satin skirt?",
  "Trying this for a gallery opening. Too much black or just enough?",
  "Weekend shopping fit. White sneakers or ankle boots instead?",
  "Dinner with friends tonight. Does the leather jacket make this better or too heavy?",
  "Trying a softer work look for Friday. Are the trousers and knit working together?",
  "Coffee meeting tomorrow morning — does this trench and loafer combo feel polished enough?",
  "I want this to feel expensive without looking overdone. Is the belt helping?",
  "Testing an all-denim look today. Chic or too matchy?",
  "Would you keep the boots with this midi dress or switch to heels?",
  "Airport outfit check: comfortable enough, or too plain?",
];

const profileValues = profiles
  .map(
    ({ id, username, displayName }) =>
      `  ('${id}', '${username}', '${displayName.replace(/'/g, "''")}', 0, 0, 0)`,
  )
  .join(',\n');

const postValues = Array.from({ length: 50 }, (_, index) => {
  const profile = profiles[index % profiles.length];
  const id = String(index + 1).padStart(12, '0');
  const uuid = `${id.slice(0, 8)}-${id.slice(8, 12)}-4444-8888-${id.padEnd(12, '0')}`;
  const caption = captions[index % captions.length].replace(/'/g, "''");
  const yesCount = 55 + (index * 7) % 140;
  const noCount = 8 + (index * 3) % 45;
  return `  ('${uuid}', '${profile.id}', 'seed://look-${index + 1}', '${caption}', ${yesCount}, ${noCount}, true)`;
}).join(',\n');

console.log(`insert into profiles (id, username, display_name, total_yes_given, total_no_given, unlock_votes_completed)\nvalues\n${profileValues}\non conflict (id) do nothing;\n\ninsert into posts (id, user_id, image_url, caption, yes_count, no_count, is_active)\nvalues\n${postValues}\non conflict (id) do nothing;`);
