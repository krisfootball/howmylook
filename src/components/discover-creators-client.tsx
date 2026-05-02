"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type DiscoverProfile = {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  isFollowing: boolean;
};

export function DiscoverCreatorsClient({
  onChanged,
  query = "",
}: {
  onChanged?: () => void;
  query?: string;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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
          setMessage("Sign in to discover people to follow.");
          setProfiles([]);
          setLoading(false);
          return;
        }

        const { data: allProfiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id,username,display_name,bio,avatar_url")
          .neq("id", user.id)
          .order("created_at", { ascending: false })
          .limit(12);

        if (profilesError) {
          throw profilesError;
        }

        const { data: followRows, error: followsError } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);

        if (followsError) {
          throw followsError;
        }

        const followingIds = new Set((followRows ?? []).map((row) => row.following_id));

        const mappedProfiles = (allProfiles ?? []).map((profile) => ({
          id: profile.id,
          username: profile.username ? `@${profile.username}` : "@username",
          displayName: profile.display_name || "HowMyLook user",
          bio: profile.bio || "Posting looks and getting quick feedback.",
          avatarUrl: profile.avatar_url || null,
          isFollowing: followingIds.has(profile.id),
        }));

        const filteredProfiles = !query
          ? mappedProfiles
          : mappedProfiles.filter((profile) => {
              const haystack = `${profile.displayName} ${profile.username} ${profile.bio}`.toLowerCase();
              return haystack.includes(query.toLowerCase());
            });

        setProfiles(filteredProfiles);
        setMessage(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unable to load suggested people.";
        setMessage(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [query, supabase]);

  async function handleToggleFollow(profileId: string, isFollowing: boolean) {
    setBusyId(profileId);
    setMessage(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Sign in to manage following.");
      }

      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", profileId);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: profileId,
        });

        if (error) {
          throw error;
        }
      }

      setProfiles((current) =>
        current.map((profile) =>
          profile.id === profileId
            ? {
                ...profile,
                isFollowing: !isFollowing,
              }
            : profile,
        ),
      );
      setMessage(isFollowing ? "Unfollowed." : "Following saved.");
      onChanged?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to update following.";
      const friendlyMessage = errorMessage.toLowerCase().includes("row-level security") || errorMessage.toLowerCase().includes("permission")
        ? "Following is wired in the app, but Supabase still needs the RLS policies from SUPABASE_RLS_SETUP.sql applied."
        : errorMessage;
      setMessage(friendlyMessage);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="space-y-4 rounded-[1.6rem] border border-pink-100 bg-white p-4 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-500">Discover</p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">Find people to follow</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Follow a few creators so the following feed becomes useful right away.
        </p>
      </div>

      {loading ? <p className="text-sm text-slate-600">Loading suggestions...</p> : null}

      {!loading && profiles.length === 0 && !message ? (
        <p className="text-sm text-slate-600">No matching creators found yet.</p>
      ) : null}

      <div className="space-y-3">
        {profiles.map((profile) => (
          <article
            key={profile.id}
            className="flex items-start justify-between gap-3 rounded-[1.2rem] bg-slate-50 px-4 py-4"
          >
            <Link href={`/people/${profile.id}`} className="min-w-0 flex-1">
              <div className="flex items-start gap-3">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt={profile.displayName} className="h-12 w-12 rounded-full object-cover shadow-sm" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,_#f6c4d5_0%,_#ddb7ff_100%)] text-lg shadow-sm">
                    ✨
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{profile.displayName}</p>
                  <p className="text-sm text-slate-500">{profile.username}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{profile.bio}</p>
                  <p className="mt-2 text-xs font-medium text-pink-600">Open profile</p>
                </div>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => handleToggleFollow(profile.id, profile.isFollowing)}
              disabled={busyId === profile.id}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                profile.isFollowing
                  ? "bg-white text-slate-700 ring-1 ring-slate-200"
                  : "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
              } disabled:opacity-60`}
            >
              {busyId === profile.id ? "Saving..." : profile.isFollowing ? "Following" : "Follow"}
            </button>
          </article>
        ))}
      </div>

      {message ? (
        <div className="rounded-[1.2rem] bg-pink-50 px-4 py-3 text-sm leading-6 text-slate-700">{message}</div>
      ) : null}
    </section>
  );
}
