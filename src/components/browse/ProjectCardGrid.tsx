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
    <Card className="h-full min-h-[360px] bg-card border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl overflow-hidden flex flex-col group relative">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-start justify-between mb-4 pr-16">
          <Badge className="bg-primary/10 text-primary border-primary/10 text-[10px] font-bold py-0.5 px-3 rounded-lg">
            {project.category?.name || "Uncategorized"}
          </Badge>

          {/* Match score */}
          {project.matchPercentage > 0 && (
            <span
              className={cn(
                "text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border shadow-sm",
                project.matchPercentage >= 70
                  ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
                  : project.matchPercentage >= 40
                    ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
                    : "text-muted-foreground bg-muted border-border",
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
          <h3 className="text-[15px] font-bold leading-[1.4] line-clamp-2 text-foreground hover:text-primary transition-colors overflow-hidden" style={{ overflowWrap: 'anywhere' }}>
            {project.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="p-6 pt-2 flex-1 flex flex-col gap-5">
        {/* Description */}
        <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed overflow-hidden">
          {project.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {skillNames.slice(0, 4).map((name: string) => (
            <span
              key={name}
              className="text-[10px] font-semibold bg-muted/50 border border-border/50 px-2.5 py-1 rounded-lg text-muted-foreground/90"
            >
              {name}
            </span>
          ))}
          {skillNames.length > 4 && (
            <span className="text-[10px] text-muted-foreground/50 self-center ml-1">
              +{skillNames.length - 4}
            </span>
          )}
        </div>

        {/* Client info section */}
        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
            {project.client?.isVerified ? (
              <span className="flex items-center gap-1.5 text-blue-500 font-bold">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>Verified Client</span>
              </span>
            ) : (
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Unverified</span>
            )}
            
            {project.client?.averageRating && (
              <span className="flex items-center gap-1 border-l border-border pl-3">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="font-bold text-foreground/80">{project.client.averageRating.toFixed(1)}</span>
              </span>
            )}

            <span className="ml-auto text-[9px] font-semibold text-muted-foreground/60">
              {formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {(project.client?.hireRate != null || project.client?.totalSpent != null) && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70">
              {project.client?.hireRate != null && (
                <span>{Math.round(project.client.hireRate * 100)}% hire rate</span>
              )}
              {project.client?.totalSpent != null && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>${project.client.totalSpent.toLocaleString()}+ spent</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-5 mt-2 border-t border-border/60">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-heavy tracking-widest text-muted-foreground/50 mb-1">
              BUDGET
            </span>
            <div className="text-lg font-black text-foreground flex items-baseline gap-1">
              ${project.budget?.toLocaleString()}
              {project.budgetType === "hourly" && (
                <span className="text-xs font-medium text-muted-foreground/50">
                  /hr
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2.5">
            {/* Stats row */}
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-semibold">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 opacity-70" />
                {project.proposalCount}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary/60" />
                {project.locationObj?.name || project.locationPref || "Global"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSave(project.id, project.category?.slug)}
                className={cn(
                  "h-9 w-9 rounded-xl border flex items-center justify-center transition-all",
                  isSaved
                    ? "bg-primary/10 border-primary/20 text-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/20 hover:text-primary active:scale-95",
                )}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-4 h-4 fill-current" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>

              <Link to={`/freelancer/projects/${project.id}`}>
                <Button
                  size="icon"
                  className="h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 active:scale-95 transition-all"
                  onClick={() => onView(project.id, project.category?.slug)}
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
