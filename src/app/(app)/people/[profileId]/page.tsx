import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
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
    .select("id,username,display_name,bio")
    .eq("id", profileId)
    .maybeSingle();

  if (profileError || !profile) {
    return (
      <MobileShell title="Profile" subtitle="This creator could not be opened.">
        <section className="rounded-[1.6rem] border border-rose-100 bg-rose-50 p-5 text-sm leading-6 text-rose-700 shadow-sm">
          This profile is unavailable right now.
        </section>
        <Link href="/following" className="mt-4 inline-flex rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
          Back to following
        </Link>
      </MobileShell>
    );
  }

  const { data: posts } = await supabase
    .from("posts")
    .select("id,caption,image_url,yes_count,no_count")
    .eq("user_id", profileId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(24);

  return (
    <MobileShell title={profile.display_name || profile.username || "Profile"} subtitle="Public creator profile.">
      <div className="space-y-4">
        <Link href="/following" className="inline-flex rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm">
          ← Back to following
        </Link>

        <section className="rounded-[1.6rem] border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(180deg,_#f6c4d5_0%,_#ddb7ff_100%)] text-2xl shadow-sm">
              ✨
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold tracking-tight text-slate-900">{profile.display_name || "HowMyLook user"}</p>
              <p className="text-sm text-slate-500">{profile.username ? `@${profile.username}` : "@username"}</p>
              <p className="mt-3 text-sm leading-6 text-slate-700">{profile.bio || "Posting looks and getting quick feedback."}</p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Posts</h2>
          </div>

          {!posts || posts.length === 0 ? (
            <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
              No posts yet.
            </section>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {posts.map((post, index) => {
                const showImage = post.image_url.startsWith("http");
                return (
                  <article key={post.id} className="overflow-hidden rounded-[1.4rem] border border-pink-100 bg-white shadow-sm">
                    {showImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.image_url} alt={post.caption ?? "Outfit post"} className="aspect-square w-full object-cover" />
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
                      <p className="text-sm font-semibold text-slate-900">{post.caption ?? "Untitled look"}</p>
                      <p className="mt-1 text-xs text-slate-500">{post.yes_count} yes · {post.no_count} no</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </MobileShell>
  );
}
