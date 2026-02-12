import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    MoreVertical,
    Search,
    Filter,
    Plus,
    Calendar,
    Users,
    DollarSign,
    Eye
} from "lucide-react";
import { Link } from "react-router-dom";

// Dummy Data
const MOCK_PROJECTS = [
    {
        id: "1",
        title: "E-Commerce Mobile App Redesign",
        description: "We need a complete overhaul of our existing React Native app to improve user experience and sales conversion. The current app is outdated and slow.",
        status: "open",
        budget: { min: 5000, max: 8000 },
        proposals: 12,
        deadline: "2024-04-15",
        skills: ["React Native", "UI/UX", "Node.js"],
    },
    {
        id: "2",
        title: "AI-Powered Customer Support Chatbot",
        description: "Looking for an expert in NLP to build a chatbot that handles L1 support queries. Must integrate with our existing CRM.",
        status: "in_progress",
        budget: { min: 3000, max: 5000 },
        proposals: 8,
        deadline: "2024-03-30",
        skills: ["Python", "TensorFlow", "OpenAI API"],
    },
    {
        id: "3",
        title: "Corporate Website Migration to Next.js",
        description: "Migrate our Wordpress site to a high-performance Next.js application with a headless CMS.",
        status: "completed",
        budget: { min: 2000, max: 4000 },
        proposals: 5,
        deadline: "2024-02-28",
        skills: ["Next.js", "React", "Sanity.io"],
    },
    {
        id: "4",
        title: "Real-time Data Visualization Dashboard",
        description: "Build a dashboard for visualizing IoT sensor data in real-time. Needs to handle high throughput via WebSockets.",
        status: "open",
        budget: { min: 6000, max: 9000 },
        proposals: 3,
        deadline: "2024-05-01",
        skills: ["React", "D3.js", "Socket.io"],
    },
];

const ClientProjectsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredProjects = MOCK_PROJECTS.filter((project) => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || project.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open":
                return "bg-green-500/10 text-green-600 hover:bg-green-500/20";
            case "in_progress":
                return "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20";
            case "completed":
                return "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your posted projects and view proposals.
                        </p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link to="/client/post-project">
                            <Plus className="h-4 w-4" /> Post New Project
                        </Link>
                    </Button>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto ml-auto">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredProjects.map((project) => (
                        <Card key={project.id} className="flex flex-col shadow-soft hover:shadow-lg transition-all duration-200 group">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <Badge className={getStatusColor(project.status)}>
                                            {project.status.replace("_", " ").toUpperCase()}
                                        </Badge>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Edit Project</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Close Project</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardTitle className="text-xl mt-2 line-clamp-1 group-hover:text-primary transition-colors">
                                    {project.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4 pb-4">
                                <p className="text-muted-foreground text-sm line-clamp-2 min-h-[40px]">
                                    {project.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <DollarSign className="h-4 w-4 text-primary" />
                                        <span className="font-medium text-foreground">
                                            ${project.budget.min} - ${project.budget.max}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="h-4 w-4 text-primary" />
                                        <span>{project.proposals} Proposals</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {project.skills.map(skill => (
                                        <Badge key={skill} variant="outline" className="text-xs font-normal">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 pb-6 px-6 grid grid-cols-2 gap-3">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link to={`/client/projects/${project.id}`}>
                                        View Details
                                    </Link>
                                </Button>
                                <Button className="w-full" asChild>
                                    <Link to={`/client/projects/${project.id}/proposals`}>
                                        View Proposals
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {filteredProjects.length === 0 && (
                    <div className="text-center py-12">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
                        <p className="mt-2 text-muted-foreground">
                            Try adjusting your search or filters.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ClientProjectsPage;
