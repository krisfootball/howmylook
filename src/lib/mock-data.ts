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

export const ratingQueue: OutfitPost[] = [
  {
    id: "1",
    authorName: "Mia",
    authorHandle: "@miastyles",
    caption: "Dinner date look. Is the blazer working with the satin skirt?",
    yesCount: 128,
    noCount: 17,
    imageStyle:
      "bg-[linear-gradient(180deg,_#f8d6df_0%,_#f1c9ef_35%,_#c8b6ff_70%,_#9b8cff_100%)]",
    tags: ["date night", "blazer", "heels"],
  },
  {
    id: "2",
    authorName: "Elena",
    authorHandle: "@elenafits",
    caption: "Trying this for a gallery opening. Too much black or just enough?",
    yesCount: 76,
    noCount: 21,
    imageStyle:
      "bg-[linear-gradient(180deg,_#2a2333_0%,_#5a496f_35%,_#b085c8_70%,_#f0d0e8_100%)]",
    tags: ["gallery", "minimal", "black"],
  },
  {
    id: "3",
    authorName: "Nora",
    authorHandle: "@noralooks",
    caption: "Weekend shopping fit. White sneakers or ankle boots instead?",
    yesCount: 93,
    noCount: 28,
    imageStyle:
      "bg-[linear-gradient(180deg,_#f6e7cb_0%,_#f8c7b4_35%,_#f1998e_65%,_#cc6b8e_100%)]",
    tags: ["shopping", "casual", "weekend"],
  },
  {
    id: "4",
    authorName: "Zoe",
    authorHandle: "@zoechic",
    caption: "Dinner with friends tonight. Does the leather jacket make this better or too heavy?",
    yesCount: 84,
    noCount: 19,
    imageStyle:
      "bg-[linear-gradient(180deg,_#d9d0ff_0%,_#f0c2dd_45%,_#f8e6bf_100%)]",
    tags: ["night out", "jacket", "edgy"],
  },
  {
    id: "5",
    authorName: "Lina",
    authorHandle: "@linalooks",
    caption: "Trying a softer work look for Friday. Are the trousers and knit working together?",
    yesCount: 67,
    noCount: 14,
    imageStyle:
      "bg-[linear-gradient(180deg,_#d2f1eb_0%,_#c4d9ff_45%,_#f3d9ff_100%)]",
    tags: ["workwear", "knit", "friday"],
  },
];

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
