"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { appConfig } from "@/lib/app-config";
import { getNextRequiredStep } from "@/lib/app-state";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type AccessGateCardProps = {
  areaLabel: string;
  children: React.ReactNode;
};

export function AccessGateCard({ areaLabel, children }: AccessGateCardProps) {
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
          .select("username,unlock_votes_completed,total_yes_given,total_no_given")
          .eq("id", user.id)
          .maybeSingle();

        const completed =
          profile?.unlock_votes_completed ??
          ((profile?.total_yes_given ?? 0) + (profile?.total_no_given ?? 0));

        const step = getNextRequiredStep({
          isAuthenticated: true,
          hasUsername: Boolean(profile?.username),
          ratingsCompleted: completed,
          unlockVoteCount: appConfig.unlockVoteCount,
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
        Checking access to {areaLabel}...
      </div>
    );
  }

  if (allowed) {
    return <>{children}</>;
  }

  return (
    <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-500">Locked area</p>
      <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-900">{areaLabel} unlocks after the first 5 ratings.</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Current next step: <span className="font-semibold text-slate-900">{nextStep}</span>. Ratings completed: {ratingsCompleted} / {appConfig.unlockVoteCount}.
      </p>

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
