import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Freelancer } from '@/lib/mockData';
import { Star, MapPin, DollarSign, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FreelancerCardProps {
  freelancer: Freelancer;
  showHireButton?: boolean;
}

export function FreelancerCard({ freelancer, showHireButton = true }: FreelancerCardProps) {
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
              <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
              <AvatarFallback>{freelancer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-card ${
                availabilityColors[freelancer.availability]
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{freelancer.name}</h3>
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground">{freelancer.title}</p>

            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                {freelancer.rating} ({freelancer.reviewCount})
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {freelancer.location}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-lg font-bold">
              <DollarSign className="w-4 h-4" />
              {freelancer.hourlyRate}
              <span className="text-sm font-normal text-muted-foreground">/hr</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {freelancer.completedProjects} projects
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4 line-clamp-2">{freelancer.bio}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          {freelancer.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="skill">
              {skill}
            </Badge>
          ))}
          {freelancer.skills.length > 4 && (
            <Badge variant="muted">+{freelancer.skills.length - 4}</Badge>
          )}
        </div>

        {showHireButton && (
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" asChild>
              <Link to={`/freelancer/${freelancer.id}`}>View Profile</Link>
            </Button>
            <Button className="flex-1">Invite to Project</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
