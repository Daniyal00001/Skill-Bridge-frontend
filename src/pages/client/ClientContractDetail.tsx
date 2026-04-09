import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  Lock,
  Package,
  RotateCcw,
  Send,
  Shield,
  Upload,
  X,
  AlertCircle,
  AlertTriangle,
  Calendar,
  ShieldCheck,
  ListChecks,
  ChevronDown,
  ChevronUp,
  Eye,
  TrendingUp,
  Activity,
  Star,
  Zap,
  Play,
  ShieldAlert,
  Gavel,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { createDispute, type DisputeType } from "@/services/dispute.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ReviewModal } from "@/components/modals/ReviewModal";
import { StripeFundModal } from "@/components/modals/StripeFundModal";

type MilestoneStatus =
  | "PENDING"
  | "FUNDED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "APPROVED"
  | "REVISION_REQUESTED"
  | "REJECTED";

interface HistoryEvent {
  type: string;
  timestamp: string;
  content: string;
  attachments?: string[];
  actorName?: string;
  actorRole?: "CLIENT" | "FREELANCER";
}

interface Milestone {
  id: string;
  order: number;
  title: string;
  description?: string;
  amount: number;
  dueDate?: string;
  status: MilestoneStatus;
  deliverables?: string;
  revisionNote?: string;
  submittedAt?: string;
  approvedAt?: string;
  allowedRevisions: number;
  revisionsUsed: number;
  attachments: string[];
  history?: HistoryEvent[];
}

interface Contract {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  freelancerName: string;
  freelancerImage?: string;
  freelancerId: string;
  agreedPrice: number;
  status: string;
  startDate: string;
  endDate?: string;
  milestones: Milestone[];
  totalMilestoneAmount: number;
  releasedAmount: number;
  escrowAmount: number;
  pendingAmount: number;
}

const statusConfig: Record<
  MilestoneStatus,
  { label: string; color: string; icon: React.ReactNode; bg: string }
> = {
  PENDING: {
    label: "Pending Funding",
    color: "bg-slate-500/10 text-slate-600 border-slate-300",
    bg: "bg-slate-50 dark:bg-slate-900/20",
    icon: <Lock className="w-3.5 h-3.5" />,
  },
  FUNDED: {
    label: "Funded — Ready",
    color: "bg-blue-500/10 text-blue-600 border-blue-300",
    bg: "bg-blue-50 dark:bg-blue-900/10",
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-amber-500/10 text-amber-600 border-amber-300",
    bg: "bg-amber-50 dark:bg-amber-900/10",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  SUBMITTED: {
    label: "Under Review",
    color: "bg-purple-500/10 text-purple-600 border-purple-300",
    bg: "bg-purple-50 dark:bg-purple-900/10",
    icon: <Package className="w-3.5 h-3.5" />,
  },
  APPROVED: {
    label: "Approved ✓",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-900/10",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  REVISION_REQUESTED: {
    label: "Revision Requested",
    color: "bg-orange-500/10 text-orange-600 border-orange-300",
    bg: "bg-orange-50 dark:bg-orange-900/10",
    icon: <RotateCcw className="w-3.5 h-3.5" />,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-500/10 text-red-600 border-red-300",
    bg: "bg-red-50 dark:bg-red-900/10",
    icon: <X className="w-3.5 h-3.5" />,
  },
};

const eventConfig: any = {
  FUNDED: {
    label: "Milestone Funded",
    color: "bg-blue-500",
    icon: <Shield className="w-3 h-3 text-white" />,
    border: "border-l-blue-400",
  },
  STARTED: {
    label: "Work Started",
    color: "bg-amber-500",
    icon: <Play className="w-3 h-3 text-white" />,
    border: "border-l-amber-400",
  },
  SUBMISSION: {
    label: "Deliverables Submitted",
    color: "bg-purple-500",
    icon: <Package className="w-3 h-3 text-white" />,
    border: "border-l-purple-400",
  },
  REVISION_REQUEST: {
    label: "Revision Requested",
    color: "bg-orange-500",
    icon: <RotateCcw className="w-3 h-3 text-white" />,
    border: "border-l-orange-400",
  },
  APPROVAL: {
    label: "Milestone Approved",
    color: "bg-emerald-500",
    icon: <CheckCircle2 className="w-3 h-3 text-white" />,
    border: "border-l-emerald-400",
  },
  DISPUTE_RESOLUTION: {
    label: "Dispute Resolved",
    color: "bg-indigo-600",
    icon: <Gavel className="w-3 h-3 text-white" />,
    border: "border-l-indigo-400",
  },
};

export default function ClientContractDetail() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(
    null,
  );
  const [revisionModal, setRevisionModal] = useState<{
    open: boolean;
    milestoneId: string;
    note: string;
  }>({ open: false, milestoneId: "", note: "" });

  // ── Review state ──
  const [reviewModal, setReviewModal] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<{
    reviewStatus: "PENDING" | "WAITING" | "REVEALED";
    myReview: any;
    theirReview: any;
  } | null>(null);

  // ── Stripe Fund Modal state ──
  const [stripeFundModal, setStripeFundModal] = useState<{
    open: boolean;
    milestone: { id: string; title: string; amount: number; order: number } | null;
  }>({ open: false, milestone: null });

  // ── Dispute state ──
  const [disputeModal, setDisputeModal] = useState(false);
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    disputeType: "PAYMENT" as DisputeType,
    reason: "",
    details: "",
  });
  const [existingDispute, setExistingDispute] = useState<any>(null);

  const fetchContract = useCallback(async () => {
    try {
      const res = await api.get(`/contracts/${contractId}`);
      const contractData = res.data.contract;
      setContract(contractData);

      // Fetch dispute status for this project
      if (contractData?.projectId) {
        try {
          const disputeRes = await api.get(
            `/disputes/my/${contractData.projectId}`,
          );
          if (disputeRes.data.success) {
            setExistingDispute(disputeRes.data.dispute);
          }
        } catch (err) {
          // No dispute exists or not found, ignore
        }
      }
    } catch {
      toast.error("Failed to load contract");
      navigate("/client/projects");
    } finally {
      setLoading(false);
    }
  }, [contractId, navigate]);

  const fetchReviewStatus = useCallback(async () => {
    try {
      const res = await api.get(`/reviews/contract/${contractId}/status`);
      setReviewStatus(res.data);
    } catch {
      // Non-critical
    }
  }, [contractId]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);
  useEffect(() => {
    if (contract?.status === "COMPLETED") fetchReviewStatus();
  }, [contract?.status, fetchReviewStatus]);

  const handleFund = (milestone: { id: string; title: string; amount: number; order: number }) => {
    setStripeFundModal({ open: true, milestone });
  };

  const handleApprove = async (milestoneId: string) => {
    setProcessingId(milestoneId);
    try {
      await api.post(
        `/contracts/${contractId}/milestones/${milestoneId}/approve`,
      );
      toast.success("Milestone approved! Payment released. ✅");
      await fetchContract();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevision = async () => {
    if (!revisionModal.note.trim()) {
      toast.error("Please provide a revision note");
      return;
    }
    setProcessingId(revisionModal.milestoneId);
    try {
      await api.post(
        `/contracts/${contractId}/milestones/${revisionModal.milestoneId}/revision`,
        { note: revisionModal.note },
      );
      toast.success("Revision requested. Freelancer will be notified.");
      setRevisionModal({ open: false, milestoneId: "", note: "" });
      await fetchContract();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to request revision");
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenDispute = async () => {
    if (!disputeForm.reason.trim()) {
      toast.error("Please describe the issue.");
      return;
    }
    setDisputeSubmitting(true);
    try {
      const res = await createDispute({
        projectId: contract!.projectId,
        disputeType: disputeForm.disputeType,
        reason: disputeForm.reason,
        details: disputeForm.details,
      });
      if (res.success) {
        toast.success("Dispute submitted. Admin will review shortly.");
        setDisputeModal(false);
        setExistingDispute(res.dispute);
        setDisputeForm({ disputeType: "PAYMENT", reason: "", details: "" });
        await fetchContract();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit dispute");
    } finally {
      setDisputeSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">
            Loading contract...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!contract) return null;

  const approvedCount = contract.milestones.filter(
    (m) => m.status === "APPROVED",
  ).length;
  const submittedCount = contract.milestones.filter(
    (m) => m.status === "SUBMITTED",
  ).length;
  const progress =
    contract.milestones.length > 0
      ? Math.round((approvedCount / contract.milestones.length) * 100)
      : 0;
  const pendingToFund = contract.milestones.filter(
    (m) => m.status === "PENDING",
  ).length;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 py-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            className="w-10 h-10 p-0 rounded-xl mt-1 shrink-0"
            onClick={() => navigate("/client/contracts")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                Contract Dashboard
              </p>
              <span className="text-muted-foreground/30 text-xs">•</span>
              <p className="text-xs text-muted-foreground">
                ID: {contract.id.slice(0, 8)}...
              </p>
              {contract.endDate && (
                <>
                  <span className="text-muted-foreground/30 text-xs">•</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5" />
                    Deadline: {new Date(contract.endDate).toLocaleDateString()}
                  </div>
                </>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1 leading-tight break-words overflow-hidden">
               {contract.projectTitle}
             </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(contract.status === "ACTIVE" || existingDispute) && (
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 rounded-xl font-bold text-xs gap-1.5",
                  existingDispute
                    ? "border-rose-200 text-rose-600 bg-rose-50"
                    : "border-rose-200 text-rose-600 hover:bg-rose-50",
                )}
                onClick={() => !existingDispute && setDisputeModal(true)}
                disabled={!!existingDispute}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {existingDispute ? "Case Active" : "Open Dispute"}
              </Button>
            )}
            <Badge
              className={cn(
                "font-bold px-4 py-1.5 text-sm border",
                contract.status === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-400/30"
                  : contract.status === "OFFER_PENDING"
                    ? "bg-amber-500/10 text-amber-700 border-amber-400/30"
                    : contract.status === "COMPLETED"
                      ? "bg-blue-500/10 text-blue-700 border-blue-400/30"
                      : "bg-muted text-muted-foreground border-border",
              )}
            >
              {contract.status === "OFFER_PENDING"
                ? "Awaiting Freelancer Approval"
                : contract.status}
            </Badge>
          </div>
        </div>

        {/* Active Dispute Resolution Center */}
        {existingDispute && (
          <Card className="rounded-2xl border-rose-200 bg-rose-50/30 overflow-hidden animate-in slide-in-from-top-4">
            <div className="bg-rose-500/10 px-5 py-3 border-b border-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-black text-rose-900 uppercase tracking-wider">
                  Conflict Resolution Center — Case #
                  {existingDispute.id.slice(-6).toUpperCase()}
                </h3>
              </div>
              <Badge className="bg-rose-600 text-white border-none font-black px-3 h-6">
                {existingDispute.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <CardContent className="p-0">
              <div className="p-5 grid md:grid-cols-2 gap-6 border-b border-rose-100">
                {/* Case Details */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none">
                      Status & Filing
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-8 w-8 border border-rose-200">
                        <AvatarImage
                          src={
                            existingDispute.filedBy === "FREELANCER"
                              ? existingDispute.freelancer?.profileImage
                              : existingDispute.client?.profileImage
                          }
                        />
                        <AvatarFallback className="bg-rose-100 text-rose-600 font-bold text-xs">
                          {existingDispute.filedBy === "FREELANCER"
                            ? "FL"
                            : "CL"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-rose-900">
                          {existingDispute.filedBy === "FREELANCER"
                            ? "Freelancer"
                            : "You"}{" "}
                          filed this case
                        </p>
                        <p className="text-[10px] text-rose-500 font-medium">
                          Opened on{" "}
                          {new Date(
                            existingDispute.openedAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none">
                      Dispute Reason
                    </p>
                    <p className="text-sm font-bold text-rose-800 mt-1 break-words">
                      {existingDispute.reason}
                    </p>
                    <div className="p-3 bg-white/60 border border-rose-100 rounded-xl mt-2 italic shadow-sm">
                      <p className="text-xs text-rose-700 leading-relaxed font-medium break-words">
                        "{existingDispute.details}"
                      </p>
                    </div>
                  </div>

                  {/* Official Resolution Section */}
                  {existingDispute.status === "RESOLVED" && (
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-200/50 space-y-3 mt-4">
                      <div className="flex items-center justify-between">
                         <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">
                            Official Resolution
                         </p>
                         <Badge className="bg-emerald-500 text-white border-none font-black text-[9px] h-5 px-2">
                           {existingDispute.resolution.replace(/_/g, " ")}
                         </Badge>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest">Decision Note</p>
                        <p className="text-xs font-bold leading-relaxed text-emerald-900/80 bg-white/40 p-3 rounded-xl border border-emerald-100/50 italic break-words">
                          "{existingDispute.resolutionNote || "No explanatory note provided."}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Tracker */}
                <div className="bg-white/40 p-5 rounded-2xl border border-rose-100/50 space-y-4">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-4">
                    Resolution Progress
                  </p>

                  <div className="space-y-4 relative">
                    {/* Stepper line */}
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-rose-200" />

                    {[
                      {
                        stage: "Case Opened",
                        desc: "Conflict submitted for review",
                        isActive: true,
                        isDone: true,
                      },
                      {
                        stage: "Mediator Assigned",
                        desc: "A platform admin is reviewing the logs",
                        isActive: existingDispute.status !== "OPEN",
                        isDone: !["OPEN"].includes(existingDispute.status),
                      },
                      {
                        stage: "Evidence Check",
                        desc: "Project deliverables are being audited",
                        isActive: [
                          "UNDER_REVIEW",
                          "RESOLVED",
                          "CLOSED",
                        ].includes(existingDispute.status),
                        isDone: ["RESOLVED", "CLOSED"].includes(
                          existingDispute.status,
                        ),
                      },
                      {
                        stage: "Final Decision",
                        desc: "Review resolution and next steps",
                        isActive: ["RESOLVED", "CLOSED"].includes(
                          existingDispute.status,
                        ),
                        isDone:
                          existingDispute.status === "RESOLVED" ||
                          existingDispute.status === "CLOSED",
                      },
                    ].map((step, idx) => (
                      <div key={idx} className="flex gap-4 relative z-10">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors",
                            step.isDone
                              ? "bg-rose-500 border-rose-500 text-white"
                              : step.isActive
                                ? "bg-rose-100 border-rose-400 text-rose-600 animate-pulse"
                                : "bg-white border-rose-200 text-rose-200",
                          )}
                        >
                          {step.isDone ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                          )}
                        </div>
                        <div>
                          <p
                            className={cn(
                              "text-xs font-black",
                              step.isActive ? "text-rose-900" : "text-rose-300",
                            )}
                          >
                            {step.stage}
                          </p>
                          <p
                            className={cn(
                              "text-[10px] font-medium",
                              step.isActive ? "text-rose-600" : "text-rose-200",
                            )}
                          >
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-4">
                {/* <div className="flex items-center gap-2">
                  <div className="p-1 px-2 bg-rose-100 rounded text-[10px] font-black text-rose-600 uppercase">
                    Next Step
                  </div>
                  <p className="text-xs font-bold text-rose-800">
                    <p className="text-sm text-rose-800 dark:text-rose-300 font-bold leading-relaxed">
                      Mediator is reviewing the case. Check back soon.
                    </p>
                  </p>
                </div> */}
                <div className="flex gap-2">
                  {/* <Button variant="outline" size="sm" className="rounded-xl border-rose-200 text-rose-600 font-bold h-8 bg-white" asChild>
                      <Link to="/client/messages">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Discuss in Workspace
                      </Link>
                    </Button> */}
                  {/* <Button variant="outline" size="sm" className="rounded-xl border-rose-200 text-rose-600 font-bold h-8 bg-white" asChild>
                      <Link to="/settings/support">
                        <Shield className="w-3 h-3 mr-1" />
                        Help Center
                      </Link>
                    </Button> */}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Offer Pending Alert */}
        {contract.status === "OFFER_PENDING" && (
          <Card className="rounded-2xl border-amber-400/40 bg-amber-500/5 border-2">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-amber-800 dark:text-amber-400">
                  Awaiting Freelancer Approval
                </h3>
                <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                  You've modified the milestones. The freelancer needs to review
                  and approve them before work can begin.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submissions Alert */}
        {submittedCount > 0 && (
          <Card className="rounded-2xl border-orange-400/40 bg-orange-500/5 border-2">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0 animate-pulse">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-orange-800 dark:text-orange-400">
                  {submittedCount} Milestone{submittedCount > 1 ? "s" : ""}{" "}
                  Awaiting Your Review
                </h3>
                <p className="text-sm text-orange-700/80 dark:text-orange-400/80 mt-0.5">
                  Please review within 3 days — payment will be automatically
                  released otherwise.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contract Overview — 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Freelancer Info */}
          <Card className="rounded-2xl border-border/40 bg-card/60">
            <CardContent className="p-4">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">
                Working With
              </p>
              <Link
                to={`/client/freelancers/${contract.freelancerId}`}
                className="flex items-center gap-4 group/flancer hover:opacity-80 transition-all"
              >
                <Avatar className="h-14 w-14 ring-4 ring-border/30 group-hover/flancer:ring-primary/40 transition-all">
                  <AvatarImage src={contract.freelancerImage} />
                  <AvatarFallback className="text-xl font-black">
                    {contract.freelancerName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black group-hover/flancer:text-primary transition-colors">
                      {contract.freelancerName}
                    </p>
                    <Eye className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/flancer:opacity-100 transition-all" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Contract started{" "}
                    {new Date(contract.startDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  {contract.endDate && (
                    <p className="text-sm text-emerald-600 font-bold">
                      Completed{" "}
                      {new Date(contract.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card className="rounded-2xl border-border/40 bg-card/60">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Overall Progress
                </p>
                <span className="text-sm font-black text-primary">
                  {approvedCount}/{contract.milestones.length} milestones
                </span>
              </div>
              <Progress value={progress} className="h-3 rounded-full" />
              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    label: "Done",
                    value: approvedCount,
                    color: "text-emerald-600",
                  },
                  {
                    label: "Submitted",
                    value: submittedCount,
                    color: "text-purple-600",
                  },
                  {
                    label: "In Progress",
                    value: contract.milestones.filter((m) =>
                      ["IN_PROGRESS", "FUNDED"].includes(m.status),
                    ).length,
                    color: "text-amber-600",
                  },
                  {
                    label: "Pending",
                    value: pendingToFund,
                    color: "text-slate-500",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="text-center p-2 rounded-xl bg-muted/30"
                  >
                    <p className={cn("text-base font-black", s.color)}>
                      {s.value}
                    </p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Escrow Finance Dashboard */}
        <Card className="rounded-2xl border-border/40 bg-gradient-to-br from-card/80 to-card/40 overflow-hidden">
          <CardHeader className="pb-2 px-5 pt-4">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> Escrow &amp;
              Payment Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                {
                  label: "Total Contract Value",
                  value: contract.totalMilestoneAmount,
                  icon: <DollarSign className="w-4 h-4" />,
                  color: "text-foreground",
                  bg: "bg-muted/40 border-border/20",
                  desc: "Agreed upon value",
                },
                {
                  label: "Released to Freelancer",
                  value: contract.releasedAmount,
                  icon: <CheckCircle2 className="w-4 h-4" />,
                  color: "text-emerald-600",
                  bg: "bg-emerald-500/5 border-emerald-500/10",
                  desc: "Paid out",
                },
                {
                  label: "Held in Escrow",
                  value: contract.escrowAmount,
                  icon: <Shield className="w-4 h-4" />,
                  color: "text-blue-600",
                  bg: "bg-blue-500/5 border-blue-500/10",
                  desc: "Locked & protected",
                },
                {
                  label: "Yet to Fund",
                  value: contract.pendingAmount,
                  icon: <Lock className="w-4 h-4" />,
                  color: "text-slate-500",
                  bg: "bg-slate-500/5 border-slate-500/10",
                  desc: "Needs funding",
                },
              ].map((p, i) => (
                <div
                  key={i}
                  className={cn("p-3 rounded-xl border space-y-0.5", p.bg)}
                >
                  <div className="flex items-center gap-2">
                    <span className={p.color}>{p.icon}</span>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      {p.label}
                    </p>
                  </div>
                  <p className={cn("text-2xl font-black", p.color)}>
                    ${p.value.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
            {/* Payment Bar */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Payment Breakdown
              </p>
              <div className="h-3 rounded-full bg-muted/60 overflow-hidden flex">
                {contract.totalMilestoneAmount > 0 && (
                  <>
                    <div
                      className="h-full bg-emerald-500 transition-all duration-700"
                      style={{
                        width: `${(contract.releasedAmount / contract.totalMilestoneAmount) * 100}%`,
                      }}
                    />
                    <div
                      className="h-full bg-blue-500 transition-all duration-700"
                      style={{
                        width: `${(contract.escrowAmount / contract.totalMilestoneAmount) * 100}%`,
                      }}
                    />
                  </>
                )}
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Released
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  In Escrow
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/30 inline-block" />
                  Pending
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones Section */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-black flex items-center gap-2">
                  <ListChecks className="w-5 h-5" /> Milestones
                  <span className="text-sm font-medium text-muted-foreground">
                    ({contract.milestones.length})
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground font-medium">
                  Complete project roadmap & escrow status
                </p>
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur-sm rounded-xl border border-primary/20 shadow-sm animate-bounce-subtle">
              <Eye className="w-3.5 h-3.5 text-primary" />
              <p className="text-[11px] font-black uppercase tracking-wider text-primary">
                Click any milestone to view full history
              </p>
            </div>
          </div>

          {contract.milestones.length === 0 ? (
            <Card className="rounded-2xl border-2 border-dashed border-border/40 p-12 text-center">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <p className="font-black text-lg">No milestones defined yet</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {contract.milestones.map((milestone, index) => {
                const cfg = statusConfig[milestone.status];
                const isProcessing = processingId === milestone.id;
                const isExpanded = expandedMilestoneId === milestone.id;
                const history = Array.isArray(milestone.history)
                  ? milestone.history
                  : [];
                const revisionHistory = history.filter(
                  (e) => e.type === "REVISION_REQUEST",
                );
                const submissionHistory = history.filter(
                  (e) => e.type === "SUBMISSION",
                );

                return (
                  <Card
                    key={milestone.id}
                    className={cn(
                      "rounded-2xl border-border/40 bg-card/60 transition-all duration-300 group/mcard",
                      "hover:border-primary/40 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer",
                      milestone.status === "APPROVED" && "opacity-80",
                      milestone.status === "SUBMITTED" &&
                        "border-purple-400/50 shadow-purple-500/10 shadow-lg",
                      milestone.status === "REVISION_REQUESTED" &&
                        "border-orange-400/40",
                      isExpanded &&
                        "ring-2 ring-primary/20 bg-card shadow-lg translate-y-0 border-primary/30",
                    )}
                    onClick={() =>
                      setExpandedMilestoneId(isExpanded ? null : milestone.id)
                    }
                  >
                    {/* Milestone Header — always visible */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          {/* Order indicator */}
                          <div
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 mt-0.5",
                              milestone.status === "APPROVED"
                                ? "bg-emerald-500/20 text-emerald-600"
                                : milestone.status === "SUBMITTED"
                                  ? "bg-purple-500/20 text-purple-600"
                                  : milestone.status === "REVISION_REQUESTED"
                                    ? "bg-orange-500/20 text-orange-600"
                                    : "bg-muted/60 text-muted-foreground",
                            )}
                          >
                            {milestone.status === "APPROVED" ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-black text-base break-words">
                                {milestone.title}
                              </h3>
                              {submissionHistory.length > 0 && (
                                <span className="text-[10px] font-black bg-purple-500/10 text-purple-600 border border-purple-400/20 px-2 py-0.5 rounded-full">
                                  {submissionHistory.length} submission
                                  {submissionHistory.length > 1 ? "s" : ""}
                                </span>
                              )}
                              {revisionHistory.length > 0 && (
                                <span className="text-[10px] font-black bg-orange-500/10 text-orange-600 border border-orange-400/20 px-2 py-0.5 rounded-full">
                                  {revisionHistory.length} revision
                                  {revisionHistory.length > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                            {milestone.description && (
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2 break-words">
                                {milestone.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              {milestone.dueDate && (
                                <span className="flex items-center gap-1 text-[9px] font-black text-muted-foreground uppercase tracking-tighter opacity-60">
                                  <Calendar className="w-2.5 h-2.5" />
                                  Due{" "}
                                  {new Date(
                                    milestone.dueDate,
                                  ).toLocaleDateString()}
                                </span>
                              )}
                              <span
                                className={cn(
                                  "flex items-center gap-1 text-xs font-bold",
                                  milestone.allowedRevisions !== -1 &&
                                    milestone.revisionsUsed >=
                                      milestone.allowedRevisions
                                    ? "text-red-600"
                                    : "text-muted-foreground",
                                )}
                              >
                                <RotateCcw className="w-3 h-3" />
                                Revisions: {milestone.revisionsUsed}/
                                {milestone.allowedRevisions === -1
                                  ? "∞"
                                  : milestone.allowedRevisions}
                                {milestone.allowedRevisions !== -1 &&
                                  milestone.revisionsUsed >=
                                    milestone.allowedRevisions &&
                                  " (Limit reached)"}
                              </span>
                              <div className="flex items-center gap-1 text-primary/60 group-hover/mcard:text-primary transition-colors ml-1">
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                  {isExpanded ? "Close" : "Details"}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 group-hover/mcard:translate-y-0.5 transition-transform" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-2">
                          <p className="text-xl font-black">
                            ${milestone.amount.toLocaleString()}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold flex items-center gap-1",
                              cfg.color,
                            )}
                          >
                            {cfg.icon} {cfg.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Current Deliverables Preview (SUBMITTED or APPROVED state) */}
                      {(milestone.status === "SUBMITTED" ||
                        milestone.status === "APPROVED") && (
                        <div
                          className={cn(
                            "mt-3 p-3 rounded-xl border space-y-1.5",
                            milestone.status === "SUBMITTED"
                              ? "bg-purple-500/10 border-purple-400/25"
                              : "bg-emerald-500/5 border-emerald-400/20",
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <p
                              className={cn(
                                "text-xs font-black uppercase tracking-widest flex items-center gap-1.5",
                                milestone.status === "SUBMITTED"
                                  ? "text-purple-700"
                                  : "text-emerald-700",
                              )}
                            >
                              <Package className="w-3.5 h-3.5" />
                              {milestone.status === "SUBMITTED"
                                ? "Latest Submission — Awaiting Review"
                                : "Final Deliverables"}
                            </p>
                            {milestone.status === "SUBMITTED" && (
                              <Badge
                                variant="outline"
                                className="bg-red-500/10 text-red-600 border-red-400/30 text-[10px] font-black gap-1 animate-pulse"
                              >
                                <AlertCircle className="w-3 h-3" /> Review /
                                Auto-release in 3 days
                              </Badge>
                            )}
                          </div>
                          {milestone.deliverables && (
                            <p className="text-sm leading-relaxed break-words">
                              {milestone.deliverables}
                            </p>
                          )}
                          {milestone.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {milestone.attachments.map((url, i) => (
                                <a
                                  key={i}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-lg border border-border/50 text-xs font-bold hover:bg-primary/5 transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5 text-primary" />{" "}
                                  Attachment {i + 1}
                                </a>
                              ))}
                            </div>
                          )}
                          {milestone.submittedAt && (
                            <p className="text-[10px] text-muted-foreground">
                              {milestone.status === "SUBMITTED"
                                ? "Submitted"
                                : "Final version submitted"}{" "}
                              {new Date(milestone.submittedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Current Revision Note (REVISION_REQUESTED state) */}
                      {milestone.status === "REVISION_REQUESTED" &&
                        milestone.revisionNote && (
                          <div className="mt-3 p-3 rounded-xl bg-orange-500/10 border border-orange-400/25">
                            <p className="text-xs font-black text-orange-700 mb-1 flex items-center gap-1">
                              <RotateCcw className="w-3.5 h-3.5" /> Your Latest
                              Revision Request
                            </p>
                            <p className="text-sm break-words">{milestone.revisionNote}</p>
                          </div>
                        )}

                      {/* Action Buttons */}
                      <div
                        className="flex flex-wrap gap-2.5 mt-3 pt-3 border-t border-border/30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {milestone.status === "PENDING" && (
                          <div className="space-y-1">
                            <Button
                              className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white rounded-xl font-black"
                              onClick={() =>
                                handleFund({
                                  id: milestone.id,
                                  title: milestone.title,
                                  amount: milestone.amount,
                                  order: milestone.order,
                                })
                              }
                              disabled={contract.status === "OFFER_PENDING"}
                            >
                              <Shield className="w-4 h-4" />
                              Fund ${milestone.amount.toLocaleString()} via
                              Stripe
                            </Button>
                            {contract.status === "OFFER_PENDING" && (
                              <p className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Awaiting
                                freelancer approval first.
                              </p>
                            )}
                          </div>
                        )}
                        {milestone.status === "SUBMITTED" && (
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black"
                              onClick={() => handleApprove(milestone.id)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                              Approve &amp; Release Payment
                            </Button>
                            <Button
                              variant="outline"
                              className={cn(
                                "gap-2 rounded-xl font-black",
                                milestone.allowedRevisions !== -1 &&
                                  milestone.revisionsUsed >=
                                    milestone.allowedRevisions
                                  ? "border-border/40 text-muted-foreground cursor-not-allowed"
                                  : "border-orange-400/40 text-orange-600 hover:bg-orange-500/10",
                              )}
                              onClick={() =>
                                setRevisionModal({
                                  open: true,
                                  milestoneId: milestone.id,
                                  note: "",
                                })
                              }
                              disabled={
                                isProcessing ||
                                (milestone.allowedRevisions !== -1 &&
                                  milestone.revisionsUsed >=
                                    milestone.allowedRevisions)
                              }
                            >
                              <RotateCcw className="w-4 h-4" />
                              {milestone.allowedRevisions !== -1 &&
                              milestone.revisionsUsed >=
                                milestone.allowedRevisions
                                ? "Revision Limit Reached"
                                : `Request Revision (${milestone.revisionsUsed}/${milestone.allowedRevisions === -1 ? "∞" : milestone.allowedRevisions} used)`}
                            </Button>
                          </div>
                        )}
                        {milestone.status === "APPROVED" && (
                          <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                            <CheckCircle2 className="w-4 h-4" />$
                            {milestone.amount.toLocaleString()} Payment Released
                            {milestone.approvedAt && (
                              <span className="text-muted-foreground font-medium">
                                —{" "}
                                {new Date(
                                  milestone.approvedAt,
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                        {["FUNDED", "IN_PROGRESS"].includes(
                          milestone.status,
                        ) && (
                          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                            <Clock className="w-4 h-4" /> Waiting for freelancer
                            to submit work…
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded: Full History Timeline */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-border/30 pt-4 animate-in slide-in-from-top-2 duration-300 space-y-3">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" />
                          <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                            Complete Activity History
                          </h4>
                          {history.length > 0 && (
                            <span className="text-[10px] font-black bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full">
                              {history.length} event
                              {history.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        {history.length === 0 ? (
                          <div className="flex items-center gap-3 py-6 text-muted-foreground text-sm italic">
                            <div className="w-0.5 h-10 bg-border/40 rounded-full ml-2.5" />
                            <div className="w-3 h-3 rounded-full bg-muted border-2 border-background ml-[-2px]" />
                            No activity logged yet for this milestone.
                          </div>
                        ) : (
                          <div className="relative space-y-0">
                            {/* vertical line */}
                            <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-border/50 rounded-full" />
                            {history.map((event, idx) => {
                              const eCfg = eventConfig[event.type] || {
                                label: event.type,
                                color: "bg-slate-500",
                                icon: <Activity className="w-3 h-3 text-white" />,
                                border: "border-l-slate-400",
                              };
                              const isLatest = idx === history.length - 1;
                              return (
                                <div
                                  key={idx}
                                  className="relative flex gap-4 pb-5 last:pb-0"
                                >
                                  {/* Timeline dot */}
                                  <div
                                    className={cn(
                                      "w-9 h-9 shrink-0 rounded-full flex items-center justify-center z-10 border-4 border-background shadow-sm transition-transform hover:scale-110",
                                      eCfg.color,
                                    )}
                                  >
                                    {eCfg.icon}
                                  </div>
                                  {/* Content card */}
                                  <div
                                    className={cn(
                                      "flex-1 min-w-0 rounded-xl border-l-4 bg-muted/20 border border-border/20 overflow-hidden",
                                      eCfg.border,
                                    )}
                                  >
                                    <div className="p-3 flex items-center justify-between gap-2 border-b border-border/10">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-black text-foreground">
                                          {eCfg.label}
                                        </p>
                                        {event.actorName && (
                                          <Badge
                                            variant="secondary"
                                            className="text-[9px] px-1.5 py-0 h-4 bg-muted text-muted-foreground font-black uppercase tracking-tight"
                                          >
                                            {event.actorName} ({event.actorRole}
                                            )
                                          </Badge>
                                        )}
                                        {isLatest && (
                                          <span className="text-[9px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                                            Latest
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] font-bold text-muted-foreground bg-muted/40 px-2 py-1 rounded-full shrink-0">
                                        {new Date(
                                          event.timestamp,
                                        ).toLocaleString("en-US", {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>
                                    <div className="p-3 space-y-2">
                                      <p className="text-sm leading-relaxed">
                                        {event.content}
                                      </p>
                                      {event.attachments &&
                                        event.attachments.length > 0 && (
                                          <div className="flex flex-wrap gap-1.5 pt-1">
                                            {event.attachments.map((url, i) => (
                                              <a
                                                key={i}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-border/40 text-[11px] font-bold text-primary hover:bg-primary/5 transition-colors"
                                              >
                                                <FileText className="w-3 h-3" />{" "}
                                                File {i + 1}
                                              </a>
                                            ))}
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Submission count summary */}
                        {submissionHistory.length > 0 && (
                          <div className="mt-3 p-3 rounded-xl bg-muted/30 border border-border/20 flex items-center gap-3">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              <span className="font-black text-foreground">
                                {submissionHistory.length}
                              </span>{" "}
                              total submission
                              {submissionHistory.length > 1 ? "s" : ""} made •{" "}
                              <span className="font-black text-foreground">
                                {revisionHistory.length}
                              </span>{" "}
                              revision{revisionHistory.length !== 1 ? "s" : ""}{" "}
                              requested
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed + Review Section */}
        {contract.status === "COMPLETED" && (
          <div className="space-y-4">
            <Card className="rounded-2xl border-emerald-400/30 bg-emerald-500/5 p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                Contract Completed!
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                All milestones approved and $
                {contract.releasedAmount.toLocaleString()} released.
              </p>
              {contract.endDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Completed on{" "}
                  {new Date(contract.endDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              )}
            </Card>

            {/* Review Panel */}
            <Card className="rounded-2xl border-border/40 overflow-hidden">
              <CardHeader className="pb-3 px-5 pt-4 border-b border-border/20">
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" /> Mutual Review
                  <span className="text-xs font-medium text-muted-foreground ml-1">
                    (blind until both submit)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {!reviewStatus ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading review
                    status...
                  </div>
                ) : reviewStatus.reviewStatus === "PENDING" ||
                  (reviewStatus.reviewStatus === "WAITING" &&
                    !reviewStatus.myReview) ? (
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-400/20">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Star className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <p className="font-black text-amber-800 dark:text-amber-400">
                        {reviewStatus.reviewStatus === "WAITING"
                          ? "Leave a Review — Freelancer Already Submitted!"
                          : "Leave a Review"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {reviewStatus.reviewStatus === "WAITING"
                          ? "Submit yours to instantly unlock both reviews!"
                          : `Share your experience with ${contract.freelancerName}. Reviews are hidden until both parties submit.`}
                      </p>
                    </div>
                    <Button
                      className="gap-2 rounded-xl font-black bg-amber-500 hover:bg-amber-600 text-white shrink-0"
                      onClick={() => setReviewModal(true)}
                    >
                      <Star className="w-4 h-4" /> Leave Review
                    </Button>
                  </div>
                ) : reviewStatus.reviewStatus === "WAITING" &&
                  reviewStatus.myReview ? (
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-400/20 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-black text-blue-800 dark:text-blue-400">
                          Review Submitted — Waiting for Freelancer
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Your review is sealed. It will be revealed once the
                          freelancer submits or after the deadline.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 p-3 rounded-lg bg-muted/30 w-fit">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            "w-4 h-4",
                            s <= reviewStatus.myReview.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/20",
                          )}
                        />
                      ))}
                      <span className="text-sm font-black ml-1">
                        {reviewStatus.myReview.rating}/5
                      </span>
                    </div>
                    {reviewStatus.myReview.reviewDeadline && (
                      <p className="text-xs text-muted-foreground">
                        Auto-reveals:{" "}
                        {new Date(
                          reviewStatus.myReview.reviewDeadline,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                ) : reviewStatus.reviewStatus === "REVEALED" ? (
                  <div className="space-y-4">
                    {reviewStatus.myReview && (
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/20 space-y-2">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                          Your Review (for {contract.freelancerName})
                        </p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                "w-4 h-4",
                                s <= reviewStatus.myReview.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/20",
                              )}
                            />
                          ))}
                          <span className="text-sm font-black ml-2">
                            {reviewStatus.myReview.rating}/5
                          </span>
                        </div>
                        {reviewStatus.myReview.comment && (
                          <p className="text-sm text-muted-foreground leading-relaxed italic">
                            "{reviewStatus.myReview.comment}"
                          </p>
                        )}
                      </div>
                    )}
                    {reviewStatus.theirReview && (
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-400/20 space-y-2">
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                          {contract.freelancerName}'s Review of You
                        </p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                "w-4 h-4",
                                s <= reviewStatus.theirReview.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/20",
                              )}
                            />
                          ))}
                          <span className="text-sm font-black ml-2">
                            {reviewStatus.theirReview.rating}/5
                          </span>
                        </div>
                        {reviewStatus.theirReview.comment && (
                          <p className="text-sm text-muted-foreground leading-relaxed italic">
                            "{reviewStatus.theirReview.comment}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Revision Modal */}
        <Dialog
          open={revisionModal.open}
          onOpenChange={(o) =>
            !o && setRevisionModal({ open: false, milestoneId: "", note: "" })
          }
        >
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-black text-lg">
                Request Revision
              </DialogTitle>
              <DialogDescription>
                Describe clearly what changes you need. The freelancer will be
                notified immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {revisionModal.milestoneId &&
                (() => {
                  const m = contract.milestones.find(
                    (m) => m.id === revisionModal.milestoneId,
                  );
                  const prevRevisions = (
                    Array.isArray(m?.history) ? m!.history : []
                  ).filter((e) => e.type === "REVISION_REQUEST");
                  if (prevRevisions.length > 0) {
                    return (
                      <div className="space-y-2">
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                          Previous Revision Notes
                        </p>
                        <div className="max-h-36 overflow-y-auto space-y-2">
                          {prevRevisions.map((r, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-xl bg-orange-500/5 border border-orange-400/20"
                            >
                              <p className="text-[10px] font-black text-orange-600 mb-1">
                                Revision #{i + 1} —{" "}
                                {new Date(r.timestamp).toLocaleDateString()}
                              </p>
                              <p className="text-xs">{r.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              <Textarea
                placeholder="Describe what needs to be revised or improved in detail..."
                value={revisionModal.note}
                onChange={(e) =>
                  setRevisionModal((p) => ({ ...p, note: e.target.value }))
                }
                rows={4}
                className="rounded-xl resize-none"
              />
              <p className="text-[10px] text-muted-foreground text-right font-medium">
                {revisionModal.note.length} characters
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() =>
                  setRevisionModal({ open: false, milestoneId: "", note: "" })
                }
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black gap-2"
                onClick={handleRevision}
                disabled={!!processingId}
              >
                {processingId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send Revision Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Review Modal */}
        {contract && (
          <ReviewModal
            open={reviewModal}
            onClose={() => setReviewModal(false)}
            contractId={contract.id}
            projectTitle={contract.projectTitle}
            revieweeRole="FREELANCER"
            onSuccess={fetchReviewStatus}
          />
        )}

        {/* Dispute Modal */}
        <Dialog
          open={disputeModal}
          onOpenChange={(o) => !o && setDisputeModal(false)}
        >
          <DialogContent className="rounded-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-black text-lg flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Open a Dispute
              </DialogTitle>
              <DialogDescription>
                Describe the problem clearly. Admin will review and mediate
                between you and the freelancer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Dispute Type <span className="text-red-500">*</span>
                </label>
                <Select
                  value={disputeForm.disputeType}
                  onValueChange={(v) =>
                    setDisputeForm((p) => ({
                      ...p,
                      disputeType: v as DisputeType,
                    }))
                  }
                >
                  <SelectTrigger className="rounded-xl h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      [
                        ["PAYMENT", "💰 Payment Dispute"],
                        ["SCOPE", "📄 Scope of Work"],
                        ["DEADLINE", "⏰ Deadline / Delay"],
                        ["QUALITY", "🧪 Quality of Work"],
                        ["REVISION", "🔁 Revision Dispute"],
                        ["DELIVERABLES", "📂 Deliverables Not Provided"],
                        ["IP", "🔐 Intellectual Property"],
                      ] as [DisputeType, string][]
                    ).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Issue Summary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Freelancer missed deadline and work is incomplete"
                  value={disputeForm.reason}
                  onChange={(e) =>
                    setDisputeForm((p) => ({ ...p, reason: e.target.value }))
                  }
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Full Details
                </label>
                <Textarea
                  placeholder="Explain in detail what went wrong, when, and what resolution you expect..."
                  value={disputeForm.details}
                  onChange={(e) =>
                    setDisputeForm((p) => ({ ...p, details: e.target.value }))
                  }
                  rows={4}
                  className="rounded-xl resize-none text-sm"
                />
              </div>
              <div className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-xl p-3">
                ⚠️ Once submitted, this project will be marked as{" "}
                <strong>Disputed</strong> and an admin will be notified
                immediately.
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setDisputeModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black gap-2"
                onClick={handleOpenDispute}
                disabled={disputeSubmitting || !disputeForm.reason.trim()}
              >
                {disputeSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Gavel className="w-4 h-4" />
                )}
                Submit Dispute
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── Stripe Fund Modal ── */}
        {stripeFundModal.milestone && (
          <StripeFundModal
            open={stripeFundModal.open}
            onClose={() => setStripeFundModal({ open: false, milestone: null })}
            contractId={contractId!}
            milestone={stripeFundModal.milestone}
            onSuccess={async () => {
              toast.success("Milestone funded via Stripe! Funds locked in escrow. 🔒");
              await fetchContract();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
