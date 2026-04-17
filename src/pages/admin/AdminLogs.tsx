import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, History, User, FolderOpen, Shield, Star, DollarSign, Calendar, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface AdminLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  note?: string;
  createdAt: string;
  adminProfile?: {
    user?: { name: string; profileImage?: string };
  };
}

const TARGET_TYPES = ["ALL", "User", "Dispute", "Project", "Skill"];

const TARGET_ICONS: Record<string, React.ElementType> = {
  User: User,
  Dispute: Shield,
  Project: FolderOpen,
  Skill: Star,
};

const TARGET_COLORS: Record<string, string> = {
  User: "bg-blue-50 text-blue-700",
  Dispute: "bg-rose-50 text-rose-700",
  Project: "bg-violet-50 text-violet-700",
  Skill: "bg-amber-50 text-amber-700",
};

const fetchLogs = async (targetType: string, page: number, startDate?: string, endDate?: string): Promise<{ logs: AdminLog[]; total: number }> => {
  const params = new URLSearchParams({ page: String(page), limit: "30" });
  if (targetType !== "ALL") params.set("targetType", targetType);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const res = await api.get(`/admin/logs?${params.toString()}`);
  return res.data;
};

export default function AdminLogs() {
  const [targetFilter, setTargetFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["adminLogs", targetFilter, page, startDate, endDate],
    queryFn: () => fetchLogs(targetFilter, page, startDate, endDate),
  });

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 30);

  const formatAction = (action: string) =>
    action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
            Audit Trail
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Admin Activity Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Loading..." : `${total.toLocaleString()} total log entries`}
          </p>
        </div>

        <Card className="border border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="px-5 pt-4 pb-4 border-b border-border/30">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {TARGET_TYPES.map((t) => (
                  <Button
                    key={t}
                    size="sm"
                    variant={targetFilter === t ? "default" : "outline"}
                    className="h-7 text-xs font-semibold gap-1.5"
                    onClick={() => {
                      setTargetFilter(t);
                      setPage(1);
                    }}
                  >
                    {TARGET_ICONS[t] && (() => { const Icon = TARGET_ICONS[t]; return <Icon className="h-3 w-3" />; })()}
                    {t}
                  </Button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-muted-foreground whitespace-nowrap">From</span>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                      className="h-8 pl-8 text-[11px] font-bold w-36 rounded-xl bg-background/50"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-muted-foreground whitespace-nowrap">To</span>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                      className="h-8 pl-8 text-[11px] font-bold w-36 rounded-xl bg-background/50"
                    />
                  </div>
                </div>
                {(startDate || endDate || targetFilter !== "ALL") && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl hover:bg-muted"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      setTargetFilter("ALL");
                      setPage(1);
                    }}
                    title="Reset Filters"
                  >
                    <FilterX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <History className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No activity logs yet.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider">Admin</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Action</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Target</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Note</TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const Icon = TARGET_ICONS[log.targetType] || History;
                      return (
                        <TableRow key={log.id} className="border-border/30 hover:bg-muted/20">
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-7 w-7">
                                <AvatarImage src={log.adminProfile?.user?.profileImage} />
                                <AvatarFallback className="text-[10px] font-bold">
                                  {log.adminProfile?.user?.name?.charAt(0) || "A"}
                                </AvatarFallback>
                              </Avatar>
                              <p className="text-sm font-medium text-foreground">
                                {log.adminProfile?.user?.name || "Admin"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-semibold text-foreground">
                              {formatAction(log.action)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className={cn(
                              "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold",
                              TARGET_COLORS[log.targetType] || "bg-muted text-muted-foreground"
                            )}>
                              <Icon className="h-3 w-3" />
                              {log.targetType}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                            <span className="truncate block">{log.note || "—"}</span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-border/30">
                    <p className="text-xs text-muted-foreground">
                      Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
