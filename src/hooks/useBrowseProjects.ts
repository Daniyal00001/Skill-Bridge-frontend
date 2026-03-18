/**
 * useBrowseProjects.ts
 * location: frontend/src/hooks/useBrowseProjects.ts
 * ─────────────────────────────────────────────────────────────
 * WHY A CUSTOM HOOK:
 *   BrowseProjects.tsx component ko sirf UI pe focus karna chahiye.
 *   Saari data fetching, pagination, filter state yahan manage hogi.
 *   Kal ko agar React Query add karna ho — sirf yeh file badlegi.
 *
 * FEATURES:
 *   - Cursor-based infinite scroll (no page numbers)
 *   - Debounced search (400ms) — har keypress pe API call nahi
 *   - Prefetch next page jab user 80% scroll kare
 *   - Filter/sort change pe automatic refetch
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────
export interface ScoredProject {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType: string;
  deadline: string;
  createdAt: string;
  proposalCount: number;
  experienceLevel: string;
  size: string;
  locationPref?: string;
  isAiScoped?: boolean;
  score: number;
  matchPercentage: number;
  isExploration: boolean;
  category: { id: string; name: string; slug: string };
  skills: Array<{ skill: { id: string; name: string } }>;
  client: {
    id: string;
    fullName: string;
    company?: string;
    isVerified: boolean;
    averageRating?: number;
    totalHires?: number;
    hireRate?: number;
  };
  isSaved?: boolean;
  locationObj?: { name: string };
}

export interface BrowseSections {
  recommended: ScoredProject[];
  newProjects: ScoredProject[];
  lowCompetition: ScoredProject[];
  highBudget: ScoredProject[];
  similarToSaved: ScoredProject[];
}

export interface BrowseFilters {
  search: string;
  categorySlug: string;
  budgetMin: string;
  budgetMax: string;
  experienceLevel: string | null;
  size: string | null;
  clientVerified: boolean;
}

export type SortOption =
  | "best_match"
  | "newest"
  | "lowest_proposals"
  | "highest_budget"
  | "deadline_soon";

// ── Hook ──────────────────────────────────────────────────────
export function useBrowseProjects() {
  // ── Filter + sort state ──────────────────────────────────
  const [filters, setFilters] = useState<BrowseFilters>({
    search: "",
    categorySlug: "",
    budgetMin: "",
    budgetMax: "",
    experienceLevel: null,
    size: null,
    clientVerified: false,
  });
  const [sort, setSort] = useState<SortOption>("best_match");

  // ── Data state ───────────────────────────────────────────
  const [projects, setProjects] = useState<ScoredProject[]>([]);
  const [sections, setSections] = useState<BrowseSections | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // ── Cursor for infinite scroll ───────────────────────────
  // WHY ref not state: Cursor change should NOT trigger re-render
  // or re-fetch. It's just a pointer for "load more" calls.
  const cursorRef = useRef<string | undefined>(undefined);
  const searchTimerRef = useRef<NodeJS.Timeout>();

  // ── Build query params from filters ─────────────────────
  const buildParams = useCallback(
    (cursor?: string) => {
      const params = new URLSearchParams();
      params.set("sort", sort);
      if (cursor) params.set("cursor", cursor);
      if (filters.search) params.set("search", filters.search);
      if (filters.categorySlug) params.set("category", filters.categorySlug);
      if (filters.budgetMin) params.set("budgetMin", filters.budgetMin);
      if (filters.budgetMax) params.set("budgetMax", filters.budgetMax);
      if (filters.experienceLevel)
        params.set("experienceLevel", filters.experienceLevel);
      if (filters.size) params.set("size", filters.size);
      if (filters.clientVerified) params.set("clientVerified", "true");
      if (filters.clientVerified) params.set("clientVerified", "true");
      return params.toString();
    },
    [filters, sort]
  );

  // ── Initial / filter-change fetch ───────────────────────
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    cursorRef.current = undefined;
    try {
      const res = await api.get(`/browse/projects?${buildParams()}`);
      const projects = res.data.projects as ScoredProject[];
      setProjects(projects);
      setSections(res.data.sections);
      setTotal(res.data.total);
      setHasMore(res.data.hasMore);
      cursorRef.current = res.data.cursor;

      // Sync savedIds from backend results
      const newlySaved = new Set<string>();
      projects.forEach(p => { if (p.isSaved) newlySaved.add(p.id); });
      // Also check sections
      const sections = res.data.sections as BrowseSections;
      if (sections) {
        Object.values(sections).forEach((sectionProjects: ScoredProject[]) => {
          sectionProjects.forEach(p => { if (p.isSaved) newlySaved.add(p.id); });
        });
      }
      setSavedIds(newlySaved);
    } catch (err) {
      console.error("[Browse] Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  // ── Load more (infinite scroll) ──────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;
    setLoadingMore(true);
    try {
      const res = await api.get(
        `/browse/projects?${buildParams(cursorRef.current)}`
      );
      // APPEND to existing list — not replace
      const newProjects = res.data.projects as ScoredProject[];
      setProjects((prev) => [...prev, ...newProjects]);
      setHasMore(res.data.hasMore);
      cursorRef.current = res.data.cursor;

      // Sync savedIds from new projects
      setSavedIds((prev) => {
        const next = new Set(prev);
        newProjects.forEach(p => { if (p.isSaved) next.add(p.id); });
        return next;
      });
    } catch (err) {
      console.error("[Browse] Load more failed:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, buildParams]);

  // ── Debounced search: wait 400ms after typing stops ──────
  // WHY: Without debounce, every keystroke fires an API call.
  // With 400ms debounce, API is called ONCE after user pauses.
  useEffect(() => {
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      fetchProjects();
    }, 400);
    return () => clearTimeout(searchTimerRef.current);
  }, [fetchProjects]);

  // ── Filter helpers ────────────────────────────────────────
  const updateFilter = useCallback(
    <K extends keyof BrowseFilters>(key: K, value: BrowseFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      categorySlug: "",
      budgetMin: "",
      budgetMax: "",
      experienceLevel: null,
      size: null,
      clientVerified: false,
    });
    setSort("best_match");
  }, []);

  // ── Save / Unsave toggle ──────────────────────────────────
  const toggleSave = useCallback(
    async (projectId: string, categorySlug?: string) => {
      const isSaved = savedIds.has(projectId);

      // Optimistic update — UI updates instantly before API responds
      setSavedIds((prev) => {
        const next = new Set(prev);
        isSaved ? next.delete(projectId) : next.add(projectId);
        return next;
      });

      try {
        await api.post(`/browse/projects/${projectId}/save`);
      } catch {
        // Revert optimistic update on failure
        setSavedIds((prev) => {
          const next = new Set(prev);
          isSaved ? next.add(projectId) : next.delete(projectId);
          return next;
        });
      }
    },
    [savedIds]
  );

  // ── Track project view (fire and forget) ─────────────────
  const trackView = useCallback(
    (projectId: string) => {
      api
        .post(`/browse/projects/${projectId}/view`)
        .catch(() => {}); // silently ignore errors
    },
    []
  );

  // ── Track category click ──────────────────────────────────
  const trackCategory = useCallback((categorySlug: string) => {
    api.post("/track/category", { categorySlug }).catch(() => {});
  }, []);

  return {
    // Data
    projects,
    sections,
    total,
    loading,
    loadingMore,
    hasMore,
    savedIds,
    // Filters & sort
    filters,
    sort,
    updateFilter,
    setSort,
    resetFilters,
    // Actions
    loadMore,
    toggleSave,
    trackView,
    trackCategory,
  };
}