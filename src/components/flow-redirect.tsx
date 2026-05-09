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
  unlocked: "/home",
} as const;

const allowedByStep: Record<string, string[]> = {
  auth: ["/auth", "/terms", "/privacy", "/guidelines", "/contact", "/"],
  username: ["/welcome", "/auth", "/terms", "/privacy", "/guidelines", "/contact", "/"],
  rating: ["/rate", "/welcome", "/auth", "/terms", "/privacy", "/guidelines", "/contact", "/"],
  unlocked: ["/profile", "/people", "/post", "/admin", "/upload", "/home", "/search", "/activity", "/liked", "/disliked", "/rate", "/welcome", "/auth", "/terms", "/privacy", "/guidelines", "/contact", "/"],
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

      if (!isPathAllowed(step, pathname)) {
        router.replace(stepToPath[step]);
      }
    }

    checkFlow();
  }, [pathname, router, supabase]);

  return null;
}
