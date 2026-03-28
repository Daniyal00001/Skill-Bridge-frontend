import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  MapPin,
  DollarSign,
  CheckCircle,
  MessageSquare,
  UserPlus,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface Freelancer {
  id: string;
  name: string;
  title: string;
  bio: string;
  hourlyRate: number | null;
  averageRating: number | null;
  totalReviews: number;
  location: string;
  availability: "AVAILABLE" | "BUSY" | "UNAVAILABLE" | string;
  skills: string[];
  profileImage?: string;
  avatar?: string;
  completedProjects?: number;
}

interface FreelancerCardProps {
  freelancer: Freelancer;
  onMessage?: (freelancer: Freelancer) => void;
  onInvite?: (freelancer: Freelancer) => void;
}

export function FreelancerCard({
  freelancer,
  onMessage,
  onInvite,
}: FreelancerCardProps) {
  const availabilityColors: Record<string, string> = {
    AVAILABLE: "bg-green-500",
    BUSY: "bg-amber-500",
    UNAVAILABLE: "bg-red-500",
  };

  const statusColor =
    availabilityColors[freelancer.availability] || "bg-slate-300";

  return (
    <Card className="w-full max-w-full hover:shadow-sm transition-all duration-200 border border-border bg-card overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          {/* Avatar and Info */}
          <div className="flex items-center sm:items-start gap-4 sm:relative shrink-0">
            <div className="relative">
              <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                <AvatarImage
                  src={freelancer.profileImage || freelancer.avatar}
                  alt={freelancer.name}
                />
                <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                  {freelancer.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-card",
                  statusColor,
                )}
              />
            </div>
            {/* On mobile, name and rate are next to avatar in this flex container. On desktop, they are in the next flex-1 div. */}
            <div className="flex-1 sm:hidden min-w-0">
              <h3 className="text-base font-bold text-foreground truncate flex items-center gap-1.5">
                {freelancer.name}
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              </h3>
              <p className="text-xs font-medium text-muted-foreground truncate">
                {freelancer.title}
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="hidden sm:flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="text-base font-bold text-foreground truncate">
                  {freelancer.name}
                </h3>
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {freelancer.hourlyRate ? (
                  <>
                    <span className="text-lg font-bold text-foreground">
                      ${freelancer.hourlyRate}
                    </span>
                    <span className="text-xs text-muted-foreground">/hr</span>
                  </>
                ) : (
                  <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-wider">
                    Rate TBD
                  </span>
                )}
              </div>
            </div>

            <p className="hidden sm:block text-sm font-medium text-muted-foreground mb-2 truncate">
              {freelancer.title}
            </p>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1 sm:hidden shrink-0">
                {freelancer.hourlyRate ? (
                  <span className="text-sm font-bold text-foreground">
                    ${freelancer.hourlyRate}/hr
                  </span>
                ) : (
                  <span className="text-xs font-bold text-muted-foreground/50">Rate TBD</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-foreground">
                  {freelancer.averageRating?.toFixed(1) || "5.0"}
                </span>
                <span>({freelancer.totalReviews || 0})</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {freelancer.location}
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4 line-clamp-2 leading-relaxed break-words">
          {freelancer.bio}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-4">
          {freelancer.skills.slice(0, 4).map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="bg-muted text-muted-foreground hover:bg-muted/80 border-none px-2 py-0.5 text-[11px] font-medium"
            >
              {skill}
            </Badge>
          ))}
          {freelancer.skills.length > 4 && (
            <Badge
              variant="outline"
              className="text-[10px] text-muted-foreground border-border"
            >
              +{freelancer.skills.length - 4}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/50">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-border text-muted-foreground hover:text-primary hover:border-primary/30"
                    onClick={() => onMessage?.(freelancer)}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Message</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-border text-muted-foreground hover:text-primary hover:border-primary/30"
                    onClick={() => onInvite?.(freelancer)}
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Invite</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button
            variant="ghost"
            className="text-primary hover:bg-primary/5 text-xs font-bold gap-1.5 px-3"
            asChild
          >
            <Link to={`/freelancer/${freelancer.id}`}>
              View Profile
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
