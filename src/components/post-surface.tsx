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
    <article className="relative h-full min-h-[calc(100vh-8.5rem)] overflow-hidden bg-slate-950 text-white">
      <div className="relative h-full min-h-[calc(100vh-8.5rem)]">
        {showImage ? (
          <div className="h-full bg-slate-950">
            <PostGallery images={images} altBase={caption} fullBleed />
          </div>
        ) : (
          <div className="flex h-full min-h-[calc(100vh-8.5rem)] items-end bg-[linear-gradient(180deg,_#f6d6df_0%,_#dfc8ff_48%,_#a78bfa_100%)] p-5">
            <div className="w-full rounded-[1.6rem] border border-white/25 bg-white/12 p-4 text-white/92 backdrop-blur-sm">
              <p className="text-sm font-semibold">{authorName}</p>
              {authorUsername ? <p className="mt-1 text-xs text-white/72">{authorUsername}</p> : null}
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Preview only</p>
              <p className="mt-2 text-sm leading-6 text-white/84">
                This seeded post has no real photo file yet, but it can still be rated.
              </p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/10 to-black/18" />

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
          {showVoting ? null : <p className="text-sm font-semibold text-white">{authorName}</p>}

          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/75">Occasion</p>

          <p className="mt-2 text-[15px] font-medium leading-6 text-white">{caption}</p>

          {!showVoting ? (
            <div className="mt-3 flex items-center justify-between text-xs text-white/85">
              <span>{yesCount} yes</span>
              <span>{noCount} no</span>
            </div>
          ) : null}

          <div className="mt-4 flex items-center gap-3">
            {showVoting ? (
              <>
                <button
                  onClick={onYes}
                  disabled={votingDisabled}
                  className="flex-1 rounded-[1.8rem] border border-white/28 bg-white/10 px-4 py-4 text-white shadow-[0_12px_32px_rgba(0,0,0,0.16)] backdrop-blur-md transition hover:bg-white/14 disabled:opacity-60"
                >
                  <span className="block text-[1.15rem] font-semibold leading-none tracking-tight">{yesLabel}</span>
                  <span className="mt-2 block text-[12px] font-medium leading-none text-white/72">{yesCount}</span>
                </button>
                <button
                  onClick={onNo}
                  disabled={votingDisabled}
                  className="flex-1 rounded-[1.8rem] border border-white/28 bg-white/10 px-4 py-4 text-white shadow-[0_12px_32px_rgba(0,0,0,0.16)] backdrop-blur-md transition hover:bg-white/14 disabled:opacity-60"
                >
                  <span className="block text-[1.15rem] font-semibold leading-none tracking-tight">{noLabel}</span>
                  <span className="mt-2 block text-[12px] font-medium leading-none text-white/72">{noCount}</span>
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
