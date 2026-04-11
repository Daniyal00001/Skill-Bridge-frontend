/**
 * LevelBadge.tsx
 * Reusable badge component that shows a freelancer or client level.
 *
 * Usage:
 *   <LevelBadge level={getFreelancerLevel({ totalEarnings, clientsCount, projectsCount, averageRating })} />
 *   <LevelBadge level={getClientLevel({ totalSpent, totalHires, totalOrders })} size="sm" />
 */

import { cn } from "@/lib/utils";
import { LevelInfo } from "@/lib/levelUtils";

interface Props {
  level: LevelInfo;
  /** "xs" | "sm" | "md" (default) | "lg" */
  size?: "xs" | "sm" | "md" | "lg";
  /** Show just the emoji dot without text */
  dotOnly?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  xs: "text-[9px] px-1.5 py-0.5 gap-1",
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
  lg: "text-sm px-3 py-1.5 gap-2",
};

export function LevelBadge({ level, size = "md", dotOnly = false, className }: Props) {
  if (dotOnly) {
    return (
      <span
        title={`${level.label} Level`}
        className={cn(
          "inline-block w-2.5 h-2.5 rounded-full shrink-0",
          level.dot,
          className
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold rounded-full border select-none",
        level.bg,
        level.color,
        level.border,
        SIZE_CLASSES[size],
        className
      )}
    >
      <span className="leading-none">{level.emoji}</span>
      <span className="uppercase tracking-wider font-black leading-none">
        {level.label}
      </span>
    </span>
  );
}

/** Tooltip-style variant for compact spaces */
export function LevelPill({
  level,
  className,
}: {
  level: LevelInfo;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest rounded-lg px-2 py-0.5 border",
        level.bg,
        level.color,
        level.border,
        className
      )}
    >
      {level.emoji} {level.label}
    </span>
  );
}
