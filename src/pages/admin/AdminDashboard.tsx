import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/common/StatsCard";
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
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ShieldAlert,
  CheckCircle,
  Star,
  FileText,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardStats } from "@/services/dashboard.service";

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  OPEN: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  HIRED_PENDING: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  UNDER_REVIEW: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  REVISION_REQUESTED: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  COMPLETED: "bg-green-500/10 text-green-600 border-green-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
  DISPUTED: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

const ROLE_BADGE: Record<string, string> = {
  CLIENT: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  FREELANCER: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  ADMIN: "bg-red-500/10 text-red-500 border-red-500/20",
};

const DISPUTE_STATUS_BADGE: Record<string, string> = {
  OPEN: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  UNDER_REVIEW: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  RESOLVED: "bg-green-500/10 text-green-600 border-green-500/20",
  CLOSED: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
};

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: getAdminDashboardStats,
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Platform overview and management</p>
          </div>
          <Button variant="outline" asChild>
            <a href="/admin/logs">View Admin Logs</a>
          </Button>
        </div>

        {/* ── Stats Grid ──────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            change={`+${stats.newUsersThisMonth} this month`}
            changeType="positive"
            icon={Users}
          />
          <StatsCard
            title="Active Projects"
            value={(stats.openProjects + stats.inProgressProjects).toLocaleString()}
            change={`${stats.openProjects} open · ${stats.inProgressProjects} in progress`}
            changeType="positive"
            icon={FolderOpen}
          />
          <StatsCard
            title="Platform Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            change="From payment releases"
            changeType="positive"
            icon={DollarSign}
          />
          <StatsCard
            title="Open Disputes"
            value={stats.openDisputes}
            change="Requires admin action"
            changeType={stats.openDisputes > 0 ? "negative" : "neutral"}
            icon={AlertTriangle}
          />
        </div>

        {/* ── Secondary metric strip ─────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Completed Projects", value: stats.completedProjects, icon: CheckCircle, color: "text-green-500" },
            { label: "Pending Skills", value: stats.pendingSkills, icon: Star, color: "text-amber-500" },
            { label: "Pending Proposals", value: stats.pendingProposals, icon: FileText, color: "text-blue-500" },
            { label: "Banned Users", value: stats.bannedUsers, icon: ShieldAlert, color: "text-red-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-border/40 bg-card/50">
              <CardContent className="p-5 flex items-center gap-4">
                <Icon className={`h-8 w-8 shrink-0 ${color}`} />
                <div>
                  <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Charts + Platform Metrics ─────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Revenue Overview</span>
                <Button variant="ghost" size="sm">
                  View Report
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Revenue Chart</p>
                  <p className="text-xs text-muted-foreground mt-1">Pending implementation...</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Project Success Rate", value: "96.5%", delta: "+2.3%", up: true },
                { label: "Avg. Project Value", value: "$4,250", delta: "+8.1%", up: true },
                { label: "User Retention", value: "89.2%", delta: "-1.2%", up: false },
                { label: "Dispute Rate", value: `${stats.disputedProjects}%`, delta: "of all projects", up: false },
              ].map(({ label, value, delta, up }) => (
                <div key={label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                  </div>
                  <div className={`flex items-center ${up ? "text-green-500" : "text-destructive"}`}>
                    {up ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                    <span className="text-sm font-medium">{delta}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ── Disputes Table ───────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                Active Disputes
              </span>
              <Button variant="ghost" size="sm" asChild>
                <a href="/admin/disputes">View All</a>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lists.activeDisputes.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No active disputes.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Freelancer</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Opened</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lists.activeDisputes.map((dispute) => (
                    <TableRow key={dispute.id}>
                      <TableCell className="font-medium max-w-[160px] truncate">{dispute.projectTitle}</TableCell>
                      <TableCell className="text-sm">{dispute.clientName}</TableCell>
                      <TableCell className="text-sm">{dispute.freelancerName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">{dispute.reason}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] font-bold uppercase ${DISPUTE_STATUS_BADGE[dispute.status]}`}>
                          {dispute.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(dispute.openedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* ── Users + Projects Tables ───────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Users</span>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/admin/users">View All</a>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lists.recentUsers.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">No users found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lists.recentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.profileImage || ""} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] font-bold uppercase ${ROLE_BADGE[user.role?.toUpperCase() ?? "CLIENT"] ?? ""}`}>
                            {user.role || 'CLIENT'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isEmailVerified ? (
                            <Badge variant="outline" className="text-[10px] font-bold bg-green-500/10 text-green-600 border-green-500/20">Verified</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] font-bold bg-amber-500/10 text-amber-600 border-amber-500/20">Unverified</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.isBanned ? (
                            <Badge variant="outline" className="text-[10px] font-bold bg-red-500/10 text-red-500 border-red-500/20">Banned</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] font-bold bg-zinc-500/10 text-zinc-500 border-zinc-500/20">Active</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Projects</span>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/admin/projects">View All</a>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lists.recentProjects.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">No projects found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lists.recentProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <p className="font-medium truncate max-w-[150px] text-sm">{project.title}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] font-bold uppercase">
                            {project.size ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] font-bold uppercase ${STATUS_BADGE[(project.status ?? "").toUpperCase()] ?? ""}`}>
                            {(project.status ?? "").replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {project.budget ? `$${project.budget.toLocaleString()}` : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Pending Skill Approvals ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                Pending Skill Approvals
              </span>
              <Button variant="ghost" size="sm" asChild>
                <a href="/admin/skills">Manage Skills</a>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lists.pendingSkills.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No pending skills.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Skill Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lists.pendingSkills.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell className="font-medium">{skill.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {skill.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{skill.submittedBy}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(skill.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-7 text-xs text-green-600 border-green-500/30 hover:bg-green-500/10">Approve</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 border-red-500/30 hover:bg-red-500/10">Reject</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* ── Recent Admin Logs ─────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Recent Admin Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lists.recentAdminLogs.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No recent activity logs.</p>
            ) : (
              <div className="space-y-3">
                {lists.recentAdminLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between gap-4 py-2 border-b last:border-0 border-border/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase shrink-0">
                        {log.targetType}
                      </Badge>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{log.action.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground">{log.note}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">{new Date(log.createdAt).toLocaleString()}</p>
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
