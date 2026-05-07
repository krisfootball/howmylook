import Link from "next/link";
import { getAdminAccessDebug, requireAdminUser } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { AdminPostActions } from "./post-actions";

export default async function AdminPostsPage() {
  const adminUser = await requireAdminUser();

  if (!adminUser) {
    const debug = await getAdminAccessDebug();

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

          <section className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
            <p><span className="font-semibold text-slate-900">Signed-in email:</span> {debug.signedInEmail ?? "not signed in"}</p>
            <p className="mt-2"><span className="font-semibold text-slate-900">Allowed admin emails:</span> {debug.allowedEmails.length > 0 ? debug.allowedEmails.join(", ") : "none configured"}</p>
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
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/90 p-4 shadow-[0_25px_80px_rgba(76,29,149,0.18)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-100 px-1 pb-4 pt-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">Admin</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Post moderation</h1>
            <p className="mt-2 text-sm text-slate-600">Fast moderation grid with quick keep or delete actions.</p>
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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {(posts ?? []).map((post, index) => {
            const orderedImages = post.post_images?.length
              ? [...post.post_images].sort((a, b) => a.sort_order - b.sort_order).map((image) => image.image_url)
              : [];
            const imageUrl = orderedImages[0] || post.image_url;
            const showImage = imageUrl?.startsWith("http");

            return (
              <article key={post.id} className="overflow-hidden rounded-[1.3rem] border border-pink-100 bg-white shadow-sm">
                <Link href={`/admin/posts/${post.id}`} className="block">
                  <div className="relative bg-slate-100">
                    {showImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt={post.caption ?? "New HowMyLook post"} className="aspect-[4/5] h-full w-full object-cover" />
                    ) : (
                      <div
                        className={`aspect-[4/5] ${
                          index % 3 === 0
                            ? "bg-[linear-gradient(180deg,_#f6d6df_0%,_#dfc8ff_100%)]"
                            : index % 3 === 1
                              ? "bg-[linear-gradient(180deg,_#f7e7c6_0%,_#ebb3b0_100%)]"
                              : "bg-[linear-gradient(180deg,_#c9d4ff_0%,_#dfb2f4_100%)]"
                        }`}
                      />
                    )}
                    <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${
                        post.moderation_status === "approved"
                          ? "bg-emerald-500/90 text-white"
                          : post.moderation_status === "hidden"
                            ? "bg-amber-400/90 text-slate-900"
                            : post.moderation_status === "deleted"
                              ? "bg-rose-500/90 text-white"
                              : "bg-slate-900/70 text-white"
                      }`}>
                        {post.moderation_status}
                      </span>
                      {orderedImages.length > 1 ? (
                        <span className="rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                          {orderedImages.length}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Link>

                <div className="space-y-2 p-2.5">
                  <AdminPostActions postId={post.id} initialStatus={post.moderation_status} compact />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
