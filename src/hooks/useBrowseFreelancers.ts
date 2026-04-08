/**
 * useBrowseFreelancers.ts
 * location: frontend/src/hooks/useBrowseFreelancers.ts
 *
 * Custom hook — all data fetching, filters, infinite scroll for Browse Freelancers.
 * Mirrors useBrowseProjects.ts pattern but for client side.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────
export interface ScoredFreelancer {
  id: string;
  userId: string;
  fullName: string;
  bio?: string | null;
  tagline?: string | null;
  location?: string | null;
  region?: string | null;
  hourlyRate?: number | null;
  experienceLevel: "ENTRY" | "MID" | "SENIOR" | "EXPERT";
  availability: "AVAILABLE" | "BUSY" | "UNAVAILABLE";
  profileCompletion: number;
  averageRating?: number | null;
  totalReviews: number;
  completedContracts: number;
  lastLoginAt?: Date | string | null;
  score: number;
  matchPercentage: number;
  isExploration: boolean;
  scoreBreakdown: {
    skillMatch: number;
    rating: number;
    availability: number;
    budgetFit: number;
    successScore: number;
    activityScore: number;
    profileScore: number;
  };
  skills: Array<{
    skill: { id: string; name: string; category: string };
    proficiencyLevel: number;
  }>;
  portfolioItems: Array<{
    id: string;
    title: string;
    imageUrl?: string | null;
    techStack: string[];
  }>;
  user: {
    profileImage?: string | null;
    isIdVerified: boolean;
    isPaymentVerified: boolean;
  };
}

export interface FreelancerSections {
  topRated: ScoredFreelancer[];
  recentlyActive: ScoredFreelancer[];
  newTalent: ScoredFreelancer[];
  highlyExperienced: ScoredFreelancer[];
  perfectBudgetMatch: ScoredFreelancer[];
}

export interface FreelancerBrowseFilters {
  search: string;
  skills: string[];
  experienceLevel: string | null;
  availability: string | null;
  hourlyRateMin: string;
  hourlyRateMax: string;
  location: string;
  region: string;
  minRating: string;
  hasPortfolio: boolean;
  isVerified: boolean;
}

export type FreelancerSortOption =
  | "best_match"
  | "top_rated"
  | "most_experienced"
  | "lowest_rate"
  | "highest_rate"
  | "recently_active";

// ── Hook ──────────────────────────────────────────────────────────
export function useBrowseFreelancers() {
  const [filters, setFilters] = useState<FreelancerBrowseFilters>({
    search: "",
    skills: [],
    experienceLevel: null,
    availability: null,
    hourlyRateMin: "",
    hourlyRateMax: "",
    location: "",
    region: "",
    minRating: "",
    hasPortfolio: false,
    isVerified: false,
  });
  const [sort, setSort] = useState<FreelancerSortOption>("best_match");

  const [freelancers, setFreelancers] = useState<ScoredFreelancer[]>([]);
  const [sections, setSections] = useState<FreelancerSections | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const cursorRef = useRef<string | undefined>(undefined);
  const searchTimerRef = useRef<NodeJS.Timeout>();

  // ── Build query params ───────────────────────────────────────
  const buildParams = useCallback(
    (cursor?: string) => {
      const params = new URLSearchParams();
      params.set("sort", sort);
      if (cursor) params.set("cursor", cursor);
      if (filters.search) params.set("search", filters.search);
      if (filters.skills.length) params.set("skills", filters.skills.join(","));
      if (filters.experienceLevel)
        params.set("experienceLevel", filters.experienceLevel);
      if (filters.availability)
        params.set("availability", filters.availability);
      if (filters.hourlyRateMin)
        params.set("hourlyRateMin", filters.hourlyRateMin);
      if (filters.hourlyRateMax)
        params.set("hourlyRateMax", filters.hourlyRateMax);
      if (filters.location) params.set("location", filters.location);
      if (filters.region) params.set("region", filters.region);
      if (filters.minRating) params.set("minRating", filters.minRating);
      if (filters.hasPortfolio) params.set("hasPortfolio", "true");
      if (filters.isVerified) params.set("isIdVerified", "true");
      return params.toString();
    },
    [filters, sort],
  );

  // ── Fetch ────────────────────────────────────────────────────
  const fetchFreelancers = useCallback(async () => {
    setLoading(true);
    cursorRef.current = undefined;
    try {
      const res = await api.get(`/browse/freelancers?${buildParams()}`);
      setFreelancers(res.data.freelancers);
      setSections(res.data.sections);
      setTotal(res.data.total);
      setHasMore(res.data.hasMore);
      cursorRef.current = res.data.cursor;
    } catch (err) {
      console.error("[BrowseFreelancers] Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  // ── Load more ────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !cursorRef.current) return;
    setLoadingMore(true);
    try {
      const res = await api.get(
        `/browse/freelancers?${buildParams(cursorRef.current)}`,
      );
      setFreelancers((prev) => [...prev, ...res.data.freelancers]);
      setHasMore(res.data.hasMore);
      cursorRef.current = res.data.cursor;
    } catch (err) {
      console.error("[BrowseFreelancers] Load more failed:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, buildParams]);

  // ── Debounced fetch ──────────────────────────────────────────
  useEffect(() => {
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(fetchFreelancers, 400);
    return () => clearTimeout(searchTimerRef.current);
  }, [fetchFreelancers]);

  // ── Filter helpers ───────────────────────────────────────────
  const updateFilter = useCallback(
    <K extends keyof FreelancerBrowseFilters>(
      key: K,
      value: FreelancerBrowseFilters[K],
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const toggleSkill = useCallback((skill: string) => {
    setFilters((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      skills: [],
      experienceLevel: null,
      availability: null,
      hourlyRateMin: "",
      hourlyRateMax: "",
      location: "",
      region: "",
      minRating: "",
      hasPortfolio: false,
      isVerified: false,
    });
    setSort("best_match");
  }, []);

  return {
    freelancers,
    sections,
    total,
    loading,
    loadingMore,
    hasMore,
    filters,
    sort,
    updateFilter,
    toggleSkill,
    setSort,
    resetFilters,
    loadMore,
  };
}
