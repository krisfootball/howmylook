"use client";

import Link from "next/link";
import { useState } from "react";

const legalLinks = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/guidelines", label: "Guidelines" },
  { href: "/contact", label: "Contact" },
];

export function LegalLinksCard() {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-[1.6rem] border border-pink-100 bg-white p-2 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-[1.1rem] px-3 py-3 text-left transition hover:bg-slate-50"
      >
        <div>
          <p className="text-sm font-semibold text-slate-900">More</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Legal, privacy, guidelines, and contact.</p>
        </div>
        <span className="text-sm text-slate-300" aria-hidden="true">
          {open ? "⌃" : "⌄"}
        </span>
      </button>

      {open ? (
        <div className="mt-1 grid gap-1.5 border-t border-pink-100 px-1 pt-2">
          {legalLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-[1rem] px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-pink-50 hover:text-pink-700"
            >
              <span>{item.label}</span>
              <span className="text-sm text-slate-300" aria-hidden="true">›</span>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
