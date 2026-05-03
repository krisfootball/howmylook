"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProfileRetentionNote } from "@/components/profile-retention-note";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const MAX_KEPT_POSTS = 10;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type ProfilePost = {
  id: string;
  caption: string;
  imageUrl: string;
  imageCount: number;
  yesCount: number;
  noCount: number;
  keepForever: boolean;
  expiresAt: string;
};

function formatExpiryLabel(expiresAt: string) {
  const expiryMs = new Date(expiresAt).getTime();

  if (Number.isNaN(expiryMs)) {
    return "Expires soon";
  }

  const diffMs = expiryMs - Date.now();
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays <= 0) {
    return "Expires today";
  }

  if (diffDays === 1) {
    return "Expires in 1 day";
  }

  return `Expires in ${diffDays} days`;
}

export function ProfilePostsClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

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
          setError("Sign in to view your posts.");
          setLoading(false);
          return;
        }

        const { data: rows, error: postsError } = await supabase
          .from("posts")
          .select("id,caption,image_url,yes_count,no_count,keep_forever,expires_at,post_images(id)")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .or(`keep_forever.eq.true,expires_at.gt.${new Date().toISOString()}`)
          .order("created_at", { ascending: false });

        if (postsError) {
          throw postsError;
        }

        setPosts(
          (rows ?? []).map((post) => ({
            id: post.id,
            caption: post.caption ?? "No occasion added yet",
            imageUrl: post.image_url,
            imageCount: post.post_images?.length ?? (post.image_url.startsWith("seed://") ? 0 : 1),
            yesCount: post.yes_count,
            noCount: post.no_count,
            keepForever: Boolean(post.keep_forever),
            expiresAt: post.expires_at,
          })),
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unable to load your posts.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [supabase]);

  async function handleToggleKeep(postId: string, nextKeepForever: boolean) {
    setBusyId(postId);
    setMessage(null);

    try {
      if (nextKeepForever) {
        const keptCount = posts.filter((post) => post.keepForever).length;
        if (keptCount >= MAX_KEPT_POSTS) {
          throw new Error(`You can keep up to ${MAX_KEPT_POSTS} looks on your profile.`);
        }
      }

      const { error: updateError } = await supabase
        .from("posts")
        .update({ keep_forever: nextKeepForever })
        .eq("id", postId);

      if (updateError) {
        throw updateError;
      }

      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? {
                ...post,
                keepForever: nextKeepForever,
              }
            : post,
        ),
      );
      setMessage(nextKeepForever ? "Look kept on profile." : "Look will expire normally again.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to update keep setting.";
      setMessage(errorMessage);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        Loading your posts...
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

  const keptCount = posts.filter((post) => post.keepForever).length;

  if (posts.length === 0) {
    return (
      <div className="space-y-3">
        <ProfileRetentionNote keptCount={0} maxKept={MAX_KEPT_POSTS} />
        <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
          You have not posted any looks yet.
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ProfileRetentionNote keptCount={keptCount} maxKept={MAX_KEPT_POSTS} />

      <div className="grid grid-cols-3 gap-2">
        {posts.map((post, index) => {
        const showImage = post.imageUrl.startsWith("http");

        return (
          <Link
            key={post.id}
            href={`/profile/${post.id}`}
            className="group overflow-hidden rounded-[1rem] bg-white shadow-sm ring-1 ring-pink-100 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative">
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.imageUrl} alt={post.caption} className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
              ) : (
                <div
                  className={`aspect-square ${
                    index % 3 === 0
                      ? "bg-[linear-gradient(180deg,_#f6d6df_0%,_#dfc8ff_100%)]"
                      : index % 3 === 1
                        ? "bg-[linear-gradient(180deg,_#f7e7c6_0%,_#ebb3b0_100%)]"
                        : "bg-[linear-gradient(180deg,_#c9d4ff_0%,_#dfb2f4_100%)]"
                  }`}
                />
              )}
              {post.imageCount > 1 ? (
                <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                  {post.imageCount}
                </div>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/18 to-transparent px-2 pb-2 pt-6 text-white">
                <div className="flex items-center gap-3 text-[10px] font-medium text-white/88">
                  <span>{post.yesCount} yes</span>
                  <span>{post.noCount} no</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 px-1 pb-1 pt-2">
              <div className="min-w-0 text-[10px] text-slate-500">
                <p className="truncate">
                  {post.keepForever
                    ? "Kept on profile"
                    : `${formatExpiryLabel(post.expiresAt)}`}
                </p>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  handleToggleKeep(post.id, !post.keepForever);
                }}
                disabled={busyId === post.id || (!post.keepForever && keptCount >= MAX_KEPT_POSTS)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                  post.keepForever
                    ? "bg-slate-900 text-white"
                    : "bg-pink-50 text-pink-700 ring-1 ring-pink-200"
                } disabled:opacity-60`}
              >
                {busyId === post.id ? "..." : post.keepForever ? "Unkeep" : "Keep"}
              </button>
            </div>
          </Link>
        );
        })}
        {message ? (
          <div className="col-span-2 rounded-[1.2rem] bg-white px-4 py-3 text-sm leading-6 text-slate-600 shadow-sm">
            {message}
          </div>
        ) : null}
      </div>

      <section className="rounded-[1.4rem] border border-white/70 bg-white px-4 py-3 text-xs leading-5 text-slate-500 shadow-sm">
        Posts start with a {Math.round(THIRTY_DAYS_MS / (24 * 60 * 60 * 1000))}-day life. Keep saves a look on your profile beyond that limit, up to {MAX_KEPT_POSTS} looks.
      </section>
    </div>
  );
}
