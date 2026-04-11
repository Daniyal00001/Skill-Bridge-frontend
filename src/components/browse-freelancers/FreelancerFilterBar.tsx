/**
 * FreelancerFilterBar.tsx
 * location: frontend/src/components/browse-freelancers/FreelancerFilterBar.tsx
 */

import { Search, BadgeCheck, Images } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FreelancerBrowseFilters } from "@/hooks/useBrowseFreelancers";
import { FREELANCER_LEVELS, FREELANCER_LEVEL_KEYS } from "@/lib/levelUtils";

interface Props {
  filters: FreelancerBrowseFilters;
  onFilterChange: <K extends keyof FreelancerBrowseFilters>(
    key: K,
    value: FreelancerBrowseFilters[K],
  ) => void;
  onReset: () => void;
  compact?: boolean;
}

const EXP_LEVELS = ["ENTRY", "MID", "SENIOR", "EXPERT"];
const AVAILABILITIES = ["AVAILABLE", "BUSY"];
const REGIONS = [
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Africa",
  "Oceania",
];
const RATINGS = ["4", "4.5", "3"];

export const FreelancerFilterBar = ({
  filters,
  onFilterChange,
  onReset,
  compact = false,
}: Props) => {
  const hasActive =
    filters.search ||
    filters.skills.length ||
    filters.experienceLevel ||
    filters.availability ||
    filters.hourlyRateMin ||
    filters.hourlyRateMax ||
    filters.location ||
    filters.region ||
    filters.minRating ||
    filters.hasPortfolio ||
    filters.isVerified ||
    filters.level;

  return (
    <div
      className={cn(
        "flex bg-white border border-blue-100 rounded-2xl shadow-sm shadow-blue-50",
        compact
          ? "flex-col gap-4 p-5"
          : "flex-wrap items-center gap-2.5 px-5 py-3",
      )}
    >
      {/* Search */}
      <div className="relative min-w-[180px] flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-300" />
        <Input
          placeholder="Search name, skills, bio..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="pl-8 h-8 text-xs bg-blue-50/50 border-blue-100 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-300 placeholder:text-slate-400"
        />
      </div>

      <Divider compact={compact} />

      {/* Experience Level */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
          Exp. Level
        </span>
        {EXP_LEVELS.map((level) => (
          <Chip
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

      {/* Platform Level */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
          Level
        </span>
        {FREELANCER_LEVEL_KEYS.map((key) => {
          const lvl = FREELANCER_LEVELS[key];
          return (
            <button
              key={key}
              onClick={() =>
                onFilterChange("level", filters.level === key ? null : key)
              }
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border",
                filters.level === key
                  ? `${lvl.bg} ${lvl.color} border-current`
                  : "bg-blue-50/60 border-blue-100 text-slate-500 hover:border-blue-300 hover:text-blue-600",
              )}
            >
              <span>{lvl.emoji}</span>
              {lvl.label}
            </button>
          );
        })}
      </div>

      <Divider compact={compact} />

      {/* Hourly Rate */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
          Rate/hr
        </span>
        <div className="flex items-center gap-1">
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
              $
            </span>
            <Input
              placeholder="Min"
              type="number"
              value={filters.hourlyRateMin}
              onChange={(e) => onFilterChange("hourlyRateMin", e.target.value)}
              className="pl-5 pr-2 h-8 w-24 text-xs bg-blue-50/50 border-blue-100 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-300"
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
              value={filters.hourlyRateMax}
              onChange={(e) => onFilterChange("hourlyRateMax", e.target.value)}
              className="pl-5 pr-2 h-8 w-24 text-xs bg-blue-50/50 border-blue-100 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-300"
            />
          </div>
        </div>
      </div>

      <Divider compact={compact} />

      {/* Region */}
      <Select
        value={filters.region || "Any"}
        onValueChange={(v) => onFilterChange("region", v === "Any" ? "" : v)}
      >
        <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs bg-blue-50/50 border-blue-100 rounded-lg focus:ring-1 focus:ring-blue-300">
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-blue-100">
          <SelectItem value="Any" className="text-xs">
            Any Region
          </SelectItem>
          {REGIONS.map((r) => (
            <SelectItem key={r} value={r} className="text-xs">
              {r}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Divider compact={compact} />

      {/* Min Rating */}
      <Select
        value={filters.minRating || "Any"}
        onValueChange={(v) => onFilterChange("minRating", v === "Any" ? "" : v)}
      >
        <SelectTrigger className="h-8 w-auto min-w-[110px] text-xs bg-blue-50/50 border-blue-100 rounded-lg">
          <SelectValue placeholder="Min Rating" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-blue-100">
          <SelectItem value="Any" className="text-xs">
            Any Rating
          </SelectItem>
          <SelectItem value="4.5" className="text-xs">
            ⭐ 4.5+
          </SelectItem>
          <SelectItem value="4" className="text-xs">
            ⭐ 4.0+
          </SelectItem>
          <SelectItem value="3" className="text-xs">
            ⭐ 3.0+
          </SelectItem>
        </SelectContent>
      </Select>



      <Divider compact={compact} />

      {/* Verified Filter */}
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <Chip
          label="Verified Only"
          icon={<BadgeCheck className={cn("w-3.5 h-3.5", filters.isVerified ? "text-white" : "text-blue-500")} />}
          active={filters.isVerified}
          onClick={() => onFilterChange("isVerified", !filters.isVerified)}
          activeColor="bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200"
        />
      </div>

      {/* Reset */}
      {hasActive && (
        <button
          onClick={onReset}
          className="ml-auto text-[10px] font-semibold text-blue-400 hover:text-blue-600 transition-colors whitespace-nowrap underline underline-offset-2"
        >
          Reset all
        </button>
      )}
    </div>
  );
};

const Divider = ({ compact }: { compact: boolean }) =>
  compact ? null : <div className="w-px h-6 bg-blue-100 hidden sm:block" />;

const Chip = ({
  label,
  active,
  onClick,
  icon,
  activeColor,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  activeColor?: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border",
      active
        ? (activeColor ?? "bg-blue-500 text-white border-blue-500")
        : "bg-blue-50/60 border-blue-100 text-slate-500 hover:border-blue-300 hover:text-blue-600",
    )}
  >
    {icon}
    {label}
  </button>
);
