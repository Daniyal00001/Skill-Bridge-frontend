import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShieldCheck, XCircle, Search, ExternalLink, Calendar as CalendarIcon, FilterX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AdminVerifications() {
  const queryClient = useQueryClient();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: verifications, isLoading } = useQuery({
    queryKey: ["admin", "pending_verifications"],
    queryFn: adminService.getPendingVerifications,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const filteredVerifications = verifications?.filter((v: any) => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || v.role === roleFilter;
    const matchesDate = !dateFilter || new Date(v.createdAt).toISOString().split('T')[0] === dateFilter;

    return matchesSearch && matchesRole && matchesDate;
  }) || [];

  const approveMutation = useMutation({
    mutationFn: (userId: string) => adminService.approveVerification(userId),
    onSuccess: () => {
      toast.success("Verification approved successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin", "pending_verifications"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to approve verification.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminService.rejectVerification(userId, reason),
    onSuccess: () => {
      toast.success("Verification rejected successfully.");
      setRejectId(null);
      setRejectReason("");
      queryClient.invalidateQueries({ queryKey: ["admin", "pending_verifications"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to reject verification.");
    },
  });

  const handleApprove = (userId: string) => {
    if (window.confirm("Are you sure you want to approve this identity verification?")) {
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Identity Verifications</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage pending user identity verifications.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-9 bg-background/50 border-border/50 focus:bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-[150px] bg-background/50 border-border/50">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="FREELANCER">Freelancer</SelectItem>
              <SelectItem value="CLIENT">Client</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-full md:w-[180px]">
            <Input 
              type="date"
              className="bg-background/50 border-border/50 focus:bg-background"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {(searchQuery || roleFilter !== "ALL" || dateFilter) && (
            <Button 
              variant="ghost" 
              className="px-3"
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("ALL");
                setDateFilter("");
              }}
            >
              <FilterX className="h-4 w-4 mr-2" /> Clear
            </Button>
          )}
        </div>

        {(!verifications || verifications.length === 0) ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <ShieldCheck className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">No Pending Verifications</h3>
            <p className="text-sm text-muted-foreground mt-1">
              There are no pending identity verification requests at this time.
            </p>
          </Card>
        ) : filteredVerifications.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
            <Search className="h-10 w-10 text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-base font-semibold">No matches found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              No verification requests match your current filters.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVerifications.map((v: any) => (
              <Card key={v.id} className="overflow-hidden flex flex-col">
                <CardHeader className="bg-muted/50 pb-4 border-b">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span className="truncate" title={v.name}>{v.name}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded">
                      {v.role}
                    </span>
                  </CardTitle>
                  <CardDescription className="truncate" title={v.email}>
                    {v.email}
                  </CardDescription>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted: {new Date(v.createdAt).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col gap-4">
                  <div className="border rounded-md aspect-video bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
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
                      <span className="text-xs text-muted-foreground">No document found</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-auto pt-2">
                    <Button 
                      className="flex-1" 
                      variant="default"
                      onClick={() => handleApprove(v.id)}
                      disabled={approveMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button 
                      className="flex-1" 
                      variant="destructive"
                      onClick={() => setRejectId(v.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!rejectId} onOpenChange={(val) => !val && setRejectId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this identity document. This will be shown to the user.
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
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
