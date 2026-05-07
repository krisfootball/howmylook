"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const STORAGE_KEY = "howmylook:lastSeenActivityAt";

type ActivityItem = {
  id: string;
  kind: "follow" | "vote" | "moderation";
  createdAt: string;
  title: string;
  subtitle: string;
  href?: string;
};

type JoinedProfile = {
  display_name?: string | null;
  username?: string | null;
};

type FollowRow = {
  follower_id: string;
  created_at: string;
  profiles?: JoinedProfile[] | JoinedProfile | null;
};

type VoteRow = {
  post_id: string;
  value: "yes" | "no";
  created_at: string;
  profiles?: JoinedProfile[] | JoinedProfile | null;
};

type ModeratedPostRow = {
  id: string;
  caption?: string | null;
  moderated_at?: string | null;
  moderation_status?: "approved" | "hidden" | "deleted" | "pending" | null;
  moderation_reason?: string | null;
};

function getJoinedProfile(profile: JoinedProfile[] | JoinedProfile | null | undefined): JoinedProfile | null {
  if (!profile) {
    return null;
  }

  return Array.isArray(profile) ? (profile[0] ?? null) : profile;
}

export function ActivityFeedClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

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
          setError("Sign in to view activity.");
          setLoading(false);
          return;
        }

        const { data: followRows, error: followsError } = await supabase
          .from("follows")
          .select("follower_id,created_at,profiles!follows_follower_id_fkey(display_name,username)")
          .eq("following_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (followsError) {
          throw followsError;
        }

        const { data: ownPosts, error: ownPostsError } = await supabase
          .from("posts")
          .select("id,caption,moderated_at,moderation_status,moderation_reason")
          .eq("user_id", user.id)
          .limit(100);

        if (ownPostsError) {
          throw ownPostsError;
        }

        const ownPostIds = (ownPosts ?? []).map((post) => post.id);
        const ownPostMap = new Map((ownPosts ?? []).map((post) => [post.id, post.caption]));

        let voteRows: VoteRow[] = [];
        if (ownPostIds.length > 0) {
          const { data: votes, error: votesError } = await supabase
            .from("votes")
            .select("post_id,value,created_at,profiles!votes_user_id_fkey(display_name,username)")
            .in("post_id", ownPostIds)
            .neq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(100);

          if (votesError) {
            throw votesError;
          }

          voteRows = votes ?? [];
        }

        const followItems: ActivityItem[] = ((followRows ?? []) as FollowRow[]).map((row, index) => {
          const profile = getJoinedProfile(row.profiles);

          return {
            id: `follow-${row.follower_id}-${index}`,
            kind: "follow",
            createdAt: row.created_at,
            title: `${profile?.display_name || profile?.username || "Someone"} followed you`,
            subtitle: profile?.username ? `@${profile.username}` : "New follower",
            href: `/people/${row.follower_id}`,
          };
        });

        const voteItems: ActivityItem[] = voteRows.map((row, index) => {
          const profile = getJoinedProfile(row.profiles);

          return {
            id: `vote-${row.post_id}-${row.created_at}-${index}`,
            kind: "vote",
            createdAt: row.created_at,
            title: `${profile?.display_name || profile?.username || "Someone"} voted ${row.value} on your post`,
            subtitle: ownPostMap.get(row.post_id) || "One of your looks",
            href: `/post/${row.post_id}?from=activity`, 
          };
        });

        const moderationItems: ActivityItem[] = ((ownPosts ?? []) as ModeratedPostRow[])
          .filter((post) => post.moderation_status === "deleted" && post.moderated_at)
          .map((post) => ({
            id: `moderation-${post.id}-${post.moderated_at}`,
            kind: "moderation",
            createdAt: post.moderated_at as string,
            title: "Your post was removed because it didn’t fit HowMyLook guidelines.",
            subtitle: post.caption?.trim() || "One of your looks",
          }));

        const nextItems = [...followItems, ...voteItems, ...moderationItems].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        if (!active) {
          return;
        }

        setItems(nextItems);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, new Date().toISOString());
        }
      } catch (loadError) {
        if (!active) {
          return;
        }

        const message = loadError instanceof Error ? loadError.message : "Unable to load activity.";
        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [supabase]);

  if (loading) {
    return <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">Loading activity...</section>;
  }

  if (error) {
    return <section className="rounded-[1.6rem] border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700 shadow-sm">{error}</section>;
  }

  if (items.length === 0) {
    return <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">No activity yet.</section>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const content = (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{item.subtitle}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                item.kind === "follow"
                  ? "bg-pink-50 text-pink-600"
                  : item.kind === "vote"
                    ? "bg-pink-50 text-pink-600"
                    : "bg-rose-50 text-rose-600"
              }`}>
                {item.kind === "follow" ? "Follow" : item.kind === "vote" ? "Vote" : "Removed"}
              </span>
            </div>
            {item.href ? <p className="mt-3 text-xs font-medium text-pink-600">Open</p> : null}
          </>
        );

        return item.href ? (
          <Link key={item.id} href={item.href} className="block rounded-[1.4rem] border border-pink-100 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            {content}
          </Link>
        ) : (
          <section key={item.id} className="rounded-[1.4rem] border border-pink-100 bg-white px-4 py-4 shadow-sm">
            {content}
          </section>
        );
      })}
    </div>
  );
}
