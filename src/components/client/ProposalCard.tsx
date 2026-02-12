import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProposalCardProps } from '@/types/client';
import { Star, Clock, DollarSign, Calendar, CheckCircle, X, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ProposalCard({ 
  proposal, 
  developer, 
  onAccept, 
  onReject, 
  isProcessing = false 
}: ProposalCardProps) {
  const experienceColors: Record<string, string> = {
    'Junior': 'bg-blue/20 text-blue border-blue/20',
    'Mid': 'bg-success/20 text-success border-success/20',
    'Senior': 'bg-warning/20 text-warning border-warning/20',
    'Expert': 'bg-destructive/20 text-destructive border-destructive/20',
  };

  const availabilityColors: Record<string, string> = {
    'Available': 'bg-success',
    'Busy': 'bg-warning',
    'Unavailable': 'bg-destructive',
  };

  return (
    <Card variant="interactive" className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={developer.profileImage} alt={developer.name} />
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
              <h3 className="font-semibold text-lg truncate">{developer.name}</h3>
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
            </div>
            
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-warning fill-warning" />
                {developer.rating.toFixed(1)} ({developer.reviewCount} reviews)
              </span>
              <Badge 
                className={experienceColors[developer.experienceLevel]} 
                variant="outline"
              >
                {developer.experienceLevel}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mt-1">
              {developer.completedProjects} projects completed
            </p>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-xl font-bold text-primary">
              <DollarSign className="w-5 h-5" />
              {proposal.proposedPrice.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Total Price</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Delivery Time and Submitted Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>
              <span className="font-medium">{proposal.deliveryTime} days</span>
              <span className="text-muted-foreground ml-1">delivery</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-end">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>Submitted {formatDistanceToNow(proposal.submittedAt, { addSuffix: true })}</span>
          </div>
        </div>

        {/* Developer Skills */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {developer.skills.slice(0, 6).map((skill) => (
              <Badge key={skill} variant="skill" className="text-xs">
                {skill}
              </Badge>
            ))}
            {developer.skills.length > 6 && (
              <Badge variant="muted" className="text-xs">
                +{developer.skills.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        {/* Cover Letter */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Cover Letter</h4>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {proposal.coverLetter}
            </p>
          </div>
        </div>

        {/* Hourly Rate for Reference */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <DollarSign className="w-4 h-4 flex-shrink-0" />
          <span>Usually charges ${developer.hourlyRate}/hour</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 gap-3">
        <Button 
          variant="outline" 
          className="flex-1" 
          onClick={() => onReject(proposal.id)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <X className="w-4 h-4 mr-2" />
          )}
          Reject
        </Button>
        <Button 
          className="flex-1" 
          onClick={() => onAccept(proposal.id)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Accept Proposal
        </Button>
      </CardFooter>
    </Card>
  );
}