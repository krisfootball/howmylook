"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, SVGProps, useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactNode;

type NavItem = {
  href: string;
  label: string;
  icon: IconComponent;
};

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6.5 9.5V20h11V9.5" />
    </svg>
  );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="5.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8.5v7" />
      <path d="M8.5 12h7" />
    </svg>
  );
}

function ActivityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.5 12h3l1.7-3.5 3.2 7 2.3-4h4.8" />
    </svg>
  );
}

function ProfileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4.5" y="5.5" width="15" height="13" rx="3" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="M6.8 14.2c.7-1 1.4-1.5 2.2-1.5.8 0 1.5.5 2.2 1.5" />
      <path d="M13.8 9.2h2.8" />
      <path d="M13.8 12h2.8" />
      <path d="M13.8 14.8h2.2" />
    </svg>
  );
}

function AdminIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 4.5 18 7v4.2c0 3.8-2.2 6.8-6 8.3-3.8-1.5-6-4.5-6-8.3V7l6-2.5Z" />
      <circle cx="12" cy="10" r="1.8" />
      <path d="M9.6 14.2c.8-1.2 1.6-1.8 2.4-1.8s1.6.6 2.4 1.8" />
    </svg>
  );
}

const baseNavItems: NavItem[] = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/upload", label: "Post", icon: PlusIcon },
  { href: "/activity", label: "Activity", icon: ActivityIcon },
  { href: "/profile", label: "Profile", icon: ProfileIcon },
];

function parseAdminEmails(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function MobileShell({
  title,
  subtitle,
  children,
  hideHeader = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  hideHeader?: boolean;
}) {
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAdminState() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const allowed = parseAdminEmails(process.env.NEXT_PUBLIC_ADMIN_EMAILS);
        const isAdmin = Boolean(user?.email && allowed.includes(user.email.trim().toLowerCase()));

        if (active) {
          setShowAdmin(isAdmin);
        }
      } catch {
        if (active) {
          setShowAdmin(false);
        }
      }
    }

    void loadAdminState();

    return () => {
      active = false;
    };
  }, [supabase]);

  const navItems = showAdmin
    ? [...baseNavItems.slice(0, 3), { href: "/admin", label: "Admin", icon: AdminIcon }, ...baseNavItems.slice(3)]
    : baseNavItems;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff_0%,_#fff6fb_40%,_#f5edf8_100%)] px-4 py-6 text-slate-900">
      <div className="mx-auto flex h-[calc(100vh-3rem)] w-full max-w-sm flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-[0_25px_80px_rgba(76,29,149,0.18)] backdrop-blur">
        {hideHeader ? null : (
          <header className="border-b border-pink-100 px-5 pb-4 pt-5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p> : null}
          </header>
        )}

        <section className={`flex-1 overflow-y-auto ${hideHeader ? "px-4 py-4" : "px-4 py-4"}`}>{children}</section>

        <nav className={`sticky bottom-0 z-20 grid ${showAdmin ? "grid-cols-6" : "grid-cols-5"} border-t border-pink-100 bg-white/95 px-2 py-2 backdrop-blur`}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-center text-[11px] font-medium transition ${
                  isActive ? "bg-pink-50 text-pink-700" : "text-slate-600 hover:bg-pink-50 hover:text-pink-600"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                    isActive
                      ? "border-pink-300 bg-pink-100 text-pink-700"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </main>
  );
}
