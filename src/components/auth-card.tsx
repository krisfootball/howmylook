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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff_0%,_#fff6fb_32%,_#f5edf8_70%,_#f2e8ff_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-sm flex-col justify-center">
        <div className="rounded-[2.2rem] border border-white/70 bg-white/90 p-6 shadow-[0_30px_100px_rgba(76,29,149,0.18)] backdrop-blur">
          <div className="rounded-[1.8rem] bg-[linear-gradient(180deg,_#fff6fb_0%,_#fff_100%)] p-5 ring-1 ring-pink-100/70">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(180deg,_#f6c4d5_0%,_#ddb7ff_100%)] text-xl shadow-sm">
                ✨
              </div>
              <div>
                {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-pink-500">{eyebrow}</p> : null}
                <p className="mt-1 text-sm font-medium text-slate-500">Quick outfit feedback</p>
              </div>
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
            {description ? <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p> : null}
          </div>

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
