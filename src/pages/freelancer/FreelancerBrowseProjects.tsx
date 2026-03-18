/**
 * BrowseProjects.tsx
 * location: frontend/src/pages/freelancer/BrowseProjects.tsx
 * ─────────────────────────────────────────────────────────────
 * WHAT CHANGED vs old file:
 *   - All state/data logic moved to useBrowseProjects hook
 *   - Infinite scroll instead of pagination
 *   - Recommendation sections (Recommended, New, Low Competition etc)
 *   - Save/unsave with optimistic updates
 *   - Skeleton loading states
 *   - FilterBar is now a separate component
 *   - Score-based sorting (Best Match) added
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  TrendingUp,
  Zap,
  DollarSign,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/lib/api";

import { useBrowseProjects, SortOption } from "@/hooks/useBrowseProjects";
import { FilterBar } from "@/components/browse/FilterBar";
import { ProjectCardGrid } from "@/components/browse/ProjectCardGrid";
import { ProjectCardList } from "@/components/browse/ProjectCardList";
import { SkeletonGrid, SkeletonList } from "@/components/browse/SkeletonCard";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "best_match", label: "Best Match" },
  { value: "newest", label: "Newest First" },
  { value: "lowest_proposals", label: "Lowest Proposals" },
  { value: "highest_budget", label: "Highest Budget" },
  { value: "deadline_soon", label: "Deadline Soon" },
];

export default function FreelancerBrowseProjects() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [categories, setCategories] = useState<Category[]>([]);

  // ── Custom hook handles all data + state ──────────────────
  const {
    projects,
    sections,
    total,
    loading,
    loadingMore,
    hasMore,
    savedIds,
    filters,
    sort,
    updateFilter,
    setSort,
    resetFilters,
    loadMore,
    toggleSave,
    trackView,
    trackCategory,
  } = useBrowseProjects();

  // ── Fetch categories once ─────────────────────────────────
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data.categories ?? []))
      .catch(console.error);
  }, []);

  // ── Infinite scroll observer ──────────────────────────────
  // WHY IntersectionObserver: Fires when sentinel div enters viewport.
  // No scroll event listeners needed — performant and clean.
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        loadMore();
      }
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

  // ── Shared card props factory ─────────────────────────────
  const cardProps = (project: any) => ({
    project,
    isSaved: savedIds.has(project.id),
    onSave: toggleSave,
    onView: trackView,
  });

  return (
    <DashboardLayout>
      {/* Background gradients */}
      <div
        className="pointer-events-none fixed top-0 right-0 z-0"
        style={{
          width: 560,
          height: 560,
          borderRadius: "50%",
          transform: "translate(35%, -35%)",
          background:
            "radial-gradient(ellipse at 65% 30%, rgba(55,138,221,0.18) 0%, rgba(24,95,165,0.08) 45%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-10 py-10 space-y-8">
        {/* ── Header ───────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Project Marketplace
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {loading
                ? "Finding best matches..."
                : `${total.toLocaleString()} opportunities ranked for you`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as SortOption)}
            >
              <SelectTrigger className="h-9 bg-white border-blue-100 rounded-xl px-3 w-[165px] text-xs font-medium focus:ring-blue-200">
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

            {/* Grid / List toggle */}
            <div className="flex p-1 bg-blue-50 rounded-xl border border-blue-100">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-lg transition-all",
                  view === "grid"
                    ? "bg-white shadow-sm text-blue-500"
                    : "text-slate-400 hover:text-slate-600",
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
                    : "text-slate-400 hover:text-slate-600",
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
                <SheetContent
                  side="left"
                  className="w-[300px] border-r border-blue-100 bg-white"
                >
                  <div className="pt-6">
                    <FilterBar
                      filters={filters}
                      categories={categories}
                      onFilterChange={updateFilter}
                      onReset={resetFilters}
                      onCategoryTrack={trackCategory}
                      compact
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* ── Filter bar — desktop ──────────────────────── */}
        <div className="hidden md:block">
          <FilterBar
            filters={filters}
            categories={categories}
            onFilterChange={updateFilter}
            onReset={resetFilters}
            onCategoryTrack={trackCategory}
          />
        </div>

        {/* ── Loading state ─────────────────────────────── */}
        {loading ? (
          view === "grid" ? (
            <SkeletonGrid count={6} />
          ) : (
            <SkeletonList count={5} />
          )
        ) : (
          <>
            {/* ── Recommendation Sections ───────────────── */}
            {sections && !filters.search && (
              <div className="space-y-8">
                {/* Recommended for you */}
                {sections.recommended.length > 0 && (
                  <Section
                    title="Recommended for You"
                    icon={<TrendingUp className="w-4 h-4 text-blue-500" />}
                    subtitle="Based on your skills and history"
                  >
                    <ScrollRow>
                      {sections.recommended.map((p) => (
                        <ProjectCardGrid key={p.id} {...cardProps(p)} />
                      ))}
                    </ScrollRow>
                  </Section>
                )}

                {/* New projects */}
                {sections.newProjects.length > 0 && (
                  <Section
                    title="Just Posted"
                    icon={<Zap className="w-4 h-4 text-amber-500" />}
                    subtitle="Posted in the last 6 hours"
                  >
                    <ScrollRow>
                      {sections.newProjects.map((p) => (
                        <ProjectCardGrid key={p.id} {...cardProps(p)} />
                      ))}
                    </ScrollRow>
                  </Section>
                )}

                {/* Low competition */}
                {sections.lowCompetition.length > 0 && (
                  <Section
                    title="Low Competition"
                    icon={<Sparkles className="w-4 h-4 text-emerald-500" />}
                    subtitle="Under 5 proposals — apply now"
                  >
                    <ScrollRow>
                      {sections.lowCompetition.map((p) => (
                        <ProjectCardGrid key={p.id} {...cardProps(p)} />
                      ))}
                    </ScrollRow>
                  </Section>
                )}

                {/* High budget */}
                {sections.highBudget.length > 0 && (
                  <Section
                    title="High Budget"
                    icon={<DollarSign className="w-4 h-4 text-violet-500" />}
                    subtitle="Top paying projects right now"
                  >
                    <ScrollRow>
                      {sections.highBudget.map((p) => (
                        <ProjectCardGrid key={p.id} {...cardProps(p)} />
                      ))}
                    </ScrollRow>
                  </Section>
                )}

              </div>
            )}

            {/* ── Main Feed ─────────────────────────────── */}
            <div
              className={cn(
                "grid gap-6",
                view === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1",
              )}
            >
              <AnimatePresence mode="popLayout">
                {projects.map((project, idx) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.3) }}
                  >
                    {view === "grid" ? (
                      <ProjectCardGrid {...cardProps(project)} />
                    ) : (
                      <ProjectCardList {...cardProps(project)} />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* ── Empty state ───────────────────────────── */}
            {projects.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 bg-blue-50/40 rounded-2xl border border-dashed border-blue-100 text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-5 h-5 text-blue-300" />
                </div>
                <h3 className="text-base font-bold text-slate-700">
                  No results found
                </h3>
                <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                  Adjust your filters or search keywords to find what you're
                  looking for.
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

            {/* ── Load more sentinel ────────────────────── */}
            {/* IntersectionObserver watches this div. When it enters
                viewport (user scrolled to bottom), loadMore() fires. */}
            <div ref={sentinelRef} className="h-8" />

            {/* Loading more spinner */}
            {loadingMore && (
              <div className="flex justify-center py-6">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                  <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                  Loading more...
                </div>
              </div>
            )}

            {/* End of results */}
            {!hasMore && projects.length > 0 && (
              <div className="text-center py-8 text-xs text-slate-400 font-semibold">
                You've seen all {total} projects
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// ── Section wrapper for recommendation rows ────────────────────
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

// ── Grid row for sections ────────────────────────
const ScrollRow = ({ children }: { children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {children}
  </div>
);
