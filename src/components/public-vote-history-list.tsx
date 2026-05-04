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
    <div className="grid grid-cols-3 gap-1.5">
      {items.map((item, index) => {
        const showImage = item.imageUrl.startsWith("http");

        return (
          <Link
            key={item.id}
            href={`/profile/${item.id}?from=people&profileId=${profileId}`}
            className="group overflow-hidden rounded-none bg-white shadow-sm ring-1 ring-pink-100 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative">
              {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.caption} className="aspect-[9/16] w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
              ) : (
                <div
                  className={`aspect-[9/16] ${
                    index % 3 === 0
                      ? "bg-[linear-gradient(180deg,_#f6d6df_0%,_#dfc8ff_100%)]"
                      : index % 3 === 1
                        ? "bg-[linear-gradient(180deg,_#f7e7c6_0%,_#ebb3b0_100%)]"
                        : "bg-[linear-gradient(180deg,_#c9d4ff_0%,_#dfb2f4_100%)]"
                  }`}
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/18 to-transparent px-2 pb-2 pt-6 text-white">
                <div className="flex items-center gap-3 text-[10px] font-medium text-white/88">
                  <span>{item.yesCount} yes</span>
                  <span>{item.noCount} no</span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
