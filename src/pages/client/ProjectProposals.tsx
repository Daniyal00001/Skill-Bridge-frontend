import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Star,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
  Users,
  Briefcase,
  FileText,
  ListChecks,
  AlertCircle,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { getFreelancerLevel } from "@/lib/levelUtils";
import { LevelBadge } from "@/components/common/LevelBadge";

const ProjectProposalsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectRes, proposalsRes] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/proposals/project/${projectId}`),
        ]);
        setProject(projectRes.data.project);
        setProposals(proposalsRes.data.proposals);
      } catch {
        toast.error("Failed to load proposals");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const handleDirectHire = async (proposal: any) => {
    try {
      setIsProcessing(true);
      await api.patch(`/proposals/${proposal.id}/status`, {
        status: "ACCEPTED",
      });
      toast.success("Freelancer hired successfully! 🚀");
      try {
        const res = await api.get(`/contracts/project/${projectId}`);
        navigate(`/client/contracts/${res.data.contract.id}`);
      } catch {
        navigate("/client/dashboard");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to hire freelancer");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShortlist = async (proposalId: string) => {
    setProcessingId(proposalId);
    try {
      await api.patch(`/proposals/${proposalId}/status`, {
        status: "SHORTLISTED",
      });
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, status: "SHORTLISTED" } : p,
        ),
      );
      toast.success("Proposal shortlisted! ⭐");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to shortlist");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (proposalId: string) => {
    setProcessingId(proposalId);
    try {
      await api.patch(`/proposals/${proposalId}/status`, {
        status: "REJECTED",
      });
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, status: "REJECTED" } : p,
        ),
      );
      toast.success("Proposal rejected.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject proposal");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">
            Loading proposals...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const pendingCount = proposals.filter((p) => p.status === "PENDING").length;
  const acceptedCount = proposals.filter((p) => p.status === "ACCEPTED").length;
  const shortlistedCount = proposals.filter(
    (p) => p.status === "SHORTLISTED",
  ).length;

  const displayedProposals =
    activeTab === "all"
      ? proposals
      : proposals.filter((p) => p.status === activeTab.toUpperCase());

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6 space-y-6 animate-fade-in max-w-5xl">
        {/* Back */}
        <Button
          variant="ghost"
          className="pl-0 gap-2 text-muted-foreground hover:text-foreground"
          asChild
        >
          <Link to="/client/projects">
            <ArrowLeft className="h-4 w-4" /> Back to Projects
          </Link>
        </Button>

        {/* Project Header */}
        {project && (
          <div className="bg-card border border-border/40 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-black tracking-tight">
                    {project.title}
                  </h1>
                  <Badge
                    className={cn(
                      "font-bold uppercase tracking-widest text-[10px]",
                      project.status === "OPEN"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/20",
                    )}
                  >
                    {project.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span className="font-bold text-foreground">
                      ${project.budget?.toLocaleString()}
                    </span>
                    <span className="text-xs">{project.budgetType}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>
                      Deadline:{" "}
                      {project.deadline
                        ? new Date(project.deadline).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <div className="text-center p-3 rounded-xl bg-muted/30 border border-border/40 min-w-[70px]">
                  <p className="text-2xl font-black text-primary">
                    {proposals.length}
                  </p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Total
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 min-w-[70px]">
                  <p className="text-2xl font-black text-amber-600">
                    {pendingCount}
                  </p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Pending
                  </p>
                </div>
                {shortlistedCount > 0 && (
                  <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 min-w-[70px]">
                    <p className="text-2xl font-black text-blue-600">
                      {shortlistedCount}
                    </p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Shortlisted
                    </p>
                  </div>
                )}
                {acceptedCount > 0 && (
                  <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 min-w-[70px]">
                    <p className="text-2xl font-black text-emerald-600">
                      {acceptedCount}
                    </p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Hired
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hired banner */}
        {acceptedCount > 0 && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <p className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                Freelancer hired!
              </p>
              <p className="text-xs text-muted-foreground">
                Contract has been created with milestones defined.
              </p>
            </div>
            <Button
              size="sm"
              className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 px-4"
              onClick={async () => {
                try {
                  const res = await api.get(`/contracts/project/${projectId}`);
                  navigate(`/client/contracts/${res.data.contract.id}`);
                } catch {
                  navigate(`/client/projects/${projectId}`);
                }
              }}
            >
              View Contract
            </Button>
          </div>
        )}

        {/* Proposals List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">
              Received Proposals
              <span className="text-muted-foreground font-medium text-base ml-2">
                ({proposals.length})
              </span>
            </h2>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "All", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "Shortlisted ⭐", value: "shortlisted" },
                { label: "Accepted", value: "accepted" },
                { label: "Rejected", value: "rejected" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-colors",
                    activeTab === tab.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {displayedProposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card/20 rounded-3xl border-2 border-dashed border-border/40 gap-4">
              <Users className="w-12 h-12 text-muted-foreground/30" />
              <h3 className="text-xl font-black text-foreground/70">
                No proposals yet
              </h3>
              <p className="text-muted-foreground text-center max-w-xs">
                Your project is live. Freelancers will start sending proposals
                soon.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  isExpanded={!!expandedIds[proposal.id]}
                  onToggleExpand={() => toggleExpand(proposal.id)}
                  onHire={() => handleDirectHire(proposal)}
                  onShortlist={handleShortlist}
                  onReject={handleReject}
                  isProcessing={processingId === proposal.id}
                  projectBudget={project?.budget}
                  projectId={projectId || ""}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

// ─── Proposal Card ────────────────────────────────────────────────────────────
const ProposalCard = ({
  proposal,
  isExpanded,
  onToggleExpand,
  onHire,
  onShortlist,
  onReject,
  isProcessing,
  projectBudget,
  projectId,
}: {
  proposal: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onHire: () => void;
  onShortlist: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing: boolean;
  projectBudget?: number;
  projectId: string;
}) => {
  const navigate = useNavigate();
  const freelancer = proposal.freelancer;
  const status = proposal.status?.toUpperCase();
  const [milestoneExpanded, setMilestoneExpanded] = useState(false);

  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: {
      label: "Pending",
      className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    SHORTLISTED: {
      label: "Shortlisted ⭐",
      className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    ACCEPTED: {
      label: "Hired ✓",
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    REJECTED: {
      label: "Rejected",
      className: "bg-red-500/10 text-red-600 border-red-500/20",
    },
    WITHDRAWN: {
      label: "Withdrawn ✕",
      className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    },
  };

  const cfg = statusConfig[status] || statusConfig["PENDING"];
  const budgetDiff =
    projectBudget && proposal.bidAmount
      ? Math.round(((proposal.bidAmount - projectBudget) / projectBudget) * 100)
      : null;

  const activeMilestones =
    (proposal.negotiationStatus === "FREELANCER_ACCEPTED" ||
      proposal.negotiationStatus === "CLIENT_PROPOSED") &&
    proposal.clientRequestedMilestones
      ? proposal.clientRequestedMilestones
      : proposal.proposalMilestones || [];

  const hasMilestones =
    Array.isArray(activeMilestones) && activeMilestones.length > 0;

  return (
    <Card
      onClick={() =>
        navigate(`/client/projects/${projectId}/proposals/${proposal.id}`)
      }
      className={cn(
        "border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 overflow-hidden cursor-pointer",
        status === "ACCEPTED" && "border-emerald-500/30 bg-emerald-500/5",
        status === "REJECTED" && "opacity-60",
        status === "WITHDRAWN" &&
          "opacity-50 grayscale-0 border-gray-500/10 bg-muted/10 ring-0",
        status === "PENDING" &&
          "hover:border-primary/30 hover:shadow-lg hover:bg-muted/30",
      )}
    >
      <CardContent className="p-4 space-y-4">
        {status === "WITHDRAWN" && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500 mb-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-700 leading-tight">
              Freelancer has withdrawn this proposal. You can no longer hire or
              negotiate for this bid.
            </p>
          </div>
        )}
        {/* Top Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              to={`/client/freelancers/${freelancer?.id}`}
              onClick={(e) => e.stopPropagation()}
              className="relative group/flancer transition-transform hover:scale-105"
            >
              <Avatar className="h-14 w-14 ring-4 ring-border/40 group-hover/flancer:ring-primary/40 transition-all">
                <AvatarImage src={freelancer?.profileImage} />
                <AvatarFallback className="text-lg font-black">
                  {freelancer?.name?.[0] || "F"}
                </AvatarFallback>
              </Avatar>
              {hasMilestones && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                  <ListChecks className="w-3 h-3 text-white" />
                </div>
              )}
            </Link>
            <div>
              <Link 
                to={`/client/freelancers/${freelancer?.id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 group/name"
              >
                <h3 className="text-lg font-black group-hover/name:text-primary transition-colors">
                  {freelancer?.name || "Freelancer"}
                </h3>
                {status === "ACCEPTED" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-all" />
              </Link>
              <p className="text-sm text-muted-foreground">
                {freelancer?.title || "Developer"}
              </p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {freelancer?.rating && (
                  <div className="flex items-center gap-1 text-xs font-black text-amber-500">
                    <Star className="w-3 h-3 fill-amber-500" />{" "}
                    {freelancer.rating.toFixed(1)}
                  </div>
                )}
                {freelancer?.completedProjects > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Briefcase className="w-3 h-3" />{" "}
                    {freelancer.completedProjects} projects
                  </div>
                )}
                <LevelBadge
                  level={getFreelancerLevel({
                    totalEarnings: freelancer?.totalEarnings ?? 0,
                    clientsCount: freelancer?.totalReviews ?? 0,
                    projectsCount: freelancer?.completedProjects ?? 0,
                    averageRating: freelancer?.rating ?? 0,
                  })}
                  size="xs"
                />
                {hasMilestones && (
                  <div className="flex items-center gap-1 text-xs font-bold text-primary">
                    <ListChecks className="w-3 h-3" /> {activeMilestones.length}{" "}
                    milestones
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/40 transition-all shadow-sm"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                to={`/client/projects/${projectId}/proposals/${proposal.id}`}
              >
                Review Proposal <ExternalLink className="w-3 h-3" />
              </Link>
            </Button>
            <Badge
              variant="outline"
              className={cn(
                "font-bold text-xs shrink-0 px-3 py-1",
                cfg.className,
              )}
            >
              {cfg.label}
            </Badge>
          </div>
        </div>

        {/* Negotiation Comparison Banner */}
        {(proposal.negotiationStatus === "CLIENT_PROPOSED" ||
          proposal.negotiationStatus === "CLIENT_PROPOSED_REVISIONS" ||
          proposal.negotiationStatus === "FREELANCER_ACCEPTED") && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <ListChecks className="w-4 h-4" />
              <h4 className="text-sm font-black uppercase tracking-wider">
                Negotiation Summary
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase">
                  Freelancer's Original
                </p>
                {(proposal.proposalMilestones || []).length > 0 ? (
                  <p className="text-[10px] text-muted-foreground">
                    Milestones: {proposal.proposalMilestones?.length || 0}
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground">
                    Revisions:{" "}
                    {proposal.generalRevisionLimit === -1
                      ? "Unlimited"
                      : proposal.generalRevisionLimit || 3}
                  </p>
                )}
              </div>
              <div className="space-y-1 border-l border-border/40 pl-4">
                <p className="text-[10px] font-black text-primary uppercase">
                  {proposal.negotiationStatus === "FREELANCER_ACCEPTED"
                    ? "Agreed Plan"
                    : "Your Request"}
                </p>
                {(proposal.clientRequestedMilestones || []).length > 0 ? (
                  <p className="text-[10px] text-primary">
                    Milestones:{" "}
                    {proposal.clientRequestedMilestones?.length || 0}
                  </p>
                ) : (
                  <p className="text-[10px] text-primary">
                    Revisions:{" "}
                    {proposal.clientRequestedRevisions === -1
                      ? "Unlimited"
                      : proposal.clientRequestedRevisions}
                  </p>
                )}
              </div>
            </div>
            {proposal.negotiationStatus === "CLIENT_PROPOSED" ||
            proposal.negotiationStatus === "CLIENT_PROPOSED_REVISIONS" ? (
              <p className="text-[10px] italic text-muted-foreground pt-1 border-t border-border/20">
                Waiting for the freelancer to review and accept these changes.
              </p>
            ) : (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-1 border-t border-emerald-500/20 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {freelancer?.name || "The freelancer"} has accepted your
                changes! You can now hire them to start the contract.
              </p>
            )}
          </div>
        )}

        {/* Bid Details */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/30 border border-border/40">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Bid Amount
            </p>
            <p className="text-lg font-black text-foreground">
              ${proposal.bidAmount?.toLocaleString()}
            </p>
            {budgetDiff !== null && (
              <p
                className={cn(
                  "text-[10px] font-bold",
                  budgetDiff > 0 ? "text-red-500" : "text-emerald-500",
                )}
              >
                {budgetDiff > 0 ? `+${budgetDiff}%` : `${budgetDiff}%`} vs
                budget
              </p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Delivery
            </p>
            <p className="text-lg font-black">{proposal.deliveryDays} days</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Revisions
            </p>
            <p className="text-lg font-black">Milestone-based</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Submitted
            </p>
            <p className="text-sm font-bold">
              {new Date(proposal.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Milestone Preview */}
        {hasMilestones && (
          <div className="space-y-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMilestoneExpanded((p) => !p);
              }}
              className="flex items-center gap-2 text-sm font-black text-primary hover:underline"
            >
              <ListChecks className="w-4 h-4" />
              Milestone Plan ({activeMilestones.length} milestones)
              {milestoneExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            {milestoneExpanded && (
              <div className="rounded-xl border border-border/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {activeMilestones.map((m: any, i: number) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 text-sm",
                      i % 2 === 0 ? "bg-muted/20" : "bg-background/40",
                    )}
                  >
                    <div>
                      <span className="font-black">
                        {i + 1}. {m.title}
                      </span>
                      <Badge
                        variant="outline"
                        className="ml-2 text-[9px] font-bold py-0 h-4 border-primary/20 bg-primary/5 text-primary"
                      >
                        {m.allowedRevisions === -1 ||
                        m.allowedRevisions === "-1"
                          ? "Unlimited Revisions"
                          : `${m.allowedRevisions || 3} Revisions`}
                      </Badge>
                      {m.description && (
                        <p className="text-xs text-muted-foreground">
                          {m.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <div className="text-right">
                        <span className="font-black text-primary">
                          ${Number(m.amount).toLocaleString()}
                        </span>
                        {m.dueDate && (
                          <p className="text-[10px] text-muted-foreground">
                            Due:{" "}
                            {new Date(m.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cover Letter */}
        {proposal.coverLetter && (
          <div className="space-y-2">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Cover Letter
            </p>
            <div className="bg-muted/30 p-4 rounded-xl border border-border/40 relative group/cover">
              <div
                className={cn(
                  "text-sm text-foreground/80 leading-relaxed transition-all duration-300 prose prose-sm dark:prose-invert max-w-none prose-p:mb-4 last:prose-p:mb-0 whitespace-pre-wrap",
                  !isExpanded && "line-clamp-[5] max-h-[120px] overflow-hidden",
                )}
                dangerouslySetInnerHTML={{ __html: proposal.coverLetter }}
              />
              {!isExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-muted/50 to-transparent pointer-events-none rounded-b-2xl" />
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="text-xs font-black text-primary hover:underline flex items-center gap-1.5 px-1 w-fit mt-1"
            >
              {isExpanded ? (
                <>
                  Show Less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Read Full Letter <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Action Buttons — for PENDING or SHORTLISTED */}
        {(status === "PENDING" || status === "SHORTLISTED") && (
          <div className="space-y-3 pt-2 border-t border-border/40">
            {/* Primary hire row */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                className="flex-1 h-10 rounded-lg font-black text-sm gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onHire();
                }}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {isProcessing
                  ? "Processing..."
                  : proposal.negotiationStatus === "FREELANCER_ACCEPTED"
                    ? "Accept & Hire Freelancer"
                    : "Hire Freelancer"}
              </Button>

              {status === "PENDING" && (
                <Button
                  variant="outline"
                  className="sm:w-auto h-10 rounded-lg font-black text-xs border-2 border-primary/40 text-primary hover:bg-primary/5 gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShortlist(proposal.id);
                  }}
                  disabled={isProcessing}
                >
                  <Star className="w-3.5 h-3.5" /> Shortlist
                </Button>
              )}

              <Button
                variant="outline"
                className="sm:w-auto h-10 rounded-lg font-black text-xs border-2 border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/50 gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onReject(proposal.id);
                }}
                disabled={isProcessing}
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </Button>

              <Button
                variant="ghost"
                className="sm:w-auto h-10 rounded-lg font-bold text-xs gap-2 text-primary hover:bg-primary/10"
                asChild
              >
                <Link
                  to="/client/messages"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Message
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectProposalsPage;
