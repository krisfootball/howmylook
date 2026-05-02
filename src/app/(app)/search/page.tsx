import { AccessGateCard } from "@/components/access-gate-card";
import { MobileShell } from "@/components/mobile-shell";
import { SearchExploreClient } from "@/components/search-explore-client";

export default function SearchPage() {
  return (
    <MobileShell
      title="Search"
      subtitle="Explore popular looks from across the app in a simple 3-column photo grid."
    >
      <AccessGateCard areaLabel="Search and explore">
        <SearchExploreClient />
      </AccessGateCard>
    </MobileShell>
  );
}
