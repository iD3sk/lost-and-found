import ReportCard from "@/components/ReportCard";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/PageHeader";
import { Bot } from "lucide-react";

export default function ExplorePage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 pb-28 pt-4 md:max-w-3xl">
      <Header />
      <h1 className="text-xl font-bold">Explore</h1>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <ReportCard
          id={1}
          title="Motor pink"
          location="Pacil Gedlam"
          type="lost"
        />
      </div>
      <BottomNav />
    </main>
  );
}