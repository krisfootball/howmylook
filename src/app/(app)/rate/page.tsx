import { MobileShell } from "@/components/mobile-shell";
import { RateLookClient } from "@/components/rate-look-client";

export default function RatePage() {
  return (
    <MobileShell title="Home" hideHeader>
      <RateLookClient initialRatingsCompleted={0} />
    </MobileShell>
  );
}
