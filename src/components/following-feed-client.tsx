"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type FollowingFeedClientProps = {
  refreshKey?: number;
};

type FeedPost = {
  id: string;
  caption: string;
  yesCount: number;
  noCount: number;
  imageUrl: string;
  authorId: string;
};

export function FollowingFeedClient({ refreshKey = 0 }: FollowingFeedClientProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [posts, setPosts] = useState<FeedPost[]>([]);
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
          setError("Sign in to view the following feed.");
          setLoading(false);
          return;
        }

        const { data: followRows, error: followsError } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);

        if (followsError) {
          throw followsError;
        }

        const followingIds = (followRows ?? []).map((row) => row.following_id);

        if (followingIds.length === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }

        const { data: postRows, error: postsError } = await supabase
          .from("posts")
          .select("id,caption,image_url,yes_count,no_count,user_id")
          .in("user_id", followingIds)
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (postsError) {
          throw postsError;
        }

        setPosts(
          (postRows ?? []).map((post) => ({
            id: post.id,
            caption: post.caption ?? "Would you wear this?",
            yesCount: post.yes_count,
            noCount: post.no_count,
            imageUrl: post.image_url,
            authorId: post.user_id,
          })),
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unable to load following feed.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [refreshKey, supabase]);

  if (loading) {
    return (
      <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        Loading following feed...
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

  if (posts.length === 0) {
    return (
      <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        No followed posts yet. Once following is used more, posts will appear here.
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => {
        const showImage = post.imageUrl.startsWith("http");

        return (
          <article
            key={post.id}
            className="overflow-hidden rounded-[1.6rem] border border-pink-100 bg-white shadow-sm"
          >
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.imageUrl} alt={post.caption} className="aspect-[4/5] w-full object-cover" />
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
            <div className="space-y-3 p-4">
              <div>
                <p className="font-semibold text-slate-900">Followed look</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">{post.caption}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>{post.yesCount} yes</span>
                <span>{post.noCount} no</span>
              </div>
              {!showImage ? <p className="text-xs text-slate-400">Demo image placeholder</p> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
