"use client";

import { useMemo, useState } from "react";
import { Filter, Search, SearchX } from "lucide-react";
import ReportCard from "@/components/ReportCard";
import {
  CATEGORIES,
  LOCATIONS,
  type Report,
  type ReportType,
} from "@/lib/mock-data";

const fieldClass =
  "w-full rounded-full border-4 border-border-soft bg-background px-4 py-2 focus:border-primary focus:outline-none";

export default function ExploreView({ reports }: { reports: Report[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ReportType | null>(null);
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter di sisi client untuk mock data.
  // Nanti kirim query/type/category/locationId sebagai query param ke GET /reports.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter(
      (r) =>
        (!q || r.itemName.toLowerCase().includes(q)) &&
        (!type || r.type === type) &&
        (!category || r.category === category) &&
        (!location || r.locations.includes(location)),
    );
  }, [reports, query, type, category, location]);

  const hasAdvanced = Boolean(category || location);

  function toggleType(t: ReportType) {
    setType((current) => (current === t ? null : t));
  }

  function resetAll() {
    setQuery("");
    setType(null);
    setCategory("");
    setLocation("");
  }

  const chip = (t: ReportType, label: string) => (
    <button
      type="button"
      aria-pressed={type === t}
      onClick={() => toggleType(t)}
      className={`min-h-9 rounded-full px-4 text-base font-bold transition-colors ${
        type === t
          ? "bg-primary text-primary-foreground"
          : "bg-chip-inactive text-foreground/50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-28 pt-4 md:max-w-3xl">
      {/* Search bar */}
      <div className="relative">
        <Search
          size={20}
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search item name..."
          aria-label="Cari nama barang"
          className="w-full rounded-full border-4 border-border-soft bg-card py-2.5 pl-11 pr-4 placeholder:text-placeholder focus:border-primary focus:outline-none"
        />
      </div>

      {/* Ikon filter + chip Lost / Found */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          aria-label="Filter kategori dan lokasi"
          aria-expanded={showFilters}
          onClick={() => setShowFilters((s) => !s)}
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-primary"
        >
          <Filter size={26} aria-hidden="true" />
          {hasAdvanced && (
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-status-lost" />
          )}
        </button>
        {chip("lost", "Lost Item")}
        {chip("found", "Found Item")}
      </div>

      {/* Panel filter kategori & lokasi */}
      {showFilters && (
        <div className="mt-3 flex flex-col gap-3 rounded-3xl bg-card p-4 shadow-md">
          <div>
            <label htmlFor="f-category" className="mb-1 block text-sm font-bold">
              Category
            </label>
            <select
              id="f-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={fieldClass}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="f-location" className="mb-1 block text-sm font-bold">
              Location
            </label>
            <select
              id="f-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={fieldClass}
            >
              <option value="">All locations</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <p className="mt-4 text-sm text-muted" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "report" : "reports"}
      </p>

      {filtered.length > 0 ? (
        <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
          {filtered.map((r) => (
            <ReportCard report={r} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
          <SearchX size={48} aria-hidden="true" className="text-muted" />
          <p className="text-lg font-bold">No reports found</p>
          <p className="text-sm text-muted">Try a different keyword or filter.</p>
          <button
            type="button"
            onClick={resetAll}
            className="min-h-11 rounded-full bg-primary px-6 font-bold text-primary-foreground"
          >
            Reset filters
          </button>
        </div>
      )}
    </main>
  );
}