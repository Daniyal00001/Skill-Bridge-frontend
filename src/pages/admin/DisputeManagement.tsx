import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertTriangle, 
  MessageSquare, 
  Scale, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

const MOCK_DISPUTES = [
  {
    id: 'dsp-1',
    projectTitle: 'Mobile App Frontend',
    client: 'John Doe',
    freelancer: 'Alex Chen',
    amount: 1500,
    status: 'pending',
    date: '2024-02-18',
    issue: 'Incomplete delivery'
  },
  {
    id: 'dsp-2',
    projectTitle: 'E-commerce Redesign',
    client: 'Sarah Smith',
    freelancer: 'Michael Brown',
    amount: 3200,
    status: 'under_review',
    date: '2024-02-15',
    issue: 'Delayed timeline'
  },
];

export default function DisputeManagement() {
  const handleResolve = (id: string, winner: 'client' | 'freelancer') => {
    toast.success(`Dispute resolved in favor of ${winner}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dispute Resolution</h1>
          <p className="text-muted-foreground mt-1">
            Arbitrate conflicts between clients and freelancers to ensure fair outcomes.
          </p>
        </div>

        <div className="grid gap-6">
          {MOCK_DISPUTES.map((dispute) => (
            <Card key={dispute.id} className="overflow-hidden border-l-4 border-l-warning">
              <CardHeader className="bg-muted/30">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{dispute.projectTitle}</CardTitle>
                    <CardDescription className="mt-1">
                      Case #{dispute.id} • Opened on {dispute.date}
                    </CardDescription>
                  </div>
                  <Badge variant={dispute.status === 'pending' ? 'destructive' : 'secondary'}>
                    {dispute.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">Stakeholders</p>
                    <p className="text-sm"><span className="font-medium">Client:</span> {dispute.client}</p>
                    <p className="text-sm"><span className="font-medium">Freelancer:</span> {dispute.freelancer}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">Financials</p>
                    <p className="text-sm font-bold text-primary">${dispute.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">In-escrow funds</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">Reported Issue</p>
                    <p className="text-sm italic">"{dispute.issue}"</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-8">
                  <Button variant="outline" size="sm" className="gap-2">
                    <MessageSquare className="w-4 h-4" /> View Chat History
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Clock className="w-4 h-4" /> Project Timeline
                  </Button>
                  <div className="ml-auto flex gap-2">
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleResolve(dispute.id, 'client')}
                    >
                      Refund Client
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleResolve(dispute.id, 'freelancer')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Release to Freelancer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
