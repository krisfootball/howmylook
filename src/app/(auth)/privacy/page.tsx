import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff_0%,_#fff6fb_40%,_#f5edf8_100%)] px-4 py-6 text-slate-900">
      <div className="mx-auto w-full max-w-3xl rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_25px_80px_rgba(76,29,149,0.18)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">HowMyLook</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Privacy Policy</h1>
            <p className="mt-2 text-sm text-slate-500">Last updated: May 7, 2026</p>
          </div>
          <Link href="/auth" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            Back to signup
          </Link>
        </div>

        <div className="prose prose-slate mt-6 max-w-none text-sm leading-7">
          <p>
            This Privacy Policy explains how HowMyLook collects, uses, stores, and shares information when you use the app.
          </p>

          <h2>1. Information We Collect</h2>
          <ul>
            <li>Account information such as your email address and login credentials</li>
            <li>Profile information such as username, display name, avatar, and bio if you provide them</li>
            <li>Content you upload, including outfit photos and occasion text</li>
            <li>Activity data such as ratings, follows, notifications, and moderation actions related to your account</li>
            <li>Technical data such as device, browser, app interaction, and log information needed to operate and secure the app</li>
          </ul>

          <h2>2. How We Use Information</h2>
          <ul>
            <li>To create and manage your account</li>
            <li>To display your profile and content within the app</li>
            <li>To power ratings, discovery, social features, moderation, and notifications</li>
            <li>To operate, maintain, secure, and improve the service</li>
            <li>To investigate abuse, enforce policies, and comply with legal obligations</li>
          </ul>

          <h2>3. How Your Content Is Visible</h2>
          <p>
            Content you post may be shown to other users of the app, including your outfit photos, display name, username, profile information,
            follower relationships, and visible taste signals such as yes/no activity where the product makes that public.
          </p>

          <h2>4. Moderation and Safety</h2>
          <p>
            We may review account and content data to detect abuse, enforce our rules, and keep the service aligned with its intended purpose.
          </p>

          <h2>5. Storage and Service Providers</h2>
          <p>
            HowMyLook uses third-party infrastructure and service providers to host the app, store data, authenticate users, and support related
            product functions. Your information may be processed by those providers on our behalf.
          </p>

          <h2>6. Data Retention</h2>
          <p>
            We keep information for as long as needed to operate the app, enforce our terms, resolve disputes, comply with legal obligations,
            and improve the product. Some posts may expire under product rules, while moderation and operational records may be kept longer.
          </p>

          <h2>7. Your Choices</h2>
          <ul>
            <li>You can choose what profile details and content to provide.</li>
            <li>You can stop using the app at any time.</li>
            <li>You may request deletion or support help through the operator contact you publish for the app.</li>
          </ul>

          <h2>8. Children</h2>
          <p>
            HowMyLook is not intended for children below the minimum age required to use the service where they live. If you believe a child has
            provided personal information in violation of this policy, contact the operator so the issue can be reviewed.
          </p>

          <h2>9. International Use</h2>
          <p>
            Your information may be processed in countries other than the one where you live, depending on hosting and service providers.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Continued use of the app after changes means the updated policy applies.
          </p>

          <h2>11. Contact</h2>
          <p>
            Before public launch, add a real support or privacy contact for HowMyLook here so users know where to send requests and questions.
          </p>
        </div>
      </div>
    </main>
  );
}
