import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
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
  CheckCircle,
  XCircle,
  DollarSign,
  Loader2,
  Inbox,
  Eye,
  FileText,
  RotateCcw,
  Paperclip,
  Milestone,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const InvitationsPage = () => {
  const { invitationId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("month");
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [selectedInvite, setSelectedInvite] = useState<any | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const res = await api.get("/invitations");
      setInvites(res.data.data);
    } catch (err) {
      toast.error("Failed to load your invitations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  // Handle auto-opening via URL param
  useEffect(() => {
    if (invitationId && invites.length > 0) {
      const invite = invites.find((i) => i.id === invitationId);
      if (invite) {
        setSelectedInvite(invite);
        setDetailsModalOpen(true);
      }
    }
  }, [invitationId, invites]);

  const handleAction = async (id: string, action: "accept" | "reject") => {
    try {
      setActionLoading(`${action}-${id}`);
      await api.patch(`/invitations/${id}/${action}`);
      toast.success(`Invitation ${action}ed successfully`);
      if (detailsModalOpen) setDetailsModalOpen(false);
      await fetchInvites();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || `Failed to ${action} invitation`,
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredInvites = useMemo(() => {
    return invites.filter((invite) => {
      const matchesSearch =
        invite.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invite.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
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
    const baseClass =
      "text-[9px] px-1.5 py-0 font-bold border rounded-md uppercase tracking-tight";
    switch (status?.toUpperCase()) {
      case "ACCEPTED":
        return (
          <Badge
            className={cn(
              "bg-emerald-500/15 text-emerald-700 border-emerald-200",
              baseClass,
            )}
          >
            Accepted
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="destructive"
            className={cn(
              "bg-red-500/15 text-red-700 border-red-200",
              baseClass,
            )}
          >
            Rejected
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="secondary"
            className={cn(
              "bg-zinc-500/15 text-zinc-700 border-zinc-200",
              baseClass,
            )}
          >
            Cancelled
          </Badge>
        );
      case "PENDING":
        return (
          <Badge
            variant="secondary"
            className={cn(
              "bg-amber-500/15 text-amber-700 border-amber-200",
              baseClass,
            )}
          >
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className={baseClass} variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const stats = {
    total: invites.length,
    pending: invites.filter((i) => i.status?.toUpperCase() === "PENDING")
      .length,
    accepted: invites.filter((i) => i.status?.toUpperCase() === "ACCEPTED")
      .length,
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Project Invitations
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              Review and respond to direct project invitations from clients.
            </p>
          </div>
          {/* Quick stats */}
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 bg-amber-500/10 text-amber-700 rounded-full font-bold">
              {stats.pending} Pending
            </span>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-700 rounded-full font-bold">
              {stats.accepted} Accepted
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-center bg-card p-3 rounded-xl border shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by project or client..."
              className="pl-9 h-10 rounded-lg bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto ml-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-10 rounded-lg bg-background">
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
              <SelectTrigger className="w-[130px] h-10 rounded-lg bg-background">
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
              Loading invitations...
            </p>
          </div>
        ) : (
          <Card className="rounded-2xl shadow-sm border overflow-hidden">
            <CardHeader className="bg-muted/30 px-6 py-3 border-b">
              <CardTitle className="text-base">Received Invitations</CardTitle>
              <CardDescription className="text-xs">
                Respond to clients who want to work with you directly.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b">
                    <TableHead className="pl-6 h-10 text-[10px] uppercase font-black tracking-wider">
                      Client
                    </TableHead>
                    <TableHead className="text-[10px] uppercase font-black tracking-wider">
                      Project
                    </TableHead>
                    <TableHead className="text-[10px] uppercase font-black tracking-wider">
                      Proposed Budget
                    </TableHead>
                    <TableHead className="text-[10px] uppercase font-black tracking-wider">
                      Received On
                    </TableHead>
                    <TableHead className="text-[10px] uppercase font-black tracking-wider">
                      Status
                    </TableHead>
                    <TableHead className="text-right pr-6 text-[10px] uppercase font-black tracking-wider">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvites.map((invite) => (
                    <TableRow
                      key={invite.id}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="pl-6 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border shadow-sm">
                            <AvatarImage src={invite.clientAvatar} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {invite.clientName?.charAt(0) || "C"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-xs">
                              {invite.clientName}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell
                        className="py-3 font-medium text-xs max-w-[180px]"
                        title={invite.projectTitle}
                      >
                        <Link
                          to={`/freelancer/projects/${invite.projectId}`}
                          className="hover:text-primary transition-colors cursor-pointer block truncate"
                        >
                          {invite.projectTitle}
                        </Link>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <DollarSign className="h-3.5 w-3.5 text-primary bg-primary/10 rounded-full p-0.5" />
                          <span>
                            {invite.budget?.toLocaleString() || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                        {new Date(invite.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-3">
                        {getStatusBadge(invite.status)}
                      </TableCell>
                      <TableCell className="text-right pr-6 py-3">
                        <div className="flex flex-col items-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-black uppercase text-[9px] tracking-tight border-primary/20 text-primary hover:bg-primary/10 h-7 px-3 rounded-lg w-fit"
                            onClick={() => {
                              setSelectedInvite(invite);
                              setDetailsModalOpen(true);
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" /> View Details
                          </Button>

                          {invite.status === "ACCEPTED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-200 font-black uppercase text-[9px] tracking-tight h-7 px-3 rounded-lg w-fit"
                            >
                              <Link to={`/freelancer/contracts/`}>
                                <FileText className="mr-1 h-3 w-3" /> View
                                Contract
                              </Link>
                            </Button>
                          )}
                        </div>
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
                    No Invitations Found
                  </h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    {invites.length === 0
                      ? "You haven't received any direct invitations yet. Optimize your profile to get discovered by clients."
                      : "No invitations match your current filters."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Details Modal */}
      {selectedInvite && (
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="max-w-5xl w-full bg-background border border-border/50 rounded-2xl shadow-2xl overflow-hidden p-0 flex flex-col max-h-[88vh] text-foreground">
            {/* ── Header ── */}
            <DialogHeader className="flex-none px-6 pt-5 pb-4 border-b border-border/40 bg-muted/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <DialogTitle className="text-base font-bold tracking-tight leading-none">
                        Project Terms Details
                      </DialogTitle>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase tracking-widest px-1.5 py-0">
                        Direct Invitation
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[8px] font-bold border-border/40 text-muted-foreground uppercase tracking-wider py-0"
                      >
                        Ref: {selectedInvite.id.slice(-6).toUpperCase()}
                      </Badge>
                    </div>
                    <DialogDescription className="text-xs text-foreground/80 mt-1">
                      From{" "}
                      <span className="font-bold text-foreground">
                        {selectedInvite.clientName}
                      </span>
                      <span className="mx-1.5 opacity-40">·</span>
                      <Link
                        to={`/freelancer/projects/${selectedInvite.projectId}`}
                        onClick={() => setDetailsModalOpen(false)}
                        className="text-primary hover:underline font-bold"
                      >
                        {selectedInvite.projectTitle}
                      </Link>
                      <span className="mx-1.5 opacity-40">·</span>
                      <span className="font-medium">
                        {new Date(selectedInvite.createdAt).toLocaleDateString(
                          undefined,
                          { dateStyle: "medium" },
                        )}
                      </span>
                    </DialogDescription>
                  </div>
                </div>

                {/* Budget — always visible */}
                <div className="shrink-0 text-right pr-8">
                  <p className="text-2xl font-black tabular-nums tracking-tighter leading-none">
                    ${selectedInvite.budget?.toLocaleString()}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                    Total Budget
                  </p>
                </div>
              </div>
            </DialogHeader>

            {/* ── Two-column body ── */}
            <div className="flex-1 min-h-0 grid grid-cols-5 divide-x divide-border/40 overflow-hidden">
              {/* LEFT — context & details (scrollable) */}
              <div className="col-span-3 overflow-y-auto p-5 space-y-3 custom-scrollbar">
                {/* Message */}
                {selectedInvite.message ? (
                  <div className="relative bg-muted/20 border border-border/40 rounded-xl p-4">
                    <span className="absolute -top-3 left-4 text-4xl text-primary/10 font-serif leading-none select-none pointer-events-none">
                      "
                    </span>
                    <p className="text-[11px] leading-relaxed text-foreground/90 font-medium italic pl-1">
                      {selectedInvite.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-border/30">
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={selectedInvite.clientAvatar} />
                        <AvatarFallback className="text-[7px]">
                          {selectedInvite.clientName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[8px] font-black uppercase tracking-widest text-foreground/70">
                        {selectedInvite.clientName}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-xl border border-dashed border-border/80 text-foreground/60 bg-muted/20">
                    <Inbox className="w-4 h-4 shrink-0" />
                    <span className="text-[10px] font-bold">
                      No message provided with invitation
                    </span>
                  </div>
                )}

                {/* Project Overview */}
                <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border/40 bg-muted/20 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Project Overview
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-[11.5px] text-foreground/90 font-medium leading-relaxed whitespace-pre-wrap line-clamp-4">
                      {selectedInvite.projectDescription ||
                        "No detailed description provided for this project."}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/40 border border-border/30 text-[9px] font-bold">
                        <span className="text-muted-foreground">Level:</span>
                        <span>{selectedInvite.projectExperienceLevel}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/40 border border-border/30 text-[9px] font-bold">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{selectedInvite.projectDuration}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/40 border border-border/30 text-[9px] font-bold">
                        <span className="text-muted-foreground">Category:</span>
                        <span>
                          {typeof selectedInvite.projectCategory === "object"
                            ? selectedInvite.projectCategory.name
                            : selectedInvite.projectCategory}
                        </span>
                      </div>
                      {(!selectedInvite.milestones ||
                        selectedInvite.milestones.length === 0) && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/40 border border-border/30 text-[9px] font-bold">
                          <RotateCcw className="w-2.5 h-2.5 text-primary" />
                          <span className="text-muted-foreground">
                            Revisions:
                          </span>
                          <span>{selectedInvite.revisionsAllowed}</span>
                        </div>
                      )}
                    </div>
                    {selectedInvite.projectSkills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {selectedInvite.projectSkills.map(
                          (skill: string, i: number) => (
                            <Badge
                              key={i}
                              variant="secondary"
                              className="text-[9px] px-2 py-0 font-semibold bg-primary/5 text-primary border-primary/15"
                            >
                              {skill}
                            </Badge>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Attachments */}
                {selectedInvite.attachments?.length > 0 && (
                  <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-border/40 bg-muted/20 flex items-center gap-2">
                      <Paperclip className="w-3.5 h-3.5 text-primary" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Attachments ({selectedInvite.attachments.length})
                      </h4>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-2">
                      {selectedInvite.attachments.map(
                        (url: string, idx: number) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2.5 rounded-lg border border-border/40 bg-background hover:bg-primary/5 hover:border-primary/30 transition-all group"
                          >
                            <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                              <FileText className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/50">
                                File {idx + 1}
                              </p>
                              <p className="text-[10px] font-semibold truncate group-hover:text-primary transition-colors">
                                View Document
                              </p>
                            </div>
                          </a>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Important notice */}
                <div className="flex items-start gap-2.5 bg-amber-500/8 border border-amber-500/20 rounded-xl p-3">
                  <Badge className="bg-amber-500 text-white font-black uppercase px-1.5 py-0 text-[8px] border-none shrink-0 mt-0.5">
                    Note
                  </Badge>
                  <p className="text-[10px] font-semibold text-amber-800 dark:text-amber-400 leading-snug">
                    Accepting this invitation will automatically formalize these
                    exact terms into an active contract.
                  </p>
                </div>
              </div>

              {/* RIGHT — milestones (scrollable) */}
              <div className="col-span-2 overflow-y-auto p-5 space-y-3 custom-scrollbar bg-card/60">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Milestone className="w-4 h-4 text-primary" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
                      Milestones
                    </h4>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-bold px-2 py-0">
                    {selectedInvite.milestones?.length || 0} phases
                  </Badge>
                </div>

                {selectedInvite.milestones?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedInvite.milestones.map((m: any, idx: number) => (
                      <div
                        key={idx}
                        className="group p-3.5 bg-card border border-border/50 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-secondary flex items-center justify-center shrink-0 font-black text-[10px] text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all mt-0.5">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-bold text-[11px] leading-tight group-hover:text-primary transition-colors">
                                {m.title}
                              </p>
                              <p className="text-sm font-black tabular-nums tracking-tight text-foreground shrink-0">
                                ${Number(m.amount).toLocaleString()}
                              </p>
                            </div>
                            {m.description && (
                              <p className="text-[10px] text-foreground/80 font-medium mt-0.5 leading-snug line-clamp-2">
                                {m.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {m.dueDate && (
                                <span className="text-[9px] font-bold text-foreground/70 bg-muted/80 px-1.5 py-0.5 rounded-md">
                                  Due {new Date(m.dueDate).toLocaleDateString()}
                                </span>
                              )}
                              <span className="text-[9px] font-bold text-primary/70 flex items-center gap-0.5">
                                <RotateCcw className="w-2 h-2" />
                                {m.revisionsAllowed} rev.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-2 opacity-60">
                    <Milestone className="w-8 h-8 text-foreground/50" />
                    <div>
                      <p className="text-xs font-bold">Single Phase Project</p>
                      <p className="text-[10px] text-foreground/80 font-medium mt-0.5 max-w-[160px] mx-auto leading-snug">
                        Single-delivery project without structured milestones.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Footer ── */}
            <DialogFooter className="flex-none px-5 py-3 border-t border-border/40 bg-muted/10 flex items-center justify-between gap-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/70">
                Direct Invitation · {selectedInvite.status}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDetailsModalOpen(false)}
                  className="h-8 px-4 text-[10px] font-bold uppercase tracking-wider rounded-lg"
                >
                  Close
                </Button>
                {selectedInvite.status === "PENDING" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-4 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-red-500/8 text-red-600 hover:bg-red-500/15 border-red-200/50 shadow-none"
                      onClick={() => handleAction(selectedInvite.id, "reject")}
                      disabled={!!actionLoading}
                    >
                      {actionLoading === `reject-${selectedInvite.id}` ? (
                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1.5" />
                      )}
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 px-5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
                      onClick={() => handleAction(selectedInvite.id, "accept")}
                      disabled={!!actionLoading}
                    >
                      {actionLoading === `accept-${selectedInvite.id}` ? (
                        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3 mr-1.5" />
                      )}
                      Accept Invitation
                    </Button>
                  </>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default InvitationsPage;
