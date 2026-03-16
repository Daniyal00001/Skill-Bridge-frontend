/**
 * ProjectCardList.tsx
 * location: frontend/src/components/browse/ProjectCardList.tsx
 */

import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  MapPin,
  Users,
  Sparkles,
  BadgeCheck,
  Star,
  Bookmark,
  BookmarkCheck,
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

export const ProjectCardList = ({
  project,
  isSaved,
  onSave,
  onView,
}: Props) => {
  const skillNames = (project.skills ?? []).map(
    (s: any) => s.skill?.name ?? s.name ?? s,
  );

  return (
    <Card className="bg-white border border-blue-100 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100/50 transition-all duration-300 rounded-2xl p-5 group">
      <div className="flex flex-col md:flex-row md:items-center gap-5">
        {/* ── Left: Info ──────────────────────────────── */}
        <div className="flex-1 space-y-2.5">
          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] font-semibold py-0.5 px-2 rounded-md">
              {project.category?.name}
            </Badge>

            {project.isAiScoped && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-md">
                <Sparkles className="w-3 h-3" />
                AI Scoped
              </span>
            )}

            {project.matchPercentage > 0 && (
              <span
                className={cn(
                  "text-[10px] font-bold",
                  project.matchPercentage >= 70
                    ? "text-emerald-600"
                    : "text-amber-600",
                )}
              >
                {project.matchPercentage}% Match
              </span>
            )}

            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true,
              })}
            </span>

            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-400" />
              {project.locationObj?.name || project.locationPref || "Global"}
            </span>

            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {project.proposalCount} proposals
            </span>
          </div>

          {/* Title */}
          <Link
            to={`/freelancer/projects/${project.id}`}
            onClick={() => onView(project.id, project.category?.slug)}
          >
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-500 transition-colors">
              {project.title}
            </h3>
          </Link>

          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {skillNames.slice(0, 6).map((name: string) => (
              <span key={name} className="text-[10px] text-slate-400">
                #{name.toLowerCase()}
              </span>
            ))}
          </div>

          {/* Client row */}
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            {project.client?.isVerified && (
              <span className="flex items-center gap-0.5 text-blue-500 font-semibold">
                <BadgeCheck className="w-3 h-3" />
                Verified Client
              </span>
            )}
            {project.client?.averageRating && (
              <span className="flex items-center gap-0.5">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                {project.client.averageRating.toFixed(1)} rating
              </span>
            )}
            {project.client?.totalHires != null && (
              <span>{project.client.totalHires} hires</span>
            )}
          </div>
        </div>

        {/* ── Right: Budget + Actions ──────────────────── */}
        <div className="flex items-center gap-6 shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
              {project.budgetType === "hourly" ? "Hourly Rate" : "Fixed Price"}
            </span>
            <div className="text-lg font-bold text-slate-800">
              ${project.budget?.toLocaleString()}
              {project.budgetType === "hourly" && (
                <span className="text-xs font-normal text-slate-400">/hr</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Save button */}
            <button
              onClick={() => onSave(project.id, project.category?.slug)}
              className={cn(
                "h-9 w-9 rounded-xl border flex items-center justify-center transition-all",
                isSaved
                  ? "bg-blue-50 border-blue-200 text-blue-500"
                  : "bg-white border-slate-200 text-slate-400 hover:border-blue-200 hover:text-blue-400",
              )}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            {/* View button */}
            <Link to={`/freelancer/projects/${project.id}`}>
              <Button
                variant="outline"
                className="h-9 px-4 rounded-xl text-xs font-bold border-blue-200 text-blue-500 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all"
                onClick={() => onView(project.id, project.category?.slug)}
              >
                View Brief
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};
