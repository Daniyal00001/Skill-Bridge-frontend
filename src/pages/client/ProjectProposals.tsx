import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProposalCard } from "@/components/client/ProposalCard";
import { ArrowLeft, Calendar, DollarSign, Clock } from "lucide-react";
import { Developer, Proposal } from "@/types/client";
import { toast } from "sonner";

// Mock Data
const MOCK_PROJECT = {
    id: "1",
    title: "E-Commerce Mobile App Redesign",
    budget: { min: 5000, max: 8000 },
    deadline: "2024-04-15",
    description: "Complete overhaul of our existing React Native app...",
    status: "open",
    proposalCount: 12,
};

const MOCK_DEVELOPERS: Record<string, Developer> = {
    "dev-1": {
        id: "dev-1",
        name: "Alex Chen",
        email: "alex@example.com",
        profileImage: "https://i.pravatar.cc/150?u=alex",
        bio: "Senior Full Stack Dev",
        skills: ["React", "Node.js", "AWS"],
        rating: 4.9,
        reviewCount: 47,
        completedProjects: 52,
        hourlyRate: 85,
        experienceLevel: "Senior",
        portfolio: [],
        availability: "Available",
        joinedAt: new Date(),
    },
    "dev-2": {
        id: "dev-2",
        name: "Sarah Jones",
        email: "sarah@example.com",
        profileImage: "https://i.pravatar.cc/150?u=sarah",
        bio: "UI/UX Specialist",
        skills: ["Figma", "React", "Tailwind"],
        rating: 4.7,
        reviewCount: 23,
        completedProjects: 18,
        hourlyRate: 65,
        experienceLevel: "Mid",
        portfolio: [],
        availability: "Available",
        joinedAt: new Date(),
    },
    "dev-3": {
        id: "dev-3",
        name: "Michael Brown",
        email: "mike@example.com",
        profileImage: "https://i.pravatar.cc/150?u=mike",
        bio: "Backend Architect",
        skills: ["Python", "Django", "PostgreSQL"],
        rating: 5.0,
        reviewCount: 12,
        completedProjects: 10,
        hourlyRate: 95,
        experienceLevel: "Senior",
        portfolio: [],
        availability: "Busy",
        joinedAt: new Date(),
    },
};

const MOCK_PROPOSALS: Proposal[] = [
    {
        id: "prop-1",
        projectId: "1",
        developerId: "dev-1",
        proposedPrice: 7500,
        deliveryTime: 45,
        coverLetter: "I have built 3 similar e-commerce apps in the last year. I can ensure high performance and smooth animations. Check my portfolio for examples.",
        status: "Pending",
        submittedAt: new Date(),
    },
    {
        id: "prop-2",
        projectId: "1",
        developerId: "dev-2",
        proposedPrice: 6000,
        deliveryTime: 30,
        coverLetter: "I focus heavily on UX/UI. I can make your app look stunning and user-friendly. I'm available to start immediately.",
        status: "Pending",
        submittedAt: new Date(),
    },
    {
        id: "prop-3",
        projectId: "1",
        developerId: "dev-3",
        proposedPrice: 8000,
        deliveryTime: 40,
        coverLetter: "My robust backend background ensures your app will be secure and scalable. I use best practices for API development.",
        status: "Rejected",
        submittedAt: new Date(),
    },
];

const ProjectProposalsPage = () => {
    const { projectId } = useParams();
    const [proposals, setProposals] = useState(MOCK_PROPOSALS);

    // In a real app, fetch project and proposals based on projectId
    const project = MOCK_PROJECT;

    const handleAccept = (proposalId: string) => {
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1500)),
            {
                loading: 'Drafting contract and securing funds...',
                success: 'Hired successfully! Project moved to Working phase.',
                error: 'Failed to process deal.',
            }
        );
        // In a real app, this would navigate or refresh with new status
    };

    const handleReject = (proposalId: string) => {
        toast.error("Proposal rejected.");
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
                {/* Back Link */}
                <Button variant="ghost" className="pl-0 gap-2 text-muted-foreground hover:text-foreground" asChild>
                    <Link to="/client/projects">
                        <ArrowLeft className="h-4 w-4" /> Back to Projects
                    </Link>
                </Button>

                {/* Project Header */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
                                <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                                    {project.status.toUpperCase()}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    <span>${project.budget.min} - ${project.budget.max}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>Posted 2 days ago</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">{proposals.length}</div>
                            <div className="text-sm text-muted-foreground">Total Proposals</div>
                        </div>
                    </div>
                </div>

                {/* Proposals List */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Received Proposals</h2>
                    <div className="grid gap-6">
                        {proposals.map((proposal) => (
                            <ProposalCard
                                key={proposal.id}
                                proposal={proposal}
                                developer={MOCK_DEVELOPERS[proposal.developerId]}
                                onAccept={handleAccept}
                                onReject={handleReject}
                                onViewProfile={(id) => console.log('View profile:', id)}
                                onMessage={(id) => console.log('Message:', id)}
                                isProcessing={false}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProjectProposalsPage;
