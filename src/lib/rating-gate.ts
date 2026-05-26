import { appConfig } from "@/lib/app-config";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAvailableRatingPostCount(supabase: SupabaseClient, userId: string) {
  const nowIso = new Date().toISOString();

  const [{ data: voteRows, error: votesError }, { count: totalPostCount, error: postsError }] = await Promise.all([
    supabase.from("votes").select("post_id").eq("user_id", userId),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .neq("user_id", userId)
      .eq("is_active", true)
      .eq("moderation_status", "approved")
      .or(`keep_forever.eq.true,expires_at.gt.${nowIso}`),
  ]);

  if (votesError) {
    throw votesError;
  }

  if (postsError) {
    throw postsError;
  }

  const ratedPostIds = new Set((voteRows ?? []).map((vote: { post_id: string }) => vote.post_id));

  return Math.max((totalPostCount ?? 0) - ratedPostIds.size, 0);
}

export function shouldBypassLoginRatingGate(availablePostCount: number) {
  return availablePostCount < appConfig.unlockVoteCount;
}
