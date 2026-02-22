import { FreelancerCard as BaseFreelancerCard } from '@/components/common/FreelancerCard';
import { Freelancer } from '@/lib/mockData';

interface ClientFreelancerCardProps {
  freelancer: Freelancer;
  onViewProfile?: (id: string) => void;
  showInviteButton?: boolean;
}

export function FreelancerCard({ 
  freelancer, 
  onViewProfile, 
  showInviteButton = true 
}: ClientFreelancerCardProps) {
  return (
    <BaseFreelancerCard
      freelancer={freelancer}
      showHireButton={true}
    />
  );
}