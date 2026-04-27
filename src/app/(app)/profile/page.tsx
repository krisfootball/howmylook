import { AccessGateCard } from "@/components/access-gate-card";
import { MobileShell } from "@/components/mobile-shell";
import { ProfileClient } from "@/components/profile-client";
import { ProfilePostsClient } from "@/components/profile-posts-client";

export default function ProfilePage() {
  return (
    <MobileShell
      title="Profile"
      subtitle="Your profile shows what you have posted, how you vote, and what you have rated yes or no over time."
    >
      <AccessGateCard areaLabel="Profile">
        <div className="space-y-5">
          <ProfileClient />

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Your posts</h2>
            </div>
            <ProfilePostsClient />
          </section>
        </div>
      </AccessGateCard>
    </MobileShell>
  );
}
