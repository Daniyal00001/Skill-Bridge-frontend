import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/common/StatsCard";
import { FreelancerCard } from "@/components/common/FreelancerCard";
import { ProjectCard } from "@/components/common/ProjectCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FolderOpen,
  DollarSign,
  FileText,
  CheckCircle,
  ArrowRight,
  Search,
  Sparkles,
  Bot,
  Mail,
  Star,
  AlertTriangle,
  Users,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useQuery } from "@tanstack/react-query";
import { getClientDashboardStats } from "@/services/dashboard.service";
import { getClientLevel } from "@/lib/levelUtils";
import { LevelBadge } from "@/components/common/LevelBadge";

const PROPOSAL_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  SHORTLISTED: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  ACCEPTED: "bg-green-500/10 text-green-600 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
  WITHDRAWN: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  CANCELLED: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
};

export default function ClientDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["clientDashboard"],
    queryFn: getClientDashboardStats,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <p className="text-lg font-medium">Failed to load dashboard data.</p>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, lists } = data;
  const { openProjects, recentProposals, recentInvitations } = lists;

  return (
    <DashboardLayout>
      <div className="relative overflow-hidden -m-6 p-6 min-h-full">
        <div
          className="absolute top-0 left-0 w-[800px] h-[800px] pointer-events-none -z-10"
          style={{
            background:
              "radial-gradient(circle at 0% 0%, hsl(var(--accent) / 0.15) 0%, transparent 70%)",
            clipPath: "polygon(0 0, 100% 0, 0 100%)",
          }}
        />

        <div className="space-y-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl font-black tracking-tight">
                  Welcome back! 👋
                </h1>
                <LevelBadge
                  level={getClientLevel({
                    totalSpent: stats.committedBudget,
                    totalHires: Math.round((stats.hireRate / 100) * stats.totalProjects),
                    totalOrders: stats.totalProjects,
                  })}
                  size="sm"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 text-muted-foreground text-lg">
                <p>
                  Here's what's happening with your projects today
                </p>
                {stats.lastLoginAt && (
                   <>
                    <span className="hidden sm:inline text-border">|</span>
                    <p className="text-sm font-medium text-primary/70 bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                      Last active: {new Date(stats.lastLoginAt).toLocaleString()}
                    </p>
                   </>
                )}
              </div>
            </div>
            <Button asChild>
              <Link to="/client/post-project">+ Post a Project</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <StatsCard
              title="Active Projects"
              value={stats.activeProjects}
              change="In progress or under hiring"
              changeType="positive"
              icon={FolderOpen}
            />
            <StatsCard
              title="Total Budget Spent"
              value={`$${stats.committedBudget.toLocaleString()}`}
              change="Escrowed + Released funds"
              changeType="neutral"
              icon={DollarSign}
            />
            <StatsCard
              title="Pending Proposals"
              value={stats.pendingProposals}
              change={`${stats.shortlistedProposals} shortlisted`}
              changeType="positive"
              icon={FileText}
            />
            <StatsCard
              title="Completed Projects"
              value={stats.completedProjects}
              change="Hiring history"
              changeType="positive"
              icon={CheckCircle}
            />
            <StatsCard
              title="Hire Rate"
              value={`${stats.hireRate}%`}
              change={`${stats.totalProjects} total projects`}
              changeType="neutral"
              icon={Star}
            />
          </div>

          {stats.disputedProjects > 0 && (
            <Card className="border-rose-500/30 bg-rose-500/5">
              <CardContent className="p-4 flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                <p className="text-sm font-medium">
                  You have{" "}
                  <span className="font-bold text-rose-600">
                    {stats.disputedProjects} disputed project
                    {stats.disputedProjects > 1 ? "s" : ""}
                  </span>{" "}
                  requiring your attention.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="ml-auto"
                  asChild
                >
                  <Link to="/client/contracts?tab=disputed">View Disputes</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="group overflow-hidden border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:to-primary/10 transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Browse Freelancers</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Search from our verified talent pool by skill, experience
                    level & availability
                  </p>
                </div>
                <Button variant="default" asChild>
                  <Link to="/client/browse">Browse Talent</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group overflow-hidden border-purple-500/30 bg-gradient-to-br from-card to-purple-500/5 hover:to-purple-500/10 transition-all duration-300 relative border-l-4 border-l-purple-500">
              <div className="absolute top-2 right-2">
                <Badge className="bg-gradient-to-r from-primary to-purple-600 border-none shadow-sm">
                  AI Powered
                </Badge>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AI Scoping Assistant</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Describe your project — AI suggests category, budget range,
                    required skills & size
                  </p>
                </div>
                <Button
                  className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 border-none"
                  asChild
                >
                  <Link to="/client/ai-assistant">Scope with AI</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Open Projects</h2>
                  <Button variant="ghost" asChild>
                    <Link to="/client/projects">
                      View all <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {openProjects.length > 0 ? (
                    openProjects.map((project: any) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        viewAs="client"
                      />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm col-span-2">
                      No open projects. Post one to get proposals!
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recent Proposals</h2>
                  <Button variant="ghost" asChild>
                    <Link to="/client/proposals">
                      View all <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <Card className="border-border/40">
                  <CardContent className="p-0">
                    {recentProposals.map((proposal, idx) => (
                      <div
                        key={proposal.id ?? idx}
                        className="flex items-center justify-between px-5 py-4 border-b last:border-0 border-border/30 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage src={proposal.avatar || ""} />
                            <AvatarFallback>
                              {(proposal.freelancerName || "F").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">
                              {proposal.freelancerName || "Freelancer"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {proposal.projectTitle || "Project"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-semibold">
                            ${proposal.proposedPrice || "—"}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold uppercase tracking-wide px-2 ${PROPOSAL_COLORS[proposal.status] || "bg-muted"}`}
                          >
                            {(proposal.status || "PENDING").replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {recentProposals.length === 0 && (
                      <p className="text-center text-muted-foreground text-sm py-8">
                        No proposals yet. Post a project to start receiving
                        bids.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <Card className="border-border/40 bg-card/50">
                  <CardContent className="p-4 space-y-2">
                    {[
                      {
                        label: "Manage Projects",
                        icon: FolderOpen,
                        href: "/client/projects",
                      },
                      {
                        label: "View Messages",
                        icon: Mail,
                        href: "/client/messages",
                      },
                      {
                        label: "Contracts",
                        icon: FileText,
                        href: "/client/contracts",
                      },
                      {
                        label: "Reviews & Ratings",
                        icon: Star,
                        href: "/client/reviews",
                      },
                    ].map(({ label, icon: Icon, href }) => (
                      <Button
                        key={label}
                        variant="outline"
                        className="w-full justify-start hover:bg-primary/5 hover:text-primary transition-colors"
                        asChild
                      >
                        <Link to={href}>
                          <Icon className="mr-3 h-4 w-4" />
                          {label}
                        </Link>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 text-center lg:text-left">
                  Recent Invitations
                </h2>
                <Card className="border-border/40 shadow-sm bg-card/30 backdrop-blur-sm">
                  <CardContent className="p-0">
                    {recentInvitations.length === 0 ? (
                      <div className="text-center py-10">
                        <Mail className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">
                          No invitations sent yet.
                        </p>
                      </div>
                    ) : (
                      recentInvitations.map((invitation: any, idx: number) => (
                        <div
                          key={invitation.id || idx}
                          className="flex items-center justify-between px-5 py-4 border-b last:border-0 border-border/20 hover:bg-muted/30 transition-all group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-9 w-9 shrink-0 border-2 border-background shadow-sm group-hover:scale-105 transition-transform">
                              <AvatarImage src={invitation.avatar} />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                {(invitation.freelancerName || "F").charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                                {invitation.freelancerName}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-tight">
                                {invitation.projectTitle}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] shrink-0 font-black uppercase tracking-widest px-2 py-0.5 border shadow-sm",
                              PROPOSAL_COLORS[
                                invitation.status?.toUpperCase()
                              ] || "bg-muted text-muted-foreground",
                            )}
                          >
                            {invitation.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card variant="gradient" className="shadow-lg border-none">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md shrink-0">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Pro Tip</h3>
                      <p className="text-sm text-white/90 mt-1 leading-relaxed">
                        Find the perfect match faster with our AI-powered
                        freelancer discovery assistant.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
