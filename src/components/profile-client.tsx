"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { LegalLinksCard } from "@/components/legal-links-card";
import { StatPill } from "@/components/stat-pill";

type ProfileState = {
  loading: boolean;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  yesGiven: number;
  noGiven: number;
  followers: number;
  following: number;
  error: string | null;
};

export function ProfileClient({
  onEdit,
  refreshKey = 0,
}: {
  onEdit?: () => void;
  refreshKey?: number;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [state, setState] = useState<ProfileState>({
    loading: true,
    username: "",
    displayName: "Your profile",
    bio: "Your profile data will appear here once connected.",
    avatarUrl: null,
    yesGiven: 0,
    noGiven: 0,
    followers: 0,
    following: 0,
    error: null,
  });

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          if (!active) return;
          setState((current) => ({ ...current, loading: false, error: "Sign in to load your profile." }));
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username,display_name,bio,avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        const [{ count: followersCount }, { count: followingCount }, { data: yesVotes }, { data: noVotes }] = await Promise.all([
          supabase
            .from("follows")
            .select("*", { count: "exact", head: true })
            .eq("following_id", user.id),
          supabase
            .from("follows")
            .select("*", { count: "exact", head: true })
            .eq("follower_id", user.id),
          supabase
            .from("votes")
            .select("post_id,posts!inner(id)")
            .eq("user_id", user.id)
            .eq("value", "yes")
            .eq("posts.is_active", true)
            .eq("posts.moderation_status", "approved"),
          supabase
            .from("votes")
            .select("post_id,posts!inner(id)")
            .eq("user_id", user.id)
            .eq("value", "no")
            .eq("posts.is_active", true)
            .eq("posts.moderation_status", "approved"),
        ]);

        if (!active) return;

        setState({
          loading: false,
          username: profile?.username ? `@${profile.username}` : "@username",
          displayName: profile?.display_name || "Your profile",
          bio: profile?.bio || "No bio yet.",
          avatarUrl: profile?.avatar_url || null,
          yesGiven: yesVotes?.length ?? 0,
          noGiven: noVotes?.length ?? 0,
          followers: followersCount ?? 0,
          following: followingCount ?? 0,
          error: null,
        });
      } catch (error) {
        if (!active) return;
        const errorMessage = error instanceof Error ? error.message : "Unable to load profile.";
        setState((current) => ({ ...current, loading: false, error: errorMessage }));
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [supabase, refreshKey]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setState((current) => ({ ...current, error: error.message }));
      return;
    }

    router.replace("/auth");
    router.refresh();
  }

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
        <div className="flex items-start justify-between gap-4">
          {state.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={state.avatarUrl} alt={state.displayName} className="h-16 w-16 rounded-full object-cover shadow-sm" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(180deg,_#f6c4d5_0%,_#ddb7ff_100%)] text-2xl shadow-sm">
              ✨
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold tracking-tight text-slate-900">{state.displayName}</p>
            <p className="text-sm text-slate-500">{state.username}</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{state.bio}</p>
          </div>

          <div className="pointer-events-auto shrink-0">
            <LegalLinksCard onLogout={() => void handleLogout()} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white"
          >
            Edit profile
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <StatPill label="Followers" value={state.followers} href="/profile/followers" />
          <StatPill label="Following" value={state.following} href="/profile/following" />
          <StatPill label="Yes given" value={state.yesGiven} href="/liked" />
          <StatPill label="No given" value={state.noGiven} href="/disliked" />
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
