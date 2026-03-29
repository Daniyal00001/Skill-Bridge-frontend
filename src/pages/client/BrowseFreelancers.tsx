/**
 * BrowseFreelancers.tsx
 * location: frontend/src/pages/client/BrowseFreelancers.tsx
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutGrid,
  List,
  Filter,
  Search,
  Star,
  Zap,
  Users,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import {
  useBrowseFreelancers,
  FreelancerSortOption,
} from "@/hooks/useBrowseFreelancers";
import { FreelancerCard } from "@/components/browse-freelancers/FreelancerCard";
import { FreelancerFilterBar } from "@/components/browse-freelancers/FreelancerFilterBar";
import {
  SkeletonFreelancersGrid,
  SkeletonFreelancersList,
} from "@/components/browse-freelancers/SkeletonFreelancerCard";

const SORT_OPTIONS: { value: FreelancerSortOption; label: string }[] = [
  { value: "best_match", label: "Best Match" },
  { value: "top_rated", label: "Top Rated" },
  { value: "most_experienced", label: "Most Experienced" },
  { value: "lowest_rate", label: "Lowest Rate" },
  { value: "highest_rate", label: "Highest Rate" },
  { value: "recently_active", label: "Recently Active" },
];

export default function BrowseFreelancers() {
  const [view, setView] = useState<"grid" | "list">("grid");

  const {
    freelancers,
    sections,
    total,
    loading,
    loadingMore,
    hasMore,
    filters,
    sort,
    updateFilter,
    setSort,
    resetFilters,
    loadMore,
  } = useBrowseFreelancers();

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) loadMore();
    },
    [hasMore, loadingMore, loadMore],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersection]);

  return (
    <DashboardLayout>
      {/* Background gradient */}
      <div
        className="pointer-events-none fixed top-0 right-0 z-0"
        style={{
          width: 500,
          height: 500,
          borderRadius: "50%",
          transform: "translate(35%, -35%)",
          background:
            "radial-gradient(ellipse at 65% 30%, rgba(55,138,221,0.15) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Find Freelancers
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {loading
                ? "Finding best matches..."
                : `${total.toLocaleString()} freelancers ranked for you`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as FreelancerSortOption)}
            >
              <SelectTrigger className="h-9 bg-white border-blue-100 rounded-xl px-3 w-[175px] text-xs font-medium">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-blue-100">
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-xs"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Grid/List toggle */}
            <div className="flex p-1 bg-blue-50 rounded-xl border border-blue-100">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-lg transition-all",
                  view === "grid"
                    ? "bg-white shadow-sm text-blue-500"
                    : "text-slate-400",
                )}
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-lg transition-all",
                  view === "list"
                    ? "bg-white shadow-sm text-blue-500"
                    : "text-slate-400",
                )}
                onClick={() => setView("list")}
              >
                <List className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Mobile filter sheet */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl border-blue-100 bg-white"
                  >
                    <Filter className="w-3.5 h-3.5 text-blue-400" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] bg-white">
                  <div className="pt-6">
                    <FreelancerFilterBar
                      filters={filters}
                      onFilterChange={updateFilter}
                      onReset={resetFilters}
                      compact
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Filter bar desktop */}
        <div className="hidden md:block">
          <FreelancerFilterBar
            filters={filters}
            onFilterChange={updateFilter}
            onReset={resetFilters}
          />
        </div>

        {/* Loading */}
        {loading ? (
          view === "grid" ? (
            <SkeletonFreelancersGrid count={6} />
          ) : (
            <SkeletonFreelancersList count={5} />
          )
        ) : (
          <>
            {/* Sections — only when no active search */}
            {sections && !filters.search && !filters.skills.length && (
              <div className="space-y-8">
                {sections.topRated.length > 0 && (
                  <Section
                    title="Top Rated"
                    subtitle="Highest rated on the platform"
                    icon={<Star className="w-4 h-4 text-amber-500" />}
                  >
                    <ScrollRow>
                      {sections.topRated.map((f) => (
                        <div key={f.id} className="w-[300px] shrink-0">
                          <FreelancerCard freelancer={f} view="grid" />
                        </div>
                      ))}
                    </ScrollRow>
                  </Section>
                )}

                {sections.recentlyActive.length > 0 && (
                  <Section
                    title="Recently Active"
                    subtitle="Online in the last 7 days"
                    icon={<Zap className="w-4 h-4 text-emerald-500" />}
                  >
                    <ScrollRow>
                      {sections.recentlyActive.map((f) => (
                        <div key={f.id} className="w-[300px] shrink-0">
                          <FreelancerCard freelancer={f} view="grid" />
                        </div>
                      ))}
                    </ScrollRow>
                  </Section>
                )}

                {sections.newTalent.length > 0 && (
                  <Section
                    title="New Talent"
                    subtitle="Fresh faces — joined recently"
                    icon={<TrendingUp className="w-4 h-4 text-blue-500" />}
                  >
                    <ScrollRow>
                      {sections.newTalent.map((f) => (
                        <div key={f.id} className="w-[300px] shrink-0">
                          <FreelancerCard freelancer={f} view="grid" />
                        </div>
                      ))}
                    </ScrollRow>
                  </Section>
                )}

                {sections.highlyExperienced.length > 0 && (
                  <Section
                    title="Highly Experienced"
                    subtitle="5+ completed contracts"
                    icon={<Users className="w-4 h-4 text-violet-500" />}
                  >
                    <ScrollRow>
                      {sections.highlyExperienced.map((f) => (
                        <div key={f.id} className="w-[300px] shrink-0">
                          <FreelancerCard freelancer={f} view="grid" />
                        </div>
                      ))}
                    </ScrollRow>
                  </Section>
                )}

                {sections.perfectBudgetMatch.length > 0 && (
                  <Section
                    title="Budget Match"
                    subtitle="Rate fits your preferred budget"
                    icon={<DollarSign className="w-4 h-4 text-green-500" />}
                  >
                    <ScrollRow>
                      {sections.perfectBudgetMatch.map((f) => (
                        <div key={f.id} className="w-[300px] shrink-0">
                          <FreelancerCard freelancer={f} view="grid" />
                        </div>
                      ))}
                    </ScrollRow>
                  </Section>
                )}

                {/* Divider */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-px flex-1 bg-blue-50" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    All Freelancers
                  </span>
                  <div className="h-px flex-1 bg-blue-50" />
                </div>
              </div>
            )}

            {/* Main feed */}
            <div
              className={cn(
                "grid gap-4",
                view === "grid"
                  ? "md:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1",
              )}
            >
              <AnimatePresence mode="popLayout">
                {freelancers.map((f, idx) => (
                  <motion.div
                    key={f.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                  >
                    <FreelancerCard freelancer={f} view={view} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty state */}
            {freelancers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 bg-blue-50/40 rounded-2xl border border-dashed border-blue-100 text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-5 h-5 text-blue-300" />
                </div>
                <h3 className="text-base font-bold text-slate-700">
                  No freelancers found
                </h3>
                <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                  Try adjusting your filters or search keywords.
                </p>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="mt-5 rounded-lg text-xs font-bold border-blue-200 text-blue-500 hover:bg-blue-50"
                >
                  Clear filters
                </Button>
              </div>
            )}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-8" />

            {loadingMore && (
              <div className="flex justify-center py-6">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                  Loading more...
                </div>
              </div>
            )}

            {!hasMore && freelancers.length > 0 && (
              <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                You've seen all {total} freelancers
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Section wrapper ────────────────────────────────────────────────
const Section = ({
  title,
  icon,
  subtitle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-700">{title}</h2>
        {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

// ── Horizontal scroll row ──────────────────────────────────────────
const ScrollRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
    {children}
  </div>
);
