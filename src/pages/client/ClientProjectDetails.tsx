import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    CheckCircle,
    MessageSquare,
    Clock,
    MapPin,
    Star,
    MoreVertical,
    Share2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Mock Data for the specific project
const MOCK_PROJECT_DETAILS = {
    id: "1",
    title: "E-Commerce Mobile App Redesign",
    description: `We are looking for an experienced mobile developer to completely redesign our existing e-commerce application. The current app is built with React Native but suffers from performance issues and an outdated UI.

Key Requirements:
- Complete UI/UX overhaul based on provided Figma designs.
- Performance optimization (app startup time, scroll performance).
- Integration with our existing REST API.
- Implementation of new features: Dark mode, Biometric login.
- Push notifications setup.

The ideal candidate should have published at least 3 apps on the App Store/Play Store and have strong knowledge of React Native animations.`,
    status: "in_progress",
    budget: { min: 5000, max: 8000 },
    deadline: "2024-04-15",
    createdAt: "2024-01-10",
    skills: ["React Native", "TypeScript", "Redux", "iOS", "Android", "UI/UX"],
    hiredDeveloper: {
        id: "dev-1",
        name: "Alex Chen",
        title: "Senior Full Stack Developer",
        rating: 4.9,
        reviewCount: 47,
        avatar: "https://i.pravatar.cc/150?u=alex",
        location: "New York, USA",
        hourlyRate: 85,
        email: "alex@example.com"
    }
};

const ClientProjectDetailsPage = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(MOCK_PROJECT_DETAILS);
    const [isCompleted, setIsCompleted] = useState(false);

    // In a real app, fetch project details using projectId

    const handleMarkCompleted = () => {
        setIsCompleted(true);
        toast.success("Project marked as completed!");
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "default";
            case "in_progress": return "secondary"; // Blue-ish in many themes or change to specific class
            case "completed": return "secondary"; // Green-ish usually, handled by specific classes often
            default: return "outline";
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "open": return "bg-green-500/10 text-green-600 hover:bg-green-500/20";
            case "in_progress": return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20";
            case "completed": return "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20";
            default: return "";
        }
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto p-4 md:p-8 space-y-6 animate-fade-in">
                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" className="pl-0 gap-2 text-muted-foreground hover:text-foreground" asChild>
                        <Link to="/client/projects">
                            <ArrowLeft className="h-4 w-4" /> Back to My Projects
                        </Link>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Share2 className="mr-2 h-4 w-4" /> Share Project
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                                Cancel Project
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1) Header Section */}
                        <Card>
                            <CardHeader className="space-y-4">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
                                            <Badge variant="outline" className={getStatusBadgeClass(project.status)}>
                                                {project.status.replace("_", " ").toUpperCase()}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Clock className="h-3 w-3" /> Posted on {new Date(project.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-6 sm:grid-cols-2">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <DollarSign className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Budget</p>
                                        <p className="font-semibold">${project.budget.min} - ${project.budget.max}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Deadline</p>
                                        <p className="font-semibold">{new Date(project.deadline).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2) Description Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-muted-foreground">
                                    {project.description}
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3) Required Skills Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Required Skills</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {project.skills.map((skill) => (
                                        <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">

                        {/* 4) Hired Developer Card */}
                        {project.hiredDeveloper && (
                            <Card className="overflow-hidden border-primary/20 shadow-md">
                                <CardHeader className="bg-primary/5 pb-4">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                        Hired Developer
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center text-center space-y-3">
                                        <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
                                            <AvatarImage src={project.hiredDeveloper.avatar} />
                                            <AvatarFallback>{project.hiredDeveloper.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-bold text-lg">{project.hiredDeveloper.name}</h3>
                                            <p className="text-sm text-muted-foreground">{project.hiredDeveloper.title}</p>
                                        </div>

                                        <div className="flex items-center gap-1 bg-warning/10 text-warning px-2 py-1 rounded-full text-xs font-medium">
                                            <Star className="h-3 w-3 fill-warning" />
                                            {project.hiredDeveloper.rating} ({project.hiredDeveloper.reviewCount} reviews)
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/30 p-4 grid gap-2">
                                    <Button className="w-full gap-2" variant="default" asChild>
                                        {/* Mock Chat link */}
                                        <Link to={`/client/messages?user=${project.hiredDeveloper.id}`}>
                                            <MessageSquare className="h-4 w-4" /> Open Chat
                                        </Link>
                                    </Button>
                                    <Button variant="outline" className="w-full gap-2" asChild>
                                        <Link to={`/developer/${project.hiredDeveloper.id}`}>
                                            View Profile
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {/* 5) Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {project.status === 'in_progress' && (
                                    <Button
                                        className="w-full"
                                        variant={isCompleted ? "secondary" : "default"}
                                        onClick={handleMarkCompleted}
                                        disabled={isCompleted}
                                    >
                                        {isCompleted ? (
                                            <>
                                                <CheckCircle className="mr-2 h-4 w-4" /> Completed
                                            </>
                                        ) : (
                                            "Mark as Completed"
                                        )}
                                    </Button>
                                )}

                                <Button variant="outline" className="w-full" asChild>
                                    <Link to={`/client/projects/${projectId}/proposals`}>
                                        View Proposals ({MOCK_PROJECT_DETAILS.status === 'open' ? 12 : 'Archived'})
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Proposals Summary or other widgets could go here */}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ClientProjectDetailsPage;
