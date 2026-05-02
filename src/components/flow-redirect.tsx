"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { appConfig } from "@/lib/app-config";
import { getNextRequiredStep, hasCompletedUsername } from "@/lib/app-state";
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
  unlocked: ["/profile", "/people", "/upload", "/following", "/search", "/liked", "/disliked", "/rate", "/welcome", "/auth", "/"],
};

function isPathAllowed(step: keyof typeof allowedByStep, pathname: string) {
  return allowedByStep[step].some((allowedPath) =>
    pathname === allowedPath || pathname.startsWith(`${allowedPath}/`),
  );
}

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
        if (!isPathAllowed("auth", pathname)) {
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
        hasUsername: hasCompletedUsername({
          id: user.id,
          username: profile?.username,
        }),
        ratingsCompleted,
        unlockVoteCount: appConfig.unlockVoteCount,
      });

      if (!isPathAllowed(step, pathname)) {
        router.replace(stepToPath[step]);
      }
    }

    checkFlow();
  }, [pathname, router, supabase]);

  return null;
}
