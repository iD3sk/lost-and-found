import PageHeader from "@/components/PageHeader";
import ExploreView from "@/components/ExploreView";
import { REPORTS } from "@/lib/mock-data";

export default function ExplorePage() {
  // Tanpa backHref: navigasi pakai BottomNav (dipasang sekali di layout).
  return (
    <>
      <PageHeader title="Explore" />
      <ExploreView reports={REPORTS} />
    </>
  );
}