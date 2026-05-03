import Link from "next/link";
import { PostGallery } from "@/components/post-gallery";

type PostViewProps = {
  images: string[];
  caption: string;
  yesCount: number;
  noCount: number;
  authorId?: string | null;
  authorName: string;
  authorUsername?: string | null;
  authorAvatarUrl?: string | null;
  backHref?: string;
  backLabel?: string;
};

export function PostView({
  images,
  caption,
  yesCount,
  noCount,
  authorId,
  authorName,
  authorUsername,
  authorAvatarUrl,
  backHref,
  backLabel,
}: PostViewProps) {
  const showImage = images.length > 0;

  return (
    <article className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="relative min-h-screen">
        {showImage ? (
          <div className="absolute inset-0 bg-slate-950">
            <PostGallery images={images} altBase={caption} fullBleed />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,_#f6d6df_0%,_#dfc8ff_100%)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        <div className="relative z-10 flex min-h-screen flex-col justify-between px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.9rem,env(safe-area-inset-top))] sm:px-5">
          <div className="flex items-start justify-between gap-3">
            {backHref && backLabel ? (
              <Link
                href={backHref}
                className="rounded-full bg-black/35 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm"
              >
                {backLabel}
              </Link>
            ) : (
              <div />
            )}

            {authorId ? (
              <Link
                href={`/people/${authorId}`}
                className="rounded-full bg-black/35 px-4 py-2 text-sm font-medium text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm"
              >
                Profile
              </Link>
            ) : null}
          </div>

          <div className="max-w-sm space-y-4 pb-2">
            <div className="flex items-center gap-2.5">
              {authorAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={authorAvatarUrl} alt={authorName} className="h-10 w-10 rounded-full object-cover ring-2 ring-white/25" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/12 text-sm ring-2 ring-white/25 backdrop-blur-sm">
                  ✨
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-base font-semibold tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]">{authorName}</p>
                {authorUsername ? <p className="text-xs text-white/80">{authorUsername}</p> : null}
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/72">Occasion</p>
                <p className="mt-1.5 max-w-[18rem] text-[1.65rem] font-semibold leading-[1.06] text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
                  {caption}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/72">Description</p>
                <p className="mt-1.5 max-w-[18rem] text-[14px] leading-6 text-white/90 drop-shadow-[0_4px_18px_rgba(0,0,0,0.4)]">{caption}</p>
              </div>

              <div className="flex items-center gap-4 pt-0.5 text-[13px] font-medium text-white/92">
                <span className="drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)]">{yesCount} yes</span>
                <span className="drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)]">{noCount} no</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
