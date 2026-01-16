import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Developer } from '@/lib/mockData';
import { Star, MapPin, DollarSign, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DeveloperCardProps {
  developer: Developer;
  showHireButton?: boolean;
}

export function DeveloperCard({ developer, showHireButton = true }: DeveloperCardProps) {
  const availabilityColors = {
    available: 'bg-success',
    busy: 'bg-warning',
    unavailable: 'bg-destructive',
  };

  return (
    <Card variant="interactive" className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={developer.avatar} alt={developer.name} />
              <AvatarFallback>{developer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card ${
                availabilityColors[developer.availability]
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{developer.name}</h3>
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground">{developer.title}</p>

            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                {developer.rating} ({developer.reviewCount})
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {developer.location}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-lg font-bold">
              <DollarSign className="w-4 h-4" />
              {developer.hourlyRate}
              <span className="text-sm font-normal text-muted-foreground">/hr</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {developer.completedProjects} projects
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{developer.bio}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          {developer.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="skill">
              {skill}
            </Badge>
          ))}
          {developer.skills.length > 4 && (
            <Badge variant="muted">+{developer.skills.length - 4}</Badge>
          )}
        </div>

        {showHireButton && (
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" asChild>
              <Link to={`/developer/${developer.id}`}>View Profile</Link>
            </Button>
            <Button className="flex-1">Invite to Project</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
