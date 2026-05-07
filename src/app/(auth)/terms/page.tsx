import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff_0%,_#fff6fb_40%,_#f5edf8_100%)] px-4 py-6 text-slate-900">
      <div className="mx-auto w-full max-w-3xl rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_25px_80px_rgba(76,29,149,0.18)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pink-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">HowMyLook</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Terms of Service</h1>
            <p className="mt-2 text-sm text-slate-500">Last updated: May 7, 2026</p>
          </div>
          <Link href="/auth" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            Back to signup
          </Link>
        </div>

        <div className="prose prose-slate mt-6 max-w-none text-sm leading-7">
          <p>
            These Terms of Service govern your access to and use of HowMyLook, a fashion feedback app where users post outfit photos,
            rate looks, and interact with other users.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By creating an account, accessing, or using HowMyLook, you agree to these Terms. If you do not agree, do not use the app.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least 13 years old, or the minimum age required in your country to use online services like this. If you are under
            the age of legal majority where you live, you should use HowMyLook only with permission from a parent or legal guardian.
          </p>

          <h2>3. Your Account</h2>
          <ul>
            <li>You are responsible for the accuracy of the information you provide.</li>
            <li>You are responsible for keeping your login credentials secure.</li>
            <li>You are responsible for all activity that happens under your account.</li>
            <li>You may not impersonate another person or create an account for deceptive or abusive purposes.</li>
          </ul>

          <h2>4. What HowMyLook Is</h2>
          <p>
            HowMyLook is a social fashion feedback product designed for quick yes/no outfit reactions and related discovery features. It is not a
            professional styling, medical, mental health, or safety service.
          </p>

          <h2>5. Content You Post</h2>
          <p>
            You keep ownership of the content you submit, but you give HowMyLook a worldwide, non-exclusive, royalty-free license to host,
            store, reproduce, modify for technical display, and show your content for the purpose of operating, improving, and promoting the app.
          </p>
          <p>
            You represent that you have the rights needed to post the content you upload, including any photos, likenesses, and other material.
          </p>

          <h2>6. Prohibited Content and Conduct</h2>
          <p>You may not post, upload, share, or otherwise use HowMyLook to distribute:</p>
          <ul>
            <li>Nudity, sexually explicit content, or exploitative content</li>
            <li>Content involving minors in inappropriate, sexualized, or unsafe contexts</li>
            <li>Harassment, threats, hateful conduct, or bullying</li>
            <li>Graphic violence or shocking content</li>
            <li>Spam, scams, or deceptive promotions</li>
            <li>Content that infringes another person’s privacy, publicity, or intellectual property rights</li>
            <li>Non-outfit content that clearly does not fit the purpose of the app</li>
            <li>Anything unlawful or intended to harm people, systems, or the service</li>
          </ul>

          <h2>7. Moderation and Enforcement</h2>
          <p>
            We may review, hide, remove, restrict, or delete content or accounts at our discretion when content violates these Terms,
            our guidelines, applicable law, or the intended use of the app. We may do this with or without prior notice.
          </p>

          <h2>8. Feedback and Ratings</h2>
          <p>
            Ratings and opinions from other users are subjective. We do not guarantee the accuracy, fairness, usefulness, or tone of user feedback.
          </p>

          <h2>9. Privacy</h2>
          <p>
            Your use of HowMyLook is also governed by our Privacy Policy, which explains how we collect, use, and store information.
          </p>

          <h2>10. Termination</h2>
          <p>
            You may stop using the app at any time. We may suspend or terminate access to the app, or remove content, at any time if we believe
            you have violated these Terms, created risk for the service, or used the app in an abusive or unlawful way.
          </p>

          <h2>11. Disclaimer</h2>
          <p>
            HowMyLook is provided on an “as is” and “as available” basis without warranties of any kind, to the maximum extent allowed by law.
          </p>

          <h2>12. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, HowMyLook and its operators will not be liable for indirect, incidental, special,
            consequential, or punitive damages, or for any loss of data, reputation, profits, or business arising from your use of the app.
          </p>

          <h2>13. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the app after an update means you accept the revised Terms.
          </p>

          <h2>14. Contact</h2>
          <p>
            If you need to contact the operator of HowMyLook about these Terms, see the <Link href="/contact" className="font-semibold text-slate-900 underline">Contact & Support</Link> page and replace the placeholder contact details there before launch.
          </p>
        </div>
      </div>
    </main>
  );
}
