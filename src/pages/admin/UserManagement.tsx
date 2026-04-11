import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Search,
  MoreHorizontal,
  UserX,
  UserCheck,
  Eye,
  Loader2,
  Users,
  Mail,
  Calendar as CalendarIcon,
  Flag,
  Shield,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "FREELANCER" | "ADMIN";
  profileImage?: string;
  isEmailVerified: boolean;
  isIdVerified: boolean;
  isBanned: boolean;
  banReason?: string;
  isFlagged: boolean;
  violationCount: number;
  createdAt: string;
  lastActiveAt?: string;
}

// Scalable Identity Filters
const ROLE_FILTER = ["ALL", "CLIENT", "FREELANCER"] as const;
type RoleFilter = (typeof ROLE_FILTER)[number];

const fetchUsers = async (
  search: string, 
  banned: boolean, 
  startDate: string, 
  endDate: string,
  role: RoleFilter
): Promise<{ users: AdminUser[]; total: number }> => {
  const params = new URLSearchParams();
  if (role && role !== "ALL") params.set("role", role);
  if (search) params.set("search", search);
  if (banned) params.set("banned", "true");
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  params.set("limit", "20");
  const res = await api.get(`/admin/users?${params.toString()}`);
  return { users: res.data.users, total: res.data.total };
};

export default function UserManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showBanned, setShowBanned] = useState(false);
  const [banDialog, setBanDialog] = useState<{ open: boolean; user?: AdminUser; action: "ban" | "unban" }>({
    open: false,
    action: "ban",
  });
  const [banReason, setBanReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["adminUsers", search, showBanned, startDate, endDate, roleFilter],
    queryFn: () => fetchUsers(search, showBanned, startDate, endDate, roleFilter),
    staleTime: 30_000,
  });

  const banMutation = useMutation({
    mutationFn: ({ id, ban, reason }: { id: string; ban: boolean; reason?: string }) =>
      api.patch(`/admin/users/${id}/ban`, { ban, reason }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success(vars.ban ? "User banned successfully" : "User unbanned successfully");
      setBanDialog({ open: false, action: "ban" });
      setBanReason("");
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const users = data?.users || [];
  const total = data?.total || 0;

  const ROLE_BADGE: Record<string, string> = {
    CLIENT: "bg-blue-50 text-blue-700 border-blue-200",
    FREELANCER: "bg-violet-50 text-violet-700 border-violet-200",
    ADMIN: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Administration
            </p>
            <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLoading ? "Loading..." : `${total.toLocaleString()} identities matching protocol`}
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border border-border/50 rounded-2xl bg-primary/[0.02]">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight">{total.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">Identities in Protocol</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="sm:col-span-2 flex items-center px-4 text-xs font-medium text-muted-foreground italic">
            Showing the most recent activity logs. Use the temporal filters to explore historical data.
          </div>
        </div>

        <Card className="border border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="px-5 pt-5 pb-4 border-b border-border/30">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-9 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {/* Multi-tier Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                 <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
                    <SelectTrigger className="w-[130px] h-9 rounded-xl font-bold text-xs bg-muted/30 border-border/40">
                       <SelectValue placeholder="Protocol Role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                       <SelectItem value="ALL">All Roles</SelectItem>
                       <SelectItem value="CLIENT">Clients</SelectItem>
                       <SelectItem value="FREELANCER">Freelancers</SelectItem>
                    </SelectContent>
                 </Select>

                 <div className="flex items-center gap-2 bg-muted/30 px-3 h-9 rounded-xl border border-border/40">
                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent text-xs font-bold outline-none border-none dark:color-scheme-dark"
                    />
                    <span className="text-muted-foreground text-[10px] font-black">TO</span>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-transparent text-xs font-bold outline-none border-none dark:color-scheme-dark"
                    />
                 </div>

                <Button
                  size="sm"
                  variant={showBanned ? "destructive" : "outline"}
                  className="h-9 px-4 text-xs font-bold rounded-xl"
                  onClick={() => setShowBanned(!showBanned)}
                >
                  <Flag className="h-3.5 w-3.5 mr-2" />
                  Banned Only
                </Button>

                {(startDate || endDate || search || showBanned) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 px-4 text-xs font-bold rounded-xl text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      setSearch("");
                      setShowBanned(false);
                      setRoleFilter("ALL");
                    }}
                  >
                    Reset
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
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/30">
                    <TableHead className="pl-6 font-semibold text-xs uppercase tracking-wider">User</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Role</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Status</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Verifications</TableHead>
                    <TableHead className="font-semibold text-xs uppercase tracking-wider">Joined</TableHead>
                    <TableHead className="text-right pr-6 font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id} className="border-border/30 hover:bg-muted/20">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-border/30">
                              <AvatarImage src={user.profileImage} />
                              <AvatarFallback className="text-xs font-bold bg-primary/5">
                                {user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Link 
                                to={`/admin/users/${user.id}`}
                                className="text-sm font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                              >
                                {user.name}
                                <Eye className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Link>
                              <p className="text-[11px] text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border",
                            ROLE_BADGE[user.role] || ""
                          )}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          {user.isBanned ? (
                            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border bg-red-50 text-red-600 border-red-200">
                              Banned
                            </span>
                          ) : user.isFlagged ? (
                            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                              Flagged
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                              Active
                            </span>
                          )}
                          {user.violationCount > 0 && (
                            <span className="ml-1.5 text-[10px] text-red-500 font-bold">
                              {user.violationCount}x violations
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1.5 items-center">
                            {user.isEmailVerified ? (
                              <span title="Email verified" className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                                Email ✓
                              </span>
                            ) : (
                              <span title="Email not verified" className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold bg-muted text-muted-foreground border border-border/40">
                                Email ✗
                              </span>
                            )}
                            {user.isIdVerified && (
                              <span title="ID verified" className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                ID ✓
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}`)}>
                                <Eye className="h-4 w-4 mr-2" /> View Profile
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.isBanned ? (
                                <DropdownMenuItem
                                  onClick={() => setBanDialog({ open: true, user, action: "unban" })}
                                  className="text-emerald-600"
                                >
                                  <UserCheck className="h-4 w-4 mr-2" /> Unsuspend Account
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => setBanDialog({ open: true, user, action: "ban" })}
                                  className="text-destructive"
                                >
                                  <UserX className="h-4 w-4 mr-2" /> Suspend Account
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ban/Unban Dialog */}
      <Dialog open={banDialog.open} onOpenChange={(o) => !o && setBanDialog({ open: false, action: "ban" })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {banDialog.action === "ban" ? "Suspend Account" : "Unsuspend Account"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {banDialog.user && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={banDialog.user.profileImage} />
                  <AvatarFallback className="text-xs font-bold">{banDialog.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{banDialog.user.name}</p>
                  <p className="text-xs text-muted-foreground">{banDialog.user.email}</p>
                </div>
              </div>
            )}
            {banDialog.action === "ban" && (
              <div className="space-y-1.5">
                <Label>Suspension Reason</Label>
                <Input
                  placeholder="Reason for suspension (optional)"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {banDialog.action === "ban"
                ? "Suspending this user will prevent them from logging in and accessing the platform."
                : "Unsuspending will restore the user's access to the platform."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialog({ open: false, action: "ban" })}>
              Cancel
            </Button>
            <Button
              variant={banDialog.action === "ban" ? "destructive" : "default"}
              disabled={banMutation.isPending}
              onClick={() => banMutation.mutate({
                id: banDialog.user!.id,
                ban: banDialog.action === "ban",
                reason: banReason || undefined,
              })}
            >
              {banMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {banDialog.action === "ban" ? "Execute Suspension" : "Unsuspend Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
