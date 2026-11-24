import PageHeader from "@/components/PageHeader";
import ExploreView from "@/components/ExploreView";
import BottomNav from "@/components/BottomNav";
import { REPORTS } from "@/lib/mock-data";

export default function ExplorePage() {
  return (
    <>
      <PageHeader title="Explore" backHref="/home" />
      <ExploreView reports={REPORTS} />
      <BottomNav />
    </>
  );
}