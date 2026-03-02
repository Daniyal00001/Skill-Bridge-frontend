import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  MessageSquare,
  PlayCircle,
  Layout,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Enhanced Mock Data
const INITIAL_PROJECTS = [
  {
    id: "1",
    title: "E-Commerce Mobile App Redesign",
    description:
      "We need a complete overhaul of our existing React Native app to improve user experience and sales conversion.",
    status: "under_review",
    budget: 7500,
    proposals: 12,
    deadline: "2024-04-15",
    skills: ["React Native", "UI/UX"],
    lastActivity: "2 hours ago",
    progress: 65,
    hiredDeveloper: {
      name: "Alex Chen",
      avatar: "https://i.pravatar.cc/150?u=alex",
      title: "Senior Full Stack Dev",
    },
  },
  {
    id: "2",
    title: "AI-Powered Customer Support Chatbot",
    description:
      "Looking for an expert in NLP to build a chatbot that handles L1 support queries.",
    status: "in_progress",
    budget: 4500,
    proposals: 8,
    deadline: "2024-03-30",
    skills: ["Python", "OpenAI API"],
    lastActivity: "1 day ago",
    progress: 30,
    hiredDeveloper: {
      name: "Michael Brown",
      avatar: "https://i.pravatar.cc/150?u=mike",
      title: "AI Engineer",
    },
  },
  {
    id: "3",
    title: "Corporate Website Migration to Next.js",
    description:
      "Migrate our Wordpress site to a high-performance Next.js application.",
    status: "completed",
    budget: 3000,
    proposals: 5,
    deadline: "2024-02-28",
    skills: ["Next.js", "Sanity.io"],
    lastActivity: "5 hours ago",
    progress: 100,
    hiredDeveloper: {
      name: "Emily Davis",
      avatar: "https://i.pravatar.cc/150?u=emily",
      title: "Frontend Developer",
    },
  },
  {
    id: "4",
    title: "Real-time Data Visualization Dashboard",
    description:
      "Build a dashboard for visualizing IoT sensor data in real-time.",
    status: "open",
    budget: 8500,
    proposals: 3,
    deadline: "2024-05-01",
    skills: ["React", "D3.js"],
    lastActivity: "New proposal received",
    progress: 0,
  },
  {
    id: "5",
    title: "Legacy System Audit & Fix",
    description:
      "Identify performance bottlenecks and security flaws in our PHP legacy system.",
    status: "needs_revision",
    budget: 5000,
    proposals: 15,
    deadline: "2024-04-20",
    skills: ["PHP", "Security"],
    lastActivity: "Client requested revision",
    progress: 45,
    hiredDeveloper: {
      name: "Sarah Wilson",
      avatar: "https://i.pravatar.cc/150?u=sarah",
      title: "Security Consultant",
    },
  },
];

const ClientProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("active");
  const [projects, setProjects] = useState(INITIAL_PROJECTS);

  const updateStatus = (id: string, newStatus: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus as any } : p)),
    );
    toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "open":
        return {
          label: "Hiring",
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          icon: Users,
        };
      case "in_progress":
        return {
          label: "On Track",
          color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          icon: PlayCircle,
        };
      case "under_review":
        return {
          label: "Needs Review",
          color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
          icon: Clock,
        };
      case "needs_revision":
        return {
          label: "Revision Sent",
          color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
          icon: AlertCircle,
        };
      case "completed":
        return {
          label: "Completed",
          color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
          icon: CheckCircle2,
        };
      default:
        return {
          label: status,
          color: "bg-muted text-muted-foreground",
          icon: Layout,
        };
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      if (!matchesSearch || !matchesStatus) return false;

      if (activeTab === "active")
        return ["in_progress", "under_review", "needs_revision"].includes(
          p.status,
        );
      if (activeTab === "hiring") return p.status === "open";
      if (activeTab === "completed") return p.status === "completed";
      return true; // "all" tab
    });
  }, [projects, searchTerm, statusFilter, activeTab]);

  const ProjectCardUI = ({
    project,
  }: {
    project: (typeof INITIAL_PROJECTS)[0];
  }) => {
    const config = getStatusConfig(project.status);
    const Icon = config.icon;
    const isActive = ["in_progress", "under_review", "needs_revision"].includes(
      project.status,
    );

    return (
      <Card className="group overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 flex flex-col">
        <CardHeader className="p-5 pb-0">
          <div className="flex justify-between items-start">
            <Badge
              variant="outline"
              className={cn("gap-1.5 font-bold py-1", config.color)}
            >
              <Icon className="w-3.5 h-3.5" />
              {config.label.toUpperCase()}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-muted"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to={`/client/projects/${project.id}`}>
                    View Details
                  </Link>
                </DropdownMenuItem>
                {project.status === "open" && (
                  <DropdownMenuItem
                    onClick={() => updateStatus(project.id, "in_progress")}
                  >
                    Start Contract
                  </DropdownMenuItem>
                )}
                {isActive && (
                  <>
                    <DropdownMenuItem>Review Milestone</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => updateStatus(project.id, "completed")}
                    >
                      Mark Completed
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem className="text-destructive">
                  Archive Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="text-xl mt-4 line-clamp-1 decoration-primary/30 underline-offset-4 group-hover:underline">
            {project.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-5 space-y-6 flex-1">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          {project.hiredDeveloper ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={project.hiredDeveloper.avatar} />
                <AvatarFallback>
                  {project.hiredDeveloper.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">
                  Hired Specialist
                </p>
                <p className="text-sm font-semibold truncate">
                  {project.hiredDeveloper.name}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-primary"
                asChild
              >
                <Link to={`/client/messages`}>
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-dashed border-border/60">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">
                {project.proposals} Proposals Received
              </p>
              <Button
                size="sm"
                variant="link"
                className="ml-auto text-xs h-auto p-0"
                asChild
              >
                <Link to={`/client/projects/${project.id}/proposals`}>
                  View Bids
                </Link>
              </Button>
            </div>
          )}

          {isActive && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted-foreground uppercase tracking-widest">
                  Execution Progress
                </span>
                <span className="text-primary">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2 bg-muted/60" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground">
                ${project.budget.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{project.deadline}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-10 font-bold border-border/60 hover:bg-muted"
            asChild
          >
            <Link to={`/client/projects/${project.id}`}>Overview</Link>
          </Button>
          <Button
            className="h-10 font-bold shadow-lg shadow-primary/20"
            asChild
          >
            <Link
              to={
                project.hiredDeveloper
                  ? `/workspace/${project.id}`
                  : `/client/projects/${project.id}/proposals`
              }
            >
              {project.hiredDeveloper ? "Workspace" : "Hiring Hub"}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-10 animate-fade-in mb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/10 mb-2"
            >
              Unified Management Hub
            </Badge>
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              My Projects
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Consolidated view of all your projects, from discovery to
              delivery.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="font-bold gap-2" asChild>
              <Link to="/client/drafts">
                <Layout className="w-4 h-4" /> Drafts
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="gap-2 shadow-2xl shadow-primary/40 font-black h-14 px-8 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Link to="/client/post-project">
                <Plus className="h-6 w-6" /> Post New Project
              </Link>
            </Button>
          </div>
        </div>

        {/* Dashboard Stats (Optional/Visual) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Value",
              value: "$28,500",
              icon: DollarSign,
              color: "text-emerald-500",
            },
            {
              label: "In Progress",
              value: projects.filter((p) => p.status === "in_progress").length,
              icon: PlayCircle,
              color: "text-blue-500",
            },
            {
              label: "Open Bids",
              value: projects.filter((p) => p.status === "open").length,
              icon: Users,
              color: "text-amber-500",
            },
            {
              label: "Completed",
              value: projects.filter((p) => p.status === "completed").length,
              icon: CheckCircle2,
              color: "text-violet-500",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-card/40 border border-border/40 flex items-center gap-4"
            >
              <div className={cn("p-2.5 rounded-xl bg-muted/50", stat.color)}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">
                  {stat.label}
                </p>
                <p className="text-xl font-black">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Filter Control Bar */}
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full lg:w-auto"
          >
            <TabsList className="bg-muted/50 p-1.5 h-14 rounded-2xl border border-border/40">
              {[
                { id: "active", label: "Active", icon: PlayCircle },
                { id: "hiring", label: "Hiring", icon: Users },
                { id: "completed", label: "Completed", icon: CheckCircle2 },
                { id: "all", label: "View All", icon: Layout },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="h-full rounded-xl gap-2 px-6 font-black data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex flex-1 w-full gap-4 items-center ml-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects by keyword..."
                className="pl-12 h-14 bg-card/60 rounded-2xl border-border/40 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px] h-14 bg-card/60 rounded-2xl border-border/40 shadow-sm font-bold">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Status Filter" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/40">
                <SelectItem value="all">Every Record</SelectItem>
                <SelectItem value="open">Open Listings</SelectItem>
                <SelectItem value="in_progress">On Track</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="needs_revision">Revision Sent</SelectItem>
                <SelectItem value="completed">Archive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Grid */}
        <div className="space-y-10">
          {filteredProjects.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCardUI key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 bg-card/20 rounded-[3rem] border-4 border-dashed border-border/40 transition-all">
              <div className="p-10 bg-muted/30 rounded-full mb-8">
                <AlertCircle className="w-20 h-20 text-muted-foreground/30" />
              </div>
              <h3 className="text-3xl font-black text-foreground/70">
                No matching projects
              </h3>
              <p className="text-muted-foreground mt-3 text-lg max-w-sm text-center">
                We couldn't find any records for "{activeTab}" status with those
                filters.
              </p>
              <Button
                variant="outline"
                className="mt-8 rounded-xl font-bold px-8 h-12"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setActiveTab("all");
                }}
              >
                View All Projects
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientProjectsPage;
