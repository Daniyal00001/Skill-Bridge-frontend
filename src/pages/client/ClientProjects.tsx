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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    MoreVertical,
    Search,
    Filter,
    Plus,
    Calendar,
    Users,
    DollarSign,
    Clock,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    PlayCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Dummy Data with Expanded Statuses
const INITIAL_PROJECTS = [
    {
        id: "1",
        title: "E-Commerce Mobile App Redesign",
        description: "We need a complete overhaul of our existing React Native app to improve user experience and sales conversion.",
        status: "under_review",
        budget: { min: 5000, max: 8000 },
        proposals: 12,
        deadline: "2024-04-15",
        skills: ["React Native", "UI/UX"],
        lastActivity: "Developer submitted v1.2 for review",
        priority: true
    },
    {
        id: "2",
        title: "AI-Powered Customer Support Chatbot",
        description: "Looking for an expert in NLP to build a chatbot that handles L1 support queries.",
        status: "in_progress",
        budget: { min: 3000, max: 5000 },
        proposals: 8,
        deadline: "2024-03-30",
        skills: ["Python", "OpenAI API"],
        lastActivity: "3 days until milestone delivery"
    },
    {
        id: "3",
        title: "Corporate Website Migration to Next.js",
        description: "Migrate our Wordpress site to a high-performance Next.js application.",
        status: "completed",
        budget: { min: 2000, max: 4000 },
        proposals: 5,
        deadline: "2024-02-28",
        skills: ["Next.js", "Sanity.io"],
        lastActivity: "Final payment sent"
    },
    {
        id: "4",
        title: "Real-time Data Visualization Dashboard",
        description: "Build a dashboard for visualizing IoT sensor data in real-time.",
        status: "open",
        budget: { min: 6000, max: 9000 },
        proposals: 3,
        deadline: "2024-05-01",
        skills: ["React", "D3.js"],
        lastActivity: "New proposal received"
    },
    {
        id: "5",
        title: "Legacy System Audit & Fix",
        description: "Identify performance bottlenecks and security flaws in our PHP legacy system.",
        status: "needs_revision",
        budget: { min: 2500, max: 5000 },
        proposals: 15,
        deadline: "2024-04-20",
        skills: ["PHP", "Security"],
        lastActivity: "Client requested revision on Audit Doc",
        priority: true
    },
];

const ClientProjectsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [projects, setProjects] = useState(INITIAL_PROJECTS);

    const updateStatus = (id: string, newStatus: string) => {
        setProjects(prev => prev.map(p => {
            if (p.id === id) {
                return { ...p, status: newStatus as any };
            }
            return p;
        }));
        toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "open":
                return { label: "Hiring", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: Users };
            case "in_progress":
                return { label: "Working", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: PlayCircle };
            case "under_review":
                return { label: "Under Review", color: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: RefreshCw };
            case "needs_revision":
                return { label: "Needs Revision", color: "bg-rose-500/10 text-rose-600 border-rose-500/20", icon: AlertCircle };
            case "completed":
                return { label: "Completed", color: "bg-gray-500/10 text-gray-600 border-gray-500/20", icon: CheckCircle2 };
            default:
                return { label: status, color: "bg-gray-100", icon: Clock };
        }
    };

    const filterByCategory = (category: 'current' | 'hiring' | 'history' | 'all') => {
        return projects.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "all" || p.status === statusFilter;

            if (!matchesSearch || !matchesStatus) return false;

            if (category === 'current') {
                return ["in_progress", "under_review", "needs_revision"].includes(p.status);
            }
            if (category === 'hiring') {
                return ["open"].includes(p.status);
            }
            if (category === 'history') {
                return ["completed"].includes(p.status);
            }
            return true;
        });
    };

    const ProjectGrid = ({ projects: gridProjects, emptyMessage }: { projects: typeof INITIAL_PROJECTS, emptyMessage: { title: string, desc: string, icon: any } }) => (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {gridProjects.map((project) => {
                    const statusInfo = getStatusInfo(project.status);
                    const StatusIcon = statusInfo.icon;

                    return (
                        <Card key={project.id} className={cn(
                            "flex flex-col shadow-soft hover:shadow-lg transition-all duration-200 group overflow-hidden border-l-4",
                            project.status === 'needs_revision' ? "border-l-rose-500" :
                                project.status === 'under_review' ? "border-l-orange-500" :
                                    project.status === 'in_progress' ? "border-l-blue-500" : "border-l-transparent"
                        )}>
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start gap-4">
                                    <Badge variant="outline" className={cn("gap-1 font-bold", statusInfo.color)}>
                                        <StatusIcon className="w-3 h-3" />
                                        {statusInfo.label.toUpperCase()}
                                    </Badge>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => updateStatus(project.id, 'in_progress')}>Move to Working</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateStatus(project.id, 'under_review')}>Move to Review</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateStatus(project.id, 'needs_revision')}>Request Revision</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateStatus(project.id, 'completed')}>Mark as Completed</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Close Project</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardTitle className="text-xl mt-3 line-clamp-1 group-hover:text-primary transition-colors">
                                    {project.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4 pb-4">
                                <p className="text-muted-foreground text-sm line-clamp-2 min-h-[40px]">
                                    {project.description}
                                </p>

                                <div className="bg-muted/30 p-3 rounded-lg border border-border/40">
                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                        <Clock className="w-3 h-3" /> Last Update
                                    </div>
                                    <p className="text-sm font-medium">{project.lastActivity}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <DollarSign className="h-4 w-4 text-primary" />
                                        <span className="font-bold text-foreground">
                                            ${project.budget.max}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Users className="h-4 w-4 text-primary" />
                                        <span className="font-medium">{project.proposals} Proposals</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 pb-6 px-6 grid grid-cols-2 gap-3">
                                <Button variant="outline" className="w-full font-bold" asChild>
                                    <Link to={`/client/projects/${project.id}`}>
                                        Project Hub
                                    </Link>
                                </Button>
                                <Button className={cn(
                                    "w-full font-bold",
                                    project.status === 'under_review' ? "bg-orange-500 hover:bg-orange-600" : ""
                                )} asChild>
                                    <Link to={`/client/projects/${project.id}/proposals`}>
                                        {project.status === 'open' ? 'View Bids' : 'Manage'}
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
            {projects.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed rounded-3xl opacity-60">
                    <emptyMessage.icon className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                    <h3 className="text-xl font-bold">{emptyMessage.title}</h3>
                    <p className="text-muted-foreground">{emptyMessage.desc}</p>
                </div>
            )}
        </div>
    );

    return (
        <DashboardLayout>
            <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight">Project Management</h1>
                        <p className="text-muted-foreground text-lg">
                            Track active work, review submissions, and manage contracts.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" asChild>
                            <Link to="/client/drafts">Drafts</Link>
                        </Button>
                        <Button asChild className="gap-2 shadow-lg shadow-primary/20">
                            <Link to="/client/post-project">
                                <Plus className="h-5 w-5" /> Create New Deal
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-border/40 shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by project name..."
                            className="pl-10 h-11 bg-background/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto ml-auto">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px] h-11 bg-background/50">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Records</SelectItem>
                                <SelectItem value="open">Open Listings</SelectItem>
                                <SelectItem value="in_progress">Working</SelectItem>
                                <SelectItem value="under_review">Needs Review</SelectItem>
                                <SelectItem value="needs_revision">Revision Sent</SelectItem>
                                <SelectItem value="completed">Archive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Tabs defaultValue="current" className="space-y-8">
                    <TabsList className="bg-muted/50 p-1 h-12 w-full max-w-2xl">
                        <TabsTrigger value="current" className="h-full gap-2 font-bold px-6">
                            <RefreshCw className="w-4 h-4" /> Current Projects ({filterByCategory('current').length})
                        </TabsTrigger>
                        <TabsTrigger value="hiring" className="h-full gap-2 font-bold px-6">
                            <Users className="w-4 h-4" /> Hiring ({filterByCategory('hiring').length})
                        </TabsTrigger>
                        <TabsTrigger value="history" className="h-full gap-2 font-bold px-6">
                            <Calendar className="w-4 h-4" /> History ({filterByCategory('history').length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="current" className="space-y-6 animate-in fade-in duration-300">
                        <ProjectGrid
                            projects={filterByCategory('current')}
                            emptyMessage={{
                                title: "No Current Projects",
                                desc: "Accepted projects and those being built will appear here.",
                                icon: RefreshCw
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="hiring" className="space-y-6 animate-in fade-in duration-300">
                        <ProjectGrid
                            projects={filterByCategory('hiring')}
                            emptyMessage={{
                                title: "No Open Listings",
                                desc: "Active project posts looking for freelancers will appear here.",
                                icon: Users
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="history" className="space-y-6 animate-in fade-in duration-300">
                        <ProjectGrid
                            projects={filterByCategory('history')}
                            emptyMessage={{
                                title: "History Clean",
                                desc: "Completed and archived projects will appear here.",
                                icon: Calendar
                            }}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default ClientProjectsPage;
