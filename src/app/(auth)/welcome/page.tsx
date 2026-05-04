import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { SessionStatusCard } from "@/components/session-status-card";
import { UsernameForm } from "@/components/username-form";

export default function WelcomePage() {
  return (
    <AuthCard eyebrow="Step 2" title="Choose your username">
      <div className="space-y-4">
        <SessionStatusCard />
        <UsernameForm />

        <Link href="/rate" className="block text-center text-sm font-medium text-pink-600">
          Continue to rating
        </Link>
      </div>
    </AuthCard>
  );
}
