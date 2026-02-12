// ChatUI component placeholder - will be implemented in later tasks
import { Card } from '@/components/ui/card';

interface ChatUIProps {
  messages: any[]; // Will be properly typed later
}

export function ChatUI({ messages }: ChatUIProps) {
  return (
    <Card className="p-4">
      <p>ChatUI component - implementation coming soon</p>
    </Card>
  );
}