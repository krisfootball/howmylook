type ProfileRetentionNoteProps = {
  keptCount?: number;
  maxKept?: number;
};

export function ProfileRetentionNote({ keptCount, maxKept }: ProfileRetentionNoteProps) {
  const showCount = typeof keptCount === "number" && typeof maxKept === "number";

  return (
    <section className="rounded-[1.4rem] border border-pink-100 bg-pink-50/70 p-4 text-sm leading-6 text-slate-700">
      <p>Looks disappear after 30 days unless you keep them.</p>
      {showCount ? (
        <p className="mt-2 text-xs font-medium text-pink-700">
          {keptCount} of {maxKept} kept
        </p>
      ) : null}
    </section>
  );
}
