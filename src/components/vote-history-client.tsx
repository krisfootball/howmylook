"use client";

import { useEffect, useMemo, useState } from "react";
import { PublicVoteHistoryList } from "@/components/public-vote-history-list";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type VoteHistoryClientProps = {
  value: "yes" | "no";
};

type VoteHistoryItem = {
  id: string;
  caption: string;
  imageUrl: string;
  yesCount: number;
  noCount: number;
};

export function VoteHistoryClient({ value }: VoteHistoryClientProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<VoteHistoryItem[]>([]);
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

        if (!user) {
          setError("Sign in to view your vote history.");
          setLoading(false);
          return;
        }

        const { data: votes, error: votesError } = await supabase
          .from("votes")
          .select("post_id,value")
          .eq("user_id", user.id)
          .eq("value", value);

        if (votesError) {
          throw votesError;
        }

        if (!votes || votes.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }

        const postIds = votes.map((vote) => vote.post_id);
        const { data: posts, error: postsError } = await supabase
          .from("posts")
          .select("id,caption,image_url,user_id,yes_count,no_count")
          .in("id", postIds);

        if (postsError) {
          throw postsError;
        }

        const orderedItems = postIds
          .map((postId) => (posts ?? []).find((post) => post.id === postId))
          .filter((post): post is NonNullable<typeof post> => Boolean(post))
          .map((post) => ({
            id: post.id,
            caption: post.caption ?? "Would you wear this?",
            imageUrl: post.image_url,
            yesCount: post.yes_count,
            noCount: post.no_count,
          }));

        setItems(orderedItems);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unable to load vote history.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [supabase, value]);

  if (loading) {
    return (
      <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        Loading history...
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[1.6rem] border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700 shadow-sm">
        {error}
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        No {value} votes yet.
      </section>
    );
  }

  return <PublicVoteHistoryList items={items} value={value} profileId="" />;
}
