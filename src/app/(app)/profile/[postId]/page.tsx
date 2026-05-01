import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { supabase } from "@/lib/supabase";

type PostDetailPageProps = {
  params: Promise<{
    postId: string;
  }>;
  searchParams?: Promise<{
    from?: string;
    profileId?: string;
  }>;
};

export default async function PostDetailPage({ params, searchParams }: PostDetailPageProps) {
  const { postId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const { data: post, error } = await supabase
    .from("posts")
    .select("id,caption,image_url,yes_count,no_count,user_id,is_active,post_images(id,image_url,sort_order)")
    .eq("id", postId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !post) {
    return (
      <MobileShell title="Post" subtitle="This look could not be opened.">
        <section className="rounded-[1.6rem] border border-rose-100 bg-rose-50 p-5 text-sm leading-6 text-rose-700 shadow-sm">
          This post is unavailable right now.
        </section>
        <Link
          href="/profile"
          className="mt-4 inline-flex rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm"
        >
          Back to profile
        </Link>
      </MobileShell>
    );
  }

  const { data: author } = await supabase
    .from("profiles")
    .select("username,display_name")
    .eq("id", post.user_id)
    .maybeSingle();

  const galleryImages =
    post.post_images && post.post_images.length > 0
      ? [...post.post_images].sort((a, b) => a.sort_order - b.sort_order).map((image) => image.image_url)
      : post.image_url.startsWith("http")
        ? [post.image_url]
        : [];
  const showImage = galleryImages.length > 0;
  const authorName = author?.display_name || author?.username || "HowMyLook user";
  const authorHandle = author?.username ? `@${author.username}` : null;
  const backHref =
    resolvedSearchParams?.from === "people" && resolvedSearchParams.profileId
      ? `/people/${resolvedSearchParams.profileId}`
      : "/profile";
  const backLabel = resolvedSearchParams?.from === "people" ? "← Back to profile" : "← Back to profile";

  return (
    <MobileShell title="Post" subtitle="A closer look at one outfit post.">
      <div className="space-y-4">
        <Link
          href={backHref}
          className="inline-flex rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm"
        >
          {backLabel}
        </Link>

        <article className="overflow-hidden rounded-[1.6rem] border border-pink-100 bg-white shadow-sm">
          {showImage ? (
            <div className="p-2">
              <div className="hide-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-[1.1rem]">
                {galleryImages.map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="min-w-full snap-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={`${post.caption ?? "Outfit for an occasion"} ${index + 1}`}
                      className="aspect-[4/5] w-full rounded-[1.1rem] object-cover"
                    />
                  </div>
                ))}
              </div>

              {galleryImages.length > 1 ? (
                <div className="mt-3 flex items-center justify-center gap-2">
                  {galleryImages.map((_, index) => (
                    <span
                      key={`dot-${index}`}
                      className={`h-2 w-2 rounded-full ${index === 0 ? "bg-pink-500" : "bg-pink-200"}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="aspect-[4/5] bg-[linear-gradient(180deg,_#f6d6df_0%,_#dfc8ff_100%)]" />
          )}

          <div className="space-y-4 p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-pink-500">Occasion</p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">{post.caption ?? "No occasion added yet"}</p>
              <p className="mt-2 text-sm text-slate-500">
                {authorName}
                {authorHandle ? <span> · {authorHandle}</span> : null}
              </p>
            </div>

            <p className="text-sm text-slate-500">
              {galleryImages.length === 0 ? "No photos attached" : `${galleryImages.length} photo${galleryImages.length > 1 ? "s" : ""}`}
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-pink-50 px-4 py-4">
                <p className="text-slate-500">Yes</p>
                <p className="mt-1 font-semibold text-slate-900">{post.yes_count}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-slate-500">No</p>
                <p className="mt-1 font-semibold text-slate-900">{post.no_count}</p>
              </div>
            </div>

            {!showImage ? <p className="text-xs text-slate-400">Demo image placeholder</p> : null}
          </div>
        </article>
      </div>
    </MobileShell>
  );
}
