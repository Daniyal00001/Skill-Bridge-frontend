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
  totalMilestones: number;
  completedMilestones: number;
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

const eventConfig: Record<string, { color: string; border: string; icon: any }> = {
  SUBMISSION: { color: "bg-purple-500", border: "border-l-purple-500", icon: <Package className="w-4 h-4 text-white" /> },
  REVISION_REQUEST: { color: "bg-orange-500", border: "border-l-orange-500", icon: <RotateCcw className="w-4 h-4 text-white" /> },
  APPROVAL: { color: "bg-emerald-500", border: "border-l-emerald-500", icon: <CheckCircle2 className="w-4 h-4 text-white" /> },
  DISPUTE_RESOLUTION: { color: "bg-primary text-white", border: "border-l-primary", icon: <Gavel className="w-4 h-4 text-white" /> },
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
              <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight break-words">
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
                  existingDispute ? "border-rose-200 text-rose-600 bg-rose-50" : "border-rose-200 text-rose-600 hover:bg-rose-50",
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
              <Badge className="bg-rose-600 text-white font-black">{existingDispute.status.replace(/_/g, " ")}</Badge>
            </CardHeader>
            <CardContent className="p-5 grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Status & Filing</p>
                  <p className="text-sm font-bold text-rose-900 capitalize">{existingDispute.filedBy} filed this case</p>
                  <p className="text-[10px] text-rose-500">Opened {new Date(existingDispute.openedAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Dispute Reason</p>
                  <p className="text-sm font-bold text-rose-800">{existingDispute.reason}</p>
                  <div className="p-3 bg-white/60 border border-rose-100 rounded-xl mt-2 italic text-xs text-rose-700">
                    "{existingDispute.details}"
                  </div>
                </div>
              </div>
              <div className="bg-white/40 p-5 rounded-2xl border border-rose-100/50">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4">Progress Tracker</p>
                <div className="space-y-4 relative">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-rose-200" />
                  {["Case Opened", "Mediator Assigned", "Evidence Check", "Final Decision"].map((step, idx) => (
                    <div key={idx} className="flex gap-4 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center shrink-0">
                         <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-rose-900">{step}</p>
                      </div>
                    </div>
                  ))}
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
          <Card className="rounded-2xl border-border/40 bg-card/60 p-5">
             <CardTitle className="text-sm font-black flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-primary" /> Earnings Breakdown
             </CardTitle>
             <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border bg-emerald-500/5 text-center">
                  <p className="text-lg font-black text-emerald-600">${contract.releasedAmount}</p>
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Earned</p>
                </div>
                <div className="p-3 rounded-xl border bg-blue-500/5 text-center">
                  <p className="text-lg font-black text-blue-600">${contract.escrowAmount}</p>
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Escrow</p>
                </div>
                <div className="p-3 rounded-xl border bg-slate-500/5 text-center">
                  <p className="text-lg font-black text-muted-foreground">${contract.pendingAmount}</p>
                  <p className="text-[9px] font-black uppercase text-muted-foreground">Left</p>
                </div>
             </div>
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
              <Card key={milestone.id} className={cn("rounded-2xl border-border/40 bg-card/60 transition-all", isExpanded && "ring-2 ring-primary/20 bg-card shadow-lg")}>
                <div className="p-4 cursor-pointer" onClick={() => setExpandedMilestoneId(isExpanded ? null : milestone.id)}>
                   <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                         <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">{index + 1}</div>
                         <div className="flex-1">
                            <h3 className="font-black text-base">{milestone.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                               {milestone.dueDate && (
                                 <span className="text-[10px] font-black text-muted-foreground uppercase flex items-center gap-1">
                                   <Calendar className="w-3 h-3" /> Due {new Date(milestone.dueDate).toLocaleDateString()}
                                 </span>
                               )}
                               {contract.disputeInfo && contract.disputeInfo.status === "RESOLVED" && (
                                 <span className="text-[10px] font-black text-primary uppercase flex items-center gap-1">
                                   <Gavel className="w-3 h-3" /> Resolved: {contract.disputeInfo.resolution}
                                 </span>
                               )}
                               <Badge variant="outline" className={cn("text-[9px] font-bold uppercase", statusConfig[milestone.status].color)}>
                                 {statusConfig[milestone.status].label}
                               </Badge>
                            </div>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xl font-black">${milestone.amount}</p>
                      </div>
                   </div>

                   {isExpanded && (
                     <div className="mt-5 border-t border-border/30 pt-5 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                           <Activity className="w-4 h-4 text-primary" />
                           <p className="text-xs font-black uppercase text-muted-foreground">Activity Log</p>
                        </div>
                        {history.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">No events yet.</p>
                        ) : (
                          <div className="space-y-4 relative">
                            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border/40" />
                            {history.map((event: any, i: number) => (
                              <div key={i} className="flex gap-4 relative z-10">
                                 <div className="w-6 h-6 rounded-full bg-muted border-2 border-white" />
                                 <div className="flex-1">
                                    <div className="flex justify-between">
                                       <p className="text-xs font-black">{event.type}</p>
                                       <span className="text-[10px] text-muted-foreground">{new Date(event.timestamp).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">{event.content}</p>
                                 </div>
                              </div>
                            ))}
                          </div>
                        )}
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
