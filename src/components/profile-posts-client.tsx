"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProfileRetentionNote } from "@/components/profile-retention-note";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const MAX_KEPT_POSTS = 10;

type ProfilePost = {
  id: string;
  caption: string;
  imageUrl: string;
  imageCount: number;
  yesCount: number;
  noCount: number;
  keepForever: boolean;
  expiresAt: string;
  createdAt: string;
};

function sortProfilePosts(posts: ProfilePost[]) {
  return [...posts].sort((a, b) => {
    if (a.keepForever !== b.keepForever) {
      return a.keepForever ? -1 : 1;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function ProfilePostsClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
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
          setError("Sign in to view your posts.");
          setLoading(false);
          return;
        }

        const { data: rows, error: postsError } = await supabase
          .from("posts")
          .select("id,caption,image_url,yes_count,no_count,keep_forever,expires_at,created_at,post_images(id)")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .or(`keep_forever.eq.true,expires_at.gt.${new Date().toISOString()}`)
          .order("created_at", { ascending: false });

        if (postsError) {
          throw postsError;
        }

        setPosts(
          sortProfilePosts(
            (rows ?? []).map((post) => ({
              id: post.id,
              caption: post.caption ?? "No occasion added yet",
              imageUrl: post.image_url,
              imageCount: post.post_images?.length ?? (post.image_url.startsWith("seed://") ? 0 : 1),
              yesCount: post.yes_count,
              noCount: post.no_count,
              keepForever: Boolean(post.keep_forever),
              expiresAt: post.expires_at,
              createdAt: post.created_at,
            })),
          ),
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
    <div className="space-y-2">
      <ProfileRetentionNote keptCount={keptCount} maxKept={MAX_KEPT_POSTS} />

      <div className="grid grid-cols-3 gap-1.5">
        {posts.map((post, index) => {
        const showImage = post.imageUrl.startsWith("http");

        return (
          <Link
            key={post.id}
            href={`/post/${post.id}?from=profile`}
            className="group overflow-hidden rounded-none bg-white shadow-sm ring-1 ring-pink-100 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative">
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={post.imageUrl} alt={post.caption} className="aspect-[9/16] w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
              ) : (
                <div
                  className={`aspect-[9/16] ${
                    index % 3 === 0
                      ? "bg-[linear-gradient(180deg,_#f6d6df_0%,_#dfc8ff_100%)]"
                      : index % 3 === 1
                        ? "bg-[linear-gradient(180deg,_#f7e7c6_0%,_#ebb3b0_100%)]"
                        : "bg-[linear-gradient(180deg,_#c9d4ff_0%,_#dfb2f4_100%)]"
                  }`}
                />
              )}
              {post.keepForever ? (
                <div className="pointer-events-none absolute right-2 top-2 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]" aria-label="Pinned kept post">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                    <path d="M15.9 3.2a1 1 0 0 1 .6 1.28l-1.1 3.02 2.03 2.04a1 1 0 0 1-.7 1.7H13.9l-1.08 6.14a.75.75 0 0 1-1.42.18l-1.12-2.44-2.44-1.12a.75.75 0 0 1 .18-1.42l6.14-1.08V7.27a1 1 0 0 1 1.7-.7l2.04 2.03 3.02-1.1a1 1 0 0 1 1.28.6l.1.28a1 1 0 0 1-.6 1.28l-3.77 1.37-1.9-1.9v3.1a1 1 0 0 1-.82.98l-3.78.67.98.45a1 1 0 0 1 .48.48l.45.98.67-3.78a1 1 0 0 1 .98-.82h3.1l-1.9-1.9 1.37-3.77a1 1 0 0 1 1.28-.6z" />
                  </svg>
                </div>
              ) : null}
              {post.imageCount > 1 ? (
                <div className={`pointer-events-none absolute rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm ${
                  post.keepForever ? "right-2 top-8" : "right-2 top-2"
                }`}>
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
          </Link>
        );
        })}
      </div>

    </div>
  );
}
