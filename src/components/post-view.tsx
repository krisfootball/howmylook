import Link from "next/link";
import { MobileShell } from "@/components/mobile-shell";
import { OwnPostActions } from "@/components/own-post-actions";
import { PostGallery } from "@/components/post-gallery";
import { PostOpenRatingActions } from "@/components/post-open-rating-actions";

type PostViewProps = {
  images: string[];
  caption: string;
  yesCount: number;
  noCount: number;
  authorId?: string | null;
  authorName: string;
  isOwnPost?: boolean;
  postId?: string;
  ownerId?: string | null;
  isKeptForever?: boolean;
  backHref?: string;
  backLabel?: string;
  showPostedBadge?: boolean;
};

export function PostView({
  images,
  caption,
  yesCount,
  noCount,
  authorId,
  authorName,
  isOwnPost = false,
  postId,
  ownerId,
  isKeptForever = false,
  backHref,
  backLabel,
  showPostedBadge = false,
}: PostViewProps) {
  const showImage = images.length > 0;

  return (
    <MobileShell title={authorName} hideHeader>
      <article className="-mx-4 -my-4 overflow-hidden rounded-none bg-slate-950 text-white shadow-none">
        <div className="relative h-[calc(100vh-7.5rem)] min-h-[calc(100vh-7.5rem)]">
        {showImage ? (
          <div className="absolute inset-0 overflow-hidden bg-slate-950">
            <PostGallery images={images} altBase={caption} fullBleed />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,_#f6d6df_0%,_#dfc8ff_100%)]" />
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-black/10" />

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between px-4 pb-5 pt-4 sm:px-5">
          <div className="flex items-start justify-between gap-3">
            {backHref && backLabel ? (
              <Link
                href={backHref}
                className="pointer-events-auto rounded-full bg-black/35 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm"
              >
                {backLabel}
              </Link>
            ) : (
              <div />
            )}

            {isOwnPost && postId && backHref ? (
              <OwnPostActions
                postId={postId}
                initialCaption={caption}
                backHref={backHref}
                ownerId={ownerId}
                isKeptForever={isKeptForever}
                compact
              />
            ) : authorId ? (
              <Link
                href={`/people/${authorId}`}
                className="pointer-events-auto rounded-full bg-black/35 px-4 py-2 text-sm font-medium text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm"
              >
                Profile
              </Link>
            ) : null}
          </div>

          <div className="max-w-sm space-y-4 pb-2">
            <div className="min-w-0 space-y-2">
              {showPostedBadge ? (
                <div className="photo-text-outline-soft inline-flex items-center rounded-full bg-emerald-400/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100 backdrop-blur-sm">
                  Posted
                </div>
              ) : null}

              {authorId ? (
                <Link
                  href={`/people/${authorId}`}
                  className="photo-text-outline-strong pointer-events-auto truncate text-base font-semibold tracking-tight text-white underline-offset-4 hover:underline"
                >
                  {authorName}
                </Link>
              ) : (
                <p className="photo-text-outline-strong truncate text-base font-semibold tracking-tight text-white">{authorName}</p>
              )}
            </div>

            <div className="space-y-3.5">
              <div>
                <p className="photo-text-outline-soft text-[11px] font-semibold uppercase tracking-[0.24em] text-white/75">Occasion</p>
                <p className="photo-text-outline-strong mt-1.5 max-w-[18rem] text-[15px] font-medium leading-6 text-white">
                  {caption}
                </p>
              </div>

              <div className="photo-text-outline-soft flex items-center gap-4 pt-0.5 text-[11px] font-medium text-white/85">
                <span className="drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)]">{yesCount} yes</span>
                <span className="drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)]">{noCount} no</span>
              </div>

              {!isOwnPost && postId ? <PostOpenRatingActions postId={postId} ownerId={ownerId ?? authorId} /> : null}
            </div>
          </div>
        </div>
        </div>
      </article>
    </MobileShell>
  );
}
