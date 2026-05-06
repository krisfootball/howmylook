import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { AdminPostActions } from "../post-actions";

type AdminPostDetailPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function AdminPostDetailPage({ params }: AdminPostDetailPageProps) {
  const adminUser = await requireAdminUser();

  if (!adminUser) {
    redirect("/home");
  }

  const { postId } = await params;

  const { data: post, error } = await supabase
    .from("posts")
    .select(
      "id,user_id,image_url,caption,yes_count,no_count,created_at,is_active,moderation_status,moderation_reason,profiles!posts_user_id_fkey(username,display_name,avatar_url),post_images(id,image_url,sort_order)",
    )
    .eq("id", postId)
    .maybeSingle();

  if (error || !post) {
    notFound();
  }

  const orderedImages = post.post_images?.length
    ? [...post.post_images].sort((a, b) => a.sort_order - b.sort_order).map((image) => image.image_url)
    : [];
  const gallery = orderedImages.length > 0 ? orderedImages : [post.image_url];
  const joinedProfile = Array.isArray(post.profiles) ? (post.profiles[0] ?? null) : (post.profiles ?? null);
  const authorName = joinedProfile?.display_name || joinedProfile?.username || "HowMyLook user";
  const authorUsername = joinedProfile?.username || null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff_0%,_#fff6fb_40%,_#f5edf8_100%)] px-4 py-6 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/90 p-4 shadow-[0_25px_80px_rgba(76,29,149,0.18)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-100 px-1 pb-4 pt-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">Admin review</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{authorName}</h1>
            <p className="mt-2 text-sm text-slate-600">Review this post in detail, then keep it, hide it, or soft-delete it.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/posts" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-pink-100">
              Back to queue
            </Link>
            <Link href={`/post/${post.id}?from=admin`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
              Open public view
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-3">
            {gallery.map((imageUrl, index) => {
              const showImage = imageUrl?.startsWith("http");
              return (
                <div key={`${imageUrl}-${index}`} className="overflow-hidden rounded-[1.7rem] border border-pink-100 bg-white shadow-sm">
                  {showImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt={post.caption ?? "HowMyLook post"} className="aspect-[4/5] w-full object-cover" />
                  ) : (
                    <div className="aspect-[4/5] bg-[linear-gradient(180deg,_#f6d6df_0%,_#dfc8ff_100%)]" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            <section className="rounded-[1.6rem] border border-pink-100 bg-white p-4 shadow-sm">
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

              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-pink-500">Occasion</p>
                  <p className="mt-1">{post.caption?.trim() || "No occasion added yet"}</p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{new Date(post.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC</span>
                  <span>{post.yes_count} yes</span>
                  <span>{post.no_count} no</span>
                  <span>{gallery.length} photo{gallery.length === 1 ? "" : "s"}</span>
                </div>
              </div>

              {post.moderation_reason ? (
                <div className="mt-4 rounded-[1.1rem] bg-slate-50 px-3 py-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">Reason:</span> {post.moderation_reason}
                </div>
              ) : null}
            </section>

            <section className="rounded-[1.6rem] border border-pink-100 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Moderation actions</p>
              <p className="mt-1 text-sm text-slate-500">These changes immediately affect what the public app can see.</p>
              <div className="mt-4">
                <AdminPostActions postId={post.id} initialStatus={post.moderation_status} />
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
