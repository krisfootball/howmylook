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
    .select("username,login_rating_votes_completed")
    .eq("id", user.id)
    .maybeSingle();

  const ratingsCompleted = profile?.login_rating_votes_completed ?? 0;

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
