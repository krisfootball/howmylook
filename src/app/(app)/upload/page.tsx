import { AccessGateCard } from "@/components/access-gate-card";
import { MobileShell } from "@/components/mobile-shell";
import { UploadForm } from "@/components/upload-form";

export default function UploadPage() {
  return (
    <MobileShell
      title="Create post"
      subtitle="Add 1 to 5 photos per post. Keep posting quick, but give people enough context to rate the full look."
    >
      <AccessGateCard areaLabel="Posting">
        <div className="space-y-4">
          <UploadForm />

          <section className="rounded-[1.7rem] border border-pink-100 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Post settings for MVP</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>• 1 to 5 photos per post</li>
              <li>• yes/no counts visible to everyone</li>
              <li>• who voted stays private</li>
              <li>• comments disabled in v1</li>
            </ul>
          </section>
        </div>
      </AccessGateCard>
    </MobileShell>
  );
}
