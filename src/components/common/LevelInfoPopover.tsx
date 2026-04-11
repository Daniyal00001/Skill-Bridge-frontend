/**
 * LevelInfoPopover.tsx
 *
 * Renders the level badge + an "i" button that opens a popover showing:
 *  - Current level & conditions met
 *  - What the user still needs to reach the NEXT level
 *
 * Works for both freelancers and clients.
 */

import { useState } from "react";
import { Info, CheckCircle2, Circle, ChevronRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LevelInfo,
  getFreelancerLevel,
  getClientLevel,
  FREELANCER_LEVELS,
  CLIENT_LEVELS,
} from "@/lib/levelUtils";
import { LevelBadge } from "./LevelBadge";

// ── Types ─────────────────────────────────────────────────────────

interface FreelancerStats {
  type: "freelancer";
  totalEarnings: number;
  clientsCount: number;  // use totalReviews as proxy
  projectsCount: number;
  averageRating: number;
}

interface ClientStats {
  type: "client";
  totalSpent: number;
  totalHires: number;
  totalOrders: number;
}

type LevelStats = FreelancerStats | ClientStats;

// ── Requirement row for the popover ───────────────────────────────

interface Requirement {
  label: string;
  current: number | string;
  target: number | string;
  met: boolean;
  format?: (v: number) => string;
}

// ── Freelancer level definitions ──────────────────────────────────

const FREELANCER_LEVEL_ORDER = ["entry", "beginner", "intermediate", "senior", "expert"] as const;

function getFreelancerRequirements(
  levelKey: string,
  earnings: number,
  clients: number,
  projects: number,
  rating: number,
): Requirement[] {
  const fmt$ = (v: number) => `$${v.toLocaleString()}`;

  switch (levelKey) {
    case "entry":
      return []; // no requirements — everyone starts here
    case "beginner":
      return [
        { label: "Total Earnings", current: earnings, target: 100, met: earnings >= 100, format: fmt$ },
        { label: "Clients / Reviews", current: clients, target: 3, met: clients >= 3 },
      ];
    case "intermediate":
      return [
        { label: "Total Earnings", current: earnings, target: 500, met: earnings >= 500, format: fmt$ },
        { label: "Clients / Reviews", current: clients, target: 5, met: clients >= 5 },
        { label: "Completed Projects", current: projects, target: 10, met: projects >= 10 },
      ];
    case "senior":
      return [
        { label: "Total Earnings", current: earnings, target: 2000, met: earnings >= 2000, format: fmt$ },
        { label: "Completed Projects", current: projects, target: 15, met: projects >= 15 },
        { label: "Average Rating", current: rating, target: 4.0, met: rating >= 4.0 },
      ];
    case "expert":
      return [
        { label: "Total Earnings", current: earnings, target: 5000, met: earnings >= 5000, format: fmt$ },
        { label: "Completed Projects", current: projects, target: 30, met: projects >= 30 },
        { label: "Average Rating", current: rating, target: 4.5, met: rating >= 4.5 },
      ];
    default:
      return [];
  }
}

// ── Client level definitions ───────────────────────────────────────

const CLIENT_LEVEL_ORDER = ["new_client", "active", "regular", "premium", "elite"] as const;

function getClientRequirements(
  levelKey: string,
  spent: number,
  hires: number,
  orders: number,
): Requirement[] {
  const fmt$ = (v: number) => `$${v.toLocaleString()}`;

  switch (levelKey) {
    case "new_client":
      return []; // default for everyone
    case "active":
      return [
        { label: "Total Spent", current: spent, target: 100, met: spent >= 100, format: fmt$ },
        { label: "Total Hires", current: hires, target: 3, met: hires >= 3 },
      ];
    case "regular":
      return [
        { label: "Total Spent", current: spent, target: 500, met: spent >= 500, format: fmt$ },
        { label: "Total Orders/Projects", current: orders, target: 10, met: orders >= 10 },
      ];
    case "premium":
      return [
        { label: "Total Spent", current: spent, target: 2000, met: spent >= 2000, format: fmt$ },
      ];
    case "elite":
      return [
        { label: "Total Spent", current: spent, target: 5000, met: spent >= 5000, format: fmt$ },
        { label: "Total Hires", current: hires, target: 20, met: hires >= 20 },
      ];
    default:
      return [];
  }
}

// ── Progress bar ───────────────────────────────────────────────────

const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-500", color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

// ── Main popover component ─────────────────────────────────────────

interface Props {
  stats: LevelStats;
  badgeSize?: "xs" | "sm" | "md";
  className?: string;
}

export function LevelInfoPopover({ stats, badgeSize = "sm", className }: Props) {
  const [open, setOpen] = useState(false);

  // Compute current level & next level
  let currentLevel: LevelInfo;
  let nextLevelKey: string | null = null;
  let nextLevel: LevelInfo | null = null;
  let currentReqs: Requirement[] = [];
  let nextReqs: Requirement[] = [];

  if (stats.type === "freelancer") {
    const { totalEarnings, clientsCount, projectsCount, averageRating } = stats;
    currentLevel = getFreelancerLevel({ totalEarnings, clientsCount, projectsCount, averageRating });

    const idx = FREELANCER_LEVEL_ORDER.indexOf(currentLevel.key as any);
    currentReqs = getFreelancerRequirements(
      currentLevel.key, totalEarnings, clientsCount, projectsCount, averageRating
    );

    if (idx < FREELANCER_LEVEL_ORDER.length - 1) {
      nextLevelKey = FREELANCER_LEVEL_ORDER[idx + 1];
      nextLevel = FREELANCER_LEVELS[nextLevelKey as keyof typeof FREELANCER_LEVELS];
      nextReqs = getFreelancerRequirements(
        nextLevelKey, totalEarnings, clientsCount, projectsCount, averageRating
      );
    }
  } else {
    const { totalSpent, totalHires, totalOrders } = stats;
    currentLevel = getClientLevel({ totalSpent, totalHires, totalOrders });

    const idx = CLIENT_LEVEL_ORDER.indexOf(currentLevel.key as any);
    currentReqs = getClientRequirements(currentLevel.key, totalSpent, totalHires, totalOrders);

    if (idx < CLIENT_LEVEL_ORDER.length - 1) {
      nextLevelKey = CLIENT_LEVEL_ORDER[idx + 1];
      nextLevel = CLIENT_LEVELS[nextLevelKey as keyof typeof CLIENT_LEVELS];
      nextReqs = getClientRequirements(nextLevelKey, totalSpent, totalHires, totalOrders);
    }
  }

  const isMaxLevel = !nextLevel;

  return (
    <div className={cn("relative inline-flex items-center gap-1", className)}>
      {/* Badge */}
      <LevelBadge level={currentLevel} size={badgeSize} />

      {/* Info button */}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center transition-all",
          "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
          open && "text-slate-600 bg-slate-100"
        )}
        title="Level details"
      >
        <Info className="w-3 h-3" />
      </button>

      {/* Popover */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            className={cn(
              "absolute z-50 top-full left-0 mt-2 w-72",
              "bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60",
              "text-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={cn("px-4 py-3 border-b border-slate-100 flex items-center gap-2", currentLevel.bg)}>
              <span className="text-lg">{currentLevel.emoji}</span>
              <div>
                <p className={cn("text-xs font-black uppercase tracking-widest", currentLevel.color)}>
                  {currentLevel.label} Level
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {isMaxLevel ? "🏆 Maximum level achieved!" : `Next: ${nextLevel?.label}`}
                </p>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Current level requirements (what they've met) */}
              {currentReqs.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    ✅ Current Level Achieved
                  </p>
                  <div className="space-y-2">
                    {currentReqs.map((req) => {
                      const fmt = req.format ?? ((v: number) => String(v));
                      const current = typeof req.current === "number" ? req.current : 0;
                      const target = typeof req.target === "number" ? req.target : 0;
                      return (
                        <div key={req.label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1 text-slate-600 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              {req.label}
                            </span>
                            <span className="font-bold text-emerald-600">
                              {fmt(current)} / {fmt(target)}
                            </span>
                          </div>
                          <ProgressBar value={current} max={target} color="bg-emerald-400" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentReqs.length === 0 && (
                <p className="text-xs text-slate-500 italic">
                  🟢 You're at Entry level — just getting started!
                </p>
              )}

              {/* Next level requirements */}
              {nextLevel && nextReqs.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className={cn("flex items-center gap-1 text-[10px] font-black uppercase tracking-widest", nextLevel.color)}>
                      <TrendingUp className="w-3 h-3" />
                      To reach {nextLevel.emoji} {nextLevel.label}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {nextReqs.map((req) => {
                      const fmt = req.format ?? ((v: number) => String(v));
                      const current = typeof req.current === "number" ? req.current : 0;
                      const target = typeof req.target === "number" ? req.target : 0;
                      const remaining = Math.max(0, target - current);
                      return (
                        <div key={req.label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1 font-medium text-slate-600">
                              {req.met
                                ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                : <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              }
                              {req.label}
                            </span>
                            <span className={cn("font-bold", req.met ? "text-emerald-600" : "text-slate-500")}>
                              {fmt(current)} / {fmt(target)}
                            </span>
                          </div>
                          <ProgressBar
                            value={current}
                            max={target}
                            color={req.met ? "bg-emerald-400" : nextLevel!.dot}
                          />
                          {!req.met && (
                            <p className="text-[10px] text-slate-400">
                              Need <span className="font-bold text-slate-600">{fmt(remaining)}</span> more
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Max level */}
              {isMaxLevel && (
                <div className={cn("rounded-xl p-3 text-center", currentLevel.bg, "border", currentLevel.border)}>
                  <p className="text-xs font-black">🏆 You're at the top!</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Keep maintaining your excellence.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
