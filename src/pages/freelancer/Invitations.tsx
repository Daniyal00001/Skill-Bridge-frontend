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
          <DialogContent className="max-w-4xl border-none bg-card/95 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[96vh] flex flex-col p-0 border border-white/10 text-foreground">
            <DialogHeader className="p-5 pb-3 border-b shrink-0 bg-secondary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-5 opacity-10 pointer-events-none">
                <FileText className="w-16 h-16 rotate-12" />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-primary/20 text-primary border-primary/30 font-black uppercase tracking-widest text-[8px] px-1.5 py-0">
                  Direct Invitation
                </Badge>
                <Badge
                  variant="outline"
                  className="font-bold border-muted-foreground/20 text-muted-foreground uppercase tracking-tighter text-[8px] py-0"
                >
                  Ref: {selectedInvite.id.slice(-6).toUpperCase()}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-black tracking-tight mb-0">
                Project Terms Details
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-muted-foreground/80 leading-tight">
                Formal proposal from{" "}
                <span className="text-foreground">
                  {selectedInvite.clientName}
                </span>{" "}
                for "{selectedInvite.projectTitle}".
              </DialogDescription>
            </DialogHeader>

            <div className="p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              {/* Top Row: Important Stats & Message */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Attachments Section - High Prominence */}
                  {selectedInvite.attachments &&
                    selectedInvite.attachments.length > 0 && (
                      <div className="bg-primary/[0.02] border border-primary/10 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1.5">
                            <Paperclip className="w-3.5 h-3.5" /> Attached
                            Project Files
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedInvite.attachments.map(
                            (url: string, idx: number) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 p-3 rounded-xl border bg-background hover:bg-primary/5 hover:border-primary/30 transition-all group shadow-sm"
                              >
                                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                  <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">
                                    Asset {idx + 1}
                                  </p>
                                  <p className="text-[10px] font-bold truncate">
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
                    <div className="bg-card border rounded-2xl p-4 shadow-sm border-muted/40 italic text-muted-foreground relative">
                      <div className="absolute top-3 left-3 text-3xl text-primary/10 font-serif leading-none italic pointer-events-none">
                        “
                      </div>
                      <p className="text-xs font-medium leading-relaxed pl-4 pr-1">
                        {selectedInvite.message}
                      </p>
                      <div className="mt-2 pt-2 border-t flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={selectedInvite.clientAvatar} />
                          <AvatarFallback>
                            {selectedInvite.clientName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[8px] uppercase font-black tracking-widest text-muted-foreground">
                          {selectedInvite.clientName}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-muted/10 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 opacity-50 text-center py-10">
                      <Inbox className="w-8 h-8 text-muted-foreground/30" />
                      <p className="text-xs font-bold text-muted-foreground tracking-tight">
                        No message provided with invitation
                      </p>
                    </div>
                  )}

                  {/* Project Overview */}
                  <div className="bg-card border rounded-2xl p-5 shadow-sm space-y-4 mt-6">
                    <h4 className="text-sm font-black tracking-tight flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Project Overview
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedInvite.projectDescription || "No detailed description provided for this project."}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/30 border text-[10px] font-bold">
                        <span className="text-muted-foreground uppercase tracking-widest text-[8px]">Experience:</span>
                        <span>{selectedInvite.projectExperienceLevel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/30 border text-[10px] font-bold">
                        <span className="text-muted-foreground uppercase tracking-widest text-[8px]">Duration:</span>
                        <span>{selectedInvite.projectDuration}</span>
                      </div>
                    </div>
                    {selectedInvite.projectSkills && selectedInvite.projectSkills.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Required Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedInvite.projectSkills.map((skill: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-[9px] px-2 py-0 font-bold bg-primary/5 text-primary border-primary/20">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>{" "}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent space-y-3 shadow-sm">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">
                        Total Budget
                      </p>
                      <p className="text-3xl font-black text-foreground tabular-nums tracking-tighter">
                        ${selectedInvite.budget?.toLocaleString()}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-primary/10 grid grid-cols-1 gap-2">
                      {(!selectedInvite.milestones ||
                        selectedInvite.milestones.length === 0) && (
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                            General Revisions
                          </p>
                          <p className="text-sm font-bold flex items-center gap-1.5">
                            <RotateCcw className="w-3.5 h-3.5 text-primary" />{" "}
                            {selectedInvite.revisionsAllowed} Available
                          </p>
                        </div>
                      )}
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                          Proposal Date
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-80">
                          {new Date(
                            selectedInvite.createdAt,
                          ).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <h4 className="text-base font-black tracking-tight flex items-center gap-2 italic">
                    <Milestone className="w-5 h-5 text-primary" />
                    Milestone Breakdown
                  </h4>
                  <Badge className="bg-primary px-2 py-0.5 font-black shadow-md shadow-primary/20 text-[9px] uppercase tracking-wider">
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
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0 font-black text-xs text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-sm mb-0 group-hover:text-primary transition-colors">
                              {m.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground/70 font-medium mb-1.5 leading-tight">
                              {m.description || "No description provided."}
                            </p>
                            <div className="flex items-center gap-3 flex-wrap">
                              {m.dueDate && (
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] font-bold px-1.5 py-0 rounded-md bg-muted text-muted-foreground border-transparent"
                                >
                                  {new Date(m.dueDate).toLocaleDateString()}
                                </Badge>
                              )}
                              <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 opacity-80">
                                <RotateCcw className="w-2.5 h-2.5" />{" "}
                                {m.revisionsAllowed}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="sm:text-right shrink-0">
                          <p className="text-xl font-black tabular-nums tracking-tighter text-foreground group-hover:scale-105 transition-transform">
                            ${Number(m.amount).toLocaleString()}
                          </p>
                          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
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
                          This invitation is for a single-delivery project
                          without structured milestones.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl text-[11px] font-semibold text-amber-800 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500 text-white font-black uppercase px-1.5 py-0 text-[8px] border-none">
                    Important
                  </Badge>
                </div>
                <p className="leading-snug">
                  Accepting this invitation will automatically formalize these
                  exact terms into an active contract.
                </p>
              </div>

              {/* Centered Project Category at Bottom */}
              <div className="flex justify-center pt-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 border border-border/40 shadow-sm">
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Category:
                  </span>
                  <span className="text-[9px] font-bold">
                    {typeof selectedInvite.projectCategory === "object"
                      ? selectedInvite.projectCategory.name
                      : selectedInvite.projectCategory}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 pt-2 border-t bg-background/50 shrink-0 gap-3">
              <Button
                variant="ghost"
                onClick={() => setDetailsModalOpen(false)}
                className="font-black uppercase text-[10px] tracking-widest h-10 rounded-xl px-6 hover:bg-muted transition-all"
              >
                Close View
              </Button>
              {selectedInvite.status === "PENDING" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="font-black uppercase text-[10px] tracking-widest h-10 rounded-xl px-5 bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200 shadow-sm transition-all"
                    onClick={() => handleAction(selectedInvite.id, "reject")}
                    disabled={!!actionLoading}
                  >
                    {actionLoading === `reject-${selectedInvite.id}` ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Decline
                  </Button>
                  <Button
                    className="font-black uppercase text-[10px] tracking-widest h-10 rounded-xl px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 active:scale-95 transition-all"
                    onClick={() => handleAction(selectedInvite.id, "accept")}
                    disabled={!!actionLoading}
                  >
                    {actionLoading === `accept-${selectedInvite.id}` ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Accept
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default InvitationsPage;
