/**
 * SkeletonCard.tsx
 * location: frontend/src/components/browse/SkeletonCard.tsx
 * ─────────────────────────────────────────────────────────────
 * WHY: Jab projects load ho rahe hain, blank screen ya spinner
 * dono bad UX hain. Skeleton cards exact card shape dikhate hain
 * taake user ko pata ho content kahan aayega — feels faster.
 * ─────────────────────────────────────────────────────────────
 */

import { cn } from "@/lib/utils";

// Reusable shimmer block
const Shimmer = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse rounded-lg",
      className,
    )}
  />
);

export const SkeletonCardGrid = () => (
  <div className="bg-white border border-blue-50 rounded-2xl p-5 flex flex-col gap-4 h-[280px]">
    {/* Badge + match */}
    <div className="flex items-center justify-between">
      <Shimmer className="h-5 w-24" />
      <Shimmer className="h-5 w-16" />
    </div>
    {/* Title */}
    <div className="space-y-2">
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-3/4" />
    </div>
    {/* Description */}
    <div className="space-y-1.5">
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-5/6" />
    </div>
    {/* Skills */}
    <div className="flex gap-1.5">
      <Shimmer className="h-5 w-14" />
      <Shimmer className="h-5 w-16" />
      <Shimmer className="h-5 w-12" />
    </div>
    {/* Footer */}
    <div className="flex items-center justify-between pt-3 mt-auto border-t border-slate-50">
      <div className="space-y-1">
        <Shimmer className="h-3 w-10" />
        <Shimmer className="h-6 w-20" />
      </div>
      <Shimmer className="h-8 w-8 rounded-xl" />
    </div>
  </div>
);

export const SkeletonCardList = () => (
  <div className="bg-white border border-blue-50 rounded-2xl p-5">
    <div className="flex flex-col md:flex-row md:items-center gap-5">
      <div className="flex-1 space-y-3">
        <div className="flex gap-2">
          <Shimmer className="h-5 w-20" />
          <Shimmer className="h-5 w-14" />
          <Shimmer className="h-5 w-24" />
        </div>
        <Shimmer className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Shimmer className="h-3 w-12" />
          <Shimmer className="h-3 w-14" />
          <Shimmer className="h-3 w-10" />
        </div>
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <div className="space-y-1.5 text-right">
          <Shimmer className="h-3 w-16 ml-auto" />
          <Shimmer className="h-7 w-20 ml-auto" />
          <Shimmer className="h-3 w-14 ml-auto" />
        </div>
        <Shimmer className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  </div>
);

// Grid of skeleton cards for initial load
export const SkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCardGrid key={i} />
    ))}
  </div>
);

export const SkeletonList = ({ count = 5 }: { count?: number }) => (
  <div className="grid gap-4 grid-cols-1">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCardList key={i} />
    ))}
  </div>
);
