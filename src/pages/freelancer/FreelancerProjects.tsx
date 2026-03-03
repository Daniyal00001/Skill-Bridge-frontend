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
  MapPin,
  TrendingUp,
  CreditCard,
  Wallet,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Milestone {
  id: number;
  name: string;
  date: string;
  amount: string;
  status: "completed" | "under_review" | "pending";
  notes?: string;
}

interface Contract {
  id: string;
  title: string;
  status: string;
  progress: number;
  totalBudget: number;
  earned: number;
  currentMilestone: number;
  totalMilestones: number;
  lastActivity: string;
  deadline: string;
  description: string;
  skills: string[];
  needsAttention?: boolean;
  client: {
    name: string;
    avatar: string;
    rating: number;
    location: string;
    isOnline: boolean;
  };
  milestones: Milestone[];
}

interface StatusConfig {
  label: string;
  color: string;
  icon: React.ElementType;
}
import { toast } from "sonner";

// Enhanced Mock Data for Freelancer
const INITIAL_PROJECTS: Contract[] = [
  {
    id: "p1",
    title: "Crypto Wallet Mobile App Development",
    description:
      "Developing a high-security mobile wallet with multi-chain support and biometrics.",
    status: "in_progress",
    totalBudget: 12000,
    earned: 4500,
    deadline: "Apr 15, 2024",
    skills: ["React Native", "Blockchain", "Security"],
    lastActivity: "2 hours ago",
    progress: 45,
    client: {
      name: "ChainTech Solutions",
      avatar: "https://i.pravatar.cc/150?u=chain",
      location: "New York, USA",
      isOnline: true,
      rating: 4.8,
    },
    milestones: [
      {
        id: 1,
        name: "UI Architecture",
        status: "completed",
        date: "Mar 10",
        amount: "$2,000",
      },
      {
        id: 2,
        name: "Core Wallet Logic",
        status: "under_review",
        date: "Mar 25",
        amount: "$2,500",
        notes:
          "Submitted for review. Integrated Web3.js and secure enclave storage.",
      },
      {
        id: 3,
        name: "Multi-Chain Integration",
        status: "pending",
        date: "Apr 05",
        amount: "$3,500",
      },
      {
        id: 4,
        name: "Final Testing & QA",
        status: "pending",
        date: "Apr 15",
        amount: "$4,000",
      },
    ],
    currentMilestone: 2,
    totalMilestones: 4,
    needsAttention: false,
  },
  {
    id: "p2",
    title: "AI Customer Support Chatbot",
    description: "Building an LLM-powered support bot for a FinTech startup.",
    status: "in_progress",
    totalBudget: 5000,
    earned: 1500,
    deadline: "Mar 30, 2024",
    skills: ["Python", "OpenAI", "Next.js"],
    lastActivity: "1 day ago",
    progress: 30,
    client: {
      name: "Streamline AI",
      avatar: "https://i.pravatar.cc/150?u=stream",
      location: "San Francisco, USA",
      isOnline: false,
      rating: 4.9,
    },
    milestones: [
      {
        id: 1,
        name: "Dataset Preparation",
        status: "completed",
        date: "Mar 12",
        amount: "$1,500",
      },
      {
        id: 2,
        name: "Model Fine-tuning",
        status: "pending",
        date: "Mar 22",
        amount: "$1,500",
      },
      {
        id: 3,
        name: "System Integration",
        status: "pending",
        date: "Mar 30",
        amount: "$2,000",
      },
    ],
    currentMilestone: 2,
    totalMilestones: 3,
    needsAttention: true,
  },
  {
    id: "p3",
    title: "E-commerce Platform Refactor",
    description:
      "Refactoring a legacy PHP site to Next.js and Headless Shopify.",
    status: "completed",
    totalBudget: 8500,
    earned: 8500,
    deadline: "Feb 15, 2024",
    skills: ["Next.js", "Shopify", "Tailwind"],
    lastActivity: "1 month ago",
    progress: 100,
    client: {
      name: "Global Goods co.",
      avatar: "https://i.pravatar.cc/150?u=global",
      location: "London, UK",
      isOnline: false,
      rating: 4.7,
    },
    milestones: [],
    currentMilestone: 0,
    totalMilestones: 0,
  },
];

const FreelancerProjects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [projects] = useState(INITIAL_PROJECTS);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch = p.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (activeTab === "active") return p.status === "in_progress";
      if (activeTab === "completed") return p.status === "completed";
      return true;
    });
  }, [searchTerm, activeTab, projects]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "in_progress":
        return {
          label: "In Flight",
          color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          icon: PlayCircle,
        };
      case "completed":
        return {
          label: "Success",
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
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

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-10 animate-fade-in pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/10 mb-2 font-black uppercase tracking-widest text-[10px] px-3 py-1"
            >
              Work Management hub
            </Badge>
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              My Contracts
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl font-medium">
              Manage your active projects, milestones, and client communications
              in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-14 px-8 rounded-2xl font-black border-2 transition-all hover:bg-muted"
              asChild
            >
              <Link to="/freelancer/proposals">Active Bids</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="gap-2 shadow-2xl shadow-primary/40 font-black h-14 px-8 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Link to="/freelancer/browse">
                <Search className="h-5 w-5" /> Find More Work
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Active Revenue",
              value: "$17,000",
              icon: DollarSign,
              color: "text-emerald-500",
            },
            {
              label: "Ongoing",
              value: projects.filter((p) => p.status === "in_progress").length,
              icon: PlayCircle,
              color: "text-blue-500",
            },
            {
              label: "Next Milestone",
              value: "3 Days",
              icon: Clock,
              color: "text-amber-500",
            },
            {
              label: "Total Completed",
              value: projects.filter((p) => p.status === "completed").length,
              icon: CheckCircle2,
              color: "text-violet-500",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-[2rem] bg-card/40 backdrop-blur-md border border-border/40 flex items-center gap-5 group hover:border-primary/20 transition-all shadow-xl shadow-foreground/5 overflow-hidden relative"
            >
              <div
                className={cn(
                  "p-3 rounded-2xl bg-muted/50 transition-transform group-hover:scale-110",
                  stat.color,
                )}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest opacity-60">
                  {stat.label}
                </p>
                <p className="text-2xl font-black tracking-tight">
                  {stat.value}
                </p>
              </div>
              <div className="absolute -bottom-4 -right-4 h-16 w-16 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            </div>
          ))}
        </div>

        {/* Filters & Tabs */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="bg-muted/50 p-1 rounded-2xl border border-border/20"
            >
              <TabsList className="bg-transparent gap-2 h-12">
                <TabsTrigger
                  value="active"
                  className="rounded-xl font-black px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Active Work
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="rounded-xl font-black px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Completed
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="rounded-xl font-black px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Archive
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contracts..."
                  className="pl-12 h-14 bg-card/40 border-border/40 rounded-2xl font-medium focus:ring-primary/20 backdrop-blur-md"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-2xl border-2 hover:bg-muted"
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Project List */}
          <div className="grid grid-cols-1 gap-8">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <ContractCard
                  key={project.id}
                  project={project}
                  statusConfig={getStatusConfig(project.status)}
                />
              ))
            ) : (
              <div className="py-20 text-center space-y-4 bg-card/20 rounded-[3rem] border-4 border-dashed border-border/40 animate-fade-in">
                <div className="p-8 bg-muted/40 rounded-full w-fit mx-auto">
                  <Briefcase className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <h3 className="text-2xl font-black text-foreground/80 tracking-tight">
                  No contracts found
                </h3>
                <p className="text-muted-foreground font-medium max-w-xs mx-auto">
                  You don't have any projects matching these filters. Try
                  browsing for new opportunities!
                </p>
                <Button
                  asChild
                  className="h-12 px-8 rounded-xl font-black mt-4"
                  variant="secondary"
                >
                  <Link to="/freelancer/browse">Discover Jobs</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const ContractCard = ({
  project,
  statusConfig,
}: {
  project: Contract;
  statusConfig: StatusConfig;
}) => {
  const Icon = statusConfig.icon;
  const isCompleted = project.status === "completed";

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-500 group rounded-[2.5rem]">
      {/* Header */}
      <CardHeader className="p-8 pb-4 flex flex-row items-start justify-between">
        <div className="space-y-4 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight truncate decoration-primary/30 group-hover:underline underline-offset-8 transition-all">
              <Link to={`/freelancer/projects/${project.id}`}>
                {project.title}
              </Link>
            </h2>
            <Badge
              className={cn(
                "font-black uppercase tracking-[0.2em] text-[10px] py-1 px-4 rounded-full border-0",
                statusConfig.color,
              )}
            >
              {statusConfig.label}
            </Badge>
            {project.needsAttention && (
              <Badge
                variant="destructive"
                className="gap-2 font-black uppercase tracking-widest text-[10px] py-1 px-3 shadow-lg shadow-destructive/20 animate-pulse"
              >
                <AlertTriangle className="w-3 h-3" /> Deadline Warning
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              {project.client.location}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Last active: {project.lastActivity}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-2xl hover:bg-muted/80"
            >
              <MoreVertical className="w-6 h-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 p-2 rounded-2xl bg-card/90 backdrop-blur-xl border-border/40"
          >
            <DropdownMenuItem className="rounded-xl p-3 font-bold" asChild>
              <Link to={`/freelancer/projects/${project.id}`}>
                Project Overview
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl p-3 font-bold">
              Submit Milestone Work
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl p-3 font-bold">
              Request Payment
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl p-3 font-bold text-destructive">
              Terminate contract
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-8 pt-4 space-y-8">
        {/* Client Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] bg-primary/5 border border-primary/10 transition-all group-hover:bg-primary/8 gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-4 ring-primary/10 shadow-2xl transition-transform group-hover:scale-105">
                <AvatarImage src={project.client.avatar} />
                <AvatarFallback className="font-black bg-primary/20 text-primary">
                  CL
                </AvatarFallback>
              </Avatar>
              {project.client.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-background rounded-full shadow-lg" />
              )}
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-80">
                Connected Client
              </p>
              <h3 className="text-xl font-black tracking-tight">
                {project.client.name}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              variant="secondary"
              className="font-black rounded-2xl gap-3 h-14 px-8 shadow-xl shadow-foreground/5"
              asChild
            >
              <Link to="/freelancer/messages">
                <MessageSquare className="w-5 h-5" /> Send Message
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-black rounded-2xl h-14 px-8 border-2"
            >
              View Brief
            </Button>
          </div>
        </div>

        {/* Progress Section */}
        {!isCompleted && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-center gap-3 bg-card px-5 py-3 rounded-2xl border border-border/40 shadow-sm animate-in slide-in-from-left duration-500">
                <Briefcase className="w-5 h-5 text-primary" />
                <span className="text-sm font-black tracking-tight">
                  Current Goal: Milestone {project.currentMilestone} of{" "}
                  {project.totalMilestones}
                </span>
              </div>
              <div className="flex items-end flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">
                  Contract completion
                </span>
                <span className="text-2xl font-black text-primary leading-none">
                  {project.progress}%{" "}
                  <span className="text-sm font-bold opacity-60">Verified</span>
                </span>
              </div>
            </div>
            <Progress
              value={project.progress}
              className="h-4 bg-muted/60 rounded-full overflow-hidden relative border border-border/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            </Progress>
          </div>
        )}

        {/* Financials & Milestones */}
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground border-b border-border/20 pb-2">
              Active Roadmap
            </h4>
            <div className="space-y-3">
              {(project.milestones || []).map((m: Milestone) => (
                <div
                  key={m.id}
                  className={cn(
                    "p-5 rounded-2xl border transition-all flex items-center justify-between group/m shadow-sm hover:shadow-md",
                    m.status === "completed"
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : m.status === "under_review"
                        ? "bg-amber-500/10 border-amber-500/30 ring-2 ring-amber-500/10"
                        : "bg-card border-border/40",
                  )}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                        m.status === "completed"
                          ? "bg-emerald-500 text-white"
                          : m.status === "under_review"
                            ? "bg-amber-500 text-white animate-pulse"
                            : "bg-muted/60 text-muted-foreground border border-border/60",
                      )}
                    >
                      {m.status === "completed" ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : m.status === "under_review" ? (
                        <Clock className="w-6 h-6" />
                      ) : (
                        <span className="font-black text-sm">{m.id}</span>
                      )}
                    </div>
                    <div className="truncate">
                      <p className="font-black text-sm tracking-tight truncate">
                        {m.name}
                      </p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        Due {m.date} • {m.amount}
                      </p>
                    </div>
                  </div>
                  {m.status === "under_review" && (
                    <Badge
                      variant="secondary"
                      className="bg-amber-500/20 text-amber-700 dark:text-amber-400 font-black text-[8px] border-amber-500/20"
                    >
                      Awaiting Client
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8 h-full flex flex-col">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground border-b border-border/20 pb-2">
              Financial Summary
            </h4>
            <div className="bg-muted/20 p-8 rounded-[2rem] border border-border/40 flex-1 space-y-8 flex flex-col justify-center">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Total Contract Value
                  </p>
                  <p className="text-3xl font-black tracking-tighter">
                    ${project.totalBudget.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-primary opacity-20" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold tracking-tight">
                  <span className="text-muted-foreground">
                    Earnings Received
                  </span>
                  <span className="text-emerald-500">
                    ${project.earned.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={(project.earned / project.totalBudget) * 100}
                  className="h-2 bg-muted/60 rounded-full"
                />
              </div>
              <div className="pt-4 border-t border-border/20 flex gap-4">
                <div className="flex-1 p-4 bg-background/50 rounded-2xl border border-border/40">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                    In Escrow
                  </p>
                  <p className="font-black text-primary">
                    ${(project.totalBudget - project.earned).toLocaleString()}
                  </p>
                </div>
                <div className="flex-1 p-4 bg-background/50 rounded-2xl border border-border/40">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                    Est. Completion
                  </p>
                  <p className="font-black text-primary">{project.deadline}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-8 pt-0 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-border/20 bg-muted/5">
        <div className="flex items-center gap-8">
          <div className="flex -space-x-3">
            {[1, 2, 3].map((i) => (
              <Avatar
                key={i}
                className="h-10 w-10 ring-4 ring-background border-2 border-border/40"
              >
                <AvatarImage src={`https://i.pravatar.cc/150?u=${i + 10}`} />
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
            ))}
            <div className="h-10 w-10 rounded-full bg-muted border-4 border-background flex items-center justify-center text-[10px] font-black text-muted-foreground">
              +4
            </div>
          </div>
          <p className="text-xs font-bold text-muted-foreground italic">
            Shared with 7 team members
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Button
            variant="outline"
            className="h-14 px-8 rounded-2xl font-black border-2 flex-1 md:flex-none"
            asChild
          >
            <Link to={`/freelancer/projects/${project.id}`}>
              Open Contract Dashboard
            </Link>
          </Button>
          <Button className="h-14 px-10 rounded-2xl font-black shadow-lg shadow-primary/20 flex-1 md:flex-none gap-3 group">
            Manage Milestones{" "}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FreelancerProjects;
