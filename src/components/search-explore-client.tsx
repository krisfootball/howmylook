"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type ExplorePost = {
  id: string;
  caption: string;
  imageUrl: string;
  imageCount: number;
  yesCount: number;
  noCount: number;
  authorId: string;
};

export function SearchExploreClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: rows, error: postsError } = await supabase
          .from("posts")
          .select("id,caption,image_url,yes_count,no_count,user_id,keep_forever,expires_at,post_images(id)")
          .eq("is_active", true)
          .or(`keep_forever.eq.true,expires_at.gt.${new Date().toISOString()}`)
          .order("yes_count", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(60);

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
            authorId: post.user_id,
          })),
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unable to load explore posts.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [supabase]);

  const filteredPosts = !query.trim()
    ? posts
    : posts.filter((post) => post.caption.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-5">
      <section className="rounded-[1.6rem] border border-pink-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-500">Search</p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900">Popular looks</h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
            3-column grid
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Browse the most popular photos across the app in one clean photo grid.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
          <span className="text-sm text-slate-400">⌕</span>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search photos by occasion"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-xs font-semibold text-slate-500"
            >
              Clear
            </button>
          ) : null}
        </div>
      </section>

      {loading ? (
        <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
          Loading explore page...
        </section>
      ) : null}

      {error ? (
        <section className="rounded-[1.6rem] border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700 shadow-sm">
          {error}
        </section>
      ) : null}

      {!loading && !error ? (
        filteredPosts.length === 0 ? (
          <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
            No looks match that search yet.
          </section>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {filteredPosts.map((post, index) => {
              const showImage = post.imageUrl.startsWith("http");

              return (
                <Link
                  key={post.id}
                  href={`/profile/${post.id}?from=people&profileId=${post.authorId}`}
                  className="group overflow-hidden rounded-[1.2rem] border border-pink-100 bg-white shadow-sm"
                >
                  <div className="relative">
                    {showImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.imageUrl} alt={post.caption} className="aspect-square w-full object-cover transition group-hover:scale-[1.02]" />
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
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-2 py-2 text-white">
                      <p className="truncate text-[11px] font-semibold">{post.caption}</p>
                      <p className="mt-1 text-[10px] text-white/85">{post.yesCount} yes</p>
                    </div>
                    {post.imageCount > 1 ? (
                      <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {post.imageCount}
                      </div>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )
      ) : null}
    </div>
  );
}
