import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { PostGallery } from "@/components/post-gallery";
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
    .select("id,caption,image_url,yes_count,no_count,user_id,is_active,keep_forever,expires_at,post_images(id,image_url,sort_order)")
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
    .select("id,username,display_name,avatar_url")
    .eq("id", post.user_id)
    .maybeSingle();

  const galleryImages =
    post.post_images && post.post_images.length > 0
      ? [...post.post_images].sort((a, b) => a.sort_order - b.sort_order).map((image) => image.image_url)
      : post.image_url.startsWith("http")
        ? [post.image_url]
        : [];
  const showImage = galleryImages.length > 0;
  const isKeptForever = Boolean(post.keep_forever);
  const expiresAt = post.expires_at;
  const authorName = author?.display_name || author?.username || "HowMyLook user";
  const authorHandle = author?.username ? `@${author.username}` : null;
  const backHref =
    resolvedSearchParams?.from === "people" && resolvedSearchParams.profileId
      ? `/people/${resolvedSearchParams.profileId}`
      : resolvedSearchParams?.from === "search"
        ? "/search"
        : "/profile";
  const backLabel = resolvedSearchParams?.from === "search" ? "← Back to search" : "← Back to profile";

  return (
    <MobileShell title="Post" subtitle="A closer look at one outfit post.">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={backHref}
            className="inline-flex rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm"
          >
            {backLabel}
          </Link>
          {author?.id ? (
            <Link
              href={`/people/${author.id}`}
              className="inline-flex rounded-full bg-pink-50 px-4 py-3 text-sm font-semibold text-pink-700 ring-1 ring-pink-200"
            >
              View author
            </Link>
          ) : null}
        </div>

        <article className="overflow-hidden rounded-[1.6rem] border border-pink-100 bg-white shadow-sm">
          {showImage ? (
            <PostGallery images={galleryImages} altBase={post.caption ?? "Outfit for an occasion"} />
          ) : (
            <div className="aspect-[4/5] bg-[linear-gradient(180deg,_#f6d6df_0%,_#dfc8ff_100%)]" />
          )}

          <div className="space-y-4 p-4">
            <div className="flex items-start gap-3">
              {author?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={author.avatar_url} alt={authorName} className="h-11 w-11 rounded-full object-cover shadow-sm" />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(180deg,_#f6c4d5_0%,_#ddb7ff_100%)] text-sm shadow-sm">
                  ✨
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-pink-500">Occasion</p>
                <p className="mt-2 text-lg font-semibold tracking-tight text-slate-900">{post.caption ?? "No occasion added yet"}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {authorName}
                  {authorHandle ? <span> · {authorHandle}</span> : null}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl bg-pink-50 px-4 py-4">
                <p className="text-slate-500">Yes</p>
                <p className="mt-1 font-semibold text-slate-900">{post.yes_count}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-slate-500">No</p>
                <p className="mt-1 font-semibold text-slate-900">{post.no_count}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-slate-500">Photos</p>
                <p className="mt-1 font-semibold text-slate-900">{galleryImages.length || 0}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-pink-50/70 px-4 py-4 text-sm text-slate-600">
              <p className="text-slate-500">Availability</p>
              <p className="mt-1 font-semibold text-slate-900">
                {isKeptForever
                  ? "Kept on profile"
                  : expiresAt
                    ? `Expires ${new Date(expiresAt).toLocaleDateString()}`
                    : "30-day post"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/rate"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Rate looks
              </Link>
              {author?.id ? (
                <Link
                  href={`/people/${author.id}`}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
                >
                  More from this person
                </Link>
              ) : null}
            </div>

            {!showImage ? <p className="text-xs text-slate-400">Demo image placeholder</p> : null}
          </div>
        </article>
      </div>
    </MobileShell>
  );
}
