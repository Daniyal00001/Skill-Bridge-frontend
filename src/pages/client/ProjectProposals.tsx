import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Clock,
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
  Award,
  TrendingUp,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const ProjectProposalsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<string>("all");

  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  // Fetch project + proposals
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
      } catch (err) {
        toast.error("Failed to load proposals");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  // Accept a proposal → auto creates contract, rejects others
  const handleAccept = async (proposalId: string) => {
    setProcessingId(proposalId);
    try {
      await toast.promise(
        api.patch(`/proposals/${proposalId}/status`, { status: "ACCEPTED" }),
        {
          loading: "Drafting contract and securing funds...",
          success: "Hired! Project moved to In Progress. Contract created. 🎉",
          error: "Failed to process. Try again.",
        },
      );
      // Refresh proposals — others will now show REJECTED
      const res = await api.get(`/proposals/project/${projectId}`);
      setProposals(res.data.proposals);
      // Navigate to project details after short delay
      setTimeout(() => navigate(`/client/projects/${projectId}`), 1500);
    } catch (err) {
      // toast.promise handles error
    } finally {
      setProcessingId(null);
    }
  };

  // Shortlist a proposal
  const handleShortlist = async (proposalId: string) => {
    setProcessingId(proposalId);
    try {
      await api.patch(`/proposals/${proposalId}/status`, { status: "SHORTLISTED" });
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

  // Reject a proposal
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
  const shortlistedCount = proposals.filter((p) => p.status === "SHORTLISTED").length;

  const displayedProposals = activeTab === "all"
    ? proposals
    : proposals.filter(p => p.status === activeTab.toUpperCase());

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in max-w-5xl">
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
          <div className="bg-card border border-border/40 rounded-2xl p-8 shadow-sm space-y-6">
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
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>
                      Posted {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Proposals count summary */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <div className="text-center p-4 rounded-2xl bg-muted/30 border border-border/40 min-w-[70px]">
                  <p className="text-2xl font-black text-primary">{proposals.length}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total</p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 min-w-[70px]">
                  <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pending</p>
                </div>
                {shortlistedCount > 0 && (
                  <div className="text-center p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 min-w-[70px]">
                    <p className="text-2xl font-black text-blue-600">{shortlistedCount}</p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Shortlisted</p>
                  </div>
                )}
                {acceptedCount > 0 && (
                  <div className="text-center p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 min-w-[70px]">
                    <p className="text-2xl font-black text-emerald-600">{acceptedCount}</p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Hired</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Already hired banner */}
        {acceptedCount > 0 && (
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <p className="font-black text-emerald-700 dark:text-emerald-400">
                Freelancer hired!
              </p>
              <p className="text-sm text-muted-foreground">
                Contract has been created. Other proposals are now closed.
              </p>
            </div>
            <Button
              size="sm"
              className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              asChild
            >
              <Link to={`/client/projects/${projectId}`}>View Project</Link>
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
            {/* Filter tabs */}
            <div className="flex gap-2">
              {[
                { label: "All", value: "all" },
                { label: "Pending", value: "pending" },
                { label: "Shortlisted ⭐", value: "shortlisted" },
                { label: "Accepted", value: "accepted" },
                { label: "Rejected", value: "rejected" },
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-colors",
                    activeTab === tab.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted"
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
                  onAccept={handleAccept}
                  onShortlist={handleShortlist}
                  onReject={handleReject}
                  isProcessing={processingId === proposal.id}
                  projectBudget={project?.budget}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

// ─── Proposal Card ─────────────────────────────────────────────────────────────
const ProposalCard = ({
  proposal,
  isExpanded,
  onToggleExpand,
  onAccept,
  onShortlist,
  onReject,
  isProcessing,
  projectBudget,
}: {
  proposal: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAccept: (id: string) => void;
  onShortlist: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing: boolean;
  projectBudget?: number;
}) => {
  const freelancer = proposal.freelancer;
  const status = proposal.status?.toUpperCase();

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
  };

  const cfg = statusConfig[status] || statusConfig["PENDING"];

  // Budget comparison
  const budgetDiff =
    projectBudget && proposal.bidAmount
      ? Math.round(((proposal.bidAmount - projectBudget) / projectBudget) * 100)
      : null;

  return (
    <Card
      className={cn(
        "border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 overflow-hidden",
        status === "ACCEPTED" && "border-emerald-500/30 bg-emerald-500/5",
        status === "REJECTED" && "opacity-60",
        status === "PENDING" && "hover:border-primary/30 hover:shadow-lg",
      )}
    >
      <CardContent className="p-6 space-y-6">
        {/* Top Row — Freelancer info + status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-4 ring-border/40">
                <AvatarImage src={freelancer?.profileImage} />
                <AvatarFallback className="text-lg font-black">
                  {freelancer?.name?.[0] || "F"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black">
                  {freelancer?.name || "Freelancer"}
                </h3>
                {status === "ACCEPTED" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {freelancer?.title || "Developer"}
              </p>
              <div className="flex items-center gap-3 mt-1">
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
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn("font-bold text-xs shrink-0", cfg.className)}
          >
            {cfg.label}
          </Badge>
        </div>

        {/* Bid Details */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-muted/30 border border-border/40">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Bid Amount
            </p>
            <p className="text-xl font-black text-foreground">
              ${proposal.bidAmount?.toLocaleString()}
            </p>
            {budgetDiff !== null && (
              <p
                className={cn(
                  "text-[10px] font-bold",
                  budgetDiff > 0 ? "text-red-500" : "text-emerald-500",
                )}
              >
                {budgetDiff > 0 ? `+${budgetDiff}%` : `${budgetDiff}%`} vs your
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

        {/* Cover Letter */}
        {proposal.coverLetter && (
          <div className="space-y-2">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Cover Letter
            </p>
            <div
              className={cn(
                "text-sm text-muted-foreground leading-relaxed transition-all duration-300 prose prose-sm dark:prose-invert max-w-none prose-p:my-0 prose-headings:my-1",
                !isExpanded && "line-clamp-3",
              )}
              dangerouslySetInnerHTML={{ __html: proposal.coverLetter }}
            />
            <button
              onClick={onToggleExpand}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
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

        {/* Attachments */}
        {proposal.attachments && proposal.attachments.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3 h-3" /> Attachments ({proposal.attachments.length})
            </p>
            <div className="flex flex-wrap gap-3">
              {proposal.attachments.map((url: string, i: number) => {
                const isImage = url.match(/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i);
                return (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex flex-col items-center gap-2 p-2 rounded-xl bg-muted/30 border border-border/40 hover:bg-primary/5 hover:border-primary/20 transition-all overflow-hidden"
                  >
                    {isImage ? (
                      <div className="w-20 h-14 rounded-lg overflow-hidden border border-border/20 bg-background">
                        <img 
                          src={url} 
                          alt="attachment" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-14 rounded-lg bg-background flex items-center justify-center border border-border/20">
                        <FileText className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    )}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-primary/90 text-white p-1 rounded-md shadow-sm">
                        <ExternalLink className="w-2 h-2" />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons — for PENDING or SHORTLISTED proposals */}
        {(status === "PENDING" || status === "SHORTLISTED") && (
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border/40">
            <Button
              className="flex-1 h-12 rounded-xl font-black text-base gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
              onClick={() => onAccept(proposal.id)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              {isProcessing
                ? "Processing..."
                : `Hire for $${proposal.bidAmount?.toLocaleString()}`}
            </Button>
            
            {status === "PENDING" && (
              <Button
                variant="outline"
                className="sm:w-auto h-12 rounded-xl font-black border-2 border-primary/40 text-primary hover:bg-primary/5 gap-2"
                onClick={() => onShortlist(proposal.id)}
                disabled={isProcessing}
              >
                <Star className="w-4 h-4" /> Shortlist
              </Button>
            )}

            <Button
              variant="outline"
              className="sm:w-auto h-12 rounded-xl font-black border-2 border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/50 gap-2"
              onClick={() => onReject(proposal.id)}
              disabled={isProcessing}
            >
              <XCircle className="w-4 h-4" /> Reject
            </Button>
            
            <Button
              variant="ghost"
              className="sm:w-auto h-12 rounded-xl font-bold gap-2 text-primary hover:bg-primary/10"
              asChild
            >
              <Link to="/client/messages">
                <MessageSquare className="w-4 h-4" /> Message
              </Link>
            </Button>
          </div>
        )}

        {/* Accepted state CTA */}
        {status === "ACCEPTED" && proposal.contractId && (
          <div className="flex gap-3 pt-2 border-t border-emerald-500/20">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black gap-2"
              asChild
            >
              <Link to={`/client/contracts/${proposal.contractId}`}>
                View Contract <ExternalLink className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="rounded-xl font-bold gap-2 border-emerald-500/30"
              asChild
            >
              <Link to="/client/messages">
                <MessageSquare className="w-4 h-4" /> Message
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectProposalsPage;
