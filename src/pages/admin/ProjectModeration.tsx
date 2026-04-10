import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  ExternalLink,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  title: string;
  status: string;
  budget: number;
  budgetType: string;
  size: string;
  proposalCount: number;
  createdAt: string;
  clientProfile?: {
    user?: { name: string; email: string };
  };
  category?: { name: string };
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600 border-zinc-200",
  OPEN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  HIRED_PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  UNDER_REVIEW: "bg-purple-50 text-purple-700 border-purple-200",
  REVISION_REQUESTED: "bg-orange-50 text-orange-700 border-orange-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
  DISPUTED: "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_FILTERS = ["ALL", "OPEN", "IN_PROGRESS", "COMPLETED", "DISPUTED", "CANCELLED", "DRAFT"];

const fetchProjects = async (status: string, search: string): Promise<{ projects: Project[]; total: number }> => {
  const params = new URLSearchParams({ limit: "50" });
  if (status !== "ALL") params.set("status", status);
  if (search) params.set("search", search);
  const res = await api.get(`/projects?${params.toString()}`);
  // The projects endpoint may return data differently - handle both formats
  const data = res.data;
  if (Array.isArray(data)) return { projects: data, total: data.length };
  if (data.projects) return { projects: data.projects, total: data.total || data.projects.length };
  return { projects: [], total: 0 };
};

export default function ProjectModeration() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["adminProjects", statusFilter, search],
    queryFn: () => fetchProjects(statusFilter, search),
    staleTime: 30_000,
  });

  const projects = data?.projects || [];
  const total = data?.total || 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
            Content
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Project Moderation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? "Loading..." : `${total.toLocaleString()} total projects`}
          </p>
        </div>

        <Card className="border border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="px-5 pt-4 pb-4 border-b border-border/30">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  className="pl-9 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {/* Status filters */}
              <div className="flex flex-wrap gap-1.5">
                {STATUS_FILTERS.map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={statusFilter === s ? "default" : "outline"}
                    className="h-7 text-xs font-semibold"
                    onClick={() => setStatusFilter(s)}
                  >
                    {s.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <FolderOpen className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No projects found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wider">Project</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Client</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Budget</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Proposals</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Posted</TableHead>
                    <TableHead className="text-right pr-6 text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id} className="border-border/30 hover:bg-muted/20">
                      <TableCell className="pl-6">
                        <div className="max-w-[220px]">
                          <p className="text-sm font-semibold text-foreground truncate">{project.title}</p>
                          {project.category && (
                            <p className="text-[11px] text-muted-foreground">{project.category.name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {project.clientProfile?.user?.name || "N/A"}
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        ${project.budget?.toLocaleString() || "0"}
                        <span className="text-[10px] text-muted-foreground ml-1 font-normal">
                          {project.budgetType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold border",
                          STATUS_COLORS[project.status] || ""
                        )}>
                          {project.status.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {project.proposalCount || 0}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(project.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => window.open(`/client/projects/${project.id}`, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
