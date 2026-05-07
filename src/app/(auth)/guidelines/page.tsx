import Link from "next/link";

export default function GuidelinesPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff_0%,_#fff6fb_40%,_#f5edf8_100%)] px-4 py-6 text-slate-900">
      <div className="mx-auto w-full max-w-3xl rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_25px_80px_rgba(76,29,149,0.18)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">HowMyLook</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Community Guidelines</h1>
            <p className="mt-2 text-sm text-slate-500">Last updated: May 7, 2026</p>
          </div>
          <Link href="/auth" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            Back to signup
          </Link>
        </div>

        <div className="prose prose-slate mt-6 max-w-none text-sm leading-7">
          <p>
            HowMyLook is for real outfit feedback. These guidelines explain what belongs in the app and what may be removed.
          </p>

          <h2>What belongs here</h2>
          <ul>
            <li>Real outfit photos</li>
            <li>Looks you want feedback on</li>
            <li>Clear, honest occasion text</li>
            <li>Respectful participation and rating behavior</li>
          </ul>

          <h2>What does not belong here</h2>
          <ul>
            <li>Nudity or sexually explicit content</li>
            <li>Content involving minors in unsafe or inappropriate contexts</li>
            <li>Harassment, bullying, hate, threats, or humiliation</li>
            <li>Spam, scams, fake engagement, or misleading content</li>
            <li>Graphic violence or shocking material</li>
            <li>Copyright-infringing or privacy-violating content</li>
            <li>Images that are not really about outfit feedback</li>
          </ul>

          <h2>Moderation</h2>
          <p>
            Posts that do not fit the app’s purpose or violate these rules may be removed. Accounts that repeatedly abuse the app may be restricted
            or suspended.
          </p>

          <h2>How to use the app well</h2>
          <ul>
            <li>Post clear photos of the outfit you want feedback on</li>
            <li>Keep ratings honest and quick</li>
            <li>Be respectful of other people’s appearance and participation</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
