/**
 * FilterBar.tsx
 * location: frontend/src/components/browse/FilterBar.tsx
 * ─────────────────────────────────────────────────────────────
 * WHY SEPARATE COMPONENT:
 *   FilterBar desktop + mobile sheet dono mein use hoti hai.
 *   Ek component banao, do jagah use karo — no duplication.
 *   BrowseProjects.tsx mein sirf <FilterBar /> likhna hoga.
 * ─────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from "react";
import { Search, BadgeCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BrowseFilters } from "@/hooks/useBrowseProjects";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface FilterBarProps {
  filters: BrowseFilters;
  categories: Category[];
  onFilterChange: <K extends keyof BrowseFilters>(
    key: K,
    value: BrowseFilters[K],
  ) => void;
  onReset: () => void;
  onCategoryTrack: (slug: string) => void;
  compact?: boolean; // true = mobile sheet layout (vertical)
}

const EXP_LEVELS = ["ENTRY", "MID", "SENIOR", "EXPERT"];
const PROJECT_SIZES = ["SMALL", "MEDIUM", "LARGE"];

export const FilterBar = ({
  filters,
  categories,
  onFilterChange,
  onReset,
  onCategoryTrack,
  compact = false,
}: FilterBarProps) => {
  // ── Local state for budget to prevent focus loss/typing lag ──
  const [localMin, setLocalMin] = useState(filters.budgetMin);
  const [localMax, setLocalMax] = useState(filters.budgetMax);

  // Sync with global filters (e.g. on reset)
  useEffect(() => {
    setLocalMin(filters.budgetMin);
  }, [filters.budgetMin]);

  useEffect(() => {
    setLocalMax(filters.budgetMax);
  }, [filters.budgetMax]);

  const hasActiveFilters =
    filters.search ||
    filters.categorySlug ||
    filters.budgetMin ||
    filters.budgetMax ||
    filters.experienceLevel ||
    filters.size ||
    filters.clientVerified;

  return (
    <div
      className={cn(
        "flex bg-card border border-border rounded-2xl relative overflow-hidden",
        compact
          ? "flex-col gap-5 p-5"
          : "flex-wrap items-center gap-2.5 px-5 py-3",
        "shadow-sm shadow-primary/5",
      )}
    >
      {/* ── Search ─────────────────────────────────────── */}
      <div className="relative min-w-[180px] flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
        <Input
          placeholder="Search skills or title..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="pl-8 h-8 text-xs bg-muted/50 border-border rounded-lg focus-visible:ring-1 focus-visible:ring-primary/20 placeholder:text-muted-foreground/50"
        />
      </div>

      <Divider compact={compact} />

      {/* ── Category ───────────────────────────────────── */}
      <Select
        value={filters.categorySlug || "All"}
        onValueChange={(val) => {
          const slug = val === "All" ? "" : val;
          onFilterChange("categorySlug", slug);
          if (slug) onCategoryTrack(slug);
        }}
      >
        <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs bg-muted/50 border-border rounded-lg focus:ring-1 focus:ring-primary/20 text-foreground">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-border">
          <SelectItem value="All" className="text-xs">
            All Categories
          </SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.slug} className="text-xs">
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Divider compact={compact} />

      {/* ── Budget ─────────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wide whitespace-nowrap">
          Budget
        </span>
        <div className="flex items-center gap-1">
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50">
              $
            </span>
            <Input
              placeholder="Min"
              type="number"
              value={localMin}
              onChange={(e) => {
                setLocalMin(e.target.value);
                onFilterChange("budgetMin", e.target.value);
              }}
              className="pl-5 h-8 w-20 text-xs bg-muted/50 border-border rounded-lg focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
            />
          </div>
          <span className="text-muted-foreground/30 text-xs">—</span>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50">
              $
            </span>
            <Input
              placeholder="Max"
              type="number"
              value={localMax}
              onChange={(e) => {
                setLocalMax(e.target.value);
                onFilterChange("budgetMax", e.target.value);
              }}
              className="pl-5 h-8 w-20 text-xs bg-muted/50 border-border rounded-lg focus-visible:ring-1 focus-visible:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </div>

      <Divider compact={compact} />

      {/* ── Experience chips ───────────────────────────── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wide whitespace-nowrap">
          Exp
        </span>
        {EXP_LEVELS.map((level) => (
          <ChipButton
            key={level}
            label={level.charAt(0) + level.slice(1).toLowerCase()}
            active={filters.experienceLevel === level}
            onClick={() =>
              onFilterChange(
                "experienceLevel",
                filters.experienceLevel === level ? null : level,
              )
            }
          />
        ))}
      </div>

      <Divider compact={compact} />

      {/* ── Size chips ─────────────────────────────────── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wide whitespace-nowrap">
          Size
        </span>
        {PROJECT_SIZES.map((size) => (
          <ChipButton
            key={size}
            label={size.charAt(0) + size.slice(1).toLowerCase()}
            active={filters.size === size}
            onClick={() =>
              onFilterChange("size", filters.size === size ? null : size)
            }
          />
        ))}
      </div>

      <Divider compact={compact} />

      {/* ── Toggle chips ───────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        <ChipButton
          label="Verified Client"
          icon={<BadgeCheck className="w-3 h-3" />}
          active={filters.clientVerified}
          onClick={() =>
            onFilterChange("clientVerified", !filters.clientVerified)
          }
        />
      </div>

      {/* ── Reset ──────────────────────────────────────── */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="ml-auto text-[10px] font-semibold text-primary/60 hover:text-primary transition-colors whitespace-nowrap px-1 underline underline-offset-2"
        >
          Reset all
        </button>
      )}
    </div>
  );
};

// ── Small reusable helpers ─────────────────────────────────────

const Divider = ({ compact }: { compact: boolean }) =>
  compact ? null : <div className="w-px h-6 bg-border hidden sm:block" />;

const ChipButton = ({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border",
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-muted/50 border-border text-muted-foreground hover:border-primary/30 hover:text-primary",
    )}
  >
    {icon}
    {label}
  </button>
);
