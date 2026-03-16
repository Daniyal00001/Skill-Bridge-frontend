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

import { Search, Sparkles, BadgeCheck } from "lucide-react";
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
  const hasActiveFilters =
    filters.search ||
    filters.categorySlug ||
    filters.budgetMin ||
    filters.budgetMax ||
    filters.experienceLevel ||
    filters.size ||
    filters.clientVerified ||
    filters.isAiScoped;

  return (
    <div
      className={cn(
        "flex bg-white border border-blue-100 rounded-2xl relative overflow-hidden",
        compact
          ? "flex-col gap-5 p-5"
          : "flex-wrap items-center gap-2.5 px-5 py-3",
        "shadow-sm shadow-blue-50",
      )}
    >
      {/* ── Search ─────────────────────────────────────── */}
      <div className="relative min-w-[180px] flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-300" />
        <Input
          placeholder="Search skills or title..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="pl-8 h-8 text-xs bg-blue-50/50 border-blue-100 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-300 placeholder:text-slate-400"
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
        <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs bg-blue-50/50 border-blue-100 rounded-lg focus:ring-1 focus:ring-blue-300">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-blue-100">
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
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
          Budget
        </span>
        <div className="flex items-center gap-1">
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
              $
            </span>
            <Input
              placeholder="Min"
              type="number"
              value={filters.budgetMin}
              onChange={(e) => onFilterChange("budgetMin", e.target.value)}
              className="pl-5 h-8 w-16 text-xs bg-blue-50/50 border-blue-100 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-300"
            />
          </div>
          <span className="text-slate-300 text-xs">—</span>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
              $
            </span>
            <Input
              placeholder="Max"
              type="number"
              value={filters.budgetMax}
              onChange={(e) => onFilterChange("budgetMax", e.target.value)}
              className="pl-5 h-8 w-16 text-xs bg-blue-50/50 border-blue-100 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-300"
            />
          </div>
        </div>
      </div>

      <Divider compact={compact} />

      {/* ── Experience chips ───────────────────────────── */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
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
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
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
          label="Verified"
          icon={<BadgeCheck className="w-3 h-3" />}
          active={filters.clientVerified}
          onClick={() =>
            onFilterChange("clientVerified", !filters.clientVerified)
          }
        />
        <ChipButton
          label="AI Scoped"
          icon={<Sparkles className="w-3 h-3" />}
          active={filters.isAiScoped}
          onClick={() => onFilterChange("isAiScoped", !filters.isAiScoped)}
        />
      </div>

      {/* ── Reset ──────────────────────────────────────── */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="ml-auto text-[10px] font-semibold text-blue-400 hover:text-blue-600 transition-colors whitespace-nowrap px-1 underline underline-offset-2"
        >
          Reset all
        </button>
      )}
    </div>
  );
};

// ── Small reusable helpers ─────────────────────────────────────

const Divider = ({ compact }: { compact: boolean }) =>
  compact ? null : <div className="w-px h-6 bg-blue-100 hidden sm:block" />;

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
        ? "bg-blue-500 text-white border-blue-500"
        : "bg-blue-50/60 border-blue-100 text-slate-500 hover:border-blue-300 hover:text-blue-600",
    )}
  >
    {icon}
    {label}
  </button>
);
