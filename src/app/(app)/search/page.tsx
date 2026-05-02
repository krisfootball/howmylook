import { AccessGateCard } from "@/components/access-gate-card";
import { MobileShell } from "@/components/mobile-shell";
import { SearchExploreClient } from "@/components/search-explore-client";

export default function SearchPage() {
  return (
    <MobileShell
      title="Search"
      subtitle="Explore popular looks from across the app and discover what is getting the most yes votes."
    >
      <AccessGateCard areaLabel="Search and explore">
        <SearchExploreClient />
      </AccessGateCard>
    </MobileShell>
  );
}
