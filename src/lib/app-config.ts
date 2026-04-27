export const appConfig = {
  name: "HowMyLook",
  tagline: "Quick outfit feedback.",
  onboardingHeadline: "Rate 5 looks to unlock the app.",
  onboardingDescription:
    "Create an account, choose a username, then rate 5 looks before profile, posting, and following unlock.",
  yesLabel: "Yes",
  noLabel: "No",
  unlockVoteCount: 5,
  unlockRules: {
    requireAuthBeforeRating: true,
    requireUsernameBeforeRating: true,
    lockProfileUntilVotesComplete: true,
    lockPostingUntilVotesComplete: true,
    lockFollowingUntilVotesComplete: true,
  },
};
