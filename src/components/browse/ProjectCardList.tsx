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
    <Card className="bg-card border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl p-6 group">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {/* ── Left: Info ──────────────────────────────── */}
        <div className="flex-1 space-y-3">
          {/* Badges row */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="bg-primary/10 text-primary border-primary/10 text-[10px] font-bold py-0.5 px-2.5 rounded-lg">
              {project.category?.name || "Uncategorized"}
            </Badge>

            {project.matchPercentage > 0 && (
              <span
                className={cn(
                  "text-[10px] font-extrabold px-2 py-0.5 rounded-lg border",
                  project.matchPercentage >= 70
                    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                    : "text-amber-500 bg-amber-500/10 border-amber-500/20",
                )}
              >
                {project.matchPercentage}% Match
              </span>
            )}

            <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground/60 font-semibold ml-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDistanceToNow(new Date(project.createdAt), {
                  addSuffix: true,
                })}
              </span>

              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary/60" />
                {project.locationObj?.name || project.locationPref || "Global"}
              </span>

              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {project.proposalCount} proposals
              </span>
            </div>
          </div>

          {/* Title */}
          <Link
            to={`/freelancer/projects/${project.id}`}
            onClick={() => onView(project.id, project.category?.slug)}
          >
            <h3 className="text-base font-black text-foreground group-hover:text-primary transition-colors leading-tight">
              {project.title}
            </h3>
          </Link>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 pt-0.5">
            {skillNames.slice(0, 6).map((name: string) => (
              <span
                key={name}
                className="text-[10px] font-medium bg-muted/40 text-muted-foreground px-2 py-0.5 rounded-md border border-border/40"
              >
                {name}
              </span>
            ))}
            {skillNames.length > 6 && (
              <span className="text-[10px] text-muted-foreground/50 self-center">
                +{skillNames.length - 6} more
              </span>
            )}
          </div>

          {/* Client row */}
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground/70 font-medium pt-1">
            {project.client?.isVerified ? (
              <span className="flex items-center gap-1.5 text-blue-500 font-bold">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>Verified Client</span>
              </span>
            ) : (
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Unverified Client</span>
            )}
            
            {project.client?.averageRating && (
              <span className="flex items-center gap-1 border-l border-border pl-4">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="font-bold text-foreground/80">{project.client.averageRating.toFixed(1)} Rating</span>
              </span>
            )}

            {(project.client?.totalHires != null || project.client?.totalSpent != null) && (
              <span className="flex items-center gap-2 border-l border-border pl-4">
                {project.client?.totalHires != null && <span>{project.client.totalHires} hires</span>}
                {project.client?.totalSpent != null && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span>${project.client.totalSpent.toLocaleString()}+ spent</span>
                  </>
                )}
              </span>
            )}
          </div>
        </div>

        {/* ── Right: Budget + Actions ──────────────────── */}
        <div className="flex items-center gap-8 shrink-0 border-t md:border-t-0 pt-5 md:pt-0">
          <div className="text-right flex flex-col items-end">
            <span className="text-[9px] uppercase font-heavy tracking-widest text-muted-foreground/40 mb-1">
              {project.budgetType === "hourly" ? "HOURLY RATE" : "FIXED BUDGET"}
            </span>
            <div className="text-xl font-black text-foreground flex items-baseline gap-1">
              ${project.budget?.toLocaleString()}
              {project.budgetType === "hourly" && (
                <span className="text-xs font-medium text-muted-foreground/40">/hr</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Save button */}
            <button
              onClick={() => onSave(project.id, project.category?.slug)}
              className={cn(
                "h-10 w-10 rounded-xl border flex items-center justify-center transition-all",
                isSaved
                  ? "bg-primary/10 border-primary/20 text-primary"
                  : "bg-card border-border text-muted-foreground hover:border-primary/20 hover:text-primary active:scale-95",
              )}
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5 fill-current" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>

            {/* View button */}
            <Link to={`/freelancer/projects/${project.id}`}>
              <Button
                variant="default"
                className="h-10 px-6 rounded-xl text-xs font-extrabold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 active:scale-95 transition-all"
                onClick={() => onView(project.id, project.category?.slug)}
              >
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};
