import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff_0%,_#fff6fb_40%,_#f5edf8_100%)] px-4 py-6 text-slate-900">
      <div className="mx-auto w-full max-w-3xl rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_25px_80px_rgba(76,29,149,0.18)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">HowMyLook</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Contact & Support</h1>
            <p className="mt-2 text-sm text-slate-500">Last updated: May 7, 2026</p>
          </div>
          <Link href="/auth" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            Back to signup
          </Link>
        </div>

        <div className="prose prose-slate mt-6 max-w-none text-sm leading-7">
          <p>
            If you need help with your account, privacy questions, moderation issues, or a data request, contact HowMyLook support.
          </p>

          <h2>Support contact</h2>
          <p>
            Before launch, replace this placeholder with your real support contact details.
          </p>
          <ul>
            <li>Email: <strong>support@howmylook.com</strong></li>
            <li>Privacy requests: <strong>privacy@howmylook.com</strong></li>
          </ul>

          <h2>What you can contact us about</h2>
          <ul>
            <li>Account access issues</li>
            <li>Post moderation questions</li>
            <li>Report abuse or harmful content</li>
            <li>Request account deletion</li>
            <li>Request help with your personal data</li>
          </ul>

          <h2>Account deletion and data requests</h2>
          <p>
            If you want your account deleted or want to make a privacy-related request, contact support from the email address linked to your
            account and include enough detail for us to verify the request and help you safely.
          </p>
        </div>
      </div>
    </main>
  );
}
