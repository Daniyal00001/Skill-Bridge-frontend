import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  DollarSign,
  FolderOpen,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  CheckCircle,
  Star,
  FileText,
  Loader2,
  Briefcase,
  ArrowUpRight,
  ChevronRight,
  Activity,
  Ban,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardStats } from "@/services/dashboard.service";

// ─── Status maps ──────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-500 border-zinc-200",
  OPEN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  HIRED_PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  UNDER_REVIEW: "bg-purple-50 text-purple-700 border-purple-200",
  REVISION_REQUESTED: "bg-orange-50 text-orange-700 border-orange-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
  DISPUTED: "bg-rose-50 text-rose-700 border-rose-200",
};

const ROLE_BADGE: Record<string, string> = {
  CLIENT: "bg-blue-50 text-blue-700 border-blue-200",
  FREELANCER: "bg-violet-50 text-violet-700 border-violet-200",
  ADMIN: "bg-red-50 text-red-600 border-red-200",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  accent,
}: {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accent?: boolean;
}) {
  return (
    <Card
      className={cn(
        "border rounded-2xl transition-shadow duration-200 hover:shadow-md",
        accent ? "border-red-200 bg-red-50/50" : "border-border/50 bg-card",
      )}
    >
      <CardContent className="p-5">
        <div
          className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center mb-4",
            iconBg,
          )}
        >
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        <p className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </p>
        <p className="text-xs font-semibold text-muted-foreground mt-0.5">
          {title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-2 opacity-70">
          {sub}
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
    <div className="flex items-center justify-between mb-0">
      <CardTitle className="text-sm font-bold">{title}</CardTitle>
      <a
        href={to}
        className="text-xs font-semibold text-primary flex items-center gap-0.5 hover:underline"
      >
        {label} <ChevronRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: getAdminDashboardStats,
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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Admin Panel
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Platform Overview
            </h1>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl font-semibold h-9"
            asChild
          >
            <a href="/admin/logs">Admin Logs</a>
          </Button>
        </div>

        {/* ── Primary KPIs ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            sub={`+${stats.newUsersThisMonth} this month`}
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
          <KpiCard
            title="Platform Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            sub="From payment releases"
            icon={DollarSign}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <KpiCard
            title="Active Projects"
            value={(
              stats.openProjects + stats.inProgressProjects
            ).toLocaleString()}
            sub={`${stats.openProjects} open · ${stats.inProgressProjects} in progress`}
            icon={FolderOpen}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
          />
          <KpiCard
            title="Banned Users"
            value={stats.bannedUsers}
            sub="Requires review"
            icon={Ban}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            accent={stats.bannedUsers > 0}
          />
        </div>

        {/* ── Secondary metrics row ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Completed Projects",
              value: stats.completedProjects,
              icon: CheckCircle,
              bg: "bg-green-50",
              color: "text-green-600",
            },
            {
              label: "Pending Skills",
              value: stats.pendingSkills,
              icon: Star,
              bg: "bg-amber-50",
              color: "text-amber-600",
            },
            {
              label: "Pending Proposals",
              value: stats.pendingProposals,
              icon: FileText,
              bg: "bg-blue-50",
              color: "text-blue-600",
            },
            {
              label: "Disputed Projects",
              value: stats.disputedProjects,
              icon: ShieldAlert,
              bg: "bg-rose-50",
              color: "text-rose-600",
            },
          ].map(({ label, value, icon: Icon, bg, color }) => (
            <Card
              key={label}
              className="border border-border/50 bg-card rounded-2xl"
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div
                  className={cn(
                    "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                    bg,
                  )}
                >
                  <Icon className={cn("h-4.5 w-4.5", color)} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {value.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {label}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Users + Projects ─────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card className="border border-border/50 bg-card rounded-2xl overflow-hidden">
            <CardHeader className="px-5 pt-5 pb-3 border-b border-border/30">
              <SectionHeader title="Recent Users" to="/admin/users" />
            </CardHeader>
            <CardContent className="p-0">
              {lists.recentUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Users className="h-7 w-7 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No users found.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {lists.recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={user.profileImage || ""} />
                          <AvatarFallback className="text-xs font-bold">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate text-foreground">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold border",
                            ROLE_BADGE[user.role?.toUpperCase() ?? "CLIENT"] ??
                              "",
                          )}
                        >
                          {user.role || "CLIENT"}
                        </span>
                        {user.isBanned ? (
                          <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold border bg-red-50 text-red-600 border-red-200">
                            Banned
                          </span>
                        ) : user.isEmailVerified ? (
                          <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold border bg-green-50 text-green-700 border-green-200">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card className="border border-border/50 bg-card rounded-2xl overflow-hidden">
            <CardHeader className="px-5 pt-5 pb-3 border-b border-border/30">
              <SectionHeader title="Recent Projects" to="/admin/projects" />
            </CardHeader>
            <CardContent className="p-0">
              {lists.recentProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <Briefcase className="h-7 w-7 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    No projects found.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {lists.recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate text-foreground">
                          {project.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold border",
                              STATUS_BADGE[
                                (project.status ?? "").toUpperCase()
                              ] ?? "",
                            )}
                          >
                            {(project.status ?? "").replace("_", " ")}
                          </span>
                          {project.size && (
                            <span className="text-[11px] text-muted-foreground uppercase font-medium">
                              {project.size}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-foreground shrink-0 ml-4">
                        {project.budget
                          ? `$${project.budget.toLocaleString()}`
                          : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Pending Skill Approvals ──────────────────────────────────────── */}
        <Card className="border border-border/50 bg-card rounded-2xl overflow-hidden">
          <CardHeader className="px-5 pt-5 pb-3 border-b border-border/30">
            <SectionHeader
              title={`Pending Skill Approvals ${stats.pendingSkills > 0 ? `(${stats.pendingSkills})` : ""}`}
              to="/admin/skills"
              label="Manage Skills"
            />
          </CardHeader>
          <CardContent className="p-0">
            {lists.pendingSkills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Layers className="h-7 w-7 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No pending skills to review.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {lists.pendingSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Star className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {skill.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-muted-foreground">
                            {typeof skill.category === "object"
                              ? skill.category.name
                              : skill.category}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            ·
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {skill.submittedBy}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            ·
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(skill.createdAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs rounded-lg font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs rounded-lg font-semibold text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Recent Admin Activity ───────────────────────────────────────── */}
        <Card className="border border-border/50 bg-card rounded-2xl overflow-hidden">
          <CardHeader className="px-5 pt-5 pb-3 border-b border-border/30">
            <SectionHeader
              title="Recent Admin Activity"
              to="/admin/logs"
              label="Full logs"
            />
          </CardHeader>
          <CardContent className="p-0">
            {lists.recentAdminLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Activity className="h-7 w-7 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No recent admin activity.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {lists.recentAdminLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold border bg-muted text-muted-foreground border-border/50 shrink-0 uppercase">
                        {log.targetType}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {log.action.replace(/_/g, " ")}
                        </p>
                        {log.note && (
                          <p className="text-[11px] text-muted-foreground truncate">
                            {log.note}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground shrink-0 ml-4">
                      {new Date(log.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
