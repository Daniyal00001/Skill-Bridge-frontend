import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService, VerificationUser, StatusCounts } from "@/services/admin.service";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Loader2, ShieldCheck, XCircle, Search, ExternalLink, FilterX,
  CheckCircle, Clock, AlertCircle, Users
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type StatusTab = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const STATUS_CONFIG: Record<string, {
  label: string;
  badgeClass: string;
  icon: React.ElementType;
}> = {
  PENDING: {
    label: "Pending Review",
    badgeClass: "bg-blue-500/10 text-blue-600 border-blue-200",
    icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    badgeClass: "bg-green-500/10 text-green-600 border-green-200",
    icon: CheckCircle,
  },
  REJECTED: {
    label: "Rejected",
    badgeClass: "bg-red-500/10 text-red-600 border-red-200",
    icon: XCircle,
  },
};

export default function AdminVerifications() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<StatusTab>("PENDING");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "all_verifications", activeTab, page, searchQuery, roleFilter],
    queryFn: () => adminService.getAllVerifications(activeTab, page, searchQuery, roleFilter),
  });

  const verifications: VerificationUser[] = data?.users || [];
  const total = data?.total || 0;
  const statusCounts: StatusCounts = data?.statusCounts || { ALL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 };

  const approveMutation = useMutation({
    mutationFn: (userId: string) => adminService.approveVerification(userId),
    onSuccess: () => {
      toast.success("Verification approved successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin", "all_verifications"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to approve verification.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminService.rejectVerification(userId, reason),
    onSuccess: () => {
      toast.success("Verification rejected.");
      setRejectId(null);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["admin", "all_verifications"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to reject verification.");
    },
  });

  const handleApprove = (userId: string) => {
    if (window.confirm("Approve this identity verification?")) {
      approveMutation.mutate(userId);
    }
  };

  const handleReject = () => {
    if (rejectId && rejectReason.trim()) {
      rejectMutation.mutate({ userId: rejectId, reason: rejectReason.trim() });
    } else {
      toast.error("Please provide a reason for rejection.");
    }
  };

  const tabs: { key: StatusTab; label: string; icon: React.ElementType }[] = [
    { key: "ALL", label: "All", icon: Users },
    { key: "PENDING", label: "Pending", icon: Clock },
    { key: "APPROVED", label: "Approved", icon: CheckCircle },
    { key: "REJECTED", label: "Rejected", icon: XCircle },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Identity Verifications</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage user identity verification submissions.
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 border-b border-border/40 pb-0">
          {tabs.map((tab) => {
            const count = statusCounts[tab.key] ?? 0;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {count > 0 && (
                  <Badge
                    className={cn(
                      "h-5 min-w-[20px] px-1.5 text-[10px] font-black border",
                      tab.key === "PENDING"
                        ? "bg-blue-500/10 text-blue-600 border-blue-200"
                        : tab.key === "APPROVED"
                        ? "bg-green-500/10 text-green-600 border-green-200"
                        : tab.key === "REJECTED"
                        ? "bg-red-500/10 text-red-600 border-red-200"
                        : "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {count}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              className="pl-9 bg-background/50"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => {
            setRoleFilter(v);
            setPage(1);
          }}>
            <SelectTrigger className="w-full md:w-[150px] bg-background/50">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="FREELANCER">Freelancer</SelectItem>
              <SelectItem value="CLIENT">Client</SelectItem>
            </SelectContent>
          </Select>
          {(searchQuery || roleFilter !== "ALL") && (
            <Button
              variant="ghost"
              className="px-3"
              onClick={() => { 
                setSearchQuery(""); 
                setRoleFilter("ALL"); 
                setPage(1);
              }}
            >
              <FilterX className="h-4 w-4 mr-2" /> Clear
            </Button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center h-[40vh]">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : verifications.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <ShieldCheck className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-lg font-semibold">
              {searchQuery || roleFilter !== "ALL"
                ? "No matches found"
                : activeTab === "PENDING"
                ? "No Pending Verifications"
                : activeTab === "APPROVED"
                ? "No Approved Verifications"
                : activeTab === "REJECTED"
                ? "No Rejected Verifications"
                : "No Verification Submissions"}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery || roleFilter !== "ALL"
                ? "Try adjusting your filters."
                : "Nothing to show here yet."}
            </p>
          </Card>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verifications.map((v) => {
              const statusCfg = STATUS_CONFIG[v.idVerificationStatus];
              const StatusIcon = statusCfg?.icon ?? AlertCircle;
              return (
                <Card key={v.id} className="overflow-hidden flex flex-col">
                  <CardHeader className="bg-muted/40 pb-4 border-b">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link 
                          to={`/admin/users/${v.id}`}
                          className="hover:text-primary transition-colors block group"
                        >
                          <CardTitle className="text-base truncate flex items-center gap-1.5" title={v.name}>
                            {v.name}
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </CardTitle>
                        </Link>
                        <CardDescription className="truncate text-xs mt-0.5" title={v.email}>
                          {v.email}
                        </CardDescription>
                      </div>
                      <Badge
                        className={cn(
                          "shrink-0 text-[10px] font-bold uppercase tracking-wider border",
                          "bg-primary/10 text-primary border-primary/20"
                        )}
                      >
                        {v.role}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(v.createdAt).toLocaleDateString()}
                      </p>
                      <Badge
                        className={cn(
                          "flex items-center gap-1 text-[10px] font-semibold border",
                          statusCfg?.badgeClass
                        )}
                      >
                        <StatusIcon className="h-2.5 w-2.5" />
                        {statusCfg?.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 flex-1 flex flex-col gap-3">
                    {/* Rejection Reason */}
                    {v.idVerificationStatus === "REJECTED" && v.idRejectionReason && (
                      <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs leading-relaxed border border-red-100">
                        <span className="font-bold block mb-0.5">Rejection Reason:</span>
                        {v.idRejectionReason}
                      </div>
                    )}

                    {/* ID Document Preview */}
                    <div className="border rounded-lg aspect-video bg-muted flex items-center justify-center overflow-hidden relative group flex-shrink-0">
                      {v.idDocumentUrl ? (
                        <>
                          <img
                            src={v.idDocumentUrl}
                            alt="ID Document"
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <a
                            href={v.idDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <Button variant="secondary" size="sm" className="gap-2">
                              <ExternalLink className="h-4 w-4" /> View Full
                            </Button>
                          </a>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <AlertCircle className="h-8 w-8 opacity-30" />
                          <span className="text-xs">No document on file</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons (only for PENDING) */}
                    {v.idVerificationStatus === "PENDING" && (
                      <div className="flex gap-2 mt-auto pt-1">
                        <Button
                          className="flex-1"
                          variant="default"
                          onClick={() => handleApprove(v.id)}
                          disabled={approveMutation.isPending}
                        >
                          {approveMutation.isPending && approveMutation.variables === v.id ? (
                            <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1.5" />
                          )}
                          Approve
                        </Button>
                        <Button
                          className="flex-1"
                          variant="destructive"
                          onClick={() => setRejectId(v.id)}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1.5" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {/* Approved indicator */}
                    {v.idVerificationStatus === "APPROVED" && (
                      <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-100 rounded-lg mt-auto">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                        <span className="text-xs font-semibold text-green-700">Identity Verified</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {total > 12 && (
            <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border/50">
              <p className="text-xs text-muted-foreground font-medium">
                Showing {((page - 1) * 12) + 1} - {Math.min(page * 12, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <div className="h-8 w-8 flex items-center justify-center bg-background rounded-md border text-xs font-bold">
                  {page}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page * 12 >= total}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={!!rejectId} onOpenChange={(val) => !val && setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Provide a clear reason for rejection. This will be shown to the user so they can resubmit.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g. Document is blurry, expired, or names do not match..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending || !rejectReason.trim()}
            >
              {rejectMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
