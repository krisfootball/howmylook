import { AppStep } from "@/lib/types";

export function getNextRequiredStep({
  isAuthenticated,
  hasUsername,
  ratingsCompleted,
  unlockVoteCount,
}: {
  isAuthenticated: boolean;
  hasUsername: boolean;
  ratingsCompleted: number;
  unlockVoteCount: number;
}): AppStep {
  if (!isAuthenticated) {
    return "auth";
  }

  if (!hasUsername) {
    return "username";
  }

  if (ratingsCompleted < unlockVoteCount) {
    return "rating";
  }

  return "unlocked";
}
