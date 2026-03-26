import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Briefcase,
  ExternalLink,
  ListChecks,
  Loader2,
  ChevronRight,
  Shield,
  Zap,
  Star,
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-black animate-pulse uppercase tracking-[0.2em] text-[10px]">
            Loading Proposal Details...
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
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      icon: Clock,
    },
    SHORTLISTED: {
      label: "Shortlisted ⭐",
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: Star,
    },
    ACCEPTED: {
      label: "Accepted",
      className: "bg-green-500/10 text-green-500 border-green-500/20",
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

  return (
    <DashboardLayout>
      <div className="container max-w-6xl mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="h-12 w-12 rounded-2xl bg-muted/50 hover:bg-muted"
              onClick={() => navigate("/freelancer/proposals")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Proposal Details
              </h1>
              <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
                Project:{" "}
                <Link
                  to={`/freelancer/projects/${project.id}`}
                  className="text-primary hover:underline font-bold"
                >
                  {project.title}
                </Link>
              </p>
            </div>
          </div>
          <Badge
            className={cn(
              "font-black px-4 py-1.5 rounded-xl uppercase tracking-widest text-[10px]",
              status.className,
            )}
          >
            {status.label}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Negotiation Status Banners */}
            {proposal.negotiationStatus === "FREELANCER_ACCEPTED" && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-8 flex gap-6 animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl shadow-emerald-500/5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 text-white shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    Changes Accepted! 🎉
                  </h3>
                  <p className="text-sm text-foreground/80 font-bold leading-relaxed">
                    You've accepted the client's proposed changes. We're waiting
                    for the client to finalize the contract and officially hire
                    you.
                  </p>
                </div>
              </div>
            )}

            {!proposal.negotiationStatus &&
              (proposal.status === "PENDING" ||
                proposal.status === "SHORTLISTED") && (
                <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 flex gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0">
                    <div className="relative">
                      <Clock className="w-7 h-7 text-primary/60" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-foreground/80">
                      {proposal.status === "SHORTLISTED"
                        ? "You are Shortlisted! ⭐"
                        : "Awaiting Client Review"}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                      {proposal.isViewedByClient
                        ? "The client has viewed your proposal. They are currently reviewing all candidates."
                        : "Your proposal has been sent. We'll notify you as soon as the client views it."}
                    </p>
                  </div>
                </div>
              )}

            {(proposal.negotiationStatus === "CLIENT_PROPOSED" ||
              proposal.negotiationStatus === "CLIENT_PROPOSED_REVISIONS") && (
              <Card className="border-primary/20 bg-primary/5 rounded-3xl overflow-hidden border-2">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <ListChecks className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-primary">
                        Client Proposed Changes
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        The client has reviewed your proposal and suggested some
                        adjustments to the milestone plan or revision limits.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    {/* Your Original Plan */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-1.5 h-4 bg-muted rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Your Original Plan
                        </h4>
                      </div>
                      <Card className="border-border/40 bg-background/40 rounded-3xl overflow-hidden shadow-sm">
                        <CardContent className="p-5 space-y-4">
                          {(proposal.proposalMilestones || []).length === 0 && (
                            <div className="flex justify-between items-center bg-muted/20 p-3 rounded-xl border border-border/20">
                              <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                                Revisions
                              </span>
                              <span className="text-sm font-black text-foreground">
                                {proposal.generalRevisionLimit === -1
                                  ? "Unlimited"
                                  : proposal.generalRevisionLimit || 3}
                              </span>
                            </div>
                          )}
                          <div className="space-y-3">
                            {!proposal.proposalMilestones ||
                            proposal.proposalMilestones.length === 0 ? (
                              <p className="text-xs italic text-muted-foreground text-center py-4">
                                No milestones defined
                              </p>
                            ) : (
                              proposal.proposalMilestones.map(
                                (m: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex flex-col p-4 rounded-2xl bg-background/50 border border-border/20 group gap-2"
                                  >
                                    <div className="flex justify-between items-center w-full">
                                      <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground">
                                          {idx + 1}
                                        </span>
                                        <span className="text-xs font-bold break-words max-w-[150px]">
                                          {m.title}
                                        </span>
                                      </div>
                                      <div className="flex flex-col gap-1 items-end shrink-0">
                                        <span className="text-sm font-black text-primary">
                                          ${m.amount.toLocaleString()}
                                        </span>
                                        <span className="text-[9px] font-bold text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded-md border border-border/10">
                                          {m.allowedRevisions === -1
                                            ? "Unlimited"
                                            : m.allowedRevisions}{" "}
                                          Rev.
                                        </span>
                                      </div>
                                    </div>
                                    {m.description && (
                                      <p className="text-[10px] text-muted-foreground font-medium leading-relaxed pl-9 border-t border-border/10 pt-2">
                                        {m.description}
                                      </p>
                                    )}
                                  </div>
                                ),
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Client's Proposed Changes */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-1.5 h-4 bg-primary rounded-full" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">
                          Client's Request
                        </h4>
                      </div>
                      <Card className="border-primary/20 bg-primary/5 rounded-3xl overflow-hidden shadow-sm border">
                        <CardContent className="p-5 space-y-4">
                          {(proposal.clientRequestedMilestones || []).length ===
                            0 && (
                            <div className="flex justify-between items-center bg-primary/10 p-3 rounded-xl border border-primary/20">
                              <span className="text-xs font-bold text-primary uppercase tracking-tight">
                                Proposed Revisions
                              </span>
                              <span className="text-sm font-black text-primary">
                                {proposal.negotiationStatus ===
                                "CLIENT_PROPOSED_REVISIONS"
                                  ? proposal.clientRequestedRevisions === -1
                                    ? "Unlimited"
                                    : proposal.clientRequestedRevisions
                                  : proposal.generalRevisionLimit || 3}
                              </span>
                            </div>
                          )}
                          <div className="space-y-3">
                            {proposal.negotiationStatus ===
                            "CLIENT_PROPOSED_REVISIONS" ? (
                              <div className="text-center py-8 space-y-2">
                                <Shield className="w-8 h-8 text-primary/40 mx-auto" />
                                <p className="text-xs font-bold text-primary">
                                  Client requested additional revisions only.
                                </p>
                              </div>
                            ) : !proposal.clientRequestedMilestones ||
                              proposal.clientRequestedMilestones.length ===
                                0 ? (
                              <p className="text-xs italic text-primary/60 text-center py-4">
                                No milestone changes proposed
                              </p>
                            ) : (
                              proposal.clientRequestedMilestones.map(
                                (m: any, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex flex-col p-4 rounded-2xl bg-primary/20 border border-primary/20 gap-2"
                                  >
                                    <div className="flex justify-between items-center w-full">
                                      <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-lg bg-primary/30 flex items-center justify-center text-[10px] font-black text-primary">
                                          {idx + 1}
                                        </span>
                                        <span className="text-xs font-black text-primary break-words max-w-[150px]">
                                          {m.title}
                                        </span>
                                      </div>
                                      <div className="flex flex-col gap-1 items-end shrink-0">
                                        <span className="text-sm font-black text-primary">
                                          ${m.amount.toLocaleString()}
                                        </span>
                                        <span className="text-[9px] font-black text-primary/60 bg-primary/10 px-1.5 py-0.5 rounded-md border border-primary/10">
                                          {m.allowedRevisions === -1
                                            ? "Unlimited"
                                            : m.allowedRevisions}{" "}
                                          Rev.
                                        </span>
                                      </div>
                                    </div>
                                    {m.description && (
                                      <p className="text-[10px] text-primary/70 font-bold leading-relaxed pl-9 border-t border-primary/10 pt-2">
                                        {m.description}
                                      </p>
                                    )}
                                  </div>
                                ),
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-4">
                    <Button
                      className="px-8 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black gap-2 shadow-xl shadow-primary/20 flex-1 md:flex-none"
                      onClick={handleAcceptChanges}
                      disabled={!!processingAction}
                    >
                      {processingAction === "ACCEPT" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                      Accept Proposed Changes
                    </Button>
                    <Button
                      variant="outline"
                      className="px-8 h-14 rounded-2xl border-2 border-destructive/20 text-destructive hover:bg-destructive/5 font-black gap-2 flex-1 md:flex-none"
                      onClick={handleWithdraw}
                      disabled={!!processingAction}
                    >
                      <XCircle className="w-5 h-5" /> Reject & Withdraw
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Proposal Content */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 ml-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                <h3 className="text-xl font-black tracking-tight">
                  Your Proposal
                </h3>
              </div>
              <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-3xl overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  {/* Cover Letter */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Cover Letter
                      </h4>
                    </div>
                    <div
                      className="prose prose-lg dark:prose-invert max-w-none break-words overflow-hidden prose-p:leading-relaxed prose-p:text-foreground/90 prose-p:mb-6 last:prose-p:mb-0 prose-headings:font-black prose-strong:font-black"
                      dangerouslySetInnerHTML={{ __html: proposal.coverLetter }}
                    />
                  </div>

                  {(proposal.proposalMilestones?.length > 0 ||
                    proposal.clientRequestedMilestones?.length > 0) && (
                    <div className="space-y-6 pt-10 border-t border-border/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ListChecks className="w-4 h-4 text-primary" />
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            Payment Schedule
                          </h4>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-black border-primary/20 bg-primary/5 text-primary rounded-lg"
                        >
                          {proposal.negotiationStatus === "FREELANCER_ACCEPTED"
                            ? "Negotiated Strategy"
                            : "Your Strategy"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {(proposal.negotiationStatus === "FREELANCER_ACCEPTED"
                          ? proposal.clientRequestedMilestones
                          : proposal.proposalMilestones || []
                        ).map((m: any, i: number) => (
                          <div
                            key={i}
                            className="p-6 rounded-3xl bg-muted/20 border border-border/40 flex flex-col gap-6 group hover:bg-muted/30 transition-all"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm shrink-0 border border-primary/20">
                                  {i + 1}
                                </div>
                                <div className="space-y-1 min-w-0">
                                  <p className="font-black text-lg break-words">
                                    {m.title}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] font-black uppercase tracking-tighter border-primary/20 bg-primary/5 text-primary rounded-md"
                                    >
                                      {m.allowedRevisions === -1
                                        ? "Unlimited"
                                        : m.allowedRevisions}{" "}
                                      Revisions
                                    </Badge>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">
                                      Milestone {i + 1}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-1">
                                  Release Amount
                                </p>
                                <p className="text-3xl font-black text-primary">
                                  ${m.amount.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {m.description && (
                              <div className="space-y-3">
                                <Separator className="bg-border/10" />
                                <div className="flex gap-4">
                                  <div className="w-1 h-full bg-primary/20 rounded-full shrink-0" />
                                  <p className="text-sm text-muted-foreground font-medium leading-relaxed italic opacity-80">
                                    {m.description}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {proposal.attachments?.length > 0 && (
                    <div className="space-y-6 pt-10 border-t border-border/40">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          Supporting Documents
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                              className="group relative flex flex-col items-center gap-2 p-3 rounded-2xl bg-muted/40 border border-border/40 hover:bg-primary/5 hover:border-primary/20 transition-all overflow-hidden"
                            >
                              {isImage ? (
                                <div className="w-full aspect-video rounded-xl overflow-hidden border border-border/20">
                                  <img
                                    src={url}
                                    alt="attachment"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  />
                                </div>
                              ) : (
                                <div className="w-full aspect-video rounded-xl bg-muted/50 flex items-center justify-center border border-border/20 group-hover:scale-105 transition-transform duration-500">
                                  <FileText className="w-8 h-8 text-muted-foreground/40" />
                                </div>
                              )}
                              <span className="text-[10px] font-black uppercase text-muted-foreground text-center line-clamp-1">
                                Doc {i + 1}
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-6 lg:sticky lg:top-8 self-start">
            {/* Bid Summary Card */}
            <Card className="border-primary/20 bg-primary/5 rounded-3xl overflow-hidden shadow-2xl shadow-primary/5 border-2">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-1 text-center">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Your Bid Amount
                  </p>
                  <p className="text-4xl font-black">
                    ${proposal.bidAmount?.toLocaleString()}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground mt-2 italic opacity-60">
                    Total project budget: ${project.budget?.toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/40 p-5 rounded-3xl border border-border/20 text-center space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">
                      Timeline
                    </p>
                    <p className="text-base font-black">
                      {proposal.deliveryDays} Days
                    </p>
                  </div>
                  <div className="bg-background/40 p-5 rounded-3xl border border-border/20 text-center space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">
                      Tokens used
                    </p>
                    <p className="text-base font-black flex items-center justify-center gap-1.5">
                      <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                      {proposal.tokenCost}
                    </p>
                  </div>
                </div>

                <Separator className="bg-primary/10" />

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                      <AvatarImage src={client?.profileImage} />
                      <AvatarFallback className="font-black">
                        {client?.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                        Sent To Client
                      </p>
                      <p className="text-sm font-black">{client?.name}</p>
                    </div>
                  </div>
                </div>

                {proposal.status === "ACCEPTED" && proposal.contract?.id && (
                  <Button
                    className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                    onClick={() =>
                      navigate(`/freelancer/contracts/${proposal.contract.id}`)
                    }
                  >
                    <Shield className="w-5 h-5" /> View Contract
                  </Button>
                )}

                {proposal.status !== "ACCEPTED" &&
                  proposal.status !== "REJECTED" &&
                  proposal.status !== "WITHDRAWN" && (
                    <Button
                      variant="outline"
                      className="w-full h-14 rounded-2xl border-2 border-destructive/20 text-destructive hover:bg-destructive/10 font-black gap-2 transition-all active:scale-95"
                      onClick={handleWithdraw}
                      disabled={!!processingAction}
                    >
                      {processingAction === "WITHDRAW" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                      Withdraw My Proposal
                    </Button>
                  )}
              </CardContent>
            </Card>

            {/* Help/Tips */}
            <Card className="border-border/40 bg-card/60 backdrop-blur-xl rounded-[2rem] p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black uppercase tracking-tight text-amber-600 dark:text-amber-400">
                    Pro Tip
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">
                    Clients value clear milestones and realistic deadlines.
                    Detailed descriptions help build trust and increase your
                    chances of getting hired!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerProposalDetail;
