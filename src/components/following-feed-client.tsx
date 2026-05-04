"use client";

import { useEffect, useMemo, useState } from "react";
import { appConfig } from "@/lib/app-config";
import { PostSurface } from "@/components/post-surface";
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
              "id,caption,image_url,yes_count,no_count,user_id,profiles!posts_user_id_fkey(display_name,username,avatar_url),post_images(id,image_url,sort_order)",
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
            const orderedImages = post.post_images?.length
              ? [...post.post_images].sort((a, b) => a.sort_order - b.sort_order).map((image) => image.image_url)
              : [];
            const imageUrl = orderedImages[0] || post.image_url;

            seenPostIds.add(post.id);
            combinedPosts.push({
              id: post.id,
              caption: post.caption ?? "No occasion added yet",
              yesCount: post.yes_count,
              noCount: post.no_count,
              imageUrl,
              imageCount: post.post_images?.length ?? (imageUrl.startsWith("seed://") ? 0 : 1),
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
              "id,caption,image_url,yes_count,no_count,user_id,profiles!posts_user_id_fkey(display_name,username,avatar_url),post_images(id,image_url,sort_order)",
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
            const orderedImages = post.post_images?.length
              ? [...post.post_images].sort((a, b) => a.sort_order - b.sort_order).map((image) => image.image_url)
              : [];
            const imageUrl = orderedImages[0] || post.image_url;

            seenPostIds.add(post.id);
            combinedPosts.push({
              id: post.id,
              caption: post.caption ?? "No occasion added yet",
              yesCount: post.yes_count,
              noCount: post.no_count,
              imageUrl,
              imageCount: post.post_images?.length ?? (imageUrl.startsWith("seed://") ? 0 : 1),
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
      <section className="flex min-h-full items-center justify-center px-5 text-sm text-slate-600">
        Loading home feed...
      </section>
    );
  }

  if (error) {
    return (
      <section className="m-4 rounded-[1.6rem] border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700 shadow-sm">
        {error}
      </section>
    );
  }

  if (!currentPost) {
    return (
      <section className="m-4 rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        No unrated looks are ready right now.
      </section>
    );
  }

  return (
    <div className="min-h-full">
      <PostSurface
        images={currentPost.imageUrl.startsWith("http") ? [currentPost.imageUrl] : []}
        caption={currentPost.caption}
        yesCount={currentPost.yesCount}
        noCount={currentPost.noCount}
        authorId={currentPost.authorId}
        authorName={currentPost.authorName}
        authorUsername={currentPost.authorUsername}
        authorAvatarUrl={currentPost.authorAvatarUrl}
        onYes={() => handleVote("yes")}
        onNo={() => handleVote("no")}
        votingDisabled={saving}
        yesLabel={saving ? "Saving..." : appConfig.yesLabel}
        noLabel={saving ? "Saving..." : appConfig.noLabel}
      />

      {message ? (
        <div className="pointer-events-none fixed inset-x-6 bottom-28 z-40 rounded-[1.2rem] bg-white/92 px-4 py-3 text-sm leading-6 text-slate-600 shadow-lg backdrop-blur-sm">
          {message}
        </div>
      ) : null}
    </div>
  );
}
