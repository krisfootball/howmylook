import { AccessGateCard } from "@/components/access-gate-card";
import { MobileShell } from "@/components/mobile-shell";
import { SearchExploreClient } from "@/components/search-explore-client";

export default function SearchPage() {
  return (
    <MobileShell title="Search">
      <AccessGateCard areaLabel="Search">
        <SearchExploreClient />
      </AccessGateCard>
    </MobileShell>
  );
}
