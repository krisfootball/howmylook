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
    <MobileShell title="Profile" hideHeader>
      <div className="space-y-4">
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
            <ProfilePostsClient />
          </section>
        </AccessGateCard>
      </div>
    </MobileShell>
  );
}
