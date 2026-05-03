import Link from "next/link";
import { AuthCard } from "@/components/auth-card";
import { AuthForm } from "@/components/auth-form";
import { appConfig } from "@/lib/app-config";

export default function AuthPage() {
  return (
    <AuthCard eyebrow={appConfig.name} title="Create your account">
      <div className="space-y-4">
        <AuthForm />

        <Link href="/welcome" className="block text-center text-sm font-medium text-pink-600">
          Choose username
        </Link>
      </div>
    </AuthCard>
  );
}
