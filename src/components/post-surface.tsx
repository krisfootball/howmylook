import Link from "next/link";
import { PostGallery } from "@/components/post-gallery";

type PostSurfaceProps = {
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
  onYes?: () => void;
  onNo?: () => void;
  votingDisabled?: boolean;
  yesLabel?: string;
  noLabel?: string;
};

export function PostSurface({
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
  onYes,
  onNo,
  votingDisabled = false,
  yesLabel = "Yes",
  noLabel = "No",
}: PostSurfaceProps) {
  const showImage = images.length > 0;
  const showVoting = Boolean(onYes && onNo);

  return (
    <article className="overflow-hidden rounded-[1.8rem] bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
      <div className="relative">
        {showImage ? (
          <div className="aspect-[9/16] w-full bg-slate-950">
            <PostGallery images={images} altBase={caption} />
          </div>
        ) : (
          <div className="aspect-[9/16] bg-[linear-gradient(180deg,_#f6d6df_0%,_#dfc8ff_100%)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/18 to-black/20" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          {backHref && backLabel ? (
            <Link
              href={backHref}
              className="rounded-full border border-white/25 bg-black/20 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm"
            >
              {backLabel}
            </Link>
          ) : <div />}

          {!showVoting && authorId ? (
            <Link href={`/people/${authorId}`} className="text-[11px] font-medium text-white/80">
              Profile
            </Link>
          ) : <div />}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 pb-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75">Occasion</p>
            {showVoting && authorId ? (
              <Link href={`/people/${authorId}`} className="text-[11px] font-medium text-white/80">
                Profile
              </Link>
            ) : null}
          </div>

          <p className="mt-2 text-[15px] font-medium leading-6 text-white">{caption}</p>

          <div className="mt-3 flex items-center justify-between text-xs text-white/85">
            <span>{yesCount} yes</span>
            <span>{noCount} no</span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            {showVoting ? (
              <>
                <button
                  onClick={onYes}
                  disabled={votingDisabled}
                  className="min-w-[5.5rem] rounded-full border border-white/55 bg-white/5 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 disabled:opacity-60"
                >
                  {yesLabel}
                </button>
                <button
                  onClick={onNo}
                  disabled={votingDisabled}
                  className="min-w-[5.5rem] rounded-full border border-white/55 bg-white/5 px-4 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 disabled:opacity-60"
                >
                  {noLabel}
                </button>
              </>
            ) : (
              <>
                <div className="rounded-full border border-white/25 bg-black/20 px-3 py-2 text-white backdrop-blur-sm">
                  <p className="text-sm font-semibold">{authorName}</p>
                  {authorUsername ? <p className="text-xs text-white/80">{authorUsername}</p> : null}
                </div>
                {authorAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={authorAvatarUrl} alt={authorName} className="h-10 w-10 rounded-full object-cover ring-1 ring-white/20" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm ring-1 ring-white/20 backdrop-blur-sm">
                    ✨
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
