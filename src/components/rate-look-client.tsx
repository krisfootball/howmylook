"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { appConfig } from "@/lib/app-config";
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
};

const fallbackQueue: QueuePost[] = ratingQueue.map((post) => ({
  ...post,
  id: post.id,
  authorId: undefined,
  imageUrl: "",
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
  const showImage = currentPost?.imageUrl?.startsWith("http") ?? false;

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

      const nextUnlockVotes = Number(rpcResult?.unlockVotesCompleted ?? ratingsCompleted + 1);

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
        <div className="rounded-[1.6rem] border border-pink-100 bg-pink-50/80 p-4 text-sm text-slate-700">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900">{appConfig.onboardingHeadline}</p>
              <p className="mt-1 leading-6">
                {ratingsCompleted} of {appConfig.unlockVoteCount} ratings completed.
              </p>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-pink-600 shadow-sm">
              {remaining} left
            </div>
          </div>
        </div>

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
    <div className="space-y-4">
      <div className="rounded-[1.6rem] border border-pink-100 bg-pink-50/80 p-4 text-sm text-slate-700">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900">{appConfig.onboardingHeadline}</p>
            <p className="mt-1 leading-6">
              {ratingsCompleted} of {appConfig.unlockVoteCount} ratings completed.
            </p>
          </div>
          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-pink-600 shadow-sm">
            {remaining} left
          </div>
        </div>
      </div>

      <article className="overflow-hidden rounded-[1.7rem] bg-slate-950 p-3 text-white shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
        <div className={`rounded-[1.35rem] ${showImage ? "bg-slate-950" : `aspect-[9/16] p-4 ${currentPost.imageStyle}`}`}>
          <div className="relative overflow-hidden rounded-[1.1rem]">
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentPost.imageUrl} alt={currentPost.caption} className="aspect-[4/5] w-full object-cover" />
            ) : (
              <div className={`aspect-[9/16] p-4 ${currentPost.imageStyle}`}>
                <div className="flex h-full items-end rounded-[1.1rem] bg-white/10 p-4 backdrop-blur-[2px]">
                  <p className="text-xs font-medium text-slate-950/70">Demo image placeholder</p>
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
              <div className="rounded-2xl bg-white/78 px-3 py-2 text-slate-900 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold">{currentPost.authorName}</p>
                <p className="text-xs text-slate-600">{currentPost.authorHandle}</p>
              </div>
              <span className="rounded-full bg-white/78 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-600 shadow-sm backdrop-blur">
                {Math.min(ratingsCompleted + 1, appConfig.unlockVoteCount)} of {appConfig.unlockVoteCount}
              </span>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-transparent p-4 pt-16">
              <div className="flex items-center justify-between rounded-full bg-black/35 px-4 py-2 text-sm text-white backdrop-blur-sm">
                <span>{currentPost.yesCount} yes</span>
                <span>{currentPost.noCount} no</span>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-3 rounded-[1.1rem] bg-white/92 p-4 text-slate-900 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              {currentPostNeedsMoreRatings ? (
                <span className="rounded-full bg-pink-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-pink-700">
                  Needs {currentPost.ratingsRemainingToUnlock} more rating{currentPost.ratingsRemainingToUnlock === 1 ? "" : "s"}
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                  Already past first 5 ratings
                </span>
              )}
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                Queue prioritizes fresh looks first
              </span>
            </div>

            <p className="text-sm font-medium leading-6">{currentPost.caption}</p>

            <div className="flex flex-wrap gap-2">
              {currentPost.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-900/7 px-3 py-1 text-[11px] font-medium text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleVote("yes")}
                disabled={loading}
                className="rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 disabled:opacity-60"
              >
                {loading ? "Saving..." : appConfig.yesLabel}
              </button>
              <button
                onClick={() => handleVote("no")}
                disabled={loading}
                className="rounded-full bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-900/20 disabled:opacity-60"
              >
                {loading ? "Saving..." : appConfig.noLabel}
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
