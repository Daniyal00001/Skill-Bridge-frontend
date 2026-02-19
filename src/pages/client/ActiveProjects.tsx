import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    MessageSquare,
    ArrowUpRight,
    CheckCircle2,
    AlertCircle,
    Calendar,
    DollarSign,
    MoreVertical
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock Data for Active Projects
const MOCK_ACTIVE_PROJECTS = [
    {
        id: "1",
        title: "E-Commerce Mobile App Redesign",
        hiredDeveloper: {
            id: "dev-1",
            name: "Alex Chen",
            avatar: "https://i.pravatar.cc/150?u=alex",
            title: "Senior Full Stack Dev"
        },
        progress: 65,
        status: "on_track",
        budget: 7500,
        deadline: "2024-04-15",
        nextMilestone: "UI Implementation Phase 2",
        lastActivity: "2 hours ago"
    },
    {
        id: "2",
        title: "AI-Powered Customer Support Chatbot",
        hiredDeveloper: {
            id: "dev-3",
            name: "Michael Brown",
            avatar: "https://i.pravatar.cc/150?u=mike",
            title: "AI Engineer"
        },
        progress: 30,
        status: "delayed",
        budget: 4500,
        deadline: "2024-03-30",
        nextMilestone: "NLP Model Training",
        lastActivity: "1 day ago"
    },
    {
        id: "3",
        title: "Corporate Website Migration to Next.js",
        hiredDeveloper: {
            id: "dev-4",
            name: "Emily Davis",
            avatar: "https://i.pravatar.cc/150?u=emily",
            title: "Frontend Developer"
        },
        progress: 90,
        status: "on_track",
        budget: 3000,
        deadline: "2024-02-28",
        nextMilestone: "Final QA & Testing",
        lastActivity: "5 hours ago"
    }
];

const ActiveProjectsPage = () => {

    const getStatusColor = (status: string) => {
        switch (status) {
            case "on_track": return "text-green-600 bg-green-500/10";
            case "delayed": return "text-red-600 bg-red-500/10";
            default: return "text-blue-600 bg-blue-500/10";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "on_track": return "On Track";
            case "delayed": return "Attention Needed";
            default: return "In Progress";
        }
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Active Projects</h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor progress and collaborate with your hired developers.
                        </p>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {MOCK_ACTIVE_PROJECTS.map((project) => (
                        <Card key={project.id} className="flex flex-col hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-4">
                                    <Badge variant="outline" className={getStatusColor(project.status)}>
                                        {getStatusLabel(project.status)}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>View Contract</DropdownMenuItem>
                                            <DropdownMenuItem>Milestones</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">End Contract</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardTitle className="text-xl mt-3 line-clamp-1">
                                    <Link to={`/client/projects/${project.id}`} className="hover:underline">
                                        {project.title}
                                    </Link>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="flex-1 space-y-6">
                                {/* Developer Info */}
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <Avatar>
                                        <AvatarImage src={project.hiredDeveloper.avatar} />
                                        <AvatarFallback>{project.hiredDeveloper.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="overflow-hidden">
                                        <p className="font-medium text-sm truncate">{project.hiredDeveloper.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{project.hiredDeveloper.title}</p>
                                    </div>
                                </div>

                                {/* Progress Section */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-medium">{project.progress}%</span>
                                    </div>
                                    <Progress value={project.progress} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Next Milestone: <span className="font-medium text-foreground">{project.nextMilestone}</span>
                                    </p>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <DollarSign className="h-4 w-4 text-primary" />
                                        <span>${project.budget.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <span>{new Date(project.deadline).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="pt-2 pb-6 px-6 grid grid-cols-2 gap-3">
                                <Button className="w-full" variant="default" asChild>
                                    {/* Placeholder link for workspace */}
                                    <Link to={`/workspace/${project.id}`}>
                                        Open Workspace
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link to={`/client/messages?user=${project.hiredDeveloper.id}`}>
                                        <MessageSquare className="mr-2 h-4 w-4" /> Message
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {MOCK_ACTIVE_PROJECTS.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No active projects found.</p>
                        <Button variant="link" asChild className="mt-2">
                            <Link to="/client/post-project">Post a Project</Link>
                        </Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ActiveProjectsPage;
