import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  ArrowUpRight,
  DollarSign,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  Inbox,
  Eye,
  Paperclip,
  RotateCcw,
  Milestone,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const DirectInvitesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("month");
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [selectedInvite, setSelectedInvite] = useState<any | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const res = await api.get("/invitations");
      setInvites(res.data.data);
    } catch (err) {
      toast.error("Failed to load your direct invites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleCancelInvite = async (id: string) => {
    try {
      setCancellingId(id);
      await api.patch(`/invitations/${id}/cancel`);
      toast.success("Invitation cancelled successfully");
      if (detailsModalOpen) setDetailsModalOpen(false);
      await fetchInvites();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to cancel invitation");
    } finally {
      setCancellingId(null);
    }
  };

  const filteredInvites = useMemo(() => {
    return invites.filter((invite) => {
      const matchesSearch =
        invite.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invite.freelancerName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || invite.status?.toLowerCase() === statusFilter;

      let matchesDate = true;
      if (dateFilter !== "all") {
        const inviteDate = new Date(invite.createdAt);
        const now = new Date();
        if (dateFilter === "today") {
          matchesDate = inviteDate.toDateString() === now.toDateString();
        } else if (dateFilter === "week") {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          matchesDate = inviteDate >= weekAgo;
        } else if (dateFilter === "month") {
          const monthAgo = new Date();
          monthAgo.setDate(now.getDate() - 30);
          matchesDate = inviteDate >= monthAgo;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [invites, searchTerm, statusFilter, dateFilter]);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACCEPTED":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200">
            Accepted
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="destructive"
            className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200"
          >
            Rejected
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="secondary"
            className="bg-zinc-500/15 text-zinc-700 hover:bg-zinc-500/25 border-zinc-200"
          >
            Cancelled
          </Badge>
        );
      case "PENDING":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-200"
          >
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: invites.length,
    pending: invites.filter((i) => i.status?.toUpperCase() === "PENDING")
      .length,
    accepted: invites.filter((i) => i.status?.toUpperCase() === "ACCEPTED")
      .length,
    rejected: invites.filter((i) => i.status?.toUpperCase() === "REJECTED")
      .length,
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Direct Invites
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage all direct invitations sent to freelancers.
            </p>
          </div>
          {/* Quick stats */}
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 bg-muted rounded-full font-bold">
              {stats.total} Total
            </span>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-700 rounded-full font-bold">
              {stats.pending} Pending
            </span>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 rounded-full font-bold">
              {stats.accepted} Accepted
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by project or freelancer..."
              className="pl-9 h-10 rounded-lg bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto ml-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-10 rounded-lg">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[130px] h-10 rounded-lg">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Past 7 Days</SelectItem>
                <SelectItem value="month">Past 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 bg-card rounded-2xl border">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">
              Loading invites...
            </p>
          </div>
        ) : (
          <Card className="rounded-2xl shadow-sm border overflow-hidden">
            <CardHeader className="bg-muted/30 px-6 py-4 border-b">
              <CardTitle className="text-lg">Sent Invitations</CardTitle>
              <CardDescription>
                Review the details and status of each direct invite.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6 h-12">Freelancer</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Sent On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvites.map((invite) => (
                    <TableRow
                      key={invite.id}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border shadow-sm">
                            <AvatarImage src={invite.freelancerAvatar} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {invite.freelancerName?.charAt(0) || "F"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">
                              {invite.freelancerName}
                            </p>
                            <Link
                              to={`/client/browse`}
                              className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                            >
                              View Profile <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Link
                          to={`/client/projects/${invite.projectId}`}
                          className="font-medium text-sm line-clamp-1 max-w-[200px] hover:text-primary transition-colors"
                          title={invite.projectTitle}
                        >
                          {invite.projectTitle}
                        </Link>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5 font-semibold text-sm">
                          <DollarSign className="h-4 w-4 text-primary bg-primary/10 rounded-full p-0.5" />
                          <span>
                            {invite.budget?.toLocaleString() || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-sm font-medium text-muted-foreground">
                        {new Date(invite.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </TableCell>
                      <TableCell className="py-4">
                        {getStatusBadge(invite.status)}
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4 space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-bold border-primary/20 text-primary hover:bg-primary/10"
                          onClick={() => {
                            setSelectedInvite(invite);
                            setDetailsModalOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1.5" /> Details
                        </Button>
                        {invite.status === "PENDING" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700 border-none font-bold"
                            onClick={() => handleCancelInvite(invite.id)}
                            disabled={cancellingId === invite.id}
                          >
                            {cancellingId === invite.id ? (
                              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-1.5" />
                            )}
                            Cancel
                          </Button>
                        )}
                        {invite.status === "ACCEPTED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-200 font-bold"
                          >
                            <Link to={`/client/contracts/`}>
                              Go to Contracts{" "}
                              <FileText className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredInvites.length === 0 && (
                <div className="text-center py-16 px-4">
                  <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Inbox className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-bold mb-1">
                    No Direct Invites Found
                  </h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    {invites.length === 0
                      ? "You haven't sent any direct invitations. Browse freelancers to send your first invite directly to their inbox."
                      : "No invitations match your current filters."}
                  </p>
                  {invites.length === 0 && (
                    <Button className="mt-6 rounded-xl font-bold" asChild>
                      <Link to="/client/browse">Browse Freelancers</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Details Modal */}
      {selectedInvite && (
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="max-w-4xl border-none bg-card/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col p-0 border border-white/10">
            <DialogHeader className="p-8 pb-6 border-b shrink-0 bg-secondary/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <FileText className="w-24 h-24 rotate-12" />
              </div>
              <div className="flex items-center gap-4 mb-2">
                <Badge className="bg-primary/20 text-primary border-primary/30 font-black uppercase tracking-widest text-[10px] px-3">
                  Direct Invitation Sent
                </Badge>
                <Badge
                  variant="outline"
                  className="font-bold border-muted-foreground/20 text-muted-foreground uppercase tracking-tighter text-[10px]"
                >
                  Ref: {selectedInvite.id.slice(-6).toUpperCase()}
                </Badge>
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight mb-1">
                Invitation Review
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground/80">
                Proposed terms for{" "}
                <span className="text-foreground font-bold">
                  {selectedInvite.freelancerName}
                </span>{" "}
                regarding your project "{selectedInvite.projectTitle}".
              </DialogDescription>
            </DialogHeader>

            <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
              {/* Top Row: Important Stats & Message */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Attachments Section - High Prominence */}
                  {selectedInvite.attachments &&
                    selectedInvite.attachments.length > 0 && (
                      <div className="bg-primary/[0.03] border border-primary/10 rounded-3xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                            <Paperclip className="w-4 h-4" /> Your Attached
                            Files
                          </h4>
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {selectedInvite.attachments.length} total files
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedInvite.attachments.map(
                            (url: string, idx: number) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 rounded-2xl border bg-background hover:bg-primary/5 hover:border-primary/40 transition-all group shadow-sm"
                              >
                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                  <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                                    Asset {idx + 1}
                                  </p>
                                  <p className="text-xs font-bold truncate">
                                    View Document
                                  </p>
                                </div>
                              </a>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {selectedInvite.message ? (
                    <div className="bg-card border rounded-3xl p-6 shadow-sm border-muted/40 italic text-muted-foreground relative">
                      <div className="absolute top-4 left-4 text-4xl text-primary/10 font-serif leading-none italic pointer-events-none">
                        “
                      </div>
                      <p className="text-sm font-medium leading-relaxed pl-4 pr-2">
                        {selectedInvite.message}
                      </p>
                      <div className="mt-4 pt-4 border-t flex items-center gap-2">
                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                          Sent by you
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-muted/10 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 opacity-50 text-center py-10">
                      <Inbox className="w-8 h-8 text-muted-foreground/30" />
                      <p className="text-xs font-bold text-muted-foreground tracking-tight">
                        No message included in this invite
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-3xl border bg-gradient-to-br from-primary/10 to-transparent space-y-4 shadow-sm">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        Total Budget
                      </p>
                      <p className="text-4xl font-black text-foreground tabular-nums">
                        ${selectedInvite.budget?.toLocaleString()}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-primary/10 grid grid-cols-1 gap-4">
                      {(!selectedInvite.milestones ||
                        selectedInvite.milestones.length === 0) && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Global Revisions
                          </p>
                          <p className="text-lg font-bold flex items-center gap-2">
                            <RotateCcw className="w-4 h-4 text-primary" />{" "}
                            {selectedInvite.revisionsAllowed} Limit
                          </p>
                        </div>
                      )}
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Creation Date
                        </p>
                        <p className="text-xs font-bold text-muted-foreground">
                          {new Date(
                            selectedInvite.createdAt,
                          ).toLocaleDateString(undefined, {
                            dateStyle: "long",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl border bg-secondary/20 space-y-3">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                      Current Status
                    </h4>
                    <div className="inline-block px-1 scale-110 origin-left">
                      {getStatusBadge(selectedInvite.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Centered Project Category at Bottom */}
              <div className="flex justify-center pt-4">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/30 border border-border/40 shadow-sm">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Category:
                  </span>
                  <span className="text-[10px] font-bold">
                    {selectedInvite.projectCategory}
                  </span>
                </div>
              </div>

              {/* Milestones Section */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <h4 className="text-lg font-black tracking-tight flex items-center gap-3 italic">
                    <Milestone className="w-6 h-6 text-primary" />
                    Milestone Breakdown
                  </h4>
                  <Badge className="bg-primary px-3 py-1 font-black shadow-lg shadow-primary/20">
                    {selectedInvite.milestones?.length || 0} Phases
                  </Badge>
                </div>

                <div className="space-y-4">
                  {selectedInvite.milestones &&
                  selectedInvite.milestones.length > 0 ? (
                    selectedInvite.milestones.map((m: any, idx: number) => (
                      <div
                        key={idx}
                        className="group p-5 bg-card/40 border border-muted-foreground/10 rounded-[1.5rem] hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center shrink-0 font-black text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-base mb-0.5 group-hover:text-primary transition-colors">
                              {m.title}
                            </p>
                            <p className="text-sm text-muted-foreground/70 font-medium mb-2">
                              {m.description ||
                                "No description provided for this phase."}
                            </p>
                            <div className="flex items-center gap-4 flex-wrap">
                              {m.dueDate && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-muted text-muted-foreground border-transparent"
                                >
                                  Due:{" "}
                                  {new Date(m.dueDate).toLocaleDateString()}
                                </Badge>
                              )}
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5 opacity-80">
                                <RotateCcw className="w-3 h-3" />{" "}
                                {m.revisionsAllowed} Revisions
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="sm:text-right shrink-0">
                          <p className="text-2xl font-black tabular-nums tracking-tighter text-foreground group-hover:scale-105 transition-transform">
                            ${Number(m.amount).toLocaleString()}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Amount
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center border-2 border-dashed rounded-[2rem] bg-secondary/10 space-y-3">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-30">
                        <Milestone className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-black text-lg">
                          Single Phase Project
                        </h5>
                        <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
                          This invitation was sent with a single delivery phase
                          for the full project budget.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="p-8 pt-4 border-t bg-background/80 shrink-0 gap-4">
              <Button
                variant="outline"
                onClick={() => setDetailsModalOpen(false)}
                className="font-black uppercase text-[11px] tracking-widest h-12 rounded-2xl px-10 hover:bg-muted transition-all"
              >
                Close View
              </Button>
              {selectedInvite.status === "PENDING" && (
                <Button
                  variant="destructive"
                  className="font-black uppercase text-[11px] tracking-widest h-12 rounded-2xl px-10 bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200 shadow-sm transition-all"
                  onClick={() => handleCancelInvite(selectedInvite.id)}
                  disabled={cancellingId === selectedInvite.id}
                >
                  {cancellingId === selectedInvite.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Cancel Invitation
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default DirectInvitesPage;
