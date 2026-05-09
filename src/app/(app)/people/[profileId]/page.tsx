import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { ProfileFollowButton } from "@/components/profile-follow-button";
import { supabase } from "@/lib/supabase";

type PeopleProfilePageProps = {
  params: Promise<{
    profileId: string;
  }>;
};

type PublicProfilePost = {
  id: string;
  caption: string | null;
  image_url: string;
  yes_count: number;
  no_count: number;
  keep_forever: boolean | null;
  created_at: string;
  post_images: { id: string }[] | null;
};

function sortProfilePosts(posts: PublicProfilePost[]) {
  return [...posts].sort((a, b) => {
    if (Boolean(a.keep_forever) !== Boolean(b.keep_forever)) {
      return a.keep_forever ? -1 : 1;
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export default async function PeopleProfilePage({ params }: PeopleProfilePageProps) {
  const { profileId } = await params;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,username,display_name,bio,avatar_url")
    .eq("id", profileId)
    .maybeSingle();

  if (profileError || !profile) {
    return (
      <MobileShell title="Profile" subtitle="This creator could not be opened.">
        <section className="rounded-[1.6rem] border border-rose-100 bg-rose-50 p-5 text-sm leading-6 text-rose-700 shadow-sm">
          This profile is unavailable right now.
        </section>
        <Link href="/home" className="mt-4 inline-flex rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
          Back to Home
        </Link>
      </MobileShell>
    );
  }

  const [{ data: posts }, { count: followersCount }, { count: followingCount }, { data: yesVotes }, { data: noVotes }] = await Promise.all([
    supabase
      .from("posts")
      .select("id,caption,image_url,yes_count,no_count,keep_forever,expires_at,created_at,post_images(id)")
      .eq("user_id", profileId)
      .eq("is_active", true)
      .eq("moderation_status", "approved")
      .or(`keep_forever.eq.true,expires_at.gt.${new Date().toISOString()}`)
      .order("created_at", { ascending: false })
      .limit(40),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profileId),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profileId),
    supabase
      .from("votes")
      .select("post_id,posts!inner(id)")
      .eq("user_id", profileId)
      .eq("value", "yes")
      .eq("posts.is_active", true)
      .eq("posts.moderation_status", "approved"),
    supabase
      .from("votes")
      .select("post_id,posts!inner(id)")
      .eq("user_id", profileId)
      .eq("value", "no")
      .eq("posts.is_active", true)
      .eq("posts.moderation_status", "approved"),
  ]);

  const sortedPosts = sortProfilePosts((posts ?? []) as PublicProfilePost[]).slice(0, 24);

  return (
    <MobileShell
      title={profile.display_name || profile.username || "Profile"}
      hideHeader
    >
      <div className="space-y-4">
        <section className="rounded-[1.6rem] border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-5">
          <div className="flex items-start gap-4">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={profile.display_name || profile.username || "HowMyLook user"} className="h-16 w-16 rounded-full object-cover shadow-sm" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(180deg,_#f6c4d5_0%,_#ddb7ff_100%)] text-2xl shadow-sm">
                ✨
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold tracking-tight text-slate-900">{profile.display_name || "HowMyLook user"}</p>
              <p className="text-sm text-slate-500">{profile.username ? `@${profile.username}` : "@username"}</p>
              <p className="mt-3 text-sm leading-6 text-slate-700">{profile.bio || "Posting looks and getting quick feedback."}</p>
            </div>
          </div>

          <div className="mt-4">
            <ProfileFollowButton profileId={profileId} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href={`/people/${profileId}/followers`}
              className="flex min-h-22 flex-col items-center justify-center rounded-2xl border border-pink-100 bg-pink-50/70 px-4 py-3 text-center transition hover:-translate-y-0.5 hover:bg-pink-100 active:scale-[0.99]"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-pink-500">Followers</p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{followersCount ?? 0}</p>
            </Link>
            <Link
              href={`/people/${profileId}/following`}
              className="flex min-h-22 flex-col items-center justify-center rounded-2xl border border-pink-100 bg-pink-50/70 px-4 py-3 text-center transition hover:-translate-y-0.5 hover:bg-pink-100 active:scale-[0.99]"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-pink-500">Following</p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{followingCount ?? 0}</p>
            </Link>
            <Link
              href={`/people/${profileId}/yes`}
              className="flex min-h-22 flex-col items-center justify-center rounded-2xl border border-pink-100 bg-pink-50/70 px-4 py-3 text-center transition hover:-translate-y-0.5 hover:bg-pink-100 active:scale-[0.99]"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-pink-500">Yes given</p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{yesVotes?.length ?? 0}</p>
            </Link>
            <Link
              href={`/people/${profileId}/no`}
              className="flex min-h-22 flex-col items-center justify-center rounded-2xl border border-pink-100 bg-pink-50/70 px-4 py-3 text-center transition hover:-translate-y-0.5 hover:bg-pink-100 active:scale-[0.99]"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-pink-500">No given</p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{noVotes?.length ?? 0}</p>
            </Link>
          </div>
        </section>

        <section>
          {sortedPosts.length === 0 ? (
            <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
              No posts yet.
            </section>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {sortedPosts.map((post, index) => {
                const showImage = post.image_url.startsWith("http");
                const imageCount = post.post_images?.length ?? (post.image_url.startsWith("seed://") ? 0 : 1);
                return (
                  <Link
                    key={post.id}
                    href={`/post/${post.id}?from=people&profileId=${profileId}`}
                    className="group overflow-hidden rounded-none bg-white shadow-sm ring-1 ring-pink-100 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative">
                      {showImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.image_url} alt={post.caption ?? "Outfit for an occasion"} className="aspect-[9/16] w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
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
                      {post.keep_forever ? (
                        <div className="pointer-events-none absolute right-2 top-2 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]" aria-label="Pinned kept post">
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                            <path d="M15.9 3.2a1 1 0 0 1 .6 1.28l-1.1 3.02 2.03 2.04a1 1 0 0 1-.7 1.7H13.9l-1.08 6.14a.75.75 0 0 1-1.42.18l-1.12-2.44-2.44-1.12a.75.75 0 0 1 .18-1.42l6.14-1.08V7.27a1 1 0 0 1 1.7-.7l2.04 2.03 3.02-1.1a1 1 0 0 1 1.28.6l.1.28a1 1 0 0 1-.6 1.28l-3.77 1.37-1.9-1.9v3.1a1 1 0 0 1-.82.98l-3.78.67.98.45a1 1 0 0 1 .48.48l.45.98.67-3.78a1 1 0 0 1 .98-.82h3.1l-1.9-1.9 1.37-3.77a1 1 0 0 1 1.28-.6z" />
                          </svg>
                        </div>
                      ) : null}
                      {imageCount > 1 ? (
                        <div className={`pointer-events-none absolute rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm ${
                          post.keep_forever ? "right-2 top-8" : "right-2 top-2"
                        }`}>
                          {imageCount}
                        </div>
                      ) : null}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/18 to-transparent px-2 pb-2 pt-6 text-white">
                        <div className="flex items-center gap-3 text-[10px] font-medium text-white/88">
                          <span>{post.yes_count} yes</span>
                          <span>{post.no_count} no</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </MobileShell>
  );
}
