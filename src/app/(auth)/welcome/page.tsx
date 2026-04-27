import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { SessionStatusCard } from "@/components/session-status-card";
import { UsernameForm } from "@/components/username-form";
import { appConfig } from "@/lib/app-config";

export default function WelcomePage() {
  return (
    <AuthCard
      eyebrow="Step 2"
      title="Choose your username"
      description="Before rating starts, every account picks a username. This becomes the public identity on posts and profile."
    >
      <div className="space-y-4">
        <SessionStatusCard />
        <UsernameForm />

        <div className="rounded-[1.4rem] bg-slate-950 p-4 text-sm leading-6 text-white/80">
          <p className="font-semibold text-white">What unlocks next</p>
          <p className="mt-2">
            After username setup, the app sends the user into the rating queue. They must rate {appConfig.unlockVoteCount} looks before any other section opens.
          </p>
        </div>

        <Link href="/rate" className="block text-center text-sm font-medium text-pink-600">
          Preview next step: rating queue
        </Link>
      </div>
    </AuthCard>
  );
}
