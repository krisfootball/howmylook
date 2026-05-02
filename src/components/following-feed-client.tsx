"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { appConfig } from "@/lib/app-config";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type FeedPost = {
  id: string;
  caption: string;
  yesCount: number;
  noCount: number;
  imageUrl: string;
  imageCount: number;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  source: "following" | "latest";
};

type JoinedAuthor = {
  display_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
};

function getJoinedAuthor(profiles: JoinedAuthor[] | JoinedAuthor | null | undefined): JoinedAuthor | null {
  if (!profiles) {
    return null;
  }

  return Array.isArray(profiles) ? (profiles[0] ?? null) : profiles;
}

const TARGET_FEED_COUNT = 25;

export function FollowingFeedClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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
          setError("Sign in to view and rate looks.");
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

        const { data: voteRows, error: votesError } = await supabase
          .from("votes")
          .select("post_id")
          .eq("user_id", user.id);

        if (votesError) {
          throw votesError;
        }

        const ratedPostIds = new Set((voteRows ?? []).map((vote) => vote.post_id));
        const followingIds = (followRows ?? []).map((row) => row.following_id);
        const combinedPosts: FeedPost[] = [];
        const seenPostIds = new Set<string>();

        if (followingIds.length > 0) {
          const { data: followedPostRows, error: postsError } = await supabase
            .from("posts")
            .select(
              "id,caption,image_url,yes_count,no_count,user_id,profiles!posts_user_id_fkey(display_name,username,avatar_url),post_images(id)",
            )
            .in("user_id", followingIds)
            .eq("is_active", true)
            .or(`keep_forever.eq.true,expires_at.gt.${new Date().toISOString()}`)
            .order("created_at", { ascending: false })
            .limit(TARGET_FEED_COUNT);

          if (postsError) {
            throw postsError;
          }

          for (const post of followedPostRows ?? []) {
            if (post.user_id === user.id || seenPostIds.has(post.id) || ratedPostIds.has(post.id)) {
              continue;
            }

            const author = getJoinedAuthor(post.profiles);

            seenPostIds.add(post.id);
            combinedPosts.push({
              id: post.id,
              caption: post.caption ?? "No occasion added yet",
              yesCount: post.yes_count,
              noCount: post.no_count,
              imageUrl: post.image_url,
              imageCount: post.post_images?.length ?? (post.image_url.startsWith("seed://") ? 0 : 1),
              authorId: post.user_id,
              authorName: author?.display_name || author?.username || "HowMyLook user",
              authorUsername: author?.username ? `@${author.username}` : "@username",
              authorAvatarUrl: author?.avatar_url || null,
              source: "following",
            });
          }
        }

        if (combinedPosts.length < TARGET_FEED_COUNT) {
          const { data: latestPostRows, error: latestPostsError } = await supabase
            .from("posts")
            .select(
              "id,caption,image_url,yes_count,no_count,user_id,profiles!posts_user_id_fkey(display_name,username,avatar_url),post_images(id)",
            )
            .eq("is_active", true)
            .neq("user_id", user.id)
            .or(`keep_forever.eq.true,expires_at.gt.${new Date().toISOString()}`)
            .order("created_at", { ascending: false })
            .limit(60);

          if (latestPostsError) {
            throw latestPostsError;
          }

          for (const post of latestPostRows ?? []) {
            if (seenPostIds.has(post.id) || ratedPostIds.has(post.id)) {
              continue;
            }

            const author = getJoinedAuthor(post.profiles);

            seenPostIds.add(post.id);
            combinedPosts.push({
              id: post.id,
              caption: post.caption ?? "No occasion added yet",
              yesCount: post.yes_count,
              noCount: post.no_count,
              imageUrl: post.image_url,
              imageCount: post.post_images?.length ?? (post.image_url.startsWith("seed://") ? 0 : 1),
              authorId: post.user_id,
              authorName: author?.display_name || author?.username || "HowMyLook user",
              authorUsername: author?.username ? `@${author.username}` : "@username",
              authorAvatarUrl: author?.avatar_url || null,
              source: "latest",
            });

            if (combinedPosts.length >= TARGET_FEED_COUNT) {
              break;
            }
          }
        }

        setPosts(combinedPosts);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unable to load home feed.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [supabase]);

  const currentPost = posts[0] ?? null;

  async function handleVote(value: "yes" | "no") {
    if (!currentPost) {
      return;
    }

    setSaving(true);
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
        throw new Error("Sign in first before rating looks.");
      }

      const { error: rpcError } = await supabase.rpc("cast_vote", {
        target_post_id: currentPost.id,
        vote_value: value,
      });

      if (rpcError) {
        throw rpcError;
      }

      setPosts((current) => current.slice(1));
      setMessage(`${value === "yes" ? appConfig.yesLabel : appConfig.noLabel} saved.`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to save vote.";
      const friendlyMessage =
        errorMessage.toLowerCase().includes("cast_vote") || errorMessage.toLowerCase().includes("function")
          ? "Voting needs the SQL function in SUPABASE_RPC_CAST_VOTE.sql applied in Supabase before this safer flow can work."
          : errorMessage;
      setError(friendlyMessage);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        Loading home feed...
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

  if (!currentPost) {
    return (
      <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        No unrated looks are ready right now.
      </section>
    );
  }

  const showImage = currentPost.imageUrl.startsWith("http");

  return (
    <div className="space-y-4">
      <article className="overflow-hidden rounded-[1.8rem] bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
        <div className="relative">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentPost.imageUrl} alt={currentPost.caption} className="aspect-[9/16] w-full object-cover" />
          ) : (
            <div className="aspect-[9/16] bg-[linear-gradient(180deg,_#f6d6df_0%,_#dfc8ff_100%)]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/18 to-black/20" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
            <div className="rounded-2xl border border-white/25 bg-black/20 px-3 py-2 text-white backdrop-blur-sm">
              <p className="text-sm font-semibold">{currentPost.authorName}</p>
              <p className="text-xs text-white/80">{currentPost.authorUsername}</p>
            </div>
            <span className="rounded-full border border-white/20 bg-black/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
              {currentPost.source === "following" ? "Following" : "Fresh"}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 pb-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75">Occasion</p>
              <Link href={`/people/${currentPost.authorId}`} className="text-[11px] font-medium text-white/80">
                Profile
              </Link>
            </div>

            <p className="mt-2 text-[15px] font-medium leading-6 text-white">
              {currentPost.caption}
            </p>

            <div className="mt-3 flex items-center justify-between text-xs text-white/85">
              <span>{currentPost.yesCount} yes</span>
              <span>{currentPost.noCount} no</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => handleVote("yes")}
                disabled={saving}
                className="min-w-[5.5rem] rounded-full border border-white/55 bg-white/5 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 disabled:opacity-60"
              >
                {saving ? "Saving..." : appConfig.yesLabel}
              </button>
              <button
                onClick={() => handleVote("no")}
                disabled={saving}
                className="min-w-[5.5rem] rounded-full border border-white/55 bg-white/5 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 disabled:opacity-60"
              >
                {saving ? "Saving..." : appConfig.noLabel}
              </button>
            </div>
          </div>
        </div>
      </article>

      {message ? (
        <div className="rounded-[1.2rem] bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm">
          {message}
        </div>
      ) : null}
    </div>
  );
}
