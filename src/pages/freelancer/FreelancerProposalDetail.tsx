import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  ListChecks,
  Loader2,
  Shield,
  Zap,
  Star,
  RotateCcw,
  Milestone,
  Paperclip,
  Inbox,
  Calendar,
  ExternalLink,
  ShieldCheck,
  BadgeCheck,
  Users,
  DollarSign,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FreelancerProposalDetail = () => {
  const { proposalId } = useParams();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/proposals/${proposalId}`);
        setProposal(res.data.proposal);
        setProject(res.data.proposal.project);
      } catch (err) {
        toast.error("Failed to load proposal details");
        navigate("/freelancer/proposals");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [proposalId, navigate]);

  const handleAcceptChanges = async () => {
    setProcessingAction("ACCEPT");
    try {
      await api.post(`/proposals/${proposalId}/accept-changes`);
      toast.success("Changes accepted! Waiting for client to hire you.");
      const res = await api.get(`/proposals/${proposalId}`);
      setProposal(res.data.proposal);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to accept changes");
    } finally {
      setProcessingAction(null);
    }
  };

  const handleWithdraw = async () => {
    setProcessingAction("WITHDRAW");
    try {
      await api.delete(`/proposals/${proposalId}/withdraw`);
      toast.success("Proposal withdrawn successfully.");
      navigate("/freelancer/proposals");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to withdraw proposal",
      );
    } finally {
      setProcessingAction(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-bold animate-pulse uppercase tracking-widest text-[9px]">
            Loading Proposal...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!proposal || !project) return null;

  const client = project.client;

  const statusConfig: any = {
    PENDING: {
      label: "Pending",
      className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      icon: Clock,
    },
    SHORTLISTED: {
      label: "Shortlisted ⭐",
      className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      icon: Star,
    },
    ACCEPTED: {
      label: "Accepted",
      className: "bg-green-500/10 text-green-600 border-green-500/20",
      icon: CheckCircle2,
    },
    REJECTED: {
      label: "Rejected",
      className: "bg-red-500/10 text-red-500 border-red-500/20",
      icon: XCircle,
    },
    WITHDRAWN: {
      label: "Withdrawn",
      className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      icon: XCircle,
    },
    CANCELLED: {
      label: "Cancelled",
      className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      icon: XCircle,
    },
  };

  const status =
    statusConfig[proposal.status?.toUpperCase()] || statusConfig.PENDING;
  const hasNegotiation =
    proposal.negotiationStatus === "CLIENT_PROPOSED" ||
    proposal.negotiationStatus === "CLIENT_PROPOSED_REVISIONS";
  const isFreelancerAccepted =
    proposal.negotiationStatus === "FREELANCER_ACCEPTED";
  const activeMilestones =
    (isFreelancerAccepted
      ? proposal.clientRequestedMilestones
      : proposal.proposalMilestones) || [];

  return (
    <DashboardLayout>
      {/* ── Page Shell: fixed header + scrollable body ── */}
      <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
        {/* ── Top Bar ── */}
        <div className="flex-none px-6 py-3.5 border-b border-border/40 bg-background flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl bg-muted/50 hover:bg-muted shrink-0"
              onClick={() => navigate("/freelancer/proposals")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black tracking-tight">
                  Proposal Details
                </h1>
                <Badge
                  className={cn(
                    "text-[8px] font-black uppercase tracking-widest px-2 py-0 border",
                    status.className,
                  )}
                >
                  {status.label}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                <span className="opacity-50">Project:</span>{" "}
                <Link
                  to={`/freelancer/projects/${project.id}`}
                  className="text-primary hover:underline font-semibold"
                >
                  {project.title}
                </Link>
                <span className="mx-1.5 opacity-30">·</span>
                <span className="opacity-50">Client:</span>{" "}
                <span className="font-semibold text-foreground/70">
                  {client?.name}
                </span>
              </p>
            </div>
          </div>

          {/* Bid + actions always visible */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xl font-black tabular-nums tracking-tight leading-none">
                ${proposal.bidAmount?.toLocaleString() || proposal.proposedPrice?.toLocaleString()}
              </p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                Your Bid
              </p>
            </div>

            {proposal.status === "ACCEPTED" && proposal.contract?.id && (
              <Button
                size="sm"
                className="h-8 px-4 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                onClick={() =>
                  navigate(`/freelancer/contracts/${proposal.contract.id}`)
                }
              >
                <Shield className="w-3.5 h-3.5" /> View Contract
              </Button>
            )}
            {proposal.status !== "ACCEPTED" &&
              proposal.status !== "REJECTED" &&
              proposal.status !== "WITHDRAWN" &&
              !hasNegotiation && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-4 text-[10px] font-bold uppercase tracking-wider rounded-lg border-destructive/20 text-destructive hover:bg-destructive/5"
                  onClick={handleWithdraw}
                  disabled={!!processingAction}
                >
                  {processingAction === "WITHDRAW" ? (
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  Withdraw
                </Button>
              )}
          </div>
        </div>

        {/* ── Status Banner (conditional, slim) ── */}
        {(isFreelancerAccepted ||
          (!proposal.negotiationStatus &&
            (proposal.status === "PENDING" ||
              proposal.status === "SHORTLISTED"))) && (
          <div
            className={cn(
              "flex-none px-6 py-2.5 flex items-center gap-3 text-[11px] font-semibold border-b",
              isFreelancerAccepted
                ? "bg-emerald-500/8 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                : "bg-primary/5 border-primary/10 text-foreground/70",
            )}
          >
            {isFreelancerAccepted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />{" "}
                Changes accepted — waiting for client to finalize the contract.
              </>
            ) : proposal.status === "SHORTLISTED" ? (
              <>
                <Star className="w-4 h-4 text-blue-500 shrink-0 fill-blue-500" />{" "}
                You've been shortlisted! The client is currently reviewing all
                candidates.
              </>
            ) : (
              <>
                <div className="relative shrink-0">
                  <Clock className="w-4 h-4 text-primary/50" />
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
                {proposal.isViewedByClient
                  ? "The client has viewed your proposal and is reviewing candidates."
                  : "Your proposal has been submitted. You'll be notified when the client views it."}
              </>
            )}
          </div>
        )}

        {/* ── Main Body: two-panel grid ── */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 divide-x divide-border/40 overflow-hidden">
          {/* LEFT — Cover Letter + Attachments */}
          <div className="lg:col-span-3 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {/* Negotiation Panel */}
            {hasNegotiation && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
                <div className="px-4 py-3 border-b border-primary/15 bg-primary/8 flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-primary" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">
                    Client Proposed Changes
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  {/* Original */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-muted rounded-full inline-block" />
                      Your Plan
                    </p>
                    <div className="space-y-1.5">
                      {(proposal.proposalMilestones || []).length === 0 && (
                        <div className="flex justify-between items-center bg-muted/30 p-2.5 rounded-lg border border-border/30 text-[10px]">
                          <span className="font-bold text-muted-foreground">
                            Revisions
                          </span>
                          <span className="font-black">
                            {proposal.generalRevisionLimit === -1
                              ? "Unlimited"
                              : proposal.generalRevisionLimit || 3}
                          </span>
                        </div>
                      )}
                      {(proposal.proposalMilestones || []).map(
                        (m: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex flex-col gap-1.5 p-3 rounded-lg bg-muted/20 border border-border/20"
                          >
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 h-5 rounded-md bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="text-[11px] font-black text-foreground truncate">
                                  {m.title}
                                </span>
                              </div>
                              <span className="text-[11px] font-black text-foreground shrink-0 tabular-nums">
                                ${m.amount.toLocaleString()}
                              </span>
                            </div>
                            {m.description && (
                              <p className="text-[10px] text-muted-foreground font-medium pl-7 leading-tight break-words">
                                {m.description}
                              </p>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                  {/* Client's request */}
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                      <span className="w-1.5 h-3 bg-primary rounded-full inline-block" />
                      Client's Request
                    </p>
                    <div className="space-y-1.5">
                      {(proposal.clientRequestedMilestones || []).length ===
                        0 && (
                        <div className="flex justify-between items-center bg-primary/10 p-2.5 rounded-lg border border-primary/20 text-[10px]">
                          <span className="font-bold text-primary">
                            Revisions
                          </span>
                          <span className="font-black text-primary">
                            {proposal.clientRequestedRevisions === -1
                              ? "Unlimited"
                              : proposal.clientRequestedRevisions}
                          </span>
                        </div>
                      )}
                      {proposal.negotiationStatus ===
                        "CLIENT_PROPOSED_REVISIONS" &&
                        (proposal.clientRequestedMilestones || []).length ===
                          0 && (
                          <p className="text-[9px] text-primary/60 font-semibold text-center py-2">
                            Revision count change only
                          </p>
                        )}
                      {(proposal.clientRequestedMilestones || []).map(
                        (m: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex flex-col gap-1.5 p-3 rounded-lg bg-primary/10 border border-primary/20"
                          >
                            <div className="flex items-center justify-between gap-2 min-w-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="text-[11px] font-black text-primary truncate">
                                  {m.title}
                                </span>
                              </div>
                              <span className="text-[11px] font-black text-primary shrink-0 tabular-nums">
                                ${m.amount.toLocaleString()}
                              </span>
                            </div>
                            {m.description && (
                              <p className="text-[10px] text-primary/80 font-medium pl-7 leading-tight break-words">
                                {m.description}
                              </p>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4 flex gap-2">
                  <Button
                    size="sm"
                    className="h-9 px-5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-primary hover:bg-primary/90 text-white flex-1 gap-1.5"
                    onClick={handleAcceptChanges}
                    disabled={!!processingAction}
                  >
                    {processingAction === "ACCEPT" ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    Accept Changes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-5 text-[10px] font-bold uppercase tracking-wider rounded-lg border-destructive/20 text-destructive hover:bg-destructive/5 flex-1 gap-1.5"
                    onClick={handleWithdraw}
                    disabled={!!processingAction}
                  >
                    <XCircle className="w-3 h-3" /> Reject & Withdraw
                  </Button>
                </div>
              </div>
            )}

            {/* Cover Letter */}
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border/40 bg-muted/20 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Cover Letter
                </h4>
              </div>
              <div className="p-4">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none break-words prose-p:leading-relaxed prose-p:text-foreground prose-p:text-[13px] prose-headings:font-black"
                  dangerouslySetInnerHTML={{ __html: proposal.coverLetter }}
                />
              </div>
            </div>

            {/* Attachments */}
            {proposal.attachments?.length > 0 && (
              <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border/40 bg-muted/20 flex items-center gap-2">
                  <Paperclip className="w-3.5 h-3.5 text-primary" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Supporting Documents ({proposal.attachments.length})
                  </h4>
                </div>
                <div className="p-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {proposal.attachments.map((url: string, i: number) => {
                    const isImage = url.match(
                      /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i,
                    );
                    return (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center gap-1.5 p-2 rounded-lg bg-muted/30 border border-border/30 hover:bg-primary/5 hover:border-primary/20 transition-all"
                      >
                        {isImage ? (
                          <div className="w-full aspect-video rounded-md overflow-hidden border border-border/20">
                            <img
                              src={url}
                              alt="attachment"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="w-full aspect-video rounded-md bg-muted/50 flex items-center justify-center border border-border/20 group-hover:bg-primary/5 transition-colors">
                            <FileText className="w-6 h-6 text-muted-foreground/40 group-hover:text-primary/40" />
                          </div>
                        )}
                        <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground/60">
                          Doc {i + 1}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Bid summary + Milestones */}
          <div className="lg:col-span-2 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-muted/5">
            {/* Bid Summary */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                      Your Bid
                    </p>
                    <p className="text-3xl font-black tabular-nums tracking-tighter leading-none mt-0.5">
                      ${(proposal.bidAmount || proposal.proposedPrice)?.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">
                      Project Budget
                    </p>
                    <p className="text-sm font-bold text-muted-foreground/60 mt-0.5">
                      ${project.budget?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-background/60 p-2.5 rounded-lg border border-border/30 text-center">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">
                      Timeline
                    </p>
                    <p className="text-sm font-black mt-0.5">
                      {proposal.deliveryDays || proposal.deliveryTime} Days
                    </p>
                  </div>
                  <div className="bg-background/60 p-2.5 rounded-lg border border-border/30 text-center">
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">
                      Tokens
                    </p>
                    <p className="text-sm font-black mt-0.5 flex items-center justify-center gap-1">
                      <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {proposal.tokenCost}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Client Info Box */}
            {client && (
              <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border/40 bg-muted/20 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
                    <Star className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    About the Client
                  </h4>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-md">
                      <AvatarImage src={client.profileImage} referrerPolicy="no-referrer" />
                      <AvatarFallback className="bg-primary/20 text-primary font-black">
                        {client.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-black leading-tight text-foreground text-sm">
                        {client.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span className="text-xs font-bold">
                          {client.averageRating?.toFixed(1) || "5.0"}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold">
                          ({client.totalReviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-1 pb-1">
                    {client.isIdVerified ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">Identity Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 border border-border/50 rounded-lg">
                        <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Identity Unverified</span>
                      </div>
                    )}
                    
                    {client.isPaymentVerified ? (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Payment Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 border border-border/50 rounded-lg">
                        <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Payment Unverified</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-4 border-t border-border/50">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Member Since</p>
                      <p className="font-bold text-sm leading-none flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary"/> {client.createdAt ? new Date(client.createdAt).getFullYear() : 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Total Hired</p>
                      <p className="font-bold text-sm leading-none flex items-center gap-1.5"><Users className="w-3 h-3 text-primary"/> {client.totalHires || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Total Released</p>
                      <p className="font-bold text-sm leading-none flex items-center gap-1.5"><DollarSign className="w-3 h-3 text-emerald-500"/> ${client.totalSpent?.toLocaleString() || 0}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Hire Rate</p>
                      <p className="font-bold text-sm leading-none flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500"/> {client.hireRate ? `${Math.round(client.hireRate <= 1 ? client.hireRate * 100 : client.hireRate)}%` : 'N/A'}</p>
                    </div>
                    {client.location && (
                      <div className="space-y-1 col-span-2 text-center flex flex-col items-center pt-2 border-t border-border/30 mt-2">
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Location</p>
                        <p className="font-bold text-sm leading-none flex items-center gap-1.5 justify-center mt-1">
                          <MapPin className="w-3 h-3 text-primary" />
                          {client.location}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Schedule / Milestones */}
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border/40 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Milestone className="w-3.5 h-3.5 text-primary" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Payment Schedule
                  </h4>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-bold px-2 py-0">
                  {isFreelancerAccepted ? "Negotiated" : "Your Plan"}
                </Badge>
              </div>

              {activeMilestones.length > 0 ? (
                <div className="p-3 space-y-2">
                  {activeMilestones.map((m: any, i: number) => (
                    <div
                      key={i}
                      className="group p-3 rounded-lg border border-border/40 bg-background hover:border-primary/20 hover:bg-primary/5 transition-all"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center shrink-0 font-black text-[10px] text-secondary-foreground group-hover:bg-primary group-hover:text-white transition-all mt-0.5">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[11px] font-bold leading-tight group-hover:text-primary transition-colors">
                              {m.title}
                            </p>
                            <p className="text-sm font-black tabular-nums tracking-tight shrink-0">
                              ${m.amount.toLocaleString()}
                            </p>
                          </div>
                          {m.description && (
                            <p className="text-[10px] text-muted-foreground/70 mt-0.5 line-clamp-2 leading-snug">
                              {m.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-bold text-primary/60 flex items-center gap-0.5">
                              <RotateCcw className="w-2 h-2" />
                              {m.allowedRevisions === -1
                                ? "Unlimited"
                                : m.allowedRevisions}{" "}
                              rev.
                            </span>
                            {m.dueDate && (
                              <span className="text-[9px] font-bold text-muted-foreground/60 flex items-center gap-0.5">
                                <Calendar className="w-2.5 h-2.5" />
                                Due {new Date(m.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 flex flex-col items-center justify-center gap-2 opacity-40 text-center">
                  <Inbox className="w-7 h-7 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-bold">Single Phase Delivery</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      No milestone breakdown defined.
                    </p>
                  </div>
                  {proposal.generalRevisionLimit !== undefined && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-foreground/60">
                      <RotateCcw className="w-3 h-3" />
                      {proposal.generalRevisionLimit === -1
                        ? "Unlimited"
                        : proposal.generalRevisionLimit}{" "}
                      Revisions
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pro tip */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-500/15 bg-amber-500/5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed">
                <span className="text-amber-600 dark:text-amber-400 font-black">
                  Pro Tip:
                </span>{" "}
                Clear milestones and realistic deadlines build client trust and
                increase your hire rate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerProposalDetail;
