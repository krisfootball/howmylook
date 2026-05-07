"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const STORAGE_KEY = "howmylook:lastSeenActivityAt";

type ActivityCounts = {
  unread: number;
  total: number;
};

export function ActivityLinkCard() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [counts, setCounts] = useState<ActivityCounts>({ unread: 0, total: 0 });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return;
        }

        const lastSeenAt = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;

        const { data: followRows } = await supabase
          .from("follows")
          .select("follower_id,created_at")
          .eq("following_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        const { data: ownPosts } = await supabase
          .from("posts")
          .select("id")
          .eq("user_id", user.id)
          .limit(100);

        const ownPostIds = (ownPosts ?? []).map((post) => post.id);

        let voteRows: { created_at?: string | null }[] = [];
        if (ownPostIds.length > 0) {
          const { data: votes } = await supabase
            .from("votes")
            .select("created_at")
            .in("post_id", ownPostIds)
            .neq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(100);

          voteRows = votes ?? [];
        }

        const { data: notificationRows } = await supabase
          .from("user_notifications")
          .select("created_at,kind")
          .eq("user_id", user.id)
          .eq("kind", "moderation_removed")
          .order("created_at", { ascending: false })
          .limit(100);

        const moderationTimestamps = (notificationRows ?? [])
          .map((notification) => notification.created_at)
          .filter(Boolean);

        const allTimestamps = [
          ...(followRows ?? []).map((row) => row.created_at).filter(Boolean),
          ...voteRows.map((row) => row.created_at).filter(Boolean),
          ...moderationTimestamps,
        ] as string[];

        const unread = lastSeenAt
          ? allTimestamps.filter((timestamp) => new Date(timestamp).getTime() > new Date(lastSeenAt).getTime()).length
          : allTimestamps.length;

        if (!active) {
          return;
        }

        setCounts({ unread, total: allTimestamps.length });
      } catch {
        if (!active) {
          return;
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [supabase]);

  return (
    <Link
      href="/activity"
      className="flex items-center justify-between rounded-[1.4rem] border border-pink-100 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">Activity</p>
        <p className="mt-1 text-sm text-slate-500">Followers, votes, and post updates.</p>
      </div>
      <div className="flex items-center gap-2">
        {counts.unread > 0 ? (
          <span className="rounded-full bg-pink-500 px-2.5 py-1 text-xs font-semibold text-white">
            {counts.unread > 99 ? "99+" : counts.unread}
          </span>
        ) : null}
        <span className="text-xs font-medium text-pink-600">Open</span>
      </div>
    </Link>
  );
}
