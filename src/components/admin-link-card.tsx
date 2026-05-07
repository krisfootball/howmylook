"use client";

import Link from "next/link";

export function AdminLinkCard() {
  return (
    <Link
      href="/admin"
      className="flex items-center justify-between rounded-[1.4rem] border border-rose-100 bg-rose-50 px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">Admin</p>
        <p className="mt-1 text-sm text-slate-500">Open the moderation queue.</p>
      </div>
      <span className="text-xs font-medium text-rose-600">Open</span>
    </Link>
  );
}
