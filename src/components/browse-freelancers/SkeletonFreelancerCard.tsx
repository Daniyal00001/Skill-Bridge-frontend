/**
 * SkeletonFreelancerCard.tsx
 * location: frontend/src/components/browse-freelancers/SkeletonFreelancerCard.tsx
 */

import { cn } from "@/lib/utils";

const Shimmer = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse rounded-lg",
      className,
    )}
  />
);

export const SkeletonFreelancerGrid = () => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 h-[300px]">
    <div className="flex items-start justify-between">
      <Shimmer className="w-12 h-12 rounded-xl" />
      <Shimmer className="h-5 w-16" />
    </div>
    <Shimmer className="h-4 w-36" />
    <Shimmer className="h-3 w-48" />
    <div className="flex gap-1.5">
      <Shimmer className="h-5 w-14" />
      <Shimmer className="h-5 w-16" />
      <Shimmer className="h-5 w-12" />
    </div>
    <div className="flex gap-2">
      <Shimmer className="h-3 w-16" />
      <Shimmer className="h-3 w-12" />
    </div>
    <div className="flex gap-1.5 mt-auto">
      <Shimmer className="flex-1 h-10 rounded-lg" />
      <Shimmer className="flex-1 h-10 rounded-lg" />
    </div>
    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
      <Shimmer className="h-6 w-16" />
      <Shimmer className="h-8 w-8 rounded-xl" />
    </div>
  </div>
);

export const SkeletonFreelancerList = () => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5">
    <div className="flex items-center gap-5">
      <Shimmer className="w-14 h-14 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-4 w-16" />
          <Shimmer className="h-4 w-20" />
        </div>
        <Shimmer className="h-3 w-48" />
        <div className="flex gap-1.5">
          <Shimmer className="h-4 w-12" />
          <Shimmer className="h-4 w-14" />
          <Shimmer className="h-4 w-10" />
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="space-y-1 text-right">
          <Shimmer className="h-3 w-14 ml-auto" />
          <Shimmer className="h-6 w-16 ml-auto" />
        </div>
        <Shimmer className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  </div>
);

export const SkeletonFreelancersGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonFreelancerGrid key={i} />
    ))}
  </div>
);

export const SkeletonFreelancersList = ({ count = 5 }: { count?: number }) => (
  <div className="grid gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonFreelancerList key={i} />
    ))}
  </div>
);
