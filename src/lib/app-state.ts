import { AppStep } from "@/lib/types";

export function hasCompletedUsername(profile: {
  username?: string | null;
  id?: string | null;
} | null | undefined) {
  const username = profile?.username?.trim().toLowerCase();

  if (!username) {
    return false;
  }

  const fallbackPrefix = "user_";
  const userIdPrefix = profile?.id?.slice(0, 8)?.toLowerCase();

  if (userIdPrefix && username === `${fallbackPrefix}${userIdPrefix}`) {
    return false;
  }

  return true;
}

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
