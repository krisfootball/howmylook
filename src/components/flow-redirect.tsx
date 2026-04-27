"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { appConfig } from "@/lib/app-config";
import { getNextRequiredStep } from "@/lib/app-state";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const stepToPath = {
  auth: "/auth",
  username: "/welcome",
  rating: "/rate",
  unlocked: "/following",
} as const;

const allowedByStep: Record<string, string[]> = {
  auth: ["/auth", "/"],
  username: ["/welcome", "/auth", "/"],
  rating: ["/rate", "/welcome", "/auth", "/"],
  unlocked: ["/profile", "/upload", "/following", "/liked", "/disliked", "/rate", "/welcome", "/auth", "/"],
};

export function FlowRedirect() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkFlow() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!allowedByStep.auth.includes(pathname)) {
          router.replace(stepToPath.auth);
        }
        return;
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
        hasUsername: Boolean(profile?.username),
        ratingsCompleted,
        unlockVoteCount: appConfig.unlockVoteCount,
      });

      if (!allowedByStep[step].includes(pathname)) {
        router.replace(stepToPath[step]);
      }
    }

    checkFlow();
  }, [pathname, router, supabase]);

  return null;
}
