import Link from "next/link";
import { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const navItems: NavItem[] = [
  { href: "/rate", label: "Rate", icon: "💗" },
  { href: "/following", label: "Following", icon: "✨" },
  { href: "/upload", label: "Post", icon: "➕" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export function MobileShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff_0%,_#fff6fb_40%,_#f5edf8_100%)] px-4 py-6 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-sm flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_25px_80px_rgba(76,29,149,0.18)] backdrop-blur">
        <header className="border-b border-pink-100 px-5 pb-4 pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pink-500">
            HowMyLook
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p> : null}
        </header>

        <section className="flex-1 overflow-y-auto px-4 py-4">{children}</section>

        <nav className="grid grid-cols-4 border-t border-pink-100 bg-white/95 px-2 py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-center text-[11px] font-medium text-slate-600 transition hover:bg-pink-50 hover:text-pink-600"
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
