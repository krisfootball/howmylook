import Link from "next/link";
import { requireAdminUser } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { AdminPostActions } from "./post-actions";

export default async function AdminPostsPage() {
  const adminUser = await requireAdminUser();

  if (!adminUser) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff_0%,_#fff6fb_40%,_#f5edf8_100%)] px-4 py-6 text-slate-900">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-xl flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_25px_80px_rgba(76,29,149,0.18)] backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">Admin</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Access needed</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This account is not currently allowed to open the admin queue.
            </p>
          </div>

          <section className="rounded-[1.4rem] border border-amber-100 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
            Add your signed-in email address to the <span className="font-semibold">ADMIN_EMAILS</span> environment variable in Vercel,
            then redeploy.
          </section>

          <div className="flex flex-wrap gap-2">
            <Link href="/home" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      "id,user_id,image_url,caption,yes_count,no_count,created_at,is_active,moderation_status,moderation_reason,profiles!posts_user_id_fkey(username,display_name),post_images(id,image_url,sort_order)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff_0%,_#fff6fb_40%,_#f5edf8_100%)] px-4 py-6 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/90 p-4 shadow-[0_25px_80px_rgba(76,29,149,0.18)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-100 px-1 pb-4 pt-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">Admin</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Post moderation</h1>
            <p className="mt-2 text-sm text-slate-600">Newest uploads first. Use this queue to quickly keep, hide, or soft-delete posts that do not fit the app.</p>
          </div>
          <Link href="/home" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-pink-100">
            Back to Home
          </Link>
        </div>

        {error ? (
          <section className="rounded-[1.6rem] border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700 shadow-sm">
            Unable to load moderation queue right now.
          </section>
        ) : null}

        {!error && (!posts || posts.length === 0) ? (
          <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
            No posts yet.
          </section>
        ) : null}

        <div className="space-y-4">
          {(posts ?? []).map((post) => {
            const orderedImages = post.post_images?.length
              ? [...post.post_images].sort((a, b) => a.sort_order - b.sort_order).map((image) => image.image_url)
              : [];
            const imageUrl = orderedImages[0] || post.image_url;
            const showImage = imageUrl?.startsWith("http");
            const joinedProfile = Array.isArray(post.profiles) ? (post.profiles[0] ?? null) : (post.profiles ?? null);
            const authorName = joinedProfile?.display_name || joinedProfile?.username || "HowMyLook user";
            const authorUsername = joinedProfile?.username || null;

            return (
              <article key={post.id} className="overflow-hidden rounded-[1.7rem] border border-pink-100 bg-white shadow-sm">
                <div className="grid gap-0 md:grid-cols-[220px,1fr]">
                  <div className="bg-slate-100">
                    {showImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt={post.caption ?? "New HowMyLook post"} className="aspect-[4/5] h-full w-full object-cover" />
                    ) : (
                      <div className="aspect-[4/5] bg-[linear-gradient(180deg,_#f6d6df_0%,_#dfc8ff_100%)]" />
                    )}
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold tracking-tight text-slate-900">{authorName}</p>
                        <p className="mt-1 text-sm text-slate-500">{authorUsername ? `@${authorUsername}` : "@username"}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        post.moderation_status === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : post.moderation_status === "hidden"
                            ? "bg-amber-50 text-amber-700"
                            : post.moderation_status === "deleted"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-slate-100 text-slate-700"
                      }`}>
                        {post.moderation_status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm leading-6 text-slate-700">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink-500">Occasion</p>
                        <p className="mt-1">{post.caption?.trim() || "No occasion added yet"}</p>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>{new Date(post.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC</span>
                        <span>{post.yes_count} yes</span>
                        <span>{post.no_count} no</span>
                        <span>{orderedImages.length > 1 ? `${orderedImages.length} photos` : "1 photo"}</span>
                      </div>
                    </div>

                    {post.moderation_reason ? (
                      <div className="rounded-[1.1rem] bg-slate-50 px-3 py-3 text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">Reason:</span> {post.moderation_reason}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin/posts/${post.id}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                        Review
                      </Link>
                      <Link href={`/post/${post.id}?from=admin`} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                        Open post
                      </Link>
                    </div>

                    <AdminPostActions
                      postId={post.id}
                      initialStatus={post.moderation_status}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
