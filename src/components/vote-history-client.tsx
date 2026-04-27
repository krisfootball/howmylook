"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type VoteHistoryClientProps = {
  value: "yes" | "no";
};

type VoteHistoryItem = {
  id: string;
  caption: string;
  imageUrl: string;
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
          .select("id,caption,image_url")
          .in("id", postIds);

        if (postsError) {
          throw postsError;
        }

        setItems(
          (posts ?? []).map((post) => ({
            id: post.id,
            caption: post.caption ?? "Would you wear this?",
            imageUrl: post.image_url,
          })),
        );
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

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const showImage = item.imageUrl.startsWith("http");

        return (
          <article
            key={item.id}
            className="overflow-hidden rounded-[1.6rem] border border-pink-100 bg-white shadow-sm"
          >
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt={item.caption} className="aspect-[4/5] w-full object-cover" />
            ) : (
              <div
                className={`aspect-[4/5] ${
                  index % 3 === 0
                    ? "bg-[linear-gradient(180deg,_#f6d6df_0%,_#dfc8ff_100%)]"
                    : index % 3 === 1
                      ? "bg-[linear-gradient(180deg,_#f7e7c6_0%,_#ebb3b0_100%)]"
                      : "bg-[linear-gradient(180deg,_#c9d4ff_0%,_#dfb2f4_100%)]"
                }`}
              />
            )}
            <div className="p-4">
              <p className="font-semibold text-slate-900">{item.caption}</p>
              {!showImage ? <p className="mt-2 text-xs text-slate-500">Demo image placeholder</p> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
