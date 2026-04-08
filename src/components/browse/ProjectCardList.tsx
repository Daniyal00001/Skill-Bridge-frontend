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
    <Card className="bg-card border border-border hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 rounded-2xl p-5 group">
      <div className="flex flex-col md:flex-row md:items-center gap-5">
        {/* ── Left: Info ──────────────────────────────── */}
        <div className="flex-1 space-y-2.5">
          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-primary/10 text-[10px] font-semibold py-0.5 px-2 rounded-md">
              {project.category?.name}
            </Badge>

            {project.matchPercentage > 0 && (
              <span
                className={cn(
                  "text-[10px] font-bold",
                  project.matchPercentage >= 70
                    ? "text-emerald-500"
                    : "text-amber-500",
                )}
              >
                {project.matchPercentage}% Match
              </span>
            )}

            <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true,
              })}
            </span>

            <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary/70" />
              {project.locationObj?.name || project.locationPref || "Global"}
            </span>

            <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {project.proposalCount} proposals
            </span>
          </div>

          {/* Title */}
          <Link
            to={`/freelancer/projects/${project.id}`}
            onClick={() => onView(project.id, project.category?.slug)}
          >
            <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
              {project.title}
            </h3>
          </Link>

          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {skillNames.slice(0, 6).map((name: string) => (
              <span key={name} className="text-[10px] text-muted-foreground/60">
                #{name.toLowerCase()}
              </span>
            ))}
          </div>

          {/* Client row */}
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
            {project.client?.isVerified ? (
              <span className="flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-md text-[9px] font-bold">
                <BadgeCheck className="w-3 h-3" />
                <span>ID Verified Client</span>
              </span>
            ) : (
              <span className="text-[9px] font-bold text-slate-300 border border-slate-200 px-1.5 rounded-md uppercase tracking-tighter">Unverified Client</span>
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
            <span className="text-[9px] uppercase font-bold text-muted-foreground/60 block tracking-wider mb-0.5">
              {project.budgetType === "hourly" ? "Hourly Rate" : "Fixed Price"}
            </span>
            <div className="text-lg font-bold text-foreground">
              ${project.budget?.toLocaleString()}
              {project.budgetType === "hourly" && (
                <span className="text-xs font-normal text-muted-foreground/60">/hr</span>
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
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/20 hover:text-primary",
              )}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 fill-current" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            {/* View button */}
            <Link to={`/freelancer/projects/${project.id}`}>
              <Button
                variant="outline"
                className="h-9 px-4 rounded-xl text-xs font-bold border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
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
