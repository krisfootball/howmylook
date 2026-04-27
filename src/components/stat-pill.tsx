export function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-pink-100 bg-pink-50/70 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-pink-500">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{value}</p>
    </div>
  );
}
