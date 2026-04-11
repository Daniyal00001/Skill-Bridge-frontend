/**
 * levelUtils.ts
 * Pure utility for computing freelancer and client level tiers.
 * No backend required — all data is already available from existing APIs.
 */

// ── Freelancer levels ──────────────────────────────────────────
export type FreelancerLevelKey =
  | "entry"
  | "beginner"
  | "intermediate"
  | "senior"
  | "expert";

export interface LevelInfo {
  key: string;
  label: string;
  emoji: string;
  color: string;          // Tailwind text color
  bg: string;             // Tailwind bg color
  border: string;         // Tailwind border color
  dot: string;            // Tailwind dot bg
}

export const FREELANCER_LEVELS: Record<FreelancerLevelKey, LevelInfo> = {
  entry: {
    key: "entry",
    label: "Entry",
    emoji: "🟢",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  beginner: {
    key: "beginner",
    label: "Beginner",
    emoji: "🔵",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  intermediate: {
    key: "intermediate",
    label: "Intermediate",
    emoji: "🟡",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    dot: "bg-yellow-400",
  },
  senior: {
    key: "senior",
    label: "Senior",
    emoji: "🟠",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-400",
  },
  expert: {
    key: "expert",
    label: "Expert",
    emoji: "🔴",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-400",
  },
};

/**
 * Compute the freelancer level based on:
 *  - totalEarnings  (number, in $)
 *  - clientsCount   (number of distinct clients / totalReviews)
 *  - projectsCount  (number of completed contracts / jobs)
 *  - averageRating  (0–5)
 */
export function getFreelancerLevel(params: {
  totalEarnings?: number | null;
  clientsCount?: number | null;
  projectsCount?: number | null;
  averageRating?: number | null;
}): LevelInfo {
  const earnings = params.totalEarnings ?? 0;
  const clients  = params.clientsCount  ?? 0;
  const projects = params.projectsCount ?? 0;
  const rating   = params.averageRating ?? 0;

  // Expert: $5000+ AND 30+ projects AND rating ≥ 4.5
  if (earnings >= 5000 && projects >= 30 && rating >= 4.5) {
    return FREELANCER_LEVELS.expert;
  }
  // Senior: $2000+ AND 15+ projects AND rating ≥ 4
  if (earnings >= 2000 && projects >= 15 && rating >= 4) {
    return FREELANCER_LEVELS.senior;
  }
  // Intermediate: $500+ AND 5+ clients AND 10+ projects
  if (earnings >= 500 && clients >= 5 && projects >= 10) {
    return FREELANCER_LEVELS.intermediate;
  }
  // Beginner: $100+ AND 3+ clients
  if (earnings >= 100 && clients >= 3) {
    return FREELANCER_LEVELS.beginner;
  }
  // Entry: default
  return FREELANCER_LEVELS.entry;
}

// ── Freelancer level filter options ───────────────────────────
export const FREELANCER_LEVEL_KEYS = Object.keys(FREELANCER_LEVELS) as FreelancerLevelKey[];

// ── Client levels ─────────────────────────────────────────────
export type ClientLevelKey =
  | "new_client"
  | "active"
  | "regular"
  | "premium"
  | "elite";

export const CLIENT_LEVELS: Record<ClientLevelKey, LevelInfo> = {
  new_client: {
    key: "new_client",
    label: "New Client",
    emoji: "🟢",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  active: {
    key: "active",
    label: "Active",
    emoji: "🔵",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  regular: {
    key: "regular",
    label: "Regular",
    emoji: "🟡",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    dot: "bg-yellow-400",
  },
  premium: {
    key: "premium",
    label: "Premium",
    emoji: "🟠",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-400",
  },
  elite: {
    key: "elite",
    label: "Elite",
    emoji: "🔴",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-400",
  },
};

/**
 * Compute the client level based on:
 *  - totalSpent   (number, in $)
 *  - totalHires   (number of projects with a contract / hired count)
 *  - totalOrders  (number of total projects / orders)
 */
export function getClientLevel(params: {
  totalSpent?: number | null;
  totalHires?: number | null;
  totalOrders?: number | null;
}): LevelInfo {
  const spent  = params.totalSpent  ?? 0;
  const hires  = params.totalHires  ?? 0;
  const orders = params.totalOrders ?? 0;

  // Elite: $5000+ AND 20+ hires
  if (spent >= 5000 && hires >= 20) {
    return CLIENT_LEVELS.elite;
  }
  // Premium: $2000+
  if (spent >= 2000) {
    return CLIENT_LEVELS.premium;
  }
  // Regular: $500+ AND 10+ orders
  if (spent >= 500 && orders >= 10) {
    return CLIENT_LEVELS.regular;
  }
  // Active: $100+ AND 3+ hires
  if (spent >= 100 && hires >= 3) {
    return CLIENT_LEVELS.active;
  }
  // New Client: default
  return CLIENT_LEVELS.new_client;
}
