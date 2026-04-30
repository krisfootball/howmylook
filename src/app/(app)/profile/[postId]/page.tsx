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
    .select("id,caption,image_url,yes_count,no_count,user_id,is_active")
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

  const showImage = post.image_url.startsWith("http");
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
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.image_url} alt={post.caption ?? "Outfit post"} className="aspect-[4/5] w-full object-cover" />
          ) : (
            <div className="aspect-[4/5] bg-[linear-gradient(180deg,_#f6d6df_0%,_#dfc8ff_100%)]" />
          )}

          <div className="space-y-4 p-4">
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-900">{post.caption ?? "Untitled look"}</p>
              <p className="mt-2 text-sm text-slate-500">
                {authorName}
                {authorHandle ? <span> · {authorHandle}</span> : null}
              </p>
            </div>

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
