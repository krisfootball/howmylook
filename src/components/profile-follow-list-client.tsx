"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type Mode = "followers" | "following";

type Person = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
};

export function ProfileFollowListClient({
  mode,
  profileId,
}: {
  mode: Mode;
  profileId?: string;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        if (!user && !profileId) {
          setError("Sign in to view this list.");
          setLoading(false);
          return;
        }

        const targetProfileId = profileId || user?.id;

        if (!targetProfileId) {
          setError("Unable to determine which profile to load.");
          setLoading(false);
          return;
        }

        let peopleIds: string[] = [];

        if (mode === "following") {
          const { data: follows, error: followsError } = await supabase
            .from("follows")
            .select("following_id,created_at")
            .eq("follower_id", targetProfileId)
            .order("created_at", { ascending: false })
            .limit(100);

          if (followsError) {
            throw followsError;
          }

          peopleIds = Array.from(new Set((follows ?? []).map((row) => row.following_id).filter(Boolean)));
        } else {
          const { data: follows, error: followsError } = await supabase
            .from("follows")
            .select("follower_id,created_at")
            .eq("following_id", targetProfileId)
            .order("created_at", { ascending: false })
            .limit(100);

          if (followsError) {
            throw followsError;
          }

          peopleIds = Array.from(new Set((follows ?? []).map((row) => row.follower_id).filter(Boolean)));
        }

        if (peopleIds.length === 0) {
          setPeople([]);
          setLoading(false);
          return;
        }

        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id,username,display_name,bio,avatar_url")
          .in("id", peopleIds);

        if (profilesError) {
          throw profilesError;
        }

        const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

        setPeople(
          peopleIds
            .map((id) => profileMap.get(id))
            .filter(Boolean)
            .map((profile) => ({
              id: profile!.id,
              displayName: profile!.display_name || "HowMyLook user",
              username: profile!.username ? `@${profile!.username}` : "@username",
              avatarUrl: profile!.avatar_url || null,
            })),
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unable to load this list.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [mode, profileId, supabase]);

  if (loading) {
    return (
      <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        Loading {mode}...
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[1.6rem] border border-rose-100 bg-rose-50 p-5 text-sm leading-6 text-rose-700 shadow-sm">
        {error}
      </section>
    );
  }

  if (people.length === 0) {
    return (
      <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        {mode === "following" ? "No following yet." : "No followers yet."}
      </section>
    );
  }

  return (
    <div className="space-y-3">
      {people.map((person) => (
        <Link
          key={person.id}
          href={`/people/${person.id}`}
          className="block rounded-[1.2rem] border border-pink-100 bg-white px-3 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            {person.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={person.avatarUrl} alt={person.displayName} className="h-11 w-11 rounded-full object-cover shadow-sm" />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,_#f6c4d5_0%,_#ddb7ff_100%)] text-base shadow-sm">
                ✨
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{person.displayName}</p>
              <p className="text-sm text-slate-500">{person.username}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
