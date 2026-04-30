"use client";

import { useEffect, useMemo, useState } from "react";
import { appConfig } from "@/lib/app-config";
import { getNextRequiredStep, hasCompletedUsername } from "@/lib/app-state";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type SessionState = {
  email: string | null;
  hasUser: boolean;
  hasUsername: boolean;
  ratingsCompleted: number;
  nextStep: string;
  loading: boolean;
  error: string | null;
};

export function SessionStatusCard() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [state, setState] = useState<SessionState>({
    email: null,
    hasUser: false,
    hasUsername: false,
    ratingsCompleted: 0,
    nextStep: "auth",
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          setState({
            email: null,
            hasUser: false,
            hasUsername: false,
            ratingsCompleted: 0,
            nextStep: "auth",
            loading: false,
            error: null,
          });
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username,total_yes_given,total_no_given,unlock_votes_completed")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        const ratingsCompleted =
          profile?.unlock_votes_completed ??
          ((profile?.total_yes_given ?? 0) + (profile?.total_no_given ?? 0));
        const hasUsername = hasCompletedUsername({
          id: user.id,
          username: profile?.username,
        });
        const nextStep = getNextRequiredStep({
          isAuthenticated: true,
          hasUsername,
          ratingsCompleted,
          unlockVoteCount: appConfig.unlockVoteCount,
        });

        setState({
          email: user.email ?? null,
          hasUser: true,
          hasUsername,
          ratingsCompleted,
          nextStep,
          loading: false,
          error: null,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unable to load session.";
        setState((current) => ({
          ...current,
          loading: false,
          error: errorMessage,
        }));
      }
    }

    load();
  }, [supabase]);

  return (
    <section className="rounded-[1.6rem] border border-pink-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Current app state</p>
          <p className="mt-1 text-xs text-slate-500">Live check from Supabase auth + profile</p>
        </div>
        <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-600">
          {state.loading ? "Loading" : state.nextStep}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 px-3 py-3">
          <p className="text-slate-500">Logged in</p>
          <p className="mt-1 font-semibold text-slate-900">{state.hasUser ? "Yes" : "No"}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-3">
          <p className="text-slate-500">Username set</p>
          <p className="mt-1 font-semibold text-slate-900">{state.hasUsername ? "Yes" : "No"}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-3">
          <p className="text-slate-500">Ratings completed</p>
          <p className="mt-1 font-semibold text-slate-900">{state.ratingsCompleted}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-3 py-3">
          <p className="text-slate-500">Email</p>
          <p className="mt-1 truncate font-semibold text-slate-900">{state.email ?? "—"}</p>
        </div>
      </div>

      {state.error ? (
        <p className="mt-4 rounded-xl bg-rose-50 px-3 py-3 text-sm text-rose-700">{state.error}</p>
      ) : null}
    </section>
  );
}
