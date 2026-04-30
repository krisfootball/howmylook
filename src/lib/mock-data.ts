export type VoteValue = "yes" | "no";

export type OutfitPost = {
  id: string;
  authorName: string;
  authorHandle: string;
  caption: string;
  yesCount: number;
  noCount: number;
  imageStyle: string;
  tags: string[];
};

const demoCreators = [
  { name: "Mia", handle: "@miastyles" },
  { name: "Elena", handle: "@elenafits" },
  { name: "Nora", handle: "@noralooks" },
  { name: "Zoe", handle: "@zoechic" },
  { name: "Lina", handle: "@linalooks" },
];

const demoCaptions = [
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

const demoTags = [
  ["date night", "blazer", "heels"],
  ["gallery", "minimal", "black"],
  ["shopping", "casual", "weekend"],
  ["night out", "jacket", "edgy"],
  ["workwear", "knit", "friday"],
  ["coffee", "trench", "loafer"],
  ["belt", "tailored", "polished"],
  ["denim", "casual", "street"],
  ["dress", "boots", "heels"],
  ["airport", "travel", "comfort"],
];

const demoGradients = [
  "bg-[linear-gradient(180deg,_#f8d6df_0%,_#f1c9ef_35%,_#c8b6ff_70%,_#9b8cff_100%)]",
  "bg-[linear-gradient(180deg,_#2a2333_0%,_#5a496f_35%,_#b085c8_70%,_#f0d0e8_100%)]",
  "bg-[linear-gradient(180deg,_#f6e7cb_0%,_#f8c7b4_35%,_#f1998e_65%,_#cc6b8e_100%)]",
  "bg-[linear-gradient(180deg,_#d9d0ff_0%,_#f0c2dd_45%,_#f8e6bf_100%)]",
  "bg-[linear-gradient(180deg,_#d2f1eb_0%,_#c4d9ff_45%,_#f3d9ff_100%)]",
];

export const ratingQueue: OutfitPost[] = Array.from({ length: 50 }, (_, index) => {
  const creator = demoCreators[index % demoCreators.length];
  const caption = demoCaptions[index % demoCaptions.length];
  const tags = demoTags[index % demoTags.length];
  const imageStyle = demoGradients[index % demoGradients.length];

  return {
    id: `${index + 1}`,
    authorName: creator.name,
    authorHandle: creator.handle,
    caption,
    yesCount: 55 + (index * 7) % 140,
    noCount: 8 + (index * 3) % 45,
    imageStyle,
    tags,
  };
});

export const currentUser = {
  name: "Sofia",
  handle: "@sofiawardrobe",
  joinedProgress: 3,
  unlockTarget: 5,
  yesGiven: 248,
  noGiven: 61,
  followers: 321,
  following: 118,
  bio: "Trying on outfits before brunches, work events, and too many online carts.",
};

export const myPosts = [
  { id: "p1", label: "Birthday dinner", score: "89% yes" },
  { id: "p2", label: "Office outfit", score: "74% yes" },
  { id: "p3", label: "Weekend denim", score: "68% yes" },
];

export const voteHistory = {
  liked: [ratingQueue[0], ratingQueue[2]],
  disliked: [ratingQueue[1]],
};
