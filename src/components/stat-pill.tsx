import Link from "next/link";

export function StatPill({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-pink-500">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{value}</p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex min-h-22 flex-col items-center justify-center rounded-2xl border border-pink-100 bg-pink-50/70 px-4 py-3 text-center transition hover:-translate-y-0.5 hover:bg-pink-100 active:scale-[0.99]"
      >
        {content}
      </Link>
    );
  }

  return <div className="flex min-h-22 flex-col items-center justify-center rounded-2xl border border-pink-100 bg-pink-50/70 px-4 py-3 text-center">{content}</div>;
}
