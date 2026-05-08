import { redirect } from "next/navigation";
import { getNextRequiredStep, hasCompletedUsername } from "@/lib/app-state";
import { appConfig } from "@/lib/app-config";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const stepToPath = {
  auth: "/auth",
  username: "/welcome",
  rating: "/rate",
  unlocked: "/home",
} as const;

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(stepToPath.auth);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username,unlock_votes_completed,total_yes_given,total_no_given")
    .eq("id", user.id)
    .maybeSingle();

  const ratingsCompleted =
    profile?.unlock_votes_completed ??
    ((profile?.total_yes_given ?? 0) + (profile?.total_no_given ?? 0));

  const step = getNextRequiredStep({
    isAuthenticated: true,
    hasUsername: hasCompletedUsername({
      id: user.id,
      username: profile?.username,
    }),
    ratingsCompleted,
    unlockVoteCount: appConfig.unlockVoteCount,
  });

  redirect(stepToPath[step]);
}
