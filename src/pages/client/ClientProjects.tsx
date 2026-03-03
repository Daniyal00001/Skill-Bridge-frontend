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
  AlertTriangle,
  Briefcase,
  ChevronRight,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Enhanced Mock Data
const INITIAL_PROJECTS = [
  {
    id: "1",
    title: "client projects Mobile App Redesign",
    description:
      "We need a complete overhaul of our existing React Native app to improve user experience and sales conversion.",
    status: "in_progress",
    budget: 7500,
    proposals: 12,
    deadline: "Apr 15, 2024",
    skills: ["React Native", "UI/UX"],
    lastActivity: "2 hours ago",
    progress: 65,
    hiredDeveloper: {
      name: "Alex Chen",
      avatar: "https://i.pravatar.cc/150?u=alex",
      title: "Senior Full Stack Dev",
      isOnline: true,
    },
    milestones: [
      {
        id: 1,
        name: "UI Mockups",
        status: "completed",
        date: "Mar 10",
        amount: "$1,500",
      },
      {
        id: 2,
        name: "Backend API",
        status: "under_review",
        date: "Mar 25",
        amount: "$2,000",
        notes:
          "Completed all REST API endpoints as discussed in the documentation.",
      },
      {
        id: 3,
        name: "Frontend Development",
        status: "pending",
        date: "Apr 05",
        amount: "$2,000",
      },
      {
        id: 4,
        name: "Testing & Deployment",
        status: "pending",
        date: "Apr 15",
        amount: "$2,000",
      },
    ],
    currentMilestone: 2,
    totalMilestones: 4,
    inEscrow: "$4,000",
    needsAttention: false,
  },
  {
    id: "2",
    title: "AI-Powered Customer Support Chatbot",
    description:
      "Looking for an expert in NLP to build a chatbot that handles L1 support queries.",
    status: "in_progress",
    budget: 4500,
    proposals: 8,
    deadline: "Mar 30, 2024",
    skills: ["Python", "OpenAI API"],
    lastActivity: "1 day ago",
    progress: 30,
    hiredDeveloper: {
      name: "Michael Brown",
      avatar: "https://i.pravatar.cc/150?u=mike",
      title: "AI Engineer",
      isOnline: false,
    },
    milestones: [
      {
        id: 1,
        name: "Model Selection",
        status: "completed",
        date: "Mar 05",
        amount: "$1,000",
      },
      {
        id: 2,
        name: "Training Pipeline",
        status: "pending",
        date: "Mar 20",
        amount: "$1,500",
      },
      {
        id: 3,
        name: "Integration",
        status: "pending",
        date: "Mar 30",
        amount: "$2,000",
      },
    ],
    currentMilestone: 1,
    totalMilestones: 3,
    inEscrow: "$3,500",
    needsAttention: true,
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

  const handleApprove = (projectName: string) => {
    toast.success(`Milestone for ${projectName} approved! Funds released.`);
  };

  const handleRequestChanges = (projectName: string) => {
    toast.info(`Revision request sent for ${projectName}.`);
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

    // If we are in the "Active" tab, show the high-detail active project card
    if (activeTab === "active" && project.hiredDeveloper) {
      return (
        <Card
          key={project.id}
          className="border-border/40 bg-card/60 backdrop-blur-md overflow-hidden hover:shadow-2xl transition-all duration-500 group col-span-full"
        >
          {/* Card Header */}
          <CardHeader className="p-8 pb-4 flex flex-row items-start justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-black tracking-tight underline-offset-4 decoration-primary/30 group-hover:underline">
                  <Link to={`/client/projects/${project.id}`}>
                    {project.title}
                  </Link>
                </h2>
                <Badge
                  className={cn(
                    "font-bold uppercase tracking-widest text-[10px] py-1 px-3",
                    config.color,
                  )}
                >
                  {config.label.toUpperCase()}
                </Badge>
                {(project as any).needsAttention && (
                  <Badge
                    variant="destructive"
                    className="gap-1.5 font-bold uppercase tracking-widest text-[10px] py-1 px-3"
                  >
                    <AlertTriangle className="w-3 h-3" /> Needs Attention
                  </Badge>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full hover:bg-muted/80"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to={`/client/projects/${project.id}`}>
                    View Full Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Message Specialist</DropdownMenuItem>
                <DropdownMenuItem>View Legal Contract</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Pause Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>

          <CardContent className="p-8 pt-4 space-y-8">
            {/* Freelancer Row */}
            <div className="flex items-center justify-between p-5 rounded-[1.5rem] bg-primary/5 border border-primary/10 transition-colors group-hover:bg-primary/8">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <Avatar className="h-14 w-14 ring-4 ring-primary/10">
                    <AvatarImage src={project.hiredDeveloper.avatar} />
                    <AvatarFallback>
                      {project.hiredDeveloper.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {(project.hiredDeveloper as any).isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-background rounded-full" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">
                    {project.hiredDeveloper.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {(project.hiredDeveloper as any).title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="secondary"
                  className="font-bold rounded-xl gap-2 h-10 px-6"
                  asChild
                >
                  <Link to="/client/messages">
                    <MessageSquare className="w-4 h-4" /> Message
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="font-bold rounded-xl h-10 px-6"
                >
                  View Profile
                </Button>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-card p-3 px-5 rounded-2xl border border-border/40 shadow-sm">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold tracking-tight">
                    Current: Milestone {(project as any).currentMilestone || 1}{" "}
                    of {(project as any).totalMilestones || 1}
                  </span>
                </div>
                <span className="text-sm font-black text-primary">
                  {project.progress}% Complete
                </span>
              </div>
              <Progress
                value={project.progress}
                className="h-4 bg-muted/60 relative overflow-hidden rounded-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              </Progress>
            </div>

            {/* Milestone List */}
            {((project as any).milestones || []).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(project as any).milestones.map((milestone: any) => (
                  <div
                    key={milestone.id}
                    className={cn(
                      "p-5 rounded-2xl border transition-all flex items-center justify-between group/milestone",
                      milestone.status === "completed"
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : milestone.status === "under_review"
                          ? "bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/5"
                          : "bg-muted/20 border-border/40",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover/milestone:scale-110",
                          milestone.status === "completed"
                            ? "bg-emerald-500 text-white"
                            : milestone.status === "under_review"
                              ? "bg-amber-500 text-white"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {milestone.status === "completed" ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : milestone.status === "under_review" ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <span className="font-black text-xs">
                            {milestone.id}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-sm tracking-tight">
                          {milestone.name}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                          {milestone.status.replace("_", " ")} ·{" "}
                          {milestone.date} · {milestone.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Review Section */}
            {((project as any).milestones || []).some(
              (m: any) => m.status === "under_review",
            ) && (
              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-2 border-amber-500/30 space-y-6 shadow-xl shadow-amber-500/5 transition-all hover:border-amber-500/50">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-black text-xs uppercase tracking-[0.2em]">
                      <Clock className="w-3.5 h-3.5" /> Pending Review
                    </div>
                    <h4 className="text-xl font-black tracking-tight">
                      {project.hiredDeveloper.name} submitted work for Milestone{" "}
                      {(project as any).currentMilestone}
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">
                    Submitted: March 23, 2024
                  </span>
                </div>

                <div className="bg-background/40 backdrop-blur-sm p-5 rounded-2xl border border-amber-500/20">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">
                    Submission Notes:
                  </p>
                  <p className="text-sm font-medium leading-relaxed italic">
                    "
                    {
                      (project as any).milestones.find(
                        (m: any) => m.status === "under_review",
                      )?.notes
                    }
                    "
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-black h-14 rounded-2xl flex-1 text-lg shadow-lg shadow-emerald-500/30 gap-3 group"
                    onClick={() => handleApprove(project.title)}
                  >
                    <CheckCircle2 className="w-6 h-6 transition-transform group-hover:scale-110" />
                    Approve & Release{" "}
                    {
                      (project as any).milestones.find(
                        (m: any) => m.status === "under_review",
                      )?.amount
                    }
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-black h-14 rounded-2xl px-10 text-lg"
                    onClick={() => handleRequestChanges(project.title)}
                  >
                    Request Changes
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-8 pt-0 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-border/40 bg-muted/10">
            <div className="flex items-center gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  In Escrow
                </p>
                <p className="text-lg font-black text-primary">
                  {(project as any).inEscrow || "$0"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Final Deadline
                </p>
                <div className="flex items-center gap-2 text-foreground font-black">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{project.deadline}</span>
                </div>
              </div>
            </div>
            <Button
              asChild
              className="font-black h-12 px-8 rounded-xl gap-2 shadow-lg shadow-primary/20"
            >
              <Link to={`/client/projects/${project.id}`}>
                View Full Details <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      );
    }

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
            <Link to={`/client/projects/${project.id}`}>{project.title}</Link>
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
            onClick={() =>
              project.hiredDeveloper
                ? toast.info("Workspace is under maintenance.")
                : toast.info("Hiring Hub is under maintenance.")
            }
          >
            {project.hiredDeveloper ? "Workspace" : "Hiring Hub"}
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
