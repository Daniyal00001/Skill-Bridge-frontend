import { DeveloperCard as BaseDeveloperCard } from '@/components/common/DeveloperCard';
import { Developer } from '@/types/client';

interface ClientDeveloperCardProps {
  developer: Developer;
  onViewProfile: (id: string) => void;
  showInviteButton?: boolean;
}

export function DeveloperCard({ 
  developer, 
  onViewProfile, 
  showInviteButton = true 
}: ClientDeveloperCardProps) {
  return (
    <BaseDeveloperCard
      developer={developer}
      onViewProfile={onViewProfile}
      showInviteButton={showInviteButton}
      showHireButton={true}
    />
  );
}