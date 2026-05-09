import PostDetailClient from "./post-detail-client";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type PostDetailPageProps = {
  params: Promise<{
    postId: string;
  }>;
  searchParams?: Promise<{
    from?: string;
    profileId?: string;
    posted?: string;
  }>;
};

export default async function PostDetailPage({ params, searchParams }: PostDetailPageProps) {
  const { postId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const supabase = await createSupabaseServerClient();

  const { data: authData } = await supabase.auth.getUser();
  const viewerId = authData.user?.id ?? null;

  const { data: post, error } = await supabase
    .from("posts")
    .select("id,caption,image_url,yes_count,no_count,user_id,is_active,moderation_status,keep_forever,post_images(id,image_url,sort_order)")
    .eq("id", postId)
    .eq("is_active", true)
    .maybeSingle();

  const canViewPost = Boolean(
    post && (post.moderation_status === "approved" || (viewerId && post.user_id === viewerId)),
  );

  if (error || !post || !canViewPost) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff_0%,_#fff6fb_40%,_#f5edf8_100%)] px-4 py-6 text-slate-900">
        <div className="mx-auto w-full max-w-sm rounded-[2rem] border border-rose-100 bg-rose-50 p-5 text-sm leading-6 text-rose-700 shadow-sm">
          This post is unavailable right now.
        </div>
      </main>
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

  const backHref =
    resolvedSearchParams?.from === "people" && resolvedSearchParams.profileId
      ? `/people/${resolvedSearchParams.profileId}`
      : resolvedSearchParams?.from === "search"
        ? "/search"
        : resolvedSearchParams?.from === "home"
          ? "/home"
          : resolvedSearchParams?.from === "activity"
            ? "/activity"
            : "/profile";

  return (
    <PostDetailClient
      images={galleryImages}
      caption={post.caption ?? "No occasion added yet"}
      yesCount={post.yes_count}
      noCount={post.no_count}
      authorId={author?.id}
      authorName={author?.display_name || author?.username || "HowMyLook user"}
      postId={post.id}
      ownerId={post.user_id}
      isKeptForever={Boolean(post.keep_forever)}
      backHref={backHref}
      backLabel="Back"
      showPostedBadge={resolvedSearchParams?.posted === "1"}
    />
  );
}
