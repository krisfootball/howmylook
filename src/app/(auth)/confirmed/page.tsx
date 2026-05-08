import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { appConfig } from "@/lib/app-config";

export default function ConfirmedPage() {
  return (
    <AuthCard
      eyebrow={appConfig.name}
      title="Email confirmed"
      description="Your account is ready. You can sign in now."
    >
      <div className="space-y-4">
        <div className="rounded-[1.4rem] border border-emerald-100 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-900 shadow-sm">
          <p className="text-base font-semibold tracking-tight">You’re all set</p>
          <p className="mt-2 text-sm leading-6 text-emerald-900/80">
            Your email has been confirmed successfully. Continue to sign in and finish setting up your profile.
          </p>
        </div>

        <Link
          href="/auth"
          className="block w-full rounded-full bg-slate-950 px-5 py-3.5 text-center text-sm font-semibold text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
        >
          Sign in
        </Link>
      </div>
    </AuthCard>
  );
}
