import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { ProfileFollowButton } from "@/components/profile-follow-button";
import { supabase } from "@/lib/supabase";

type PeopleProfilePageProps = {
  params: Promise<{
    profileId: string;
  }>;
};

export default async function PeopleProfilePage({ params }: PeopleProfilePageProps) {
  const { profileId } = await params;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,username,display_name,bio,avatar_url,total_yes_given,total_no_given")
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

  const [{ data: posts }, { count: followersCount }, { count: followingCount }] = await Promise.all([
    supabase
      .from("posts")
      .select("id,caption,image_url,yes_count,no_count,keep_forever,expires_at,post_images(id)")
      .eq("user_id", profileId)
      .eq("is_active", true)
      .or(`keep_forever.eq.true,expires_at.gt.${new Date().toISOString()}`)
      .order("created_at", { ascending: false })
      .limit(24),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profileId),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profileId),
  ]);

  return (
    <MobileShell
      title={profile.display_name || profile.username || "Profile"}
      subtitle="Public creator profile with the same core stats and taste signals as your own profile."
    >
      <div className="space-y-4">
        <Link href="/home" className="inline-flex rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
          ← Back to Home
        </Link>

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
              <ProfileFollowButton profileId={profileId} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href={`/people/${profileId}/followers`}
              className="block rounded-2xl border border-pink-100 bg-pink-50/70 px-4 py-3 transition hover:-translate-y-0.5 hover:bg-pink-100 active:scale-[0.99]"
            >
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-pink-500">Followers</p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{followersCount ?? 0}</p>
              <p className="mt-2 text-xs font-medium text-pink-600">Open</p>
            </Link>
            <Link
              href={`/people/${profileId}/following`}
              className="block rounded-2xl border border-pink-100 bg-pink-50/70 px-4 py-3 transition hover:-translate-y-0.5 hover:bg-pink-100 active:scale-[0.99]"
            >
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-pink-500">Following</p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{followingCount ?? 0}</p>
              <p className="mt-2 text-xs font-medium text-pink-600">Open</p>
            </Link>
            <Link
              href={`/people/${profileId}/yes`}
              className="block rounded-2xl border border-pink-100 bg-pink-50/70 px-4 py-3 transition hover:-translate-y-0.5 hover:bg-pink-100 active:scale-[0.99]"
            >
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-pink-500">Yes given</p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{profile.total_yes_given ?? 0}</p>
              <p className="mt-2 text-xs font-medium text-pink-600">Open</p>
            </Link>
            <Link
              href={`/people/${profileId}/no`}
              className="block rounded-2xl border border-pink-100 bg-pink-50/70 px-4 py-3 transition hover:-translate-y-0.5 hover:bg-pink-100 active:scale-[0.99]"
            >
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-pink-500">No given</p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{profile.total_no_given ?? 0}</p>
              <p className="mt-2 text-xs font-medium text-pink-600">Open</p>
            </Link>
          </div>
        </section>

        <section>
          {!posts || posts.length === 0 ? (
            <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
              No posts yet.
            </section>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {posts.map((post, index) => {
                const showImage = post.image_url.startsWith("http");
                const imageCount = post.post_images?.length ?? (post.image_url.startsWith("seed://") ? 0 : 1);
                return (
                  <Link
                    key={post.id}
                    href={`/profile/${post.id}?from=people&profileId=${profileId}`}
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
                      {imageCount > 1 ? (
                        <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
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
