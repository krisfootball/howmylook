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
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-slate-500 shadow-sm ring-1 ring-pink-100 transition hover:bg-pink-50 hover:text-pink-700"
        aria-label="Open more options"
      >
        <span className="text-sm" aria-hidden="true">△</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-30 w-52 overflow-hidden rounded-[1.2rem] border border-pink-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
          <div className="grid gap-1 p-2">
            {legalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-[0.9rem] px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-pink-50 hover:text-pink-700"
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
                <span className="text-sm text-slate-300" aria-hidden="true">›</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
