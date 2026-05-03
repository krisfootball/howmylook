import { ReactNode } from "react";

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff_0%,_#fff6fb_40%,_#f5edf8_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-sm flex-col justify-center rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_25px_80px_rgba(76,29,149,0.18)] backdrop-blur">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-500">{eyebrow}</p> : null}
        <h1 className={`${eyebrow ? "mt-3" : ""} text-3xl font-bold tracking-tight`}>{title}</h1>
        {description ? <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
