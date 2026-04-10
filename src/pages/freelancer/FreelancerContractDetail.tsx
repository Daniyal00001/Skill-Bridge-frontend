import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, CheckCircle2, Clock, DollarSign, ExternalLink, 
  FileText, MessageSquare, Play, Package, RotateCcw, 
  Search, ShieldCheck, UploadCloud, AlertCircle, 
  ChevronDown, ChevronUp, Loader2, MoreVertical, 
  LayoutDashboard, Activity, AlertTriangle, ArrowLeft, 
  ShieldAlert, Shield, Eye, Lock, Gavel, Handshake, Info
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ReviewModal } from "@/components/modals/ReviewModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type MilestoneStatus = "PENDING" | "FUNDED" | "IN_PROGRESS" | "SUBMITTED" | "REVISION_REQUESTED" | "APPROVED" | "REJECTED";
type ContractStatus = "OFFER_PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED" | "DISPUTED";
type DisputeType = "PAYMENT" | "SCOPE" | "DEADLINE" | "QUALITY" | "REVISION" | "DELIVERABLES" | "IP";

interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: MilestoneStatus;
  dueDate?: string;
  order: number;
  submittedAt?: string;
  approvedAt?: string;
  deliverables?: string;
  attachments?: string[];
  revisionNote?: string;
  revisionsUsed: number;
  allowedRevisions: number;
  history: any[];
}

interface DisputeInfo {
  id: string;
  status: string;
  resolution?: string;
  resolutionNote?: string;
  resolvedAt?: string;
}

interface Contract {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  freelancerName: string;
  freelancerImage?: string;
  agreedPrice: number;
  status: ContractStatus;
  startDate: string;
  endDate?: string;
  milestones: Milestone[];
  releasedAmount: number;
  escrowAmount: number;
  pendingAmount: number;
  refundedAmount?: number;
  milestonesModifiedByClient: boolean;
  disputeInfo?: DisputeInfo;
}

const statusConfig: Record<MilestoneStatus, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Pending", color: "bg-slate-500/10 text-slate-500 border-slate-500/20", icon: <Clock className="w-3 h-3" /> },
  FUNDED: { label: "Funded", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: <DollarSign className="w-3 h-3" /> },
  IN_PROGRESS: { label: "In Progress", color: "bg-primary/10 text-primary border-primary/20", icon: <Play className="w-3 h-3" /> },
  SUBMITTED: { label: "Under Review", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: <Search className="w-3 h-3" /> },
  REVISION_REQUESTED: { label: "Revision Requested", color: "bg-orange-500/10 text-orange-600 border-orange-500/20", icon: <RotateCcw className="w-3 h-3" /> },
  APPROVED: { label: "Approved", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: <CheckCircle2 className="w-3 h-3" /> },
  REJECTED: { label: "Rejected", color: "bg-rose-500/10 text-rose-600 border-rose-500/20", icon: <AlertTriangle className="w-3 h-3" /> },
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
  DISPUTE_RESOLUTION: {
    label: "Dispute Resolved",
    color: "bg-indigo-600",
    icon: <Gavel className="w-3 h-3 text-white" />,
    border: "border-l-indigo-400",
  },
};

export default function FreelancerContractDetail() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState(false);
  const [isReviewed, setIsReviewed] = useState(false);
  
  const [submitModal, setSubmitModal] = useState({
    open: false,
    milestoneId: "",
    deliverables: "",
    files: [] as File[],
  });

  const [disputeModal, setDisputeModal] = useState(false);
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [disputeForm, setDisputeForm] = useState({
    disputeType: "PAYMENT" as DisputeType,
    reason: "",
    details: ""
  });
  const [existingDispute, setExistingDispute] = useState<any>(null);

  useEffect(() => {
    fetchContract();
    fetchReviewStatus();
  }, [contractId]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/contracts/${contractId}`);
      if (res.data.success) {
        setContract(res.data.contract);
        const disputeRes = await api.get(`/disputes/project/${res.data.contract.projectId}`);
        if (disputeRes.data.success && disputeRes.data.disputes && disputeRes.data.disputes.length > 0) {
          setExistingDispute(disputeRes.data.disputes[0]);
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch contract");
      navigate("/freelancer/contracts");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStatus = async () => {
    if (!contractId) return;
    try {
      const res = await api.get(`/contracts/${contractId}/review-status`);
      if (res.data.success) {
        setIsReviewed(res.data.isReviewed);
      }
    } catch (err) {
      console.error("Error fetching review status:", err);
    }
  };

  const handleStart = async (milestoneId: string) => {
    try {
      setProcessingId(milestoneId);
      await api.patch(`/contracts/${contractId}/milestones/${milestoneId}/start`);
      toast.success("Milestone started! Keep up the great work. 🚀");
      fetchContract();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to start milestone");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSubmit = async () => {
    if (!submitModal.deliverables.trim()) {
      toast.error("Please describe your deliverables");
      return;
    }
    try {
      setProcessingId(submitModal.milestoneId);
      const formData = new FormData();
      formData.append("deliverables", submitModal.deliverables);
      submitModal.files.forEach(f => formData.append("attachments", f));
      await api.patch(
        `/contracts/${contractId}/milestones/${submitModal.milestoneId}/submit`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Deliverables submitted! Client notified. 📮");
      setSubmitModal({ open: false, milestoneId: "", deliverables: "", files: [] });
      fetchContract();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Submission failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Are you sure you want to reject this contract offer? This cannot be undone.")) return;
    try {
      setProcessingId("contract-rejection");
      await api.patch(`/contracts/${contractId}/reject`);
      toast.success("Offer rejected.");
      navigate("/freelancer/contracts");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenDispute = async () => {
    if (!disputeForm.reason.trim()) {
      toast.error("Please provide a reason for the dispute");
      return;
    }
    try {
      setDisputeSubmitting(true);
      await api.post("/disputes", {
        projectId: contract?.projectId,
        disputeType: disputeForm.disputeType,
        reason: disputeForm.reason,
        details: disputeForm.details
      });
      toast.success("Dispute case opened. Our trust team will investigate.");
      setDisputeModal(false);
      fetchContract();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to open dispute");
    } finally {
      setDisputeSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">
            Loading Contract Details...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!contract) return null;

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
            <div className="flex items-center gap-2 flex-wrap text-muted-foreground font-black text-[10px] uppercase tracking-[0.15em]">
              Client: {contract.clientName}
              <span className="text-muted-foreground/30 text-xs">•</span>
              Contract: {contract.id.slice(0, 8)}...
              {contract.endDate && (
                <>
                  <span className="text-muted-foreground/30 text-xs">•</span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Calendar className="w-3.5 h-3.5" />
                    Deadline: {new Date(contract.endDate).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight break-words overflow-hidden">
                {contract.projectTitle}
              </h1>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl font-bold text-xs bg-card hover:bg-muted shrink-0 text-muted-foreground border-border/60 transition-colors hidden md:flex"
                asChild
              >
                <Link to={`/freelancer/projects/${contract.projectId}`}>
                  <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  View Project
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(contract.status === "ACTIVE" || existingDispute) && (
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 rounded-xl font-bold text-xs gap-1.5",
                  existingDispute &&
                    !["RESOLVED", "CLOSED"].includes(existingDispute.status)
                    ? "border-rose-200 text-rose-600 bg-rose-50"
                    : "border-rose-200 text-rose-600 hover:bg-rose-50",
                )}
                onClick={() => {
                  if (
                    !existingDispute ||
                    ["RESOLVED", "CLOSED"].includes(existingDispute.status)
                  ) {
                    setDisputeModal(true);
                  }
                }}
                disabled={
                  existingDispute &&
                  !["RESOLVED", "CLOSED"].includes(existingDispute.status)
                }
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {existingDispute &&
                !["RESOLVED", "CLOSED"].includes(existingDispute.status)
                  ? "Case Active"
                  : "Open Dispute"}
              </Button>
            )}
            <Badge
              className={cn(
                "font-bold px-4 py-1.5 text-sm border",
                contract.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-700 border-emerald-400/30" : 
                contract.status === "OFFER_PENDING" ? "bg-primary/10 text-primary border-primary/30" : 
                contract.status === "COMPLETED" ? "bg-blue-500/10 text-blue-700 border-blue-400/30" : "bg-muted border-border",
              )}
            >
              {contract.status === "OFFER_PENDING" ? "Offer Pending" : contract.status}
            </Badge>
          </div>
        </div>

        {/* Dispute Center */}
        {existingDispute && (
          <Card className="rounded-2xl border-rose-200 bg-rose-50/30 overflow-hidden animate-in slide-in-from-top-4">
            <CardHeader className="bg-rose-500/10 px-5 py-3 border-b border-rose-200 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-black text-rose-900 uppercase tracking-wider">
                  Conflict Resolution — Case #{existingDispute.id.slice(-6).toUpperCase()}
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
                            existingDispute.filedBy === "CLIENT"
                              ? existingDispute.client?.profileImage
                              : existingDispute.freelancer?.profileImage
                          }
                        />
                        <AvatarFallback className="bg-rose-100 text-rose-600 font-bold text-xs">
                          {existingDispute.filedBy === "CLIENT" ? "CL" : "FL"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-rose-900">
                          {existingDispute.filedBy === "CLIENT"
                            ? "Client"
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
                  <p className="text-sm text-rose-800 dark:text-rose-300 font-bold leading-relaxed">
                    Mediator is reviewing the case. Check back soon.
                  </p>
                </div> */}
                <div className="flex gap-2">
                  {/* <Button variant="outline" size="sm" className="rounded-xl border-rose-200 text-rose-600 font-bold h-8 bg-white" asChild>
                      <Link to="/messages">
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Discuss in Workspace
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl border-rose-200 text-rose-600 font-bold h-8 bg-white" asChild>
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

        {/* Offer Banner */}
        {contract.status === "OFFER_PENDING" && (
          <Card className="rounded-2xl border-primary/30 bg-primary/5 border-2 p-4">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <AlertCircle className="w-14 h-14 text-primary shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-black">Review Contract Offer</h3>
                <p className="text-muted-foreground text-sm">Review milestones and accept to start the job.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl font-black" onClick={handleReject}>Reject</Button>
                <Button className="rounded-xl font-black bg-primary text-white" onClick={async () => {
                  await api.patch(`/contracts/${contract.id}/approve`);
                  fetchContract();
                }}>Accept & Start</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Dashboard */}
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
              <div className="grid grid-cols-4 gap-2">
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
                    label: "Refunded",
                    value: contract.refundedAmount || 0,
                    color: "text-rose-600",
                    bg: "bg-rose-500/5 border-rose-500/15",
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
                    className={cn("p-2 rounded-xl border text-center", e.bg)}
                  >
                    <p className={cn("text-base font-black", e.color)}>
                      ${e.value.toFixed(0)}
                    </p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">
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
                    <div
                      className="h-full bg-rose-500"
                      style={{
                        width: `${((contract.refundedAmount || 0) / contract.totalMilestoneAmount) * 100}%`,
                      }}
                    />
                  </>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Earned
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  Escrow
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  Refunded
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/30 inline-block" />
                  Remaining
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/40 bg-card/60 p-5">
             <CardTitle className="text-sm font-black flex items-center gap-2 mb-4">
                <LayoutDashboard className="w-4 h-4 text-primary" /> Completion
             </CardTitle>
             <div className="flex items-center justify-between mb-2">
                <p className="text-2xl font-black">{Math.round((contract.completedMilestones/contract.totalMilestones)*100)}%</p>
                <p className="text-xs font-bold text-muted-foreground">{contract.completedMilestones}/{contract.totalMilestones} Milestones</p>
             </div>
             <Progress value={(contract.completedMilestones/contract.totalMilestones)*100} className="h-2" />
          </Card>
        </div>

        {/* Milestones */}
        <div className="space-y-4">
          <h2 className="text-lg font-black flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Roadmap
          </h2>
          {contract.milestones.map((milestone, index) => {
            const isProcessing = processingId === milestone.id;
            const isExpanded = expandedMilestoneId === milestone.id;
            const canStart = milestone.status === "FUNDED";
            const canSubmit = ["IN_PROGRESS", "FUNDED", "REVISION_REQUESTED"].includes(milestone.status);
            const history = Array.isArray(milestone.history) ? milestone.history : [];

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
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {milestone.dueDate && (
                            <span className="flex items-center gap-1 text-[9px] font-black text-muted-foreground uppercase tracking-tighter opacity-60">
                              <Calendar className="w-2.5 h-2.5" />
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
                        <p className="text-sm leading-relaxed break-words">
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
                        <p className="text-sm leading-relaxed break-words">
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
                                      {eCfg.label}
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

                   <div className="mt-4 flex gap-2">
                      {canStart && <Button size="sm" className="rounded-xl font-black" onClick={() => handleStart(milestone.id)}>Start Work</Button>}
                      {canSubmit && !canStart && <Button size="sm" className="rounded-xl font-black" onClick={() => setSubmitModal({open: true, milestoneId: milestone.id, deliverables: "", files: []})}>Submit Work</Button>}
                   </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Modals */}
        <Dialog open={submitModal.open} onOpenChange={o => !o && setSubmitModal(p => ({ ...p, open: false }))}>
           <DialogContent className="rounded-2xl max-w-lg">
              <DialogHeader><DialogTitle className="font-black">Submit Deliverables</DialogTitle></DialogHeader>
              <div className="space-y-4">
                 <Textarea placeholder="Explain your delivery..." value={submitModal.deliverables} onChange={e => setSubmitModal(p => ({...p, deliverables: e.target.value}))} />
                 <Button className="w-full rounded-xl font-black" onClick={handleSubmit}>Submit for Review</Button>
              </div>
           </DialogContent>
        </Dialog>

        <Dialog open={disputeModal} onOpenChange={o => !o && setDisputeModal(false)}>
           <DialogContent className="rounded-2xl max-w-lg">
              <DialogHeader><DialogTitle className="font-black">Open Dispute</DialogTitle></DialogHeader>
              <div className="space-y-4">
                 <Textarea placeholder="Reason for dispute..." value={disputeForm.details} onChange={e => setDisputeForm(p => ({...p, details: e.target.value}))} />
                 <Button className="w-full rounded-xl font-black bg-rose-600 text-white" onClick={handleOpenDispute}>Submit Case</Button>
              </div>
           </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
