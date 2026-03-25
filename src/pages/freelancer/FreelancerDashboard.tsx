import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
  Coins,
  BookOpen,
  Shield,
  AlertCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getFreelancerDashboardStats } from "@/services/dashboard.service";

const PROPOSAL_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/5 text-amber-600 border-amber-500/20",
  SHORTLISTED: "bg-blue-500/5 text-blue-600 border-blue-500/20",
  ACCEPTED: "bg-green-500/5 text-green-600 border-green-500/20",
  REJECTED: "bg-red-500/5 text-red-500 border-red-500/20",
  WITHDRAWN: "bg-zinc-500/5 text-zinc-500 border-zinc-500/20",
  CANCELLED: "bg-zinc-500/5 text-zinc-500 border-zinc-500/20",
};

const MILESTONE_COLORS: Record<string, string> = {
  PENDING: "text-zinc-500",
  FUNDED: "text-blue-500",
  IN_PROGRESS: "text-indigo-500",
  SUBMITTED: "text-purple-500",
  APPROVED: "text-green-500",
  REVISION_REQUESTED: "text-orange-500",
  REJECTED: "text-red-500",
};

export default function FreelancerDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['freelancerDashboard'],
    queryFn: getFreelancerDashboardStats,
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
  const { activeProposals, recentTokenTxs, activeMilestones } = lists;

  return (
    <DashboardLayout>
      <div className="container max-w-7xl mx-auto space-y-10 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Welcome back! 🚀
            </h1>
            <p className="text-muted-foreground text-lg font-medium">
              You have <span className="text-primary font-black">{stats.activeProposals || 0}</span> pending
              {stats.shortlistedProposals > 0 && (
                <>
                  {" "}·{" "}
                  <span className="text-blue-500 font-black">{stats.shortlistedProposals}</span> shortlisted
                </>
              )}
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold border-2" asChild>
              <Link to="/freelancer/proposals">My Proposals</Link>
            </Button>
            <Button className="h-12 px-6 rounded-2xl font-bold gap-2 shadow-lg shadow-primary/30" asChild>
              <Link to="/freelancer/browse"><Search className="h-5 w-5" /> Browse Projects</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Active Proposals",
              value: (stats.activeProposals || 0) + (stats.shortlistedProposals || 0),
              icon: Briefcase,
              color: "text-blue-500",
              change: `${stats.shortlistedProposals || 0} shortlisted`,
            },
            {
              title: "Total Earnings",
              value: `$${(stats.totalEarnings || 0).toLocaleString()}`,
              icon: DollarSign,
              color: "text-emerald-500",
              change: "Released payments",
            },
            {
              title: "Jobs Completed",
              value: stats.completedJobs || 0,
              icon: CheckCircle,
              color: "text-violet-500",
              change: "Via contracts",
            },
            {
              title: "Avg. Rating",
              value: stats.averageRating?.toFixed(1) || "5.0",
              icon: Star,
              color: "text-amber-500",
              change: "From blind reviews",
            },
          ].map((stat, i) => (
            <Card key={i} className="border-border/40 bg-card/40 backdrop-blur-xl group hover:border-primary/20 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className={cn("h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform", stat.color)}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.title}</p>
                      <h3 className="text-2xl font-black mt-1">{stat.value}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground mt-1 opacity-70 italic">{stat.change}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-yellow-500/5">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <Coins className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">SkillToken Balance</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-black text-amber-500">{stats.skillTokenBalance || 0}</p>
                  <p className="text-sm font-bold text-muted-foreground mb-1">tokens</p>
                </div>
                <p className="text-xs text-muted-foreground">Each proposal costs tokens · Earn via activity</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10" asChild>
                <Link to="/freelancer/tokens">View History</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="group overflow-hidden border-primary/20 bg-gradient-to-br from-card to-primary/5 hover:to-primary/10 transition-all duration-500 relative">
            <CardContent className="p-8 space-y-6">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">Project Matching</h3>
                <p className="text-muted-foreground font-medium leading-relaxed max-w-sm mt-1">
                  Projects matching your skills, preferred categories & hourly rate. Check out your saved lists.
                </p>
              </div>
              <Button className="h-12 px-8 rounded-xl font-bold gap-2" asChild>
                <Link to="/freelancer/browse">View Matches <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardContent>
            <Zap className="absolute -bottom-6 -right-6 h-40 w-40 text-primary/5 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </Card>

          <Card className="group overflow-hidden border-purple-500/30 bg-gradient-to-br from-card to-purple-500/5 hover:to-purple-500/10 transition-all duration-500 relative">
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-primary to-purple-600 border-none font-black text-[10px] px-3 py-1">AI POWERED</Badge>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="h-14 w-14 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="h-7 w-7 text-purple-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">Proposal Optimizer</h3>
                <p className="text-muted-foreground font-medium leading-relaxed max-w-sm mt-1">
                  AI-refines your cover letters. Win rate up to <span className="text-foreground font-bold">45%</span> higher. Uses <span className="text-amber-500 font-bold">2 tokens</span> per proposal.
                </p>
              </div>
              <Button variant="outline" className="h-12 px-8 rounded-xl font-bold border-2" asChild>
                <Link to="/freelancer/proposals">Optimize Proposals</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black tracking-tight">Active Milestones</h2>
                <Button variant="ghost" className="font-bold text-primary px-0 hover:bg-transparent" asChild>
                  <Link to="/freelancer/contracts">View all <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
              <Card className="border-border/40 bg-card/60 rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  {activeMilestones.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">No active milestones right now.</p>
                  )}
                  {activeMilestones.map((m) => (
                    <div key={m.id} className="flex items-center justify-between px-5 py-4 border-b last:border-0 border-border/20 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("h-2 w-2 rounded-full shrink-0", {
                          "bg-zinc-400": m.status === "PENDING",
                          "bg-blue-500": m.status === "FUNDED" || m.status === "IN_PROGRESS",
                          "bg-purple-500": m.status === "SUBMITTED",
                          "bg-green-500": m.status === "APPROVED",
                          "bg-orange-500": m.status === "REVISION_REQUESTED",
                          "bg-red-500": m.status === "REJECTED",
                        })} />
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{m.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn("text-[10px] font-black uppercase", MILESTONE_COLORS[m.status])}>
                              {m.status.replace("_", " ")}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Due {new Date(m.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="font-black text-sm shrink-0">${m.amount}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-black tracking-tight mb-4">Active Proposals</h2>
              <Card className="border-border/40 bg-card/60 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardContent className="p-6 space-y-4">
                  {activeProposals.length > 0 ? (
                    activeProposals.map((proposal) => (
                      <div key={proposal.id} className="flex items-start justify-between gap-4 pb-4 border-b last:border-0 last:pb-0 border-border/20">
                        <div className="flex-1 min-w-0">
                          <p className="font-black truncate text-sm">{proposal.projectTitle || "Project"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={`text-[10px] font-black uppercase px-2 ${PROPOSAL_COLORS[proposal.status || "PENDING"]}`}>
                              {(proposal.status || "PENDING").replace("_", " ")}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Coins className="w-3 h-3 text-amber-500" />
                              {proposal.tokenCost || 2} tokens
                            </span>
                          </div>
                        </div>
                        <p className="font-black text-sm shrink-0">${proposal.proposedPrice}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 space-y-3">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto opacity-50">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <p className="text-muted-foreground text-sm font-medium">No active proposals</p>
                    </div>
                  )}
                  <Button variant="outline" className="w-full h-12 rounded-xl font-black border-2" asChild>
                    <Link to="/freelancer/proposals">Manage All Proposals</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-xl font-black tracking-tight mb-4">Token Activity</h2>
              <Card className="border-border/40 bg-card/60 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardContent className="p-5 space-y-3">
                  {recentTokenTxs.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm">No recent transactions</p>
                  )}
                  {recentTokenTxs.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{tx.description}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{tx.reason.replace("_", " ")}</p>
                      </div>
                      <span className={cn("text-sm font-black shrink-0", tx.type === "CREDIT" ? "text-green-500" : "text-red-500")}>
                        {tx.type === "CREDIT" ? "+" : "-"}{tx.amount}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-xl font-black tracking-tight mb-4">Profile Health</h2>
              <Card className="border-border/40 bg-card/60 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Completion</p>
                      <h3 className="text-2xl font-black">{stats.profileCompletion}%</h3>
                    </div>
                    <div className="h-14 w-14 rounded-full border-4 border-primary/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <Progress value={stats.profileCompletion} className="h-3 bg-muted/60" />
                  <div className="space-y-2">
                    {[
                      { label: "Skills added", done: stats.profileCompletion > 20, icon: BookOpen },
                      { label: "Portfolio items", done: stats.profileCompletion > 50, icon: Briefcase },
                      { label: "Education / Cerifications", done: stats.profileCompletion > 70, icon: BookOpen },
                      { label: "ID Verified", done: stats.profileCompletion >= 100, icon: Shield },
                    ].map(({ label, done, icon: Icon }) => (
                      <div key={label} className="flex items-center gap-2 text-xs">
                        <Icon className={cn("h-3 w-3", done ? "text-green-500" : "text-muted-foreground")} />
                        <span className={done ? "text-foreground font-medium" : "text-muted-foreground"}>{label}</span>
                        {done ? <CheckCircle className="h-3 w-3 text-green-500 ml-auto" /> : <AlertCircle className="h-3 w-3 text-amber-500 ml-auto" />}
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full h-12 rounded-xl font-black border-2" asChild>
                    <Link to="/freelancer/profile">Complete Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
