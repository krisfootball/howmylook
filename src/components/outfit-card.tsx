import { OutfitPost } from "@/lib/mock-data";

export function OutfitCard({
  post,
  badge,
}: {
  post: OutfitPost;
  badge?: string;
}) {
  return (
    <article className="rounded-[1.7rem] bg-slate-950 p-3 text-white shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
      <div className={`aspect-[9/16] rounded-[1.35rem] p-4 ${post.imageStyle}`}>
        <div className="flex h-full flex-col justify-between rounded-[1.1rem] bg-white/15 p-4 backdrop-blur-[2px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">{post.authorName}</p>
              <p className="text-xs text-slate-900/70">{post.authorHandle}</p>
            </div>
            {badge ? (
              <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-pink-600">
                {badge}
              </span>
            ) : null}
          </div>

          <div className="space-y-3 rounded-[1.1rem] bg-white/72 p-4 text-slate-900 shadow-sm backdrop-blur">
            <p className="text-sm font-medium leading-6">{post.caption}</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-900/7 px-3 py-1 text-[11px] font-medium text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20">
                Yes
              </button>
              <button className="rounded-full bg-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-900/20">
                No
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-full bg-black/28 px-4 py-2 text-sm text-white">
            <span>{post.yesCount} yes</span>
            <span>{post.noCount} no</span>
          </div>
        </div>
      </div>
    </article>
  );
}
