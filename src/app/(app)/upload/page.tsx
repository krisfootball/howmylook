import { AccessGateCard } from "@/components/access-gate-card";
import { MobileShell } from "@/components/mobile-shell";
import { UploadForm } from "@/components/upload-form";

export default function UploadPage() {
  return (
    <MobileShell title="Create post" hideHeader>
      <AccessGateCard areaLabel="Post">
        <UploadForm />
      </AccessGateCard>
    </MobileShell>
  );
}
