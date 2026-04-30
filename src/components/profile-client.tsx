"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { StatPill } from "@/components/stat-pill";

type FollowingItem = {
  id: string;
  username: string;
  displayName: string;
};

type ProfileState = {
  loading: boolean;
  userId: string | null;
  username: string;
  displayName: string;
  bio: string;
  yesGiven: number;
  noGiven: number;
  followers: number;
  following: number;
  followingPeople: FollowingItem[];
  error: string | null;
};

export function ProfileClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [state, setState] = useState<ProfileState>({
    loading: true,
    userId: null,
    username: "",
    displayName: "Your profile",
    bio: "Your profile data will appear here once connected.",
    yesGiven: 0,
    noGiven: 0,
    followers: 0,
    following: 0,
    followingPeople: [],
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

        const { data: followingRows } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id)
          .limit(8);

        let followingPeople: FollowingItem[] = [];

        if (followingRows && followingRows.length > 0) {
          const followingIds = followingRows.map((row) => row.following_id);
          const { data: followingProfiles } = await supabase
            .from("profiles")
            .select("id,username,display_name")
            .in("id", followingIds);

          followingPeople = (followingProfiles ?? []).map((person) => ({
            id: person.id,
            username: person.username ? `@${person.username}` : "@username",
            displayName: person.display_name || "HowMyLook user",
          }));
        }

        setState({
          loading: false,
          userId: user.id,
          username: profile?.username ? `@${profile.username}` : "@username",
          displayName: profile?.display_name || "Your profile",
          bio: profile?.bio || "No bio yet.",
          yesGiven: profile?.total_yes_given ?? 0,
          noGiven: profile?.total_no_given ?? 0,
          followers: followersCount ?? 0,
          following: followingCount ?? 0,
          followingPeople,
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
          <StatPill label="Followers" value={state.followers} />
          <StatPill label="Following" value={state.following} />
          <StatPill label="Yes given" value={state.yesGiven} />
          <StatPill label="No given" value={state.noGiven} />
        </div>

        <div className="mt-5 rounded-[1.3rem] bg-white/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-900">Following</p>
            <span className="text-xs text-slate-500">{state.followingPeople.length} shown</span>
          </div>

          {state.followingPeople.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">You are not following anyone yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {state.followingPeople.map((person) => (
                <a
                  key={person.id}
                  href={`/people/${person.id}`}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3 text-sm transition hover:bg-pink-50"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{person.displayName}</p>
                    <p className="text-slate-500">{person.username}</p>
                  </div>
                  <span className="text-xs font-medium text-pink-600">Open</span>
                </a>
              ))}
            </div>
          )}
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
