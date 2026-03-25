import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  DollarSign,
  Star,
  CheckCircle,
  Search,
  ArrowRight,
  TrendingUp,
  Clock,
  Zap,
  MessageSquare,
  Coins,
  BookOpen,
  Shield,
  AlertCircle,
  Loader2,
  AlertTriangle,
  FileText,
  Wallet,
  Users,
  ChevronRight,
  BarChart3,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Award,
  Activity,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getFreelancerDashboardStats } from "@/services/dashboard.service";

// ─── Status color maps ────────────────────────────────────────────────────────

const PROPOSAL_STATUS_MAP: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  ACCEPTED: {
    label: "Accepted",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-50 text-red-600 border border-red-200",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    className: "bg-zinc-100 text-zinc-500 border border-zinc-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-zinc-100 text-zinc-500 border border-zinc-200",
  },
};

const MILESTONE_STATUS_MAP: Record<
  string,
  { label: string; dot: string; text: string }
> = {
  PENDING: { label: "Pending", dot: "bg-zinc-400", text: "text-zinc-500" },
  FUNDED: { label: "Funded", dot: "bg-blue-500", text: "text-blue-600" },
  IN_PROGRESS: {
    label: "In Progress",
    dot: "bg-indigo-500",
    text: "text-indigo-600",
  },
  SUBMITTED: {
    label: "Submitted",
    dot: "bg-violet-500",
    text: "text-violet-600",
  },
  APPROVED: {
    label: "Approved",
    dot: "bg-emerald-500",
    text: "text-emerald-600",
  },
  REVISION_REQUESTED: {
    label: "Revision Requested",
    dot: "bg-orange-400",
    text: "text-orange-600",
  },
  REJECTED: { label: "Rejected", dot: "bg-red-500", text: "text-red-600" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  trend,
  iconBg,
  iconColor,
}: {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  iconBg: string;
  iconColor: string;
}) {
  return (
    <Card className="border border-border/50 bg-card rounded-2xl hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
              iconBg,
            )}
          >
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
          {trend && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-semibold",
                trend === "up"
                  ? "text-emerald-600"
                  : trend === "down"
                    ? "text-red-500"
                    : "text-zinc-400",
              )}
            >
              {trend === "up" ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : trend === "down" ? (
                <ArrowDownRight className="h-3.5 w-3.5" />
              ) : null}
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          <p className="text-xs font-medium text-muted-foreground mt-0.5">
            {title}
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1 opacity-70">
          <Clock className="h-3 w-3" /> {sub}
        </p>
      </CardContent>
    </Card>
  );
}

function SectionHeader({
  title,
  to,
  label = "View all",
}: {
  title: string;
  to: string;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold text-foreground tracking-tight">
        {title}
      </h2>
      <Link
        to={to}
        className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
      >
        {label} <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FreelancerDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["freelancerDashboard"],
    queryFn: getFreelancerDashboardStats,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center flex-col gap-3">
          <AlertTriangle className="h-8 w-8 text-red-500" />
          <p className="text-sm font-medium text-muted-foreground">
            Failed to load dashboard data.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, lists } = data;
  const { activeProposals, recentTokenTxs, activeMilestones } = lists;

  const profileItems = [
    { label: "Skills added", done: stats.profileCompletion > 20, icon: Layers },
    {
      label: "Portfolio items",
      done: stats.profileCompletion > 50,
      icon: Briefcase,
    },
    {
      label: "Education / Certificates",
      done: stats.profileCompletion > 70,
      icon: BookOpen,
    },
    {
      label: "ID Verified",
      done: stats.profileCompletion >= 100,
      icon: Shield,
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Freelancer Dashboard
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Overview
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl font-semibold h-9"
              asChild
            >
              <Link to="/freelancer/contracts">Contracts</Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl font-semibold h-9"
              asChild
            >
              <Link to="/freelancer/proposals">Proposals</Link>
            </Button>
            <Button
              size="sm"
              className="rounded-xl font-semibold h-9 gap-1.5"
              asChild
            >
              <Link to="/freelancer/browse">
                <Search className="h-4 w-4" /> Browse Projects
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Availability + Invitations banner ──────────────────────────────── */}
        {stats.pendingInvitationsCount > 0 && (
          <Card className="border border-primary/20 bg-primary/5 rounded-2xl">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Inbox className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    You have{" "}
                    <span className="text-primary">
                      {stats.pendingInvitationsCount}
                    </span>{" "}
                    pending invitation
                    {stats.pendingInvitationsCount > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Clients have invited you to their projects
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl font-semibold border-primary/30 text-primary hover:bg-primary/10 shrink-0"
                asChild
              >
                <Link to="/freelancer/invitations">View Invitations</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── KPI Stats Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Total Earnings"
            value={`$${(stats.totalEarnings || 0).toLocaleString()}`}
            sub="Lifetime released"
            icon={DollarSign}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            trend="up"
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${(stats.monthlyEarnings || 0).toLocaleString()}`}
            sub="This calendar month"
            icon={TrendingUp}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            title="Active Contracts"
            value={stats.activeContractsCount || 0}
            sub={`${stats.completedJobs || 0} completed`}
            icon={Briefcase}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
          />
          <StatCard
            title="Proposals Sent"
            value={stats.proposalsThisMonth || 0}
            sub={`${stats.activeProposals || 0} currently active`}
            icon={FileText}
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
          />
          <StatCard
            title="Avg. Rating"
            value={stats.averageRating?.toFixed(1) || "—"}
            sub={`${stats.totalReviews || 0} reviews`}
            icon={Star}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
          />
          <StatCard
            title="Token Balance"
            value={stats.skillTokenBalance || 0}
            sub="SkillTokens available"
            icon={Coins}
            iconBg="bg-yellow-50"
            iconColor="text-yellow-600"
          />
        </div>

        {/* ── Main Content: 2-column layout ──────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Milestones */}
            <Card className="border border-border/50 bg-card rounded-2xl overflow-hidden">
              <CardHeader className="px-5 pt-5 pb-3 border-b border-border/30">
                <SectionHeader
                  title="Active Milestones"
                  to="/freelancer/contracts"
                />
              </CardHeader>
              <CardContent className="p-0">
                {activeMilestones.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Activity className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      No active milestones right now.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/30">
                    {activeMilestones.map((m) => {
                      const ms =
                        MILESTONE_STATUS_MAP[m.status] ??
                        MILESTONE_STATUS_MAP.PENDING;
                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={cn(
                                "h-2 w-2 rounded-full shrink-0",
                                ms.dot,
                              )}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate text-foreground">
                                {m.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span
                                  className={cn(
                                    "text-[11px] font-semibold",
                                    ms.text,
                                  )}
                                >
                                  {ms.label}
                                </span>
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <CalendarDays className="h-3 w-3" />
                                  Due{" "}
                                  {new Date(m.dueDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-bold text-foreground">
                              ${m.amount.toLocaleString()}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Proposals */}
            <Card className="border border-border/50 bg-card rounded-2xl overflow-hidden">
              <CardHeader className="px-5 pt-5 pb-3 border-b border-border/30">
                <SectionHeader
                  title="Active Proposals"
                  to="/freelancer/proposals"
                />
              </CardHeader>
              <CardContent className="p-0">
                {activeProposals.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      No active proposals yet.
                    </p>
                    <Button
                      size="sm"
                      className="mt-2 rounded-xl h-8 text-xs"
                      asChild
                    >
                      <Link to="/freelancer/browse">Browse Projects</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/30">
                    {activeProposals.map((proposal) => {
                      const ps =
                        PROPOSAL_STATUS_MAP[proposal.status ?? "PENDING"];
                      return (
                        <div
                          key={proposal.id}
                          className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate text-foreground">
                                {proposal.projectTitle || "Untitled Project"}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                                    ps.className,
                                  )}
                                >
                                  {ps.label}
                                </span>
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Coins className="h-3 w-3 text-amber-500" />
                                  {proposal.tokenCost || 2} tokens
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-foreground shrink-0 ml-4">
                            ${proposal.proposedPrice?.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Token Activity */}
            <Card className="border border-border/50 bg-card rounded-2xl overflow-hidden">
              <CardHeader className="px-5 pt-5 pb-3 border-b border-border/30">
                <SectionHeader
                  title="Token Activity"
                  to="/freelancer/tokens"
                  label="Full history"
                />
              </CardHeader>
              <CardContent className="p-0">
                {recentTokenTxs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Wallet className="h-7 w-7 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">
                      No recent transactions.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/30">
                    {recentTokenTxs.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                              tx.type === "CREDIT"
                                ? "bg-emerald-50"
                                : "bg-red-50",
                            )}
                          >
                            {tx.type === "CREDIT" ? (
                              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate text-foreground">
                              {tx.description || "Transaction"}
                            </p>
                            <p className="text-[11px] text-muted-foreground capitalize">
                              {tx.reason.replace(/_/g, " ").toLowerCase()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "text-sm font-bold shrink-0",
                            tx.type === "CREDIT"
                              ? "text-emerald-600"
                              : "text-red-500",
                          )}
                        >
                          {tx.type === "CREDIT" ? "+" : "−"}
                          {tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column (1/3) */}
          <div className="space-y-6">
            {/* SkillToken balance card */}
            <Card className="border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Coins className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                      SkillTokens
                    </p>
                    <p className="text-2xl font-bold text-amber-700">
                      {stats.skillTokenBalance || 0}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-amber-600/80 mb-3">
                  Each proposal costs tokens. Earn more via activity.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full rounded-xl h-8 text-xs font-semibold border-amber-300 text-amber-700 hover:bg-amber-100"
                  asChild
                >
                  <Link to="/freelancer/tokens">View Token History</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Profile Health */}
            <Card className="border border-border/50 bg-card rounded-2xl">
              <CardHeader className="px-5 pt-5 pb-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Profile Health
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-0.5">
                      {stats.profileCompletion}%
                    </p>
                  </div>
                  <div
                    className={cn(
                      "h-12 w-12 rounded-full border-4 flex items-center justify-center",
                      stats.profileCompletion >= 100
                        ? "border-emerald-300"
                        : "border-primary/20",
                    )}
                  >
                    <Award
                      className={cn(
                        "h-5 w-5",
                        stats.profileCompletion >= 100
                          ? "text-emerald-500"
                          : "text-primary",
                      )}
                    />
                  </div>
                </div>
                <Progress
                  value={stats.profileCompletion}
                  className="h-2 bg-muted/60 mb-5"
                />
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-2.5">
                {profileItems.map(({ label, done, icon: Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 text-xs"
                  >
                    <div
                      className={cn(
                        "h-6 w-6 rounded-lg flex items-center justify-center shrink-0",
                        done ? "bg-emerald-50" : "bg-muted",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5",
                          done ? "text-emerald-600" : "text-muted-foreground",
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "flex-1 font-medium",
                        done ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {label}
                    </span>
                    {done ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl h-9 font-semibold mt-2"
                  asChild
                >
                  <Link to="/freelancer/profile">Complete Profile</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border border-border/50 bg-card rounded-2xl">
              <CardHeader className="px-5 pt-5 pb-3 border-b border-border/30">
                <CardTitle className="text-sm font-bold">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {[
                  {
                    label: "Completed Jobs",
                    value: stats.completedJobs || 0,
                    icon: CheckCircle,
                    color: "text-emerald-600",
                    bg: "bg-emerald-50",
                  },
                  {
                    label: "Pending Invitations",
                    value: stats.pendingInvitationsCount || 0,
                    icon: Zap,
                    color: "text-orange-600",
                    bg: "bg-orange-50",
                  },
                  {
                    label: "Total Reviews",
                    value: stats.totalReviews || 0,
                    icon: Star,
                    color: "text-amber-600",
                    bg: "bg-amber-50",
                  },
                  {
                    label: "Active Contracts",
                    value: stats.activeContractsCount || 0,
                    icon: Briefcase,
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                  },
                  {
                    label: "Proposals This Month",
                    value: stats.proposalsThisMonth || 0,
                    icon: BarChart3,
                    color: "text-violet-600",
                    bg: "bg-violet-50",
                  },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "h-7 w-7 rounded-lg flex items-center justify-center shrink-0",
                          bg,
                        )}
                      >
                        <Icon className={cn("h-3.5 w-3.5", color)} />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {label}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
