import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { AuthForm } from "@/components/auth-form";
import { appConfig } from "@/lib/app-config";

export default function AuthPage() {
  return (
    <AuthCard
      eyebrow={appConfig.name}
      title="Create your account"
      description="Sign up or sign in first. After that, choose your username and rate 5 looks before the rest of the app unlocks."
    >
      <div className="space-y-4">
        <AuthForm />

        <div className="rounded-[1.4rem] bg-slate-950 p-4 text-sm leading-6 text-white/80">
          <p className="font-semibold text-white">Current gated flow</p>
          <p className="mt-2">
            Account first → username second → rate 5 looks → unlock Home, Search, Profile, and posting.
          </p>
        </div>

        <Link href="/welcome" className="block text-center text-sm font-medium text-pink-600">
          Preview next step: choose username
        </Link>
      </div>
    </AuthCard>
  );
}
