"use client";

import { useState } from "react";
import { AccessGateCard } from "@/components/access-gate-card";
import { EditProfileForm } from "@/components/edit-profile-form";
import { MobileShell } from "@/components/mobile-shell";
import { ProfileClient } from "@/components/profile-client";
import { ProfilePostsClient } from "@/components/profile-posts-client";

export default function ProfilePage() {
  const [showEditor, setShowEditor] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <MobileShell
      title="Profile"
      subtitle="Your profile shows what you have posted, who you follow, and the kinds of looks you tend to vote yes or no on over time."
    >
      <div className="space-y-5">
        <ProfileClient
          onEdit={() => {
            setShowEditor((current) => !current);
          }}
        />

        {showEditor ? (
          <EditProfileForm
            onSaved={() => {
              setRefreshKey((current) => current + 1);
              setShowEditor(false);
            }}
          />
        ) : null}

        <AccessGateCard areaLabel="Your posts">
          <section key={refreshKey}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">Your posts</h2>
            </div>
            <ProfilePostsClient />
          </section>
        </AccessGateCard>
      </div>
    </MobileShell>
  );
}
