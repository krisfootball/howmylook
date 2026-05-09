"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { appConfig } from "@/lib/app-config";
import { getNextRequiredStep, hasCompletedUsername } from "@/lib/app-state";
import { getAvailableRatingPostCount, shouldBypassLoginRatingGate } from "@/lib/rating-gate";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type AccessGateCardProps = {
  areaLabel: string;
  children: React.ReactNode;
  bare?: boolean;
};

export function AccessGateCard({ areaLabel, children, bare = false }: AccessGateCardProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [nextStep, setNextStep] = useState("auth");
  const [ratingsCompleted, setRatingsCompleted] = useState(0);

  useEffect(() => {
    async function checkAccess() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setAllowed(false);
          setNextStep("auth");
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("username,login_rating_votes_completed")
          .eq("id", user.id)
          .maybeSingle();

        const completed = profile?.login_rating_votes_completed ?? 0;

        const availablePostCount = await getAvailableRatingPostCount(supabase, user.id);

        const step = getNextRequiredStep({
          isAuthenticated: true,
          hasUsername: hasCompletedUsername({
            id: user.id,
            username: profile?.username,
          }),
          ratingsCompleted: completed,
          unlockVoteCount: appConfig.unlockVoteCount,
          bypassRatingGate: shouldBypassLoginRatingGate(availablePostCount),
        });

        setRatingsCompleted(completed);
        setNextStep(step);
        setAllowed(step === "unlocked");
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [supabase]);

  if (loading) {
    return (
      <div className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        Loading...
      </div>
    );
  }

  if (allowed) {
    return bare ? <div className="-mx-4 -my-4">{children}</div> : <>{children}</>;
  }

  return (
    <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">{areaLabel}</h2>
      <p className="mt-2 text-sm text-slate-600">{ratingsCompleted} / {appConfig.unlockVoteCount}</p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {nextStep === "auth" ? (
          <Link href="/auth" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white text-center">
            Go to auth
          </Link>
        ) : null}
        {nextStep === "username" ? (
          <Link href="/welcome" className="rounded-full bg-pink-500 px-5 py-3 text-sm font-semibold text-white text-center">
            Choose username
          </Link>
        ) : null}
        {nextStep === "rating" ? (
          <Link href="/rate" className="rounded-full bg-pink-500 px-5 py-3 text-sm font-semibold text-white text-center">
            Continue rating
          </Link>
        ) : null}
      </div>
    </section>
  );
}
