import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/common/StatsCard";
import { ProjectCard } from "@/components/common/ProjectCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase,
  DollarSign,
  Star,
  CheckCircle,
  Search,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Zap,
  Target,
  MessageSquare,
} from "lucide-react";
import {
  freelancerDashboardStats,
  mockProjects,
  mockProposals,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function FreelancerDashboard() {
  const openProjects = mockProjects
    .filter((p) => p.status === "open")
    .slice(0, 3);
  const pendingProposals = mockProposals.filter((p) => p.status === "pending");

  return (
    <DashboardLayout>
      <div className="container max-w-7xl mx-auto space-y-10 animate-fade-in p-4 md:p-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Welcome back! 🚀
            </h1>
            <p className="text-muted-foreground text-lg font-medium">
              You have{" "}
              <span className="text-primary font-black">
                {pendingProposals.length}
              </span>{" "}
              active proposals today.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="h-14 px-8 rounded-2xl font-black border-2 transition-all hover:bg-muted"
              asChild
            >
              <Link to="/freelancer/proposals">My Proposals</Link>
            </Button>
            <Button
              className="h-14 px-8 rounded-2xl font-black shadow-2xl shadow-primary/30 gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              asChild
            >
              <Link to="/freelancer/browse">
                <Search className="h-5 w-5" /> Browse Projects
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Active Bids",
              value: freelancerDashboardStats.activeBids,
              icon: Briefcase,
              color: "text-blue-500",
              change: "3 pending",
            },
            {
              title: "Total Earnings",
              value: `$${freelancerDashboardStats.totalEarnings.toLocaleString()}`,
              icon: DollarSign,
              color: "text-emerald-500",
              change: "+$3,200 this mo",
            },
            {
              title: "Completed",
              value: freelancerDashboardStats.completedProjects,
              icon: CheckCircle,
              color: "text-violet-500",
              change: "98% success",
            },
            {
              title: "Top Rated",
              value: freelancerDashboardStats.averageRating,
              icon: Star,
              color: "text-amber-500",
              change: "Top 5% talent",
            },
          ].map((stat, i) => (
            <Card
              key={i}
              className="border-border/40 bg-card/40 backdrop-blur-xl group hover:border-primary/20 transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div
                      className={cn(
                        "h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform",
                        stat.color,
                      )}
                    >
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {stat.title}
                      </p>
                      <h3 className="text-2xl font-black mt-1">{stat.value}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground mt-1 opacity-70 italic">
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="group overflow-hidden border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:to-primary/10 transition-all duration-500 relative">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="space-y-6">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="h-7 w-7 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight">
                      Project Matching
                    </h3>
                    <p className="text-muted-foreground font-medium leading-relaxed max-w-sm">
                      Our new algorithm found{" "}
                      <span className="text-foreground font-bold">
                        12 projects
                      </span>{" "}
                      that perfectly match your tech stack.
                    </p>
                  </div>
                  <Button
                    className="h-12 px-8 rounded-xl font-bold gap-2"
                    asChild
                  >
                    <Link to="/freelancer/browse">
                      View Your Matches <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
            <Zap className="absolute -bottom-6 -right-6 h-40 w-40 text-primary/5 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </Card>

          <Card className="group overflow-hidden border-purple-500/30 bg-gradient-to-br from-card to-purple-500/5 hover:to-purple-500/10 transition-all duration-500 relative">
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-primary to-purple-600 border-none font-black text-[10px] px-3 py-1">
                AI POWERED
              </Badge>
            </div>
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="space-y-6">
                  <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Sparkles className="h-7 w-7 text-purple-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight">
                      Proposal Optimizer
                    </h3>
                    <p className="text-muted-foreground font-medium leading-relaxed max-w-sm">
                      Use AI to refine your cover letters and increase your win
                      rate by up to{" "}
                      <span className="text-foreground font-bold">45%</span>.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="h-12 px-8 rounded-xl font-bold border-2"
                    asChild
                  >
                    <Link to="/freelancer/proposals">Optimize Proposals</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">
                Recommended Projects
              </h2>
              <Button
                variant="ghost"
                className="font-bold text-primary px-0 hover:bg-transparent"
                asChild
              >
                <Link to="/freelancer/browse">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="space-y-4">
              {openProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  viewAs="freelancer"
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            {/* Active Proposals */}
            <div className="space-y-6">
              <h2 className="text-xl font-black tracking-tight">
                Active Proposals
              </h2>
              <Card className="border-border/40 bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-xl shadow-foreground/5">
                <CardContent className="p-6 space-y-6">
                  {pendingProposals.length > 0 ? (
                    pendingProposals.map((proposal) => {
                      const project = mockProjects.find(
                        (p) => p.id === proposal.projectId,
                      );
                      return (
                        <div
                          key={proposal.id}
                          className="flex items-start justify-between gap-4 pb-6 border-b last:border-0 last:pb-0 border-border/20 group cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-black truncate group-hover:text-primary transition-colors">
                              {project?.title}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge
                                variant="outline"
                                className="text-[10px] font-black uppercase tracking-widest bg-amber-500/5 text-amber-600 border-amber-500/20 px-2 py-0.5"
                              >
                                Pending
                              </Badge>
                              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 opacity-70">
                                <Clock className="w-3 h-3" />2 days ago
                              </span>
                            </div>
                          </div>
                          <p className="font-black text-sm">
                            ${proposal.proposedBudget}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 space-y-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto opacity-50">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <p className="text-muted-foreground text-sm font-medium">
                        No pending proposals
                      </p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl font-black border-2"
                    asChild
                  >
                    <Link to="/freelancer/proposals">Manage All Proposals</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Profile Health */}
            <div className="space-y-6">
              <h2 className="text-xl font-black tracking-tight">
                Profile Health
              </h2>
              <Card className="border-border/40 bg-card/60 backdrop-blur-xl rounded-[2rem] overflow-hidden shadow-xl shadow-foreground/5">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Visibility
                      </p>
                      <h3 className="text-2xl font-black">85%</h3>
                    </div>
                    <div className="h-14 w-14 rounded-full border-4 border-primary/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Progress value={85} className="h-3 bg-muted/60" />
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                      Complete your Education entries to reach{" "}
                      <span className="text-foreground font-black">100%</span>{" "}
                      and unlock{" "}
                      <span className="text-primary font-black">Top Rated</span>{" "}
                      status.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl font-black border-2"
                    asChild
                  >
                    <Link to="/freelancer/profile">Optimize Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Premium Tip */}
            <Card className="bg-gradient-to-br from-primary to-primary-foreground border-none rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/20 relative group">
              <CardContent className="p-8 relative z-10">
                <div className="space-y-6">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white tracking-tight">
                      Weekly Earnings
                    </h3>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-black text-white">$1,240</p>
                      <p className="text-sm font-bold text-white/80 mb-1">
                        +12% vs LW
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-white/80 leading-relaxed">
                    Great job! You're performing better than{" "}
                    <span className="text-white font-black">92%</span> of
                    freelancers in your category.
                  </p>
                </div>
              </CardContent>
              <Sparkles className="absolute -bottom-10 -right-10 h-40 w-40 text-white/10 group-hover:rotate-12 transition-transform duration-700" />
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
