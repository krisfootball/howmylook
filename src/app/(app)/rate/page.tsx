import { MobileShell } from "@/components/mobile-shell";
import { RateLookClient } from "@/components/rate-look-client";
import { SessionStatusCard } from "@/components/session-status-card";
import { appConfig } from "@/lib/app-config";

export default function RatePage() {
  return (
    <MobileShell
      title="Rate looks"
      subtitle={appConfig.onboardingDescription}
    >
      <div className="space-y-4">
        <SessionStatusCard />
        <RateLookClient initialRatingsCompleted={0} />

        <div className="grid grid-cols-3 gap-3 text-center text-xs text-slate-500">
          <div className="rounded-2xl bg-slate-50 px-3 py-3">
            <p className="font-semibold text-slate-900">Queue</p>
            <p className="mt-1">Fair rotation</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3 py-3">
            <p className="font-semibold text-slate-900">Votes</p>
            <p className="mt-1">Private, counts public</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3 py-3">
            <p className="font-semibold text-slate-900">Format</p>
            <p className="mt-1">One photo per post</p>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
