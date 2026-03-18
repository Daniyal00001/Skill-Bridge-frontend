/**
 * ProjectCardGrid.tsx
 * location: frontend/src/components/browse/ProjectCardGrid.tsx
 * ─────────────────────────────────────────────────────────────
 * WHY SEPARATE FILE:
 *   Grid aur List cards ka layout alag hai lekin data same.
 *   Alag files mein rakhne se dono independently edit ho sakti hain.
 *
 * NEW vs OLD card:
 *   + Save/bookmark button (optimistic update)
 *   + Match percentage badge (from scoring engine)
 *   + Client verified badge
 *   + AI Scoped badge
 *   + Proposal count
 *   + Client hire rate
 *   + onClick tracking
 * ─────────────────────────────────────────────────────────────
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  MapPin,
  Users,
  Sparkles,
  BadgeCheck,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScoredProject } from "@/hooks/useBrowseProjects";
import { formatDistanceToNow } from "date-fns";

interface Props {
  project: ScoredProject;
  isSaved: boolean;
  onSave: (projectId: string, categorySlug?: string) => void;
  onView: (projectId: string, categorySlug?: string) => void;
}

export const ProjectCardGrid = ({
  project,
  isSaved,
  onSave,
  onView,
}: Props) => {
  const skillNames = (project.skills ?? []).map(
    (s: any) => s.skill?.name ?? s.name ?? s,
  );

  return (
    <Card className="h-full bg-white border border-blue-100 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/60 transition-all duration-300 rounded-2xl overflow-hidden flex flex-col group relative">
      {/* ── AI Scoped ribbon ──────────────────────────── */}
      {project.isAiScoped && (
        <div className="absolute top-0 right-0">
          <div className="bg-violet-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-bl-xl flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            AI Scoped
          </div>
        </div>
      )}

      <CardHeader className="p-5 pb-0">
        <div className="flex items-start justify-between mb-3 pr-16">
          <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] font-semibold py-0.5 px-2.5 rounded-lg">
            {project.category?.name || "Uncategorized"}
          </Badge>

          {/* Match score */}
          {project.matchPercentage > 0 && (
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-lg border",
                project.matchPercentage >= 70
                  ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                  : project.matchPercentage >= 40
                    ? "text-amber-600 bg-amber-50 border-amber-100"
                    : "text-slate-500 bg-slate-50 border-slate-100",
              )}
            >
              {project.matchPercentage}% Match
            </span>
          )}
        </div>

        {/* Title */}
        <Link
          to={`/freelancer/projects/${project.id}`}
          onClick={() => onView(project.id, project.category?.slug)}
        >
          <h3 className="text-sm font-bold leading-snug line-clamp-2 text-slate-800 hover:text-blue-500 transition-colors">
            {project.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="p-5 pt-3 flex-1 flex flex-col gap-3">
        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {skillNames.slice(0, 4).map((name: string) => (
            <span
              key={name}
              className="text-[10px] font-medium bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-slate-500"
            >
              {name}
            </span>
          ))}
          {skillNames.length > 4 && (
            <span className="text-[10px] text-slate-400 px-1">
              +{skillNames.length - 4}
            </span>
          )}
        </div>

        {/* Client info row */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          {project.client?.isVerified && (
            <span className="flex items-center gap-0.5 text-blue-500 font-semibold">
              <BadgeCheck className="w-3 h-3" />
              Verified
            </span>
          )}
          {project.client?.averageRating && (
            <span className="flex items-center gap-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {project.client.averageRating.toFixed(1)}
            </span>
          )}
          {project.client?.hireRate != null && (
            <span>{Math.round(project.client.hireRate * 100)}% hire rate</span>
          )}
          <span className="ml-auto">
            {formatDistanceToNow(new Date(project.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-blue-50">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
              Budget
            </span>
            <div className="text-base font-bold text-slate-800">
              ${project.budget?.toLocaleString()}
              {project.budgetType === "hourly" && (
                <span className="text-xs font-normal text-slate-400 ml-0.5">
                  /hr
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {/* Proposals + location */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {project.proposalCount}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-400" />
                {project.locationObj?.name || project.locationPref || "Global"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              {/* Save button */}
              <button
                onClick={() => onSave(project.id, project.category?.slug)}
                className={cn(
                  "h-8 w-8 rounded-xl border flex items-center justify-center transition-all",
                  isSaved
                    ? "bg-blue-50 border-blue-200 text-blue-500"
                    : "bg-white border-slate-200 text-slate-400 hover:border-blue-200 hover:text-blue-400",
                )}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5" />
                )}
              </button>

              {/* View button */}
              <Link to={`/freelancer/projects/${project.id}`}>
                <Button
                  size="icon"
                  className="h-8 w-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-sm shadow-blue-200 group-hover:translate-x-0.5 transition-all"
                  onClick={() => onView(project.id, project.category?.slug)}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
