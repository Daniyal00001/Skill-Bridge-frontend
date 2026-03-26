import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreVertical,
  Search,
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
  Loader2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";

const ClientProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("active");
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Fetch client's own projects
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await api.get("/projects/client/my");
        setProjects(res.data.projects);
      } catch (err) {
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Delete project
  const handleDelete = async (projectId: string) => {
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success("Project cancelled and bidders refunded.");
      const res = await api.get("/projects/client/my");
      setProjects(res.data.projects);
      setConfirmDeleteId(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete project");
    }
  };

  // Approve milestone
  const handleApprove = async (
    projectId: string,
    milestoneId: string,
    contractId: string,
  ) => {
    try {
      await api.patch(
        `/contracts/${contractId}/milestones/${milestoneId}/approve`,
      );
      toast.success("Milestone approved! Funds released. ✅");
      // Refresh projects
      const res = await api.get("/projects/client/my");
      setProjects(res.data.projects);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to approve milestone",
      );
    }
  };

  // Request revision
  const handleRequestChanges = async (
    contractId: string,
    milestoneId: string,
  ) => {
    try {
      await api.patch(
        `/contracts/${contractId}/milestones/${milestoneId}/revision`,
        {
          feedback: "Please review and make the requested changes.",
        },
      );
      toast.info("Revision request sent.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to request revision");
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "OPEN":
        return {
          label: "Hiring",
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          icon: Users,
        };
      case "IN_PROGRESS":
        return {
          label: "On Track",
          color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          icon: PlayCircle,
        };
      case "UNDER_REVIEW":
        return {
          label: "Needs Review",
          color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
          icon: Clock,
        };
      case "COMPLETED":
        return {
          label: "Completed",
          color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
          icon: CheckCircle2,
        };
      case "DRAFT":
        return {
          label: "Draft",
          color: "bg-muted text-muted-foreground",
          icon: Layout,
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
    const now = new Date();
    const cutoff: Date | null = (() => {
      switch (dateFilter) {
        case "7d":
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case "30d":
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case "3m":
          return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        case "1y":
          return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default:
          return null;
      }
    })();

    return projects.filter((p) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (p.title?.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.contract?.freelancer?.name?.toLowerCase().includes(searchLower)) ??
        false;

      const pDate = p.createdAt ? new Date(p.createdAt) : null;
      const matchesDate =
        !cutoff || (pDate && pDate.getTime() >= cutoff.getTime());

      if (!matchesSearch || !matchesDate) return false;

      if (activeTab === "active")
        return ["IN_PROGRESS", "UNDER_REVIEW"].includes(p.status);
      if (activeTab === "hiring") return p.status === "OPEN";
      if (activeTab === "completed") return p.status === "COMPLETED";
      if (activeTab === "drafts") return p.status === "DRAFT";
      return true;
    });
  }, [projects, searchTerm, dateFilter, activeTab]);

  // Stats from real data
  const stats = {
    totalValue: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    inProgress: projects.filter((p) => p.status === "IN_PROGRESS").length,
    open: projects.filter((p) => p.status === "OPEN").length,
    completed: projects.filter((p) => p.status === "COMPLETED").length,
  };

  const ProjectCardUI = ({ project }: { project: any }) => {
    const config = getStatusConfig(project.status);
    const Icon = config.icon;
    const isActive = ["IN_PROGRESS", "UNDER_REVIEW"].includes(project.status);
    const contract = project.contract;
    const hiredDeveloper = contract?.freelancer;

    // Active project with hired developer — expanded card
    if (activeTab === "active" && hiredDeveloper) {
      const milestones = contract?.milestones || [];
      const completedCount = milestones.filter(
        (m: any) => m.status === "APPROVED",
      ).length;
      const progress =
        milestones.length > 0
          ? Math.round((completedCount / milestones.length) * 100)
          : 0;
      const pendingReview = milestones.find(
        (m: any) => m.status === "SUBMITTED",
      );

      return (
        <Card className="border-border/40 bg-card/60 backdrop-blur-md overflow-hidden hover:shadow-2xl transition-all duration-500 group col-span-full">
          <CardHeader className="p-6 pb-2 flex flex-row items-start justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-black tracking-tight break-words">
                  <Link
                    to={`/client/contracts/${contract.id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {project.title}
                  </Link>
                </h2>
                <Badge
                  className={cn(
                    "font-bold uppercase tracking-widest text-[10px] py-1 px-3",
                    config.color,
                  )}
                >
                  {config.label}
                </Badge>
                {project.hiringMethod && (
                  <Badge
                    variant="outline"
                    className="font-black uppercase tracking-widest text-[10px] py-1 px-3 bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1"
                  >
                    <Zap className="w-3 h-3" /> {project.hiringMethod}
                  </Badge>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  disabled={!["OPEN", "DRAFT"].includes(project.status)}
                  className={cn(
                    "cursor-pointer",
                    ["OPEN", "DRAFT"].includes(project.status)
                      ? "text-destructive focus:text-destructive"
                      : "text-muted-foreground opacity-50 cursor-not-allowed",
                  )}
                  onClick={() =>
                    ["OPEN", "DRAFT"].includes(project.status)
                      ? setConfirmDeleteId(project.id)
                      : undefined
                  }
                >
                  <span>Delete Project</span>
                  {!["OPEN", "DRAFT"].includes(project.status) && (
                    <span className="block text-[10px] font-normal mt-0.5 text-muted-foreground">
                      Only Hiring or Draft projects
                    </span>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>

          <CardContent className="p-6 pt-2 space-y-6">
            {/* Hired Developer Row */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-14 w-14 ring-4 ring-primary/10">
                    <AvatarImage src={hiredDeveloper.profileImage} />
                    <AvatarFallback>{hiredDeveloper.name?.[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h3 className="text-lg font-black">{hiredDeveloper.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {hiredDeveloper.title || "Freelancer"}
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
                  asChild
                >
                  <Link to={`/freelancer/profile/${hiredDeveloper.id}`}>
                    View Profile
                  </Link>
                </Button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-card p-3 px-5 rounded-2xl border border-border/40">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">
                    {completedCount} of {milestones.length} Milestones Complete
                  </span>
                </div>
                <span className="text-sm font-black text-primary">
                  {progress}%
                </span>
              </div>
              <Progress
                value={progress}
                className="h-4 bg-muted/60 rounded-full"
              />
            </div>

            {/* Milestones */}
            {milestones.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {milestones.map((milestone: any) => (
                  <div
                    key={milestone.id}
                    className={cn(
                      "p-5 rounded-2xl border flex items-center justify-between",
                      milestone.status === "APPROVED"
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : milestone.status === "SUBMITTED"
                          ? "bg-amber-500/10 border-amber-500/30"
                          : "bg-muted/20 border-border/40",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          milestone.status === "APPROVED"
                            ? "bg-emerald-500 text-white"
                            : milestone.status === "SUBMITTED"
                              ? "bg-amber-500 text-white"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {milestone.status === "APPROVED" ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : milestone.status === "SUBMITTED" ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <span className="font-black text-xs">
                            {milestone.order || "•"}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-sm break-words">
                          {milestone.title}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                          {milestone.status} · $
                          {milestone.amount?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pending Review Section */}
            {pendingReview && contract && (
              <div className="p-6 rounded-[1.5rem] bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-2 border-amber-500/30 space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase tracking-widest mb-2">
                    <Clock className="w-3.5 h-3.5" /> Pending Review
                  </div>
                  <h4 className="text-xl font-black break-words">
                    {hiredDeveloper.name} submitted work for "
                    {pendingReview.title}"
                  </h4>
                </div>
                {pendingReview.submissionNote && (
                  <div className="bg-background/40 p-5 rounded-2xl border border-amber-500/20">
                    <p className="text-xs font-black text-muted-foreground uppercase mb-2">
                      Submission Notes:
                    </p>
                    <p className="text-sm italic">
                      "{pendingReview.submissionNote}"
                    </p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-black h-12 rounded-xl flex-1 text-base gap-3"
                    onClick={() =>
                      handleApprove(project.id, pendingReview.id, contract.id)
                    }
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Approve & Release ${pendingReview.amount?.toLocaleString()}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-amber-500/50 text-amber-600 font-black h-12 rounded-xl px-8 text-base"
                    onClick={() =>
                      handleRequestChanges(contract.id, pendingReview.id)
                    }
                  >
                    Request Changes
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-6 pt-0 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-border/40 bg-muted/10">
            <div className="flex items-center gap-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Budget
                </p>
                <p className="text-lg font-black text-primary">
                  ${project.budget?.toLocaleString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Deadline
                </p>
                <div className="flex items-center gap-2 font-black">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>
                    {project.deadline
                      ? new Date(project.deadline).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <Button asChild className="font-black h-12 px-8 rounded-xl gap-2">
              <Link to={`/client/contracts/${contract.id}`}>
                View Full Details <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      );
    }

    // Compact card for hiring/completed/all tabs
    return (
      <Card className="group overflow-hidden border-border/40 bg-card/50 hover:shadow-2xl hover:border-primary/20 transition-all duration-500 flex flex-col">
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={cn("gap-1.5 font-bold py-1", config.color)}
              >
                <Icon className="w-3.5 h-3.5" />
                {config.label.toUpperCase()}
              </Badge>
              {project.hiringMethod && (
                <Badge
                  variant="outline"
                  className="font-bold py-1 bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1 text-[10px]"
                >
                  <Zap className="w-3 h-3" />{" "}
                  {project.hiringMethod.toUpperCase()}
                </Badge>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  disabled={!["OPEN", "DRAFT"].includes(project.status)}
                  className={cn(
                    "cursor-pointer",
                    ["OPEN", "DRAFT"].includes(project.status)
                      ? "text-destructive focus:text-destructive"
                      : "text-muted-foreground opacity-50 cursor-not-allowed",
                  )}
                  onClick={() =>
                    ["OPEN", "DRAFT"].includes(project.status)
                      ? setConfirmDeleteId(project.id)
                      : undefined
                  }
                >
                  <span>Delete Project</span>
                  {!["OPEN", "DRAFT"].includes(project.status) && (
                    <span className="block text-[10px] font-normal mt-0.5 text-muted-foreground">
                      Only Hiring or Draft projects
                    </span>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="text-xl mt-4 break-all hover:text-primary transition-colors">
            <Link to={`/client/projects/${project.id}`}>{project.title}</Link>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-4 flex-1">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed break-words">
            {project.description}
          </p>

          {hiredDeveloper ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={hiredDeveloper.profileImage} />
                <AvatarFallback>{hiredDeveloper.name?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">
                  Hired Developer
                </p>
                <p className="text-sm font-semibold truncate">
                  {hiredDeveloper.name}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-primary"
                asChild
              >
                <Link to="/client/messages">
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-dashed border-border/60">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">
                {project._count?.proposals || 0} Proposals Received
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
                  Progress
                </span>
                <span className="text-primary">
                  {project.contract?.milestones
                    ? `${project.contract.milestones.filter((m: any) => m.status === "APPROVED").length}/${project.contract.milestones.length} milestones`
                    : "0%"}
                </span>
              </div>
              <Progress
                value={
                  project.contract?.milestones?.length
                    ? (project.contract.milestones.filter(
                        (m: any) => m.status === "APPROVED",
                      ).length /
                        project.contract.milestones.length) *
                      100
                    : 0
                }
                className="h-2 bg-muted/60"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold">
                ${project.budget?.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {project.deadline
                  ? new Date(project.deadline).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-10 font-bold" asChild>
            <Link to={`/client/projects/${project.id}`}>Overview</Link>
          </Button>
          <Button
            className="h-10 font-bold shadow-lg shadow-primary/20"
            asChild
          >
            {project.status === "OPEN" ? (
              <Link to={`/client/projects/${project.id}/proposals`}>
                View Bids
              </Link>
            ) : project.status === "DRAFT" ? (
              <Link to={`/client/post-project?draftId=${project.id}`}>
                Continue
              </Link>
            ) : (
              <Link
                to={
                  project.contract?.id
                    ? `/client/contracts/${project.contract.id}`
                    : `/client/projects/${project.id}`
                }
              >
                Manage
              </Link>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6 space-y-8 animate-fade-in mb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/10 mb-2"
            >
              Unified Management Hub
            </Badge>
            <h1 className="text-4xl font-black tracking-tight">
              My Projects
            </h1>
            <p className="text-muted-foreground text-base max-w-xl">
              Consolidated view of all your projects, from discovery to
              delivery.
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="gap-2 shadow-2xl shadow-primary/40 font-black h-12 px-6 rounded-xl"
          >
            <Link to="/client/post-project">
              <Plus className="h-5 w-5" /> Post New Project
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Value",
              value: `$${stats.totalValue.toLocaleString()}`,
              icon: DollarSign,
              color: "text-emerald-500",
            },
            {
              label: "In Progress",
              value: stats.inProgress,
              icon: PlayCircle,
              color: "text-blue-500",
            },
            {
              label: "Open Bids",
              value: stats.open,
              icon: Users,
              color: "text-amber-500",
            },
            {
              label: "Completed",
              value: stats.completed,
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

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-1.5 items-stretch lg:items-center justify-start">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full lg:w-auto"
          >
            <TabsList className="bg-muted/50 p-0.5 h-9 rounded-xl border border-border/40 w-full lg:w-auto overflow-x-auto custom-scrollbar no-scrollbar">
              {[
                { id: "active", label: "Active", icon: PlayCircle },
                { id: "hiring", label: "Hiring", icon: Users },
                { id: "completed", label: "Completed", icon: CheckCircle2 },
                { id: "drafts", label: "Drafts", icon: AlertTriangle },
                { id: "all", label: "All", icon: Layout },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="h-full rounded-lg gap-1 px-2 md:px-3 font-black text-[10px] uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                >
                  <tab.icon className="w-3 h-3" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex flex-col sm:flex-row gap-2 items-center w-full lg:w-auto lg:min-w-[300px]">
            <div className="relative w-full lg:w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 h-9 bg-card/60 rounded-xl border-border/40 w-full text-[10px] font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[110px] h-9 bg-card/60 rounded-xl border-border/40 font-black shrink-0 text-[10px] uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <SelectValue placeholder="Date" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">
              Loading your projects...
            </p>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCardUI key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-card/20 rounded-[3rem] border-4 border-dashed border-border/40">
            <div className="p-10 bg-muted/30 rounded-full mb-8">
              <AlertCircle className="w-20 h-20 text-muted-foreground/30" />
            </div>
            <h3 className="text-3xl font-black text-foreground/70">
              No matching projects
            </h3>
            <p className="text-muted-foreground mt-3 text-lg max-w-sm text-center">
              No projects found for the selected filters.
            </p>
            <Button
              variant="outline"
              className="mt-8 rounded-xl font-bold px-8 h-12"
              onClick={() => {
                setSearchTerm("");
                setDateFilter("all");
                setActiveTab("all");
              }}
            >
              View All Projects
            </Button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AlertDialog
          open={!!confirmDeleteId}
          onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        >
          <AlertDialogContent className="rounded-2xl border-2 border-border shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black flex items-center gap-3 text-destructive">
                <AlertTriangle className="w-8 h-8" /> Cancel Project?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base text-muted-foreground mt-4 leading-relaxed">
                This action cannot be undone. All freelancers who submitted
                proposals will be **notified** and their **Skill Tokens will be
                refunded** immediately. The project will be moved to your
                cancelled records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 gap-3">
              <AlertDialogCancel className="rounded-xl h-12 font-bold px-6">
                No, Keep Project
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
                className="rounded-xl h-12 font-bold px-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20"
              >
                Yes, Cancel Project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default ClientProjectsPage;
