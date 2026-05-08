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
  authorName: string;
  authorUsername: string;
};

type ExploreProfile = {
  id: string;
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
};

type JoinedProfile = {
  display_name?: string | null;
  username?: string | null;
} | null;

export function SearchExploreClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [profiles, setProfiles] = useState<ExploreProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: profileRows, error: profilesError } = await supabase
          .from("profiles")
          .select("id,display_name,username,bio,avatar_url")
          .limit(200);

        if (profilesError) {
          throw profilesError;
        }

        const { data: rows, error: postsError } = await supabase
          .from("posts")
          .select("id,caption,image_url,yes_count,no_count,user_id,profiles!posts_user_id_fkey(display_name,username),moderation_status,keep_forever,expires_at,post_images(id)")
          .eq("is_active", true)
          .eq("moderation_status", "approved")
          .or(`keep_forever.eq.true,expires_at.gt.${new Date().toISOString()}`)
          .order("yes_count", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(60);

        if (postsError) {
          throw postsError;
        }

        setProfiles(
          (profileRows ?? []).map((profile) => ({
            id: profile.id,
            displayName: profile.display_name || "HowMyLook user",
            username: profile.username ? `@${profile.username}` : "@username",
            bio: profile.bio || "",
            avatarUrl: profile.avatar_url || null,
          })),
        );

        setPosts(
          (rows ?? []).map((post) => {
            const joinedProfile = (Array.isArray(post.profiles)
              ? (post.profiles[0] ?? null)
              : post.profiles) as JoinedProfile;

            return {
              id: post.id,
              caption: post.caption ?? "No occasion added yet",
              imageUrl: post.image_url,
              imageCount: post.post_images?.length ?? (post.image_url.startsWith("seed://") ? 0 : 1),
              yesCount: post.yes_count,
              noCount: post.no_count,
              authorId: post.user_id,
              authorName: joinedProfile?.display_name || joinedProfile?.username || "HowMyLook user",
              authorUsername: joinedProfile?.username ? `@${joinedProfile.username}` : "@username",
            };
          }),
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unable to load search.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [supabase]);

  const trimmedQuery = query.trim().toLowerCase();

  const filteredProfiles = useMemo(
    () =>
      !trimmedQuery
        ? []
        : profiles.filter((profile) =>
            `${profile.displayName} ${profile.username} ${profile.bio}`.toLowerCase().includes(trimmedQuery),
          ),
    [profiles, trimmedQuery],
  );

  const filteredPosts = useMemo(
    () =>
      !trimmedQuery
        ? posts
        : posts.filter((post) =>
            `${post.caption} ${post.authorName} ${post.authorUsername}`.toLowerCase().includes(trimmedQuery),
          ),
    [posts, trimmedQuery],
  );

  return (
    <div className="space-y-3">
      <section className="rounded-[1.7rem] border border-pink-100 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 rounded-[1.3rem] border border-slate-200 bg-slate-50 px-3 py-3">
          <span className="text-sm text-slate-400">⌕</span>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people or occasion"
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
          Loading...
        </section>
      ) : null}

      {error ? (
        <section className="rounded-[1.6rem] border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700 shadow-sm">
          {error}
        </section>
      ) : null}

      {!loading && !error ? (
        <div className="space-y-4">
          {trimmedQuery ? (
            <>
              {filteredProfiles.length > 0 ? (
                <section className="rounded-[1.6rem] border border-pink-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-500">People</p>
                  <div className="mt-3 space-y-2">
                    {filteredProfiles.map((profile) => (
                      <Link
                        key={profile.id}
                        href={`/people/${profile.id}`}
                        className="flex items-center gap-3 rounded-[1.1rem] px-2 py-2 transition hover:bg-pink-50"
                      >
                        {profile.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={profile.avatarUrl} alt={profile.displayName} className="h-11 w-11 rounded-full object-cover shadow-sm" />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,_#f6c4d5_0%,_#ddb7ff_100%)] text-lg shadow-sm">
                            ✨
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{profile.displayName}</p>
                          <p className="truncate text-xs text-slate-500">{profile.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {filteredPosts.length > 0 ? (
                <section className="space-y-2">
                  <p className="px-1 text-xs font-semibold uppercase tracking-[0.18em] text-pink-500">Looks</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {filteredPosts.map((post, index) => {
                      const showImage = post.imageUrl.startsWith("http");

                      return (
                        <Link
                          key={post.id}
                          href={`/post/${post.id}?from=search`}
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
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/18 to-transparent px-2 pb-2 pt-6 text-white">
                              <div className="flex items-center gap-3 text-[10px] font-medium text-white/88">
                                <span>{post.yesCount} yes</span>
                                <span>{post.noCount} no</span>
                              </div>
                            </div>
                            {post.imageCount > 1 ? (
                              <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                                {post.imageCount}
                              </div>
                            ) : null}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {filteredProfiles.length === 0 && filteredPosts.length === 0 ? (
                <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
                  No people or looks match that search yet.
                </section>
              ) : null}
            </>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {filteredPosts.map((post, index) => {
                const showImage = post.imageUrl.startsWith("http");

                return (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}?from=search`}
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
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/18 to-transparent px-2 pb-2 pt-6 text-white">
                        <div className="flex items-center gap-3 text-[10px] font-medium text-white/88">
                          <span>{post.yesCount} yes</span>
                          <span>{post.noCount} no</span>
                        </div>
                      </div>
                      {post.imageCount > 1 ? (
                        <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                          {post.imageCount}
                        </div>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
