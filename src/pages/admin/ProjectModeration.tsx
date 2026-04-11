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
  Trash2,
  Ban,
  FilterX,
  User,
  Eye,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

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
    user?: { id: string; name: string; email: string };
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

export default function ProjectModeration() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["adminProjects", statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await api.get(`/admin/projects?${params.toString()}`);
      return res.data;
    },
    staleTime: 30_000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/admin/projects/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      toast.success("Project status updated.");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed"),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      toast.success("Project permanently deleted.");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed"),
  });

  const handleUpdateStatus = (id: string, status: string) => {
    if (window.confirm(`Are you sure you want to change project status to ${status}?`)) {
      updateStatusMutation.mutate({ id, status });
    }
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm("PERMANENT DELETE: This project and all its data will be lost. Continue?")) {
      deleteProjectMutation.mutate(id);
    }
  };

  const projects = data?.projects || [];
  const total = data?.total || 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Content Moderation
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Platform Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading ? "Loading..." : `${total.toLocaleString()} total projects found`}
            </p>
          </div>
        </div>

        <Card className="border border-border/50 rounded-2xl overflow-hidden shadow-sm">
          <CardHeader className="px-5 pt-5 pb-4 border-b border-border/30 bg-muted/20">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  className="pl-9 h-9 border-border/50 bg-background/50"
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
                    className={cn(
                      "h-8 text-[11px] font-bold tracking-tight px-3 transition-all",
                      statusFilter === s ? "" : "bg-background/50"
                    )}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s.replace("_", " ")}
                  </Button>
                ))}
                {(search || statusFilter !== "ALL") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-muted-foreground"
                    onClick={() => { setSearch(""); setStatusFilter("ALL"); }}
                  >
                    <FilterX className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-60">
                <FolderOpen className="h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">No projects match your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="table-fixed w-full">
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent bg-muted/5">
                      <TableHead className="pl-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 w-[35%]">Project</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 w-[20%]">Client</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 w-[15%]">Budget</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 w-[15%]">Status</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 w-[15%] text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project: Project) => (
                      <TableRow key={project.id} className="border-border/30 hover:bg-muted/30 group">
                        <TableCell className="pl-6 py-4 overflow-hidden">
                          <div className="w-full">
                            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer break-words line-clamp-2" onClick={() => window.open(`/freelancer/projects/${project.id}`, "_blank")}>
                              {project.title}
                            </p>
                            {project.category && (
                              <p className="text-[10px] font-medium text-muted-foreground mt-0.5 truncate">{project.category.name}</p>
                            )}
                          </div>
                        </TableCell>
                      <TableCell>
                        {project.clientProfile?.user ? (
                          <Link 
                            to={`/admin/users/${project.clientProfile.user.id}`}
                            className="flex items-center gap-2 group/user"
                          >
                            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover/user:bg-primary/20 transition-colors">
                              <User className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-foreground truncate group-hover/user:text-primary transition-colors leading-tight">
                                {project.clientProfile.user.name}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate leading-tight">
                                {project.clientProfile.user.email}
                              </p>
                            </div>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-black text-sm text-foreground">
                          ${project.budget?.toLocaleString() || "0"}
                        </p>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                          {project.budgetType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "rounded-lg px-2 py-0.5 text-[10px] font-black tracking-tight border shadow-none",
                          STATUS_COLORS[project.status] || "bg-muted text-muted-foreground"
                        )}>
                          {project.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted font-bold">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 rounded-xl p-1 shadow-xl border-border/40">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest px-2 py-1.5 opacity-50">Project Logic</DropdownMenuLabel>
                            
                            <DropdownMenuItem 
                              onClick={() => window.open(`/freelancer/projects/${project.id}`, "_blank")}
                              className="rounded-lg h-9 px-2 gap-2 font-semibold"
                            >
                              <Eye className="h-4 w-4 text-muted-foreground" /> View Public Page
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-muted" />
                            
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest px-2 py-1.5 opacity-50">Moderation</DropdownMenuLabel>
                            
                            {project.status !== "CANCELLED" && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(project.id, "CANCELLED")}
                                className="rounded-lg h-9 px-2 gap-2 text-orange-600 font-semibold focus:bg-orange-50 focus:text-orange-700"
                              >
                                <Ban className="h-4 w-4" /> Cancel Project
                              </DropdownMenuItem>
                            )}

                            {project.status === "CANCELLED" && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(project.id, "OPEN")}
                                className="rounded-lg h-9 px-2 gap-2 text-emerald-600 font-semibold focus:bg-emerald-50 focus:text-emerald-700"
                              >
                                <FolderOpen className="h-4 w-4" /> Restore Project
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem 
                              onClick={() => handleDeleteProject(project.id)}
                              className="rounded-lg h-9 px-2 gap-2 text-red-600 font-semibold focus:bg-red-50 focus:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" /> Permanent Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            )
          }
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
