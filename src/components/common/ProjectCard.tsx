import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Project } from "@/lib/mockData";
import { Clock, DollarSign, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface ProjectCardProps {
  project: any;
  viewAs: "client" | "freelancer";
}

export function ProjectCard({ project, viewAs }: ProjectCardProps) {
  const statusColors: Record<Project["status"], string> = {
    draft: "bg-muted text-muted-foreground",
    open: "bg-success/20 text-success",
    in_progress: "bg-primary/20 text-primary",
    completed: "bg-accent/20 text-accent",
    cancelled: "bg-destructive/20 text-destructive",
  };

  const complexityColors: Record<string, string> = {
    simple: "bg-success/20 text-success",
    moderate: "bg-warning/20 text-warning",
    complex: "bg-destructive/20 text-destructive",
  };

  const detailLink =
    viewAs === "client"
      ? `/client/projects/${project.id}`
      : `/freelancer/projects/${project.id}`;

  return (
    <Card variant="interactive" className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-1">
            {project.title}
          </h3>
          <Badge className={statusColors[project.status?.toLowerCase()] || "bg-muted"} variant="secondary">
            {(project.status || "OPEN").replace(/_/g, " ")}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {project.description}
        </p>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {typeof project.budget === 'number' 
                ? `$${project.budget.toLocaleString()}`
                : project.budget?.min !== undefined 
                  ? `$${project.budget.min.toLocaleString()} - $${project.budget.max.toLocaleString()}`
                  : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge
              className={complexityColors[project.complexity?.toLowerCase()] || "bg-muted"}
              variant="secondary"
            >
              {project.complexity || project.size || "Standard"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{project.proposalCount || 0} proposals</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {project.createdAt ? formatDistanceToNow(new Date(project.createdAt), {
                addSuffix: true,
              }) : "Recently"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(project.skills || []).slice(0, 3).map((skill: string) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {(project.skills || []).length > 3 && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              +{(project.skills || []).length - 3}
            </Badge>
          )}
        </div>

        {project.deadline && (
          <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button className="w-full" asChild>
          <Link to={detailLink}>
            {viewAs === "client" ? "View Details" : "View & Apply"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
