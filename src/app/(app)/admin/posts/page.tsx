import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { getAdminAccessDebug, requireAdminUser } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { AdminPostActions } from "./post-actions";

export default async function AdminPostsPage() {
  const adminUser = await requireAdminUser();

  if (!adminUser) {
    const debug = await getAdminAccessDebug();

    return (
      <MobileShell title="Admin" subtitle="Access needed.">
        <div className="space-y-4">
          <section className="rounded-[1.6rem] border border-rose-100 bg-rose-50 p-5 text-sm leading-6 text-rose-700 shadow-sm">
            This account is not currently allowed to open the admin queue.
          </section>

          <section className="rounded-[1.4rem] border border-amber-100 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900 shadow-sm">
            Add your signed-in email address to the <span className="font-semibold">ADMIN_EMAILS</span> environment variable in Vercel,
            then redeploy.
          </section>

          <section className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700 shadow-sm">
            <p><span className="font-semibold text-slate-900">Signed-in email:</span> {debug.signedInEmail ?? "not signed in"}</p>
            <p className="mt-2"><span className="font-semibold text-slate-900">Allowed admin emails:</span> {debug.allowedEmails.length > 0 ? debug.allowedEmails.join(", ") : "none configured"}</p>
          </section>

          <Link href="/home" className="inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            Back to Home
          </Link>
        </div>
      </MobileShell>
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
    <MobileShell title="" hideHeader>
      <div className="space-y-4">
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

        <div className="grid grid-cols-2 gap-3">
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
    </MobileShell>
  );
}
