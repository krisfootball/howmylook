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
          refreshKey={refreshKey}
          onEdit={() => {
            setShowEditor((current) => !current);
          }}
        />

        {showEditor ? (
          <div className="fixed inset-0 z-50 flex items-end bg-slate-950/45 p-3 sm:items-center sm:justify-center" onClick={() => setShowEditor(false)}>
            <div
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[2rem] bg-white p-1 shadow-[0_30px_100px_rgba(15,23,42,0.28)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 pb-2 pt-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">Edit profile</p>
                  <p className="mt-1 text-sm text-slate-500">Update your public identity and profile photo.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  Close
                </button>
              </div>
              <EditProfileForm
                onSaved={() => {
                  setRefreshKey((current) => current + 1);
                  setShowEditor(false);
                }}
              />
            </div>
          </div>
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
