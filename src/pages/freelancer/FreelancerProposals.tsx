import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockProposals, mockProjects } from '@/lib/mockData';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function DeveloperProposals() {
    // In a real app, filtering would be based on logged-in user ID
    // For now, we'll just show all mock proposals that "belong" to our dev
    const allProposals = mockProposals;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return <Badge className="bg-green-500 hover:bg-green-600">Accepted</Badge>;
            case 'rejected':
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="warning">Pending</Badge>;
        }
    };

    const ProposalsList = ({ status }: { status?: string }) => {
        const filtered = status
            ? allProposals.filter(p => p.status === status)
            : allProposals;

        if (filtered.length === 0) {
            return (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No proposals found</p>
                </div>
            );
        }

        return (
            <div className="grid gap-4">
                {filtered.map((proposal) => {
                    const project = mockProjects.find(p => p.id === proposal.projectId);

                    return (
                        <Card key={proposal.id}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4 justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg hover:underline cursor-pointer">
                                                {project?.title}
                                            </h3>
                                            {getStatusBadge(proposal.status)}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {proposal.coverLetter}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                Submitted on {new Date(proposal.createdAt).toLocaleDateString()}
                                            </span>
                                            <span>•</span>
                                            <span>Budget: ${proposal.proposedBudget}</span>
                                            <span>•</span>
                                            <span>Duration: {proposal.estimatedDuration}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" asChild>
                                            <Link to={`/client/projects/${proposal.projectId}`}>View Project</Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        );
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">My Proposals</h1>
                    <p className="text-muted-foreground mt-1">
                        Track the status of your project bids
                    </p>
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList>
                        <TabsTrigger value="all">All Proposals</TabsTrigger>
                        <TabsTrigger value="pending" className="flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Pending
                        </TabsTrigger>
                        <TabsTrigger value="accepted" className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Accepted
                        </TabsTrigger>
                        <TabsTrigger value="rejected" className="flex items-center gap-2">
                            <XCircle className="w-4 h-4" /> Rejected
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6">
                        <ProposalsList />
                    </TabsContent>
                    <TabsContent value="pending" className="mt-6">
                        <ProposalsList status="pending" />
                    </TabsContent>
                    <TabsContent value="accepted" className="mt-6">
                        <ProposalsList status="accepted" />
                    </TabsContent>
                    <TabsContent value="rejected" className="mt-6">
                        <ProposalsList status="rejected" />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
