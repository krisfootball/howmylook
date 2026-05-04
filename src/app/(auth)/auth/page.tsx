import { AuthCard } from "@/components/auth-card";
import { AuthForm } from "@/components/auth-form";
import { appConfig } from "@/lib/app-config";

export default function AuthPage() {
  return (
    <AuthCard
      eyebrow={appConfig.name}
      title="Get outfit feedback fast"
      description="Create your account or sign in to start rating looks and unlock the full app."
    >
      <AuthForm />
    </AuthCard>
  );
}
