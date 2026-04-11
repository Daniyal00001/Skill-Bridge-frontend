import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  DollarSign,
  FolderOpen,
  TrendingUp,
  Loader2,
  AlertTriangle,
  BarChart3,
  Tag,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface MonthlyData {
  month: string;
  users: number;
  projects: number;
  revenue: number;
}

interface AnalyticsData {
  monthlyData: MonthlyData[];
  categoryDistribution: { name: string; count: number }[];
  roleDistribution: { role: string; count: number }[];
  projectStatusDistribution: { status: string; count: number }[];
}

const fetchAnalytics = async (): Promise<AnalyticsData> => {
  const res = await api.get("/admin/analytics");
  return res.data.data;
};

const PROJECT_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-zinc-400",
  OPEN: "bg-emerald-500",
  HIRED_PENDING: "bg-yellow-500",
  IN_PROGRESS: "bg-blue-500",
  UNDER_REVIEW: "bg-purple-500",
  REVISION_REQUESTED: "bg-orange-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
  DISPUTED: "bg-rose-600",
};

const ROLE_COLORS: Record<string, string> = {
  CLIENT: "bg-blue-500",
  FREELANCER: "bg-violet-500",
  ADMIN: "bg-red-500",
};

const CAT_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-orange-500", "bg-pink-500",
  "bg-teal-500", "bg-indigo-500",
];

function BarChartSimple({ data, valueKey, labelKey, colors }: {
  data: any[];
  valueKey: string;
  labelKey: string;
  colors?: Record<string, string> | string[];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/50">
        <BarChart3 className="h-8 w-8 mb-2" />
        <p className="text-xs">No data available</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d[valueKey]));

  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const pct = max > 0 ? (item[valueKey] / max) * 100 : 0;
        const color = Array.isArray(colors)
          ? colors[i % colors.length]
          : colors?.[item[labelKey]] || "bg-primary";
        return (
          <div key={item[labelKey]} className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-foreground/80 truncate max-w-[180px]">
                {item[labelKey]?.replace(/_/g, " ")}
              </span>
              <span className="font-bold text-foreground ml-2 shrink-0">{item[valueKey]}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", color)}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthlyLineChart({ data }: { data: MonthlyData[] }) {
  if (!data || data.length === 0) return null;

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const maxUsers = Math.max(...data.map((d) => d.users), 1);
  const maxProjects = Math.max(...data.map((d) => d.projects), 1);

  const series = [
    { key: "revenue" as const, label: "Revenue ($)", color: "stroke-emerald-500", max: maxRevenue },
    { key: "users" as const, label: "New Users", color: "stroke-blue-500", max: maxUsers },
    { key: "projects" as const, label: "New Projects", color: "stroke-violet-500", max: maxProjects },
  ];

  const H = 120;
  const W = 100;
  const pad = 5;

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {series.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <div className={cn("h-2 w-6 rounded-full", s.color.replace("stroke-", "bg-"))} />
            <span className="text-[11px] text-muted-foreground font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 280, height: 160 }}>
          {series.map((s) => {
            const points = data.map((d, i) => {
              const x = pad + (i / Math.max(data.length - 1, 1)) * (W - pad * 2);
              const y = H - pad - ((d[s.key] / s.max) * (H - pad * 2));
              return `${x},${y}`;
            });
            return (
              <polyline
                key={s.key}
                points={points.join(" ")}
                fill="none"
                className={s.color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
          {/* X Axis Labels */}
          {data.map((d, i) => {
            const x = pad + (i / Math.max(data.length - 1, 1)) * (W - pad * 2);
            return (
              <text key={i} x={x} y={H - 1} textAnchor="middle" fontSize="4" fill="currentColor" className="text-muted-foreground/50">
                {d.month}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-muted-foreground pb-2 font-medium">Month</th>
              <th className="text-right text-muted-foreground pb-2 font-medium">Users</th>
              <th className="text-right text-muted-foreground pb-2 font-medium">Projects</th>
              <th className="text-right text-muted-foreground pb-2 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {data.map((d) => (
              <tr key={d.month} className="hover:bg-muted/20">
                <td className="py-1.5 font-medium">{d.month}</td>
                <td className="py-1.5 text-right text-blue-600 font-semibold">{d.users}</td>
                <td className="py-1.5 text-right text-violet-600 font-semibold">{d.projects}</td>
                <td className="py-1.5 text-right text-emerald-600 font-semibold">${d.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: fetchAnalytics,
  });

  const totalRevenue = data?.monthlyData.reduce((acc, m) => acc + m.revenue, 0) || 0;
  const totalUsers = data?.roleDistribution.reduce((acc, r) => acc + r.count, 0) || 0;
  const totalProjects = data?.projectStatusDistribution.reduce((acc, s) => acc + s.count, 0) || 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
            Insights
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time insights into platform growth, revenue, and user activity.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-muted-foreground">Failed to load analytics data.</p>
          </div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Platform Revenue (6mo)", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Total Users", value: totalUsers.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Total Projects", value: totalProjects.toLocaleString(), icon: FolderOpen, color: "text-violet-600", bg: "bg-violet-50" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <Card key={label} className="border border-border/50 rounded-2xl">
                  <CardContent className="p-5">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-3", bg)}>
                      <Icon className={cn("h-5 w-5", color)} />
                    </div>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Monthly Trend */}
            <Card className="border border-border/50 rounded-2xl">
              <CardHeader className="px-5 pt-5 pb-3 border-b border-border/30">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  6-Month Growth Trend
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <MonthlyLineChart data={data?.monthlyData || []} />
              </CardContent>
            </Card>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Category Distribution */}
              <Card className="border border-border/50 rounded-2xl">
                <CardHeader className="px-5 pt-5 pb-3 border-b border-border/30">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Top Categories
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <BarChartSimple
                    data={data?.categoryDistribution || []}
                    valueKey="count"
                    labelKey="name"
                    colors={CAT_COLORS}
                  />
                </CardContent>
              </Card>

              {/* Role Distribution */}
              <Card className="border border-border/50 rounded-2xl">
                <CardHeader className="px-5 pt-5 pb-3 border-b border-border/30">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    User Roles
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <BarChartSimple
                    data={data?.roleDistribution || []}
                    valueKey="count"
                    labelKey="role"
                    colors={ROLE_COLORS}
                  />
                  <div className="mt-4 space-y-1">
                    {(data?.roleDistribution || []).map((r) => (
                      <div key={r.role} className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-medium">{r.role}</span>
                        <span className="font-semibold">
                          {totalUsers > 0 ? ((r.count / totalUsers) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Project Status Distribution */}
              <Card className="border border-border/50 rounded-2xl">
                <CardHeader className="px-5 pt-5 pb-3 border-b border-border/30">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-primary" />
                    Project Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <BarChartSimple
                    data={data?.projectStatusDistribution || []}
                    valueKey="count"
                    labelKey="status"
                    colors={PROJECT_STATUS_COLORS}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
