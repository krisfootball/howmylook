type ProfileRetentionNoteProps = {
  keptCount?: number;
  maxKept?: number;
};

export function ProfileRetentionNote({ keptCount, maxKept }: ProfileRetentionNoteProps) {
  const showCount = typeof keptCount === "number" && typeof maxKept === "number";

  return (
    <section className="rounded-[1.4rem] border border-pink-100 bg-pink-50/70 p-4 text-sm leading-6 text-slate-700">
      <p className="font-semibold text-slate-900">30-day profile rule</p>
      <p className="mt-2">
        Looks expire after 30 days by default so the app stays focused on fast outfit decisions.
        You can keep up to 10 looks on your profile for longer.
      </p>
      {showCount ? (
        <p className="mt-2 text-xs font-medium text-pink-700">
          {keptCount} of {maxKept} keep slots used
        </p>
      ) : null}
    </section>
  );
}
