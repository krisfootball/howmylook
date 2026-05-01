import Link from "next/link";

type PublicVoteHistoryItem = {
  id: string;
  caption: string;
  imageUrl: string;
  yesCount: number;
  noCount: number;
};

export function PublicVoteHistoryList({
  items,
  value,
  profileId,
}: {
  items: PublicVoteHistoryItem[];
  value: "yes" | "no";
  profileId: string;
}) {
  if (items.length === 0) {
    return (
      <section className="rounded-[1.6rem] border border-pink-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
        This account has not given any {value} votes yet.
      </section>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const showImage = item.imageUrl.startsWith("http");

        return (
          <Link
            key={item.id}
            href={`/profile/${item.id}?from=people&profileId=${profileId}`}
            className="block overflow-hidden rounded-[1.6rem] border border-pink-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {showImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt={item.caption} className="aspect-[4/5] w-full object-cover" />
            ) : (
              <div
                className={`aspect-[4/5] ${
                  index % 3 === 0
                    ? "bg-[linear-gradient(180deg,_#f6d6df_0%,_#dfc8ff_100%)]"
                    : index % 3 === 1
                      ? "bg-[linear-gradient(180deg,_#f7e7c6_0%,_#ebb3b0_100%)]"
                      : "bg-[linear-gradient(180deg,_#c9d4ff_0%,_#dfb2f4_100%)]"
                }`}
              />
            )}
            <div className="space-y-2 p-4">
              <p className="font-semibold text-slate-900">{item.caption}</p>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>{item.yesCount} yes</span>
                <span>{item.noCount} no</span>
              </div>
              <p className="text-xs font-medium text-pink-600">Open post</p>
              {!showImage ? <p className="text-xs text-slate-500">Demo image placeholder</p> : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
