"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type ProfilePost = {
  id: string;
  caption: string;
  imageUrl: string;
  imageCount: number;
  yesCount: number;
  noCount: number;
};

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
          .select("id,caption,image_url,yes_count,no_count,post_images(id)")
          .eq("user_id", user.id)
          .eq("is_active", true)
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

  if (posts.length === 0) {
    return (
      <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        You have not posted any looks yet.
      </section>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {posts.map((post, index) => {
        const showImage = post.imageUrl.startsWith("http");

        return (
          <Link
            key={post.id}
            href={`/profile/${post.id}`}
            className="overflow-hidden rounded-[1.4rem] border border-pink-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.imageUrl} alt={post.caption} className="aspect-square w-full object-cover" />
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
            <div className="p-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-pink-500">Occasion</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{post.caption}</p>
              <p className="mt-1 text-xs text-slate-500">
                {post.yesCount} yes · {post.noCount} no
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {post.imageCount === 0 ? "No photos" : `${post.imageCount} photo${post.imageCount > 1 ? "s" : ""}`}
              </p>
              <p className="mt-2 text-xs font-medium text-pink-600">Open post</p>
              {!showImage ? <p className="mt-1 text-[11px] text-slate-400">Demo image placeholder</p> : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
