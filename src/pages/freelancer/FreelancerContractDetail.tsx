import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  FileText,
  Lock,
  Package,
  Play,
  RotateCcw,
  Shield,
  UploadCloud,
  X,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageSquare,
  ListChecks,
  ChevronDown,
  ChevronUp,
  Activity,
  Eye,
  ShieldCheck,
  TrendingUp,
  Star,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

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
  agreedPrice: number;
  status: string;
  startDate: string;
  endDate?: string;
  milestones: Milestone[];
  totalMilestoneAmount: number;
  releasedAmount: number;
  escrowAmount: number;
  pendingAmount: number;
  milestonesModifiedByClient: boolean;
}

const statusConfig: Record<
  MilestoneStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Awaiting Funding",
    color: "bg-slate-500/10 text-slate-600 border-slate-300",
    icon: <Lock className="w-3.5 h-3.5" />,
  },
  FUNDED: {
    label: "Funded — Start Work",
    color: "bg-blue-500/10 text-blue-600 border-blue-300",
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  IN_PROGRESS: {
    label: "In Progress",
    color: "bg-amber-500/10 text-amber-600 border-amber-300",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  SUBMITTED: {
    label: "Under Review",
    color: "bg-purple-500/10 text-purple-600 border-purple-300",
    icon: <Package className="w-3.5 h-3.5" />,
  },
  APPROVED: {
    label: "Approved ✓",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  REVISION_REQUESTED: {
    label: "Revision Requested",
    color: "bg-orange-500/10 text-orange-600 border-orange-300",
    icon: <RotateCcw className="w-3.5 h-3.5" />,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-500/10 text-red-600 border-red-300",
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
    label: "Client Requested Revision",
    color: "bg-orange-500",
    icon: <RotateCcw className="w-3 h-3 text-white" />,
    border: "border-l-orange-400",
  },
  APPROVAL: {
    label: "Milestone Approved & Paid",
    color: "bg-emerald-500",
    icon: <CheckCircle2 className="w-3 h-3 text-white" />,
    border: "border-l-emerald-400",
  },
};

export default function FreelancerContractDetail() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(
    null,
  );
  const [submitModal, setSubmitModal] = useState<{
    open: boolean;
    milestoneId: string;
    deliverables: string;
    files: File[];
  }>({ open: false, milestoneId: "", deliverables: "", files: [] });

  const fetchContract = useCallback(async () => {
    try {
      const res = await api.get(`/contracts/${contractId}`);
      setContract(res.data.contract);
    } catch {
      toast.error("Failed to load contract");
      navigate("/freelancer/contracts");
    } finally {
      setLoading(false);
    }
  }, [contractId, navigate]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  const handleStart = async (milestoneId: string) => {
    setProcessingId(milestoneId);
    try {
      await api.post(
        `/contracts/${contractId}/milestones/${milestoneId}/start`,
      );
      toast.success("Milestone started! Get to work 💪");
      await fetchContract();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to start milestone");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubmit = async () => {
    if (!submitModal.deliverables.trim() && submitModal.files.length === 0) {
      toast.error("Please add a description or attach files.");
      return;
    }
    setProcessingId(submitModal.milestoneId);
    try {
      const formData = new FormData();
      formData.append("deliverables", submitModal.deliverables);
      submitModal.files.forEach((f) => formData.append("files", f));
      await api.post(
        `/contracts/${contractId}/milestones/${submitModal.milestoneId}/submit`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      toast.success("Deliverables submitted! Awaiting client review. 📦");
      setSubmitModal({
        open: false,
        milestoneId: "",
        deliverables: "",
        files: [],
      });
      await fetchContract();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (
      !window.confirm(
        "Are you sure you want to reject this offer? The project returns to open bidding.",
      )
    )
      return;
    setProcessingId("contract-rejection");
    try {
      await api.delete(`/contracts/${contractId}/reject`);
      toast.success("Offer rejected. Redirecting...");
      navigate("/freelancer/contracts");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject offer");
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
  const progress =
    contract.milestones.length > 0
      ? Math.round((approvedCount / contract.milestones.length) * 100)
      : 0;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 py-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            className="w-10 h-10 p-0 rounded-xl mt-1 shrink-0"
            onClick={() => navigate("/freelancer/contracts")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                Contract —
              </p>
              <p className="text-xs text-muted-foreground">
                Client: {contract.clientName}
              </p>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1 leading-tight break-words">
              {contract.projectTitle}
            </h1>
          </div>
          <Badge
            className={cn(
              "font-bold px-4 py-1.5 text-sm shrink-0 border",
              contract.status === "ACTIVE"
                ? "bg-emerald-500/10 text-emerald-700 border-emerald-400/30"
                : contract.status === "OFFER_PENDING"
                  ? "bg-primary/10 text-primary border-primary/30"
                  : contract.status === "COMPLETED"
                    ? "bg-blue-500/10 text-blue-700 border-blue-400/30"
                    : "bg-muted text-muted-foreground border-border",
            )}
          >
            {contract.status === "OFFER_PENDING"
              ? "Offer Pending"
              : contract.status}
          </Badge>
        </div>

        {/* Offer Approval Banner */}
        {contract.status === "OFFER_PENDING" && (
          <Card className="rounded-2xl border-primary/30 bg-primary/5 border-2 overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-black flex items-center justify-center md:justify-start gap-2">
                    Review Contract Offer
                    {contract.milestonesModifiedByClient && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-xs"
                      >
                        Milestones Modified
                      </Badge>
                    )}
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium mt-1">
                    Review the milestone plan and revision limits. Accept to
                    start work, reject to cancel the hire, or message the client
                    to negotiate.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
                  <Button
                    variant="outline"
                    className="rounded-xl border-border/40 font-black gap-2 h-11"
                    onClick={() =>
                      navigate(`/messages?projectId=${contract.projectId}`)
                    }
                  >
                    <MessageSquare className="w-4 h-4" /> Message Client
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-black gap-2 h-11"
                    onClick={handleReject}
                    disabled={!!processingId}
                  >
                    {processingId === "contract-rejection" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Reject Offer
                  </Button>
                  <Button
                    className="rounded-xl px-6 font-black bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 h-11"
                    onClick={async () => {
                      try {
                        setProcessingId("contract-approval");
                        await api.patch(`/contracts/${contract.id}/approve`);
                        toast.success(
                          "Contract approved! Let's get to work! 🚀",
                        );
                        fetchContract();
                      } catch (err: any) {
                        toast.error(
                          err?.response?.data?.message ||
                            "Failed to approve contract",
                        );
                      } finally {
                        setProcessingId(null);
                      }
                    }}
                    disabled={!!processingId}
                  >
                    {processingId === "contract-approval" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Accept &amp; Start Work
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Earnings + Progress Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Earnings breakdown */}
          <Card className="rounded-2xl border-border/40 bg-card/60">
            <CardHeader className="pb-2 px-5 pt-4">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Your Earnings
                Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Earned",
                    value: contract.releasedAmount,
                    color: "text-emerald-600",
                    bg: "bg-emerald-500/5 border-emerald-500/15",
                  },
                  {
                    label: "In Escrow",
                    value: contract.escrowAmount,
                    color: "text-blue-600",
                    bg: "bg-blue-500/5 border-blue-500/15",
                  },
                  {
                    label: "Remaining",
                    value: contract.pendingAmount,
                    color: "text-slate-500",
                    bg: "bg-slate-500/5 border-slate-500/15",
                  },
                ].map((e, i) => (
                  <div
                    key={i}
                    className={cn("p-3 rounded-xl border text-center", e.bg)}
                  >
                    <p className={cn("text-lg font-black", e.color)}>
                      ${e.value.toFixed(0)}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">
                      {e.label}
                    </p>
                  </div>
                ))}
              </div>
              {/* Earnings bar */}
              <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden flex">
                {contract.totalMilestoneAmount > 0 && (
                  <>
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${(contract.releasedAmount / contract.totalMilestoneAmount) * 100}%`,
                      }}
                    />
                    <div
                      className="h-full bg-blue-500"
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
                  Earned
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  Escrow
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/30 inline-block" />
                  Remaining
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card className="rounded-2xl border-border/40 bg-card/60">
            <CardHeader className="pb-2 px-5 pt-4">
              <CardTitle className="text-sm font-black flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Project Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-muted-foreground">
                  Milestones Completed
                </span>
                <span className="text-sm font-black text-primary">
                  {approvedCount}/{contract.milestones.length}
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
                    label: "Working",
                    value: contract.milestones.filter(
                      (m) => m.status === "IN_PROGRESS",
                    ).length,
                    color: "text-amber-600",
                  },
                  {
                    label: "Submitted",
                    value: contract.milestones.filter(
                      (m) => m.status === "SUBMITTED",
                    ).length,
                    color: "text-purple-600",
                  },
                  {
                    label: "Revisions",
                    value: contract.milestones.filter(
                      (m) => m.status === "REVISION_REQUESTED",
                    ).length,
                    color: "text-orange-600",
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

        {/* Milestones */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-primary" /> Milestones
              <span className="text-sm font-medium text-muted-foreground ml-1">
                ({contract.milestones.length})
              </span>
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              Click any milestone to view full history
            </p>
          </div>

          {contract.milestones.map((milestone, index) => {
            const cfg = statusConfig[milestone.status];
            const isProcessing = processingId === milestone.id;
            const isExpanded = expandedMilestoneId === milestone.id;
            const canStart = milestone.status === "FUNDED";
            const canSubmit = [
              "IN_PROGRESS",
              "FUNDED",
              "REVISION_REQUESTED",
            ].includes(milestone.status);
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
                  "rounded-2xl border-border/40 bg-card/60 transition-all duration-300",
                  milestone.status === "APPROVED" && "opacity-80",
                  canSubmit &&
                    milestone.status !== "SUBMITTED" &&
                    "border-primary/30 shadow-primary/10 shadow-md",
                  milestone.status === "SUBMITTED" &&
                    "border-purple-400/40 shadow-purple-500/10 shadow-md",
                  milestone.status === "REVISION_REQUESTED" &&
                    "border-orange-400/40 shadow-orange-500/10 shadow-md",
                  isExpanded && "ring-2 ring-primary/20 bg-card shadow-lg",
                )}
              >
                {/* Milestone Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() =>
                    setExpandedMilestoneId(isExpanded ? null : milestone.id)
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 mt-0.5",
                          milestone.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-600"
                            : milestone.status === "REVISION_REQUESTED"
                              ? "bg-orange-500/20 text-orange-600"
                              : canSubmit
                                ? "bg-primary/10 text-primary"
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
                          <h3 className="font-black text-base">
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
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                            {milestone.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {milestone.dueDate && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              Due{" "}
                              {new Date(milestone.dueDate).toLocaleDateString()}
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
                          </span>
                          <div className="flex items-center gap-1 text-primary/60 group-hover:text-primary transition-colors ml-1">
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {isExpanded ? "Close" : "Details"}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
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

                  {/* Revision Note (REVISION_REQUESTED) */}
                  {milestone.status === "REVISION_REQUESTED" &&
                    milestone.revisionNote && (
                      <div className="mt-3 p-3 rounded-xl bg-orange-500/10 border border-orange-400/25 space-y-1.5">
                        <p className="text-xs font-black text-orange-700 flex items-center gap-1.5">
                          <RotateCcw className="w-3.5 h-3.5" /> Client Revision
                          Request
                        </p>
                        <p className="text-sm leading-relaxed">
                          {milestone.revisionNote}
                        </p>
                        <p className="text-[10px] text-orange-600/70 font-medium">
                          Please address these changes and re-submit your
                          deliverables.
                        </p>
                      </div>
                    )}

                  {/* Submitted or Approved Deliverables */}
                  {(milestone.status === "SUBMITTED" ||
                    milestone.status === "APPROVED") && (
                    <div
                      className={cn(
                        "mt-3 p-3 rounded-xl border space-y-2",
                        milestone.status === "SUBMITTED"
                          ? "bg-purple-500/10 border-purple-400/25"
                          : "bg-emerald-500/5 border-emerald-400/20",
                      )}
                    >
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
                          ? "Latest Submission — Under Review"
                          : "Final Deliverables"}
                      </p>

                      {milestone.deliverables && (
                        <p className="text-sm leading-relaxed">
                          {milestone.deliverables}
                        </p>
                      )}

                      {milestone.attachments &&
                        milestone.attachments.length > 0 && (
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

                      <p className="text-[10px] text-muted-foreground">
                        {milestone.status === "SUBMITTED"
                          ? `Submitted on ${milestone.submittedAt && new Date(milestone.submittedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}. Client has 3 days to review.`
                          : `Approved on ${milestone.approvedAt && new Date(milestone.approvedAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div
                    className="flex flex-wrap gap-2.5 mt-3 pt-3 border-t border-border/30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {milestone.status === "PENDING" && (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold">
                        <Lock className="w-4 h-4" /> Waiting for client to fund
                        this milestone
                      </div>
                    )}
                    {canStart && (
                      <Button
                        className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl font-black"
                        onClick={() => handleStart(milestone.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        Start Working
                      </Button>
                    )}
                    {canSubmit && !canStart && (
                      <Button
                        className={cn(
                          "gap-2 text-white rounded-xl font-black",
                          milestone.status === "REVISION_REQUESTED"
                            ? "bg-orange-600 hover:bg-orange-700"
                            : "bg-purple-600 hover:bg-purple-700",
                        )}
                        onClick={() =>
                          setSubmitModal({
                            open: true,
                            milestoneId: milestone.id,
                            deliverables: "",
                            files: [],
                          })
                        }
                        disabled={isProcessing}
                      >
                        <UploadCloud className="w-4 h-4" />
                        {milestone.status === "REVISION_REQUESTED"
                          ? "Re-submit with Revisions"
                          : "Submit Deliverables"}
                      </Button>
                    )}
                    {milestone.status === "SUBMITTED" && (
                      <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                        <Package className="w-4 h-4" /> Awaiting client review
                      </div>
                    )}
                    {milestone.status === "APPROVED" && (
                      <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                        <CheckCircle2 className="w-4 h-4" />$
                        {milestone.amount.toLocaleString()} released to your
                        account
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
                  </div>
                </div>

                {/* Expanded: Full History Timeline */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-border/30 pt-5 animate-in slide-in-from-top-2 duration-300 space-y-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                        Complete Activity History
                      </h4>
                      {history.length > 0 && (
                        <span className="text-[10px] font-black bg-muted/60 text-muted-foreground px-2 py-0.5 rounded-full">
                          {history.length} event{history.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {history.length === 0 ? (
                      <div className="flex items-center gap-3 py-6 text-muted-foreground text-sm italic">
                        <div className="w-0.5 h-10 bg-border/40 rounded-full ml-2.5" />
                        <div className="w-3 h-3 rounded-full bg-muted border-2 border-background ml-[-2px]" />
                        No activity yet for this milestone.
                      </div>
                    ) : (
                      <div className="relative space-y-0">
                        <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-border/50 rounded-full" />
                        {history.map((event, idx) => {
                          const eCfg = eventConfig[event.type];
                          const isLatest = idx === history.length - 1;
                          return (
                            <div
                              key={idx}
                              className="relative flex gap-4 pb-5 last:pb-0"
                            >
                              <div
                                className={cn(
                                  "w-9 h-9 shrink-0 rounded-full flex items-center justify-center z-10 border-4 border-background shadow-sm transition-transform hover:scale-110",
                                  eCfg.color,
                                )}
                              >
                                {eCfg.icon}
                              </div>
                              <div
                                className={cn(
                                  "flex-1 min-w-0 rounded-xl border-l-4 bg-muted/20 border border-border/20 overflow-hidden",
                                  eCfg.border,
                                )}
                              >
                                <div className="p-3 flex items-center justify-between gap-2 border-b border-border/10">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-black text-foreground">
                                      {eCfg?.label || event.type}
                                    </p>
                                    {event.actorName && (
                                      <Badge
                                        variant="secondary"
                                        className="text-[9px] px-1.5 py-0 h-4 bg-muted text-muted-foreground font-black uppercase tracking-tight"
                                      >
                                        {event.actorName} ({event.actorRole})
                                      </Badge>
                                    )}
                                    {isLatest && (
                                      <span className="text-[9px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                                        Latest
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-bold text-muted-foreground bg-muted/40 px-2 py-1 rounded-full shrink-0">
                                    {new Date(event.timestamp).toLocaleString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
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

                    {submissionHistory.length > 0 && (
                      <div className="mt-3 p-3 rounded-xl bg-muted/30 border border-border/20 flex items-center gap-3">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-black text-foreground">
                            {submissionHistory.length}
                          </span>{" "}
                          total submission
                          {submissionHistory.length > 1 ? "s" : ""} •{" "}
                          <span className="font-black text-foreground">
                            {revisionHistory.length}
                          </span>{" "}
                          revision{revisionHistory.length !== 1 ? "s" : ""}{" "}
                          requested by client
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Contract Complete */}
        {contract.status === "COMPLETED" && (
          <Card className="rounded-2xl border-emerald-400/30 bg-emerald-500/5 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Star className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
              Contract Completed! 🎉
            </h2>
            <p className="text-muted-foreground mt-2">
              All milestones approved. $
              {contract.releasedAmount.toLocaleString()} has been released to
              you.
            </p>
          </Card>
        )}

        {/* Submit Deliverables Modal */}
        <Dialog
          open={submitModal.open}
          onOpenChange={(o) =>
            !o &&
            setSubmitModal({
              open: false,
              milestoneId: "",
              deliverables: "",
              files: [],
            })
          }
        >
          <DialogContent className="rounded-2xl max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-black text-lg">
                {contract.milestones.find(
                  (m) => m.id === submitModal.milestoneId,
                )?.status === "REVISION_REQUESTED"
                  ? "Re-submit with Revisions"
                  : "Submit Deliverables"}
              </DialogTitle>
              <DialogDescription>
                Describe your work and/or attach files for the client's review.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Show latest revision note if re-submitting */}
              {(() => {
                const m = contract.milestones.find(
                  (m) => m.id === submitModal.milestoneId,
                );
                if (m?.status === "REVISION_REQUESTED" && m.revisionNote) {
                  return (
                    <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-400/25">
                      <p className="text-xs font-black text-orange-700 mb-1">
                        Client's Revision Note:
                      </p>
                      <p className="text-sm">{m.revisionNote}</p>
                    </div>
                  );
                }
                return null;
              })()}

              <div>
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  placeholder="Describe what you've completed, links to your work, notes for the client..."
                  value={submitModal.deliverables}
                  onChange={(e) =>
                    setSubmitModal((p) => ({
                      ...p,
                      deliverables: e.target.value,
                    }))
                  }
                  rows={4}
                  className="rounded-xl mt-2 resize-none"
                />
              </div>

              <div>
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Attachments (Optional — Max 5 files)
                </Label>
                <div className="mt-2 border-2 border-dashed border-border/40 rounded-xl p-6 text-center relative hover:border-primary/40 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt,.zip"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (!e.target.files) return;
                      const ALLOWED = [
                        "image/jpeg",
                        "image/png",
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        "text/plain",
                        "application/zip",
                        "application/x-zip-compressed",
                      ];
                      const selected = Array.from(e.target.files);
                      
                      // Check for 500MB limit
                      const oversized = selected.filter(f => f.size > 500 * 1024 * 1024);
                      if (oversized.length > 0) {
                        toast.error("Some files are too large. Maximum 500MB per file allowed.");
                        return;
                      }

                      const valid = selected.filter((f) =>
                        ALLOWED.includes(f.type),
                      );
                      const invalid = selected.filter(
                        (f) => !ALLOWED.includes(f.type),
                      );
                      if (invalid.length > 0)
                        toast.error(
                          `${invalid.length} file(s) skipped — only JPG, PNG, PDF, Word, TXT, and ZIP allowed.`,
                        );
                      setSubmitModal((p) => ({
                        ...p,
                        files: [...p.files, ...valid].slice(0, 5),
                      }));
                      e.target.value = "";
                    }}
                  />
                  <UploadCloud className="w-8 h-8 text-primary/60 mx-auto mb-2" />
                  <p className="text-sm font-bold text-muted-foreground">
                    Click or drag to upload files
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, PDF, Word, TXT, ZIP
                  </p>
                </div>
                {submitModal.files.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {submitModal.files.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs font-bold p-2.5 bg-muted/30 rounded-xl border border-border/20"
                      >
                        <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate flex-1">{f.name}</span>
                        <span className="text-muted-foreground shrink-0">
                          {(f.size / 1024).toFixed(0)}KB
                        </span>
                        <button
                          className="text-red-500 hover:text-red-600 shrink-0"
                          onClick={() =>
                            setSubmitModal((p) => ({
                              ...p,
                              files: p.files.filter((_, idx) => idx !== i),
                            }))
                          }
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  onClick={() =>
                    setSubmitModal({
                      open: false,
                      milestoneId: "",
                      deliverables: "",
                      files: [],
                    })
                  }
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black gap-2"
                  onClick={handleSubmit}
                  disabled={!!processingId}
                >
                  {processingId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                  Submit for Review
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
