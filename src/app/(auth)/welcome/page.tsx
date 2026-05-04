import { AuthCard } from "@/components/auth-card";
import { SessionStatusCard } from "@/components/session-status-card";
import { UsernameForm } from "@/components/username-form";

export default function WelcomePage() {
  return (
    <AuthCard
      eyebrow="Step 2"
      title="Choose your profile name"
      description="Pick the name people will see when they open your looks and profile."
    >
      <div className="space-y-4">
        <SessionStatusCard />
        <UsernameForm />
      </div>
    </AuthCard>
  );
}
