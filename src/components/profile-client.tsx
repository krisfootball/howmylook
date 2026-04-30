"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { StatPill } from "@/components/stat-pill";

type ProfileState = {
  loading: boolean;
  username: string;
  displayName: string;
  bio: string;
  yesGiven: number;
  noGiven: number;
  followers: number;
  following: number;
  error: string | null;
};

export function ProfileClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [state, setState] = useState<ProfileState>({
    loading: true,
    username: "",
    displayName: "Your profile",
    bio: "Your profile data will appear here once connected.",
    yesGiven: 0,
    noGiven: 0,
    followers: 0,
    following: 0,
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
          setState((current) => ({
            ...current,
            loading: false,
            error: "Sign in to load your profile.",
          }));
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username,display_name,bio,total_yes_given,total_no_given")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        const { count: followersCount } = await supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("following_id", user.id);

        const { count: followingCount } = await supabase
          .from("follows")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", user.id);

        setState({
          loading: false,
          username: profile?.username ? `@${profile.username}` : "@username",
          displayName: profile?.display_name || "Your profile",
          bio: profile?.bio || "No bio yet.",
          yesGiven: profile?.total_yes_given ?? 0,
          noGiven: profile?.total_no_given ?? 0,
          followers: followersCount ?? 0,
          following: followingCount ?? 0,
          error: null,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unable to load profile.";
        setState((current) => ({
          ...current,
          loading: false,
          error: errorMessage,
        }));
      }
    }

    load();
  }, [supabase]);

  if (state.loading) {
    return (
      <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        Loading profile...
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[1.6rem] border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(180deg,_#f6c4d5_0%,_#ddb7ff_100%)] text-2xl shadow-sm">
            ✨
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold tracking-tight text-slate-900">{state.displayName}</p>
            <p className="text-sm text-slate-500">{state.username}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{state.bio}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatPill label="Followers" value={state.followers} href="/profile/followers" />
          <StatPill label="Following" value={state.following} href="/profile/following" />
          <StatPill label="Yes given" value={state.yesGiven} />
          <StatPill label="No given" value={state.noGiven} />
        </div>
      </section>

      {state.error ? (
        <section className="rounded-[1.4rem] bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-700">
          {state.error}
        </section>
      ) : null}
    </div>
  );
}
