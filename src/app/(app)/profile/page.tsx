import { AccessGateCard } from "@/components/access-gate-card";
import { MobileShell } from "@/components/mobile-shell";
import { ProfileClient } from "@/components/profile-client";
import { ProfilePostsClient } from "@/components/profile-posts-client";
import { ProfileRetentionNote } from "@/components/profile-retention-note";

export default function ProfilePage() {
  return (
    <MobileShell
      title="Profile"
      subtitle="Your profile shows what you have posted, who you follow, and the kinds of looks you tend to vote yes or no on over time."
    >
      <AccessGateCard areaLabel="Profile">
        <div className="space-y-5">
          <ProfileClient />

          <ProfileRetentionNote />

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
