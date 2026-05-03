import Link from "next/link";
import { appConfig } from "@/lib/app-config";

const links = [
  { href: "/auth", label: "Auth" },
  { href: "/welcome", label: "Choose username" },
  { href: "/rate", label: "Rating queue" },
  { href: "/home", label: "Home feed (will be gated)" },
  { href: "/search", label: "Search (will be gated)" },
  { href: "/profile", label: "Profile (will be gated)" },
  { href: "/upload", label: "Post look (will be gated)" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff_0%,_#fff6fb_40%,_#f5edf8_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 rounded-[2rem] border border-white/70 bg-white/85 p-8 shadow-[0_25px_80px_rgba(76,29,149,0.14)] backdrop-blur">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-500">{appConfig.name}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Mobile-first MVP now in progress.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Users must create an account, choose a username, and rate {appConfig.unlockVoteCount} looks before Home, Profile, Post, and Search unlock.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[1.5rem] border border-pink-100 bg-pink-50/70 px-5 py-5 text-base font-semibold text-slate-900 transition hover:bg-pink-100"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pink-300">Current direction</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-white/80">
            <li>• soft, elegant, fashion-oriented visual style</li>
            <li>• TikTok-like one-photo rating flow</li>
            <li>• large yes/no actions for one-hand phone use</li>
            <li>• registration and login required before rating</li>
            <li>• full app unlock only after 5 ratings</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
