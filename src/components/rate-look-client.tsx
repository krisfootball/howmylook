"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { appConfig } from "@/lib/app-config";
import { PostSurface } from "@/components/post-surface";
import { VoteValue, ratingQueue } from "@/lib/mock-data";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { DatabasePost } from "@/lib/types";

type RateLookClientProps = {
  initialRatingsCompleted: number;
};

type QueuePost = {
  id: string;
  authorId?: string;
  authorName: string;
  authorHandle: string;
  caption: string;
  yesCount: number;
  noCount: number;
  imageUrl: string;
  ratingsRemainingToUnlock: number;
  imageStyle: string;
  tags: string[];
  imageCount: number;
};

const fallbackQueue: QueuePost[] = ratingQueue.map((post) => ({
  ...post,
  id: post.id,
  authorId: undefined,
  imageUrl: "",
  imageCount: 0,
  ratingsRemainingToUnlock: Math.max(5 - (post.yesCount + post.noCount), 0),
  imageStyle: post.imageStyle,
  tags: post.tags,
}));

export function RateLookClient({ initialRatingsCompleted }: RateLookClientProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [queue, setQueue] = useState<QueuePost[]>(fallbackQueue);
  const [ratingsCompleted, setRatingsCompleted] = useState(initialRatingsCompleted);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [queueLoaded, setQueueLoaded] = useState(false);
  const [showUnlockHint, setShowUnlockHint] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setShowUnlockHint(false);
    }, 3000);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    async function loadPosts() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data, error } = await supabase
          .from("posts")
          .select("id,user_id,image_url,caption,yes_count,no_count,is_active,moderation_status,created_at,expires_at,keep_forever")
          .eq("is_active", true)
          .eq("moderation_status", "approved")
          .or(`keep_forever.eq.true,expires_at.gt.${new Date().toISOString()}`)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          setQueue([]);
          return;
        }

        let ratedPostIds = new Set<string>();

        if (user) {
          const { data: existingVotes, error: votesError } = await supabase
            .from("votes")
            .select("post_id")
            .eq("user_id", user.id);

          if (!votesError && existingVotes) {
            ratedPostIds = new Set(existingVotes.map((vote) => vote.post_id));
          }
        }

        const filteredPosts = (data as (DatabasePost & { created_at?: string | null })[]).filter(
          (post) => !ratedPostIds.has(post.id) && (!user || post.user_id !== user.id),
        );

        const priorityPosts = filteredPosts.filter((post) => post.yes_count + post.no_count < 5);
        const fallbackPosts = filteredPosts.filter((post) => post.yes_count + post.no_count >= 5);
        const orderedPosts = [...priorityPosts, ...fallbackPosts];

        const mapped = orderedPosts.map((post, index) => ({
          id: post.id,
          authorId: post.user_id,
          authorName: `Look ${index + 1}`,
          authorHandle: `@howmylook${index + 1}`,
          caption: post.caption ?? "No occasion added yet",
          yesCount: post.yes_count,
          noCount: post.no_count,
          imageUrl: post.image_url,
          imageCount: post.image_url.startsWith("seed://") ? 0 : 1,
          ratingsRemainingToUnlock: Math.max(5 - (post.yes_count + post.no_count), 0),
          imageStyle:
            fallbackQueue[index % fallbackQueue.length]?.imageStyle ??
            "bg-[linear-gradient(180deg,_#f8d6df_0%,_#f1c9ef_35%,_#c8b6ff_70%,_#9b8cff_100%)]",
          tags: fallbackQueue[index % fallbackQueue.length]?.tags ?? ["style", "fit"],
        }));

        setQueue(mapped);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unable to load rating queue.";
        setMessage(errorMessage);
      } finally {
        setQueueLoaded(true);
      }
    }

    loadPosts();
  }, [supabase]);

  const currentPost = queue[0] ?? null;
  const remaining = Math.max(appConfig.unlockVoteCount - ratingsCompleted, 0);
  const currentPostNeedsMoreRatings = (currentPost?.yesCount ?? 0) + (currentPost?.noCount ?? 0) < 5;

  async function handleVote(value: VoteValue) {
    if (!currentPost) {
      setMessage("No rating target is available right now.");
      return;
    }

    setLoading(true);
    setMessage("");

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

      const { data: rpcResult, error: rpcError } = await supabase.rpc("cast_vote", {
        target_post_id: currentPost.id,
        vote_value: value,
      });

      if (rpcError) {
        throw rpcError;
      }

      const nextUnlockVotes = Number(
        rpcResult?.loginRatingVotesCompleted ?? rpcResult?.unlockVotesCompleted ?? ratingsCompleted + 1,
      );

      setQueue((current) => current.filter((post) => post.id !== currentPost.id));
      setRatingsCompleted(nextUnlockVotes);
      setMessage(
        nextUnlockVotes >= appConfig.unlockVoteCount
          ? "Unlock complete. Opening your profile now."
          : `${value === "yes" ? "Yes" : "No"} saved. ${Math.max(appConfig.unlockVoteCount - nextUnlockVotes, 0)} ratings left.`,
      );

      if (nextUnlockVotes >= appConfig.unlockVoteCount) {
        router.replace("/home");
        router.refresh();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to save vote.";
      const friendlyMessage =
        errorMessage.toLowerCase().includes("cast_vote") ||
        errorMessage.toLowerCase().includes("function")
          ? "Voting needs the SQL function in SUPABASE_RPC_CAST_VOTE.sql applied in Supabase before this safer flow can work."
          : errorMessage;
      setMessage(friendlyMessage);
    } finally {
      setLoading(false);
    }
  }

  if (!currentPost) {
    return (
      <div className="space-y-4">
        <section className="rounded-[1.7rem] border border-pink-100 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
          <p className="font-semibold text-slate-900">
            {queueLoaded ? "No more looks are ready to rate right now." : "Loading rating queue..."}
          </p>
          <p className="mt-2">
            {queueLoaded
              ? remaining > 0
                ? "You’ve gone through the available queue. New posts that still need their first 5 ratings will appear here first."
                : "Nice — you finished the required ratings. You can keep exploring the unlocked parts of the app now."
              : "Checking Supabase for the latest unrated posts, prioritizing looks that still need their first 5 ratings."}
          </p>
        </section>

        {message ? (
          <div className="rounded-[1.2rem] bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm">
            {message}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      {showUnlockHint ? (
        <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex justify-center">
          <div className="rounded-full border border-white/25 bg-black/55 px-4 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-md">
            Rate 5 photos to access account
          </div>
        </div>
      ) : null}

      <PostSurface
        images={currentPost.imageCount > 0 && currentPost.imageUrl.startsWith("http") ? [currentPost.imageUrl] : []}
        caption={currentPost.caption}
        yesCount={currentPost.yesCount}
        noCount={currentPost.noCount}
        authorName={currentPost.authorName}
        onYes={() => void handleVote("yes")}
        onNo={() => void handleVote("no")}
        votingDisabled={loading}
        yesLabel={loading ? "Saving..." : appConfig.yesLabel}
        noLabel={loading ? "Saving..." : appConfig.noLabel}
      />

      {currentPostNeedsMoreRatings ? (
        <div className="px-4 text-center text-xs text-slate-500">
          This look still needs {currentPost.ratingsRemainingToUnlock} more rating{currentPost.ratingsRemainingToUnlock === 1 ? "" : "s"}.
        </div>
      ) : null}

      {message ? (
        <div className="mx-4 rounded-[1.2rem] bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm">
          {message}
        </div>
      ) : null}
    </div>
  );
}
