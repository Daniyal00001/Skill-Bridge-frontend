import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  Edit,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Eye,
  Bookmark,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Briefcase,
  ExternalLink,
  PlusCircle,
  Zap,
  Trash2,
  Archive,
  Pause,
  ChevronDown,
  Layout,
  ChevronRight,
  Star,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// Mock Data for the project
const MOCK_PROJECTS = {
  "1": {
    id: "1",
    title: "E-Commercee Mobile App Redesign",
    description:
      "We need a complete overhaul of our existing React Native app to improve user experience and sales conversion. The project focuses on streamlining the checkout process, integrating new payment gateways, and implementing a more social-driven shopping experience. We are looking for a developer who understands both technical implementation and UX best practices.",
    category: "Mobile Development",
    experienceLevel: "Expert",
    status: "in_progress",
    budget: "$7,500",
    budgetType: "Fixed Price",
    postedDate: "March 20, 2024",
    deadline: "April 15, 2024",
    daysRemaining: 12,
    progress: 65,
    functionalRequirements: [
      "Seamless integration with Stripe and PayPal",
      "Dynamic social feed for product discovery",
      "Push notification system for order updates",
      "Optimized image loading for slower connections",
    ],
    skills: ["React Native", "UI/UX", "Stripe API", "Node.js", "Firebase"],
    projectSize: "Large",
    hiringMethod: "Direct Hire",
    devsNeeded: 1,
    views: 47,
    proposals: 8,
    shortlisted: 2,
    hiredDeveloper: {
      name: "Alex Chen",
      avatar: "https://i.pravatar.cc/150?u=alex",
      title: "Senior Full Stack Dev",
      rating: 4.9,
    },
    milestones: [
      {
        id: 1,
        name: "Discovery & Wireframing",
        date: "Mar 25",
        amount: "$1,500",
        status: "completed",
      },
      {
        id: 2,
        name: "Core Feature Development",
        date: "Apr 05",
        amount: "$4,000",
        status: "active",
      },
      {
        id: 3,
        name: "Testing & Launch",
        date: "Apr 15",
        amount: "$2,000",
        status: "pending",
      },
    ],
    proposalsList: [
      {
        name: "Sarah Jones",
        avatar: "https://i.pravatar.cc/150?u=sarah",
        bid: "$6,800",
        time: "25 days",
        rating: 4.8,
      },
      {
        name: "Michael Brown",
        avatar: "https://i.pravatar.cc/150?u=mike",
        bid: "$7,200",
        time: "30 days",
        rating: 5.0,
      },
      {
        name: "David Lee",
        avatar: "https://i.pravatar.cc/150?u=david",
        bid: "$8,000",
        time: "20 days",
        rating: 4.7,
      },
    ],
    activity: [
      {
        type: "posted",
        text: "Project posted",
        time: "5 days ago",
        icon: PlusCircle,
        color: "text-emerald-500",
      },
      {
        type: "proposal",
        text: "Alex Chen submitted proposal",
        time: "3 days ago",
        icon: Users,
        color: "text-blue-500",
      },
      {
        type: "proposal",
        text: "Sarah Jones submitted proposal",
        time: "2 days ago",
        icon: Users,
        color: "text-blue-500",
      },
      {
        type: "view",
        text: "12 freelancers viewed your project",
        time: "Today",
        icon: Eye,
        color: "text-amber-500",
      },
    ],
  },
  "4": {
    id: "4",
    title: "Real-time Data Visualization Dashboard",
    description:
      "Build a dashboard for visualizing IoT sensor data in real-time. The project requires expertise in D3.js and WebSocket communication.",
    category: "Data Visualization",
    experienceLevel: "Expert",
    status: "open",
    budget: "$5,000 - $8,000",
    budgetType: "Fixed Price",
    postedDate: "March 28, 2024",
    deadline: "May 01, 2024",
    daysRemaining: 28,
    progress: 0,
    functionalRequirements: [
      "Real-time data streaming",
      "Interactive D3 charts",
      "Alerting system",
    ],
    skills: ["React", "D3.js", "WebSockets"],
    projectSize: "Medium",
    hiringMethod: "Competitive Bidding",
    devsNeeded: 2,
    views: 112,
    proposals: 15,
    shortlisted: 4,
    activity: [
      {
        type: "posted",
        text: "Project posted",
        time: "2 days ago",
        icon: PlusCircle,
        color: "text-emerald-500",
      },
      {
        type: "view",
        text: "45 freelancers viewed your project",
        time: "Yesterday",
        icon: Eye,
        color: "text-amber-500",
      },
    ],
    milestones: [
      {
        id: 1,
        name: "Initial Prototype",
        date: "Apr 10",
        amount: "$2,000",
        status: "pending",
      },
      {
        id: 2,
        name: "Final Delivery",
        date: "May 01",
        amount: "$4,000",
        status: "pending",
      },
    ],
    proposalsList: [
      {
        name: "John Doe",
        avatar: "https://i.pravatar.cc/150?u=john",
        bid: "$5,500",
        time: "15 days",
        rating: 4.9,
      },
    ],
  },
};

const ClientProjectDetailsPage = () => {
  const { projectId } = useParams();
  const project =
    MOCK_PROJECTS[projectId as keyof typeof MOCK_PROJECTS] ||
    MOCK_PROJECTS["1"];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            OPEN
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            IN PROGRESS
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-violet-500/10 text-violet-500 border-violet-500/20">
            COMPLETED
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in max-w-7xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          asChild
          className="gap-2 -ml-4 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
        >
          <Link to="/client/projects">
            <ChevronLeft className="w-4 h-4" />
            Back to My Projects
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content (65%) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Project Header Card */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                  {getStatusBadge(project.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 font-bold h-9"
                  >
                    <Edit className="w-4 h-4" /> Edit Project
                  </Button>
                </div>
                <CardTitle className="text-3xl font-black tracking-tight leading-tight">
                  {project.title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-4 mt-6">
                  <Badge
                    variant="outline"
                    className="bg-primary/5 text-primary border-primary/20"
                  >
                    {project.category}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">
                      {project.experienceLevel} Level
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Posted {project.postedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span
                      className={cn(
                        project.daysRemaining < 7
                          ? "text-destructive font-bold"
                          : "",
                      )}
                    >
                      {project.deadline} ({project.daysRemaining} days left)
                    </span>
                  </div>
                </div>
                {project.status === "in_progress" && (
                  <div className="mt-8 space-y-3">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-muted-foreground">
                      <span>Execution Progress</span>
                      <span className="text-primary">{project.progress}%</span>
                    </div>
                    <Progress
                      value={project.progress}
                      className="h-2.5 bg-muted/60"
                    />
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-0">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-14 px-8 gap-8">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-bold px-0 gap-2"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger
                      value="requirements"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-bold px-0 gap-2"
                    >
                      Requirements
                    </TabsTrigger>
                    <TabsTrigger
                      value="milestones"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-bold px-0 gap-2"
                    >
                      Milestones
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="overview"
                    className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold">Project Description</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-bold">
                        Functional Requirements
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {project.functionalRequirements.map((req, i) => (
                          <li
                            key={i}
                            className="flex gap-3 items-start p-3 rounded-xl bg-muted/30 border border-border/50"
                          >
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                            <span className="text-sm font-medium">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-bold">Reference Links</h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Figma Design",
                          "Product Specs",
                          "Competitor Reference",
                        ].map((link, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="gap-2 py-2 px-4 cursor-pointer hover:bg-muted transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {link}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="requirements"
                    className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.skills.map((skill, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="font-bold py-1.5 px-3"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-6">
                        {[
                          {
                            label: "Experience",
                            value: project.experienceLevel,
                            icon: Zap,
                            color: "text-amber-500",
                          },
                          {
                            label: "Project Size",
                            value: project.projectSize,
                            icon: Layout,
                            color: "text-blue-500",
                          },
                          {
                            label: "Budget Type",
                            value: project.budgetType,
                            icon: DollarSign,
                            color: "text-emerald-500",
                          },
                          {
                            label: "Developers",
                            value: project.devsNeeded,
                            icon: Users,
                            color: "text-violet-500",
                          },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "p-2 rounded-lg bg-card border shadow-sm",
                                  item.color,
                                )}
                              >
                                <item.icon className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium text-muted-foreground">
                                {item.label}
                              </span>
                            </div>
                            <span className="font-bold text-sm tracking-tight">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="milestones"
                    className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  >
                    {project.milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-muted/20 border border-border/50 group hover:border-primary/20 transition-all"
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-full bg-background border flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-110 transition-transform">
                            {milestone.id}
                          </div>
                          <div>
                            <h5 className="font-black text-lg tracking-tight">
                              {milestone.name}
                            </h5>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />{" "}
                                {milestone.date}
                              </span>
                              <span className="flex items-center gap-1.5 font-bold text-foreground">
                                <DollarSign className="w-3.5 h-3.5" />{" "}
                                {milestone.amount}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-4 py-1.5 font-black tracking-widest text-[10px]",
                            milestone.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : milestone.status === "active"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-muted text-muted-foreground",
                          )}
                        >
                          {milestone.status.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Proposals Preview Card */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="p-8 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl font-black">
                    Top Proposals
                  </CardTitle>
                  <Badge className="bg-primary/10 text-primary">
                    {project.proposals}
                  </Badge>
                </div>
                <Button
                  variant="link"
                  className="font-bold gap-2 text-primary"
                  asChild
                >
                  <Link to={`/client/projects/${project.id}/proposals`}>
                    View All Proposals <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-4">
                {project.proposalsList.map((proposal, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={proposal.avatar} />
                        <AvatarFallback>{proposal.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-sm">{proposal.name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-black">
                          <Star className="w-3 h-3 fill-amber-500" />{" "}
                          {proposal.rating}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm">{proposal.bid}</p>
                      <p className="text-xs text-muted-foreground">
                        {proposal.time} delivery
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Activity Timeline Card */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-black">Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="space-y-8 relative">
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border/40" />
                  {project.activity.map((item, i) => (
                    <div key={i} className="flex gap-6 relative">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full bg-background border flex items-center justify-center shrink-0 z-10",
                          item.color,
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="pt-1">
                        <p className="font-bold text-sm">{item.text}</p>
                        <p className="text-xs text-muted-foreground mt-1 tracking-tight">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar (35%) */}
          <div className="lg:col-span-4 space-y-8 sticky top-24">
            {/* Project Stats Card */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl shadow-background/20 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-blue-600" />
              <CardContent className="p-8 space-y-8">
                <div className="space-y-1">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                    Pricing Model
                  </p>
                  <p className="text-3xl font-black tracking-tight">
                    {project.budget}
                  </p>
                  <p className="text-sm text-primary font-bold">
                    {project.budgetType}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                      Views
                    </p>
                    <p className="text-2xl font-black">{project.views}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                      Bids
                    </p>
                    <p className="text-2xl font-black">{project.proposals}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-card/40 p-3 rounded-xl border">
                    <div className="flex items-center gap-3">
                      <Bookmark className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-bold">Shortlisted</span>
                    </div>
                    <span className="font-black text-sm">
                      {project.shortlisted}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-card/40 p-3 rounded-xl border">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-bold">In Discussion</span>
                    </div>
                    <span className="font-black text-sm">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Primary Actions Card */}
            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm shadow-2xl shadow-primary/10">
              <CardContent className="p-8 space-y-4">
                {project.status === "open" ? (
                  <>
                    <Button className="w-full h-14 rounded-2xl font-black text-lg gap-3 shadow-lg shadow-primary/30 group">
                      <Users className="w-5 h-5 transition-transform group-hover:scale-110" />
                      View All Proposals
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-14 rounded-2xl font-black bg-background/50 border-border/60"
                    >
                      Edit Project Details
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full h-12 rounded-xl font-bold text-primary hover:bg-primary/10"
                    >
                      Boost with AI Search
                    </Button>
                    <div className="pt-2">
                      <Button
                        variant="ghost"
                        className="w-full text-destructive hover:bg-destructive/10 font-bold gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Close Project
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Button className="w-full h-14 rounded-2xl font-black text-lg gap-3 shadow-lg shadow-primary/30 group">
                      <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
                      Message Specialist
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-14 rounded-2xl font-black bg-background/50 border-border/60"
                    >
                      View Legal Contract
                    </Button>
                    {project.status === "in_progress" && (
                      <Button
                        variant="ghost"
                        className="w-full h-12 rounded-xl font-bold text-amber-500 hover:bg-amber-500/10"
                      >
                        Request Revision
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Hired Freelancer Card */}
            {(project.status === "in_progress" ||
              project.status === "completed") &&
              project.hiredDeveloper && (
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden group">
                  <div className="p-6 border-b bg-muted/30">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Active Specialist
                    </p>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16 ring-4 ring-primary/10">
                          <AvatarImage src={project.hiredDeveloper.avatar} />
                          <AvatarFallback>
                            {project.hiredDeveloper.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-background rounded-full"
                          title="Online"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-black text-lg tracking-tight truncate">
                            {project.hiredDeveloper.name}
                          </h5>
                          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium truncate">
                          {project.hiredDeveloper.title}
                        </p>
                        <div className="flex items-center gap-1 mt-1 font-black text-xs text-amber-500">
                          <Star className="w-3 h-3 fill-amber-500" />{" "}
                          {project.hiredDeveloper.rating}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="secondary"
                        className="font-black text-xs h-10 rounded-xl"
                      >
                        Chat
                      </Button>
                      <Button
                        variant="outline"
                        className="font-black text-xs h-10 rounded-xl"
                      >
                        Contract
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Danger Zone Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="actions" className="border-none">
                <AccordionTrigger className="flex flex-row items-center gap-2 p-4 text-xs font-black uppercase tracking-widest text-muted-foreground hover:no-underline rounded-2xl hover:bg-muted/50 transition-all">
                  Project Actions
                </AccordionTrigger>
                <AccordionContent className="pt-4 px-2 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 font-bold text-sm h-11 rounded-xl"
                  >
                    <Pause className="w-4 h-4" /> Pause Project
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 font-bold text-sm h-11 rounded-xl"
                  >
                    <Archive className="w-4 h-4" /> Archive Project
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 font-bold text-sm h-11 rounded-xl text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Permanently
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientProjectDetailsPage;
