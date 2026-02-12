import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/client';
import { Clock, DollarSign, Users, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onViewDetails: (id: string) => void;
  showStatus?: boolean;
}

export function ProjectCard({ project, onViewDetails, showStatus = true }: ProjectCardProps) {
  const statusColors: Record<string, string> = {
    'Open': 'bg-success/20 text-success border-success/20',
    'In Progress': 'bg-primary/20 text-primary border-primary/20',
    'Completed': 'bg-accent/20 text-accent border-accent/20',
    'Cancelled': 'bg-destructive/20 text-destructive border-destructive/20',
  };

  const complexityColors: Record<string, string> = {
    'Simple': 'bg-success/20 text-success border-success/20',
    'Medium': 'bg-warning/20 text-warning border-warning/20',
    'Complex': 'bg-destructive/20 text-destructive border-destructive/20',
  };

  return (
    <Card variant="interactive" className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-1 flex-1">{project.title}</h3>
          {showStatus && (
            <Badge 
              className={statusColors[project.status]} 
              variant="outline"
            >
              {project.status}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {project.description}
        </p>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Budget and Complexity Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium">
              ${project.budget.min.toLocaleString()} - ${project.budget.max.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-end">
            <Badge 
              className={complexityColors[project.complexity]} 
              variant="outline"
            >
              {project.complexity}
            </Badge>
          </div>
        </div>

        {/* Proposals and Time Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>{project.proposalsCount} proposal{project.proposalsCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-end">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{formatDistanceToNow(project.createdAt, { addSuffix: true })}</span>
          </div>
        </div>

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-1.5">
          {project.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="skill" className="text-xs">
              {skill}
            </Badge>
          ))}
          {project.skills.length > 3 && (
            <Badge variant="muted" className="text-xs">
              +{project.skills.length - 3} more
            </Badge>
          )}
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>Due: {project.deadline.toLocaleDateString()}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button 
          className="w-full" 
          onClick={() => onViewDetails(project.id)}
          variant="default"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}