import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft, CheckCircle2, Clock, DollarSign, FileText, Loader2, Lock,
  Package, RotateCcw, Send, Shield, Upload, X, AlertCircle, AlertTriangle,
  Calendar, ShieldCheck, ListChecks, ChevronDown, ChevronUp, Eye,
  TrendingUp, Activity, Star, Zap, Play,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type MilestoneStatus = "PENDING" | "FUNDED" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "REVISION_REQUESTED" | "REJECTED";

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

const statusConfig: Record<MilestoneStatus, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  PENDING: {
    label: "Pending Funding", color: "bg-slate-500/10 text-slate-600 border-slate-300",
    bg: "bg-slate-50 dark:bg-slate-900/20", icon: <Lock className="w-3.5 h-3.5" />,
  },
  FUNDED: {
    label: "Funded — Ready", color: "bg-blue-500/10 text-blue-600 border-blue-300",
    bg: "bg-blue-50 dark:bg-blue-900/10", icon: <Shield className="w-3.5 h-3.5" />,
  },
  IN_PROGRESS: {
    label: "In Progress", color: "bg-amber-500/10 text-amber-600 border-amber-300",
    bg: "bg-amber-50 dark:bg-amber-900/10", icon: <Clock className="w-3.5 h-3.5" />,
  },
  SUBMITTED: {
    label: "Under Review", color: "bg-purple-500/10 text-purple-600 border-purple-300",
    bg: "bg-purple-50 dark:bg-purple-900/10", icon: <Package className="w-3.5 h-3.5" />,
  },
  APPROVED: {
    label: "Approved ✓", color: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-900/10", icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  REVISION_REQUESTED: {
    label: "Revision Requested", color: "bg-orange-500/10 text-orange-600 border-orange-300",
    bg: "bg-orange-50 dark:bg-orange-900/10", icon: <RotateCcw className="w-3.5 h-3.5" />,
  },
  REJECTED: {
    label: "Rejected", color: "bg-red-500/10 text-red-600 border-red-300",
    bg: "bg-red-50 dark:bg-red-900/10", icon: <X className="w-3.5 h-3.5" />,
  },
};

const eventConfig: any = {
  FUNDED: { label: "Milestone Funded", color: "bg-blue-500", icon: <Shield className="w-3 h-3 text-white" />, border: "border-l-blue-400" },
  STARTED: { label: "Work Started", color: "bg-amber-500", icon: <Play className="w-3 h-3 text-white" />, border: "border-l-amber-400" },
  SUBMISSION: { label: "Deliverables Submitted", color: "bg-purple-500", icon: <Package className="w-3 h-3 text-white" />, border: "border-l-purple-400" },
  REVISION_REQUEST: { label: "Revision Requested", color: "bg-orange-500", icon: <RotateCcw className="w-3 h-3 text-white" />, border: "border-l-orange-400" },
  APPROVAL: { label: "Milestone Approved", color: "bg-emerald-500", icon: <CheckCircle2 className="w-3 h-3 text-white" />, border: "border-l-emerald-400" },
};


export default function ClientContractDetail() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);
  const [revisionModal, setRevisionModal] = useState<{ open: boolean; milestoneId: string; note: string }>
    ({ open: false, milestoneId: "", note: "" });

  const fetchContract = useCallback(async () => {
    try {
      const res = await api.get(`/contracts/${contractId}`);
      setContract(res.data.contract);
    } catch {
      toast.error("Failed to load contract");
      navigate("/client/projects");
    } finally {
      setLoading(false);
    }
  }, [contractId, navigate]);

  useEffect(() => { fetchContract(); }, [fetchContract]);

  const handleFund = async (milestoneId: string) => {
    setProcessingId(milestoneId);
    try {
      await api.post(`/contracts/${contractId}/milestones/${milestoneId}/fund`);
      toast.success("Milestone funded! Funds are now in escrow. 🔒");
      await fetchContract();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fund milestone");
    } finally { setProcessingId(null); }
  };

  const handleApprove = async (milestoneId: string) => {
    setProcessingId(milestoneId);
    try {
      await api.post(`/contracts/${contractId}/milestones/${milestoneId}/approve`);
      toast.success("Milestone approved! Payment released. ✅");
      await fetchContract();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve");
    } finally { setProcessingId(null); }
  };

  const handleRevision = async () => {
    if (!revisionModal.note.trim()) { toast.error("Please provide a revision note"); return; }
    setProcessingId(revisionModal.milestoneId);
    try {
      await api.post(`/contracts/${contractId}/milestones/${revisionModal.milestoneId}/revision`, { note: revisionModal.note });
      toast.success("Revision requested. Freelancer will be notified.");
      setRevisionModal({ open: false, milestoneId: "", note: "" });
      await fetchContract();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to request revision");
    } finally { setProcessingId(null); }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading contract...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!contract) return null;

  const approvedCount = contract.milestones.filter((m) => m.status === "APPROVED").length;
  const submittedCount = contract.milestones.filter((m) => m.status === "SUBMITTED").length;
  const progress = contract.milestones.length > 0
    ? Math.round((approvedCount / contract.milestones.length) * 100) : 0;
  const pendingToFund = contract.milestones.filter((m) => m.status === "PENDING").length;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 py-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" className="w-10 h-10 p-0 rounded-xl mt-1 shrink-0"
            onClick={() => navigate("/client/contracts")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Contract Dashboard</p>
              <span className="text-muted-foreground/30 text-xs">•</span>
              <p className="text-xs text-muted-foreground">ID: {contract.id.slice(0, 8)}...</p>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1 leading-tight break-words">{contract.projectTitle}</h1>
          </div>
          <Badge className={cn(
            "font-bold px-4 py-1.5 text-sm shrink-0 border",
            contract.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-700 border-emerald-400/30" :
            contract.status === "OFFER_PENDING" ? "bg-amber-500/10 text-amber-700 border-amber-400/30" :
            contract.status === "COMPLETED" ? "bg-blue-500/10 text-blue-700 border-blue-400/30" :
            "bg-muted text-muted-foreground border-border"
          )}>
            {contract.status === "OFFER_PENDING" ? "Awaiting Freelancer Approval" : contract.status}
          </Badge>
        </div>

        {/* Offer Pending Alert */}
        {contract.status === "OFFER_PENDING" && (
          <Card className="rounded-2xl border-amber-400/40 bg-amber-500/5 border-2">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-amber-800 dark:text-amber-400">Awaiting Freelancer Approval</h3>
                <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                  You've modified the milestones. The freelancer needs to review and approve them before work can begin.
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
                  {submittedCount} Milestone{submittedCount > 1 ? "s" : ""} Awaiting Your Review
                </h3>
                <p className="text-sm text-orange-700/80 dark:text-orange-400/80 mt-0.5">
                  Please review within 3 days — payment will be automatically released otherwise.
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
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Working With</p>
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 ring-4 ring-border/30">
                  <AvatarImage src={contract.freelancerImage} />
                  <AvatarFallback className="text-xl font-black">{contract.freelancerName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-black">{contract.freelancerName}</p>
                  <p className="text-sm text-muted-foreground font-medium">
                    Contract started {new Date(contract.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                  {contract.endDate && (
                    <p className="text-sm text-emerald-600 font-bold">
                      Completed {new Date(contract.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card className="rounded-2xl border-border/40 bg-card/60">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Overall Progress</p>
                <span className="text-sm font-black text-primary">{approvedCount}/{contract.milestones.length} milestones</span>
              </div>
              <Progress value={progress} className="h-3 rounded-full" />
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Done", value: approvedCount, color: "text-emerald-600" },
                  { label: "Submitted", value: submittedCount, color: "text-purple-600" },
                  { label: "In Progress", value: contract.milestones.filter(m => ["IN_PROGRESS","FUNDED"].includes(m.status)).length, color: "text-amber-600" },
                  { label: "Pending", value: pendingToFund, color: "text-slate-500" },
                ].map((s, i) => (
                  <div key={i} className="text-center p-2 rounded-xl bg-muted/30">
                    <p className={cn("text-base font-black", s.color)}>{s.value}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{s.label}</p>
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
              <ShieldCheck className="w-5 h-5 text-primary" /> Escrow &amp; Payment Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                { label: "Total Contract Value", value: contract.totalMilestoneAmount, icon: <DollarSign className="w-4 h-4" />, color: "text-foreground", bg: "bg-muted/40 border-border/20", desc: "Agreed upon value" },
                { label: "Released to Freelancer", value: contract.releasedAmount, icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-600", bg: "bg-emerald-500/5 border-emerald-500/10", desc: "Paid out" },
                { label: "Held in Escrow", value: contract.escrowAmount, icon: <Shield className="w-4 h-4" />, color: "text-blue-600", bg: "bg-blue-500/5 border-blue-500/10", desc: "Locked & protected" },
                { label: "Yet to Fund", value: contract.pendingAmount, icon: <Lock className="w-4 h-4" />, color: "text-slate-500", bg: "bg-slate-500/5 border-slate-500/10", desc: "Needs funding" },
              ].map((p, i) => (
                <div key={i} className={cn("p-3 rounded-xl border space-y-0.5", p.bg)}>
                  <div className="flex items-center gap-2">
                    <span className={p.color}>{p.icon}</span>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{p.label}</p>
                  </div>
                  <p className={cn("text-2xl font-black", p.color)}>${p.value.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{p.desc}</p>
                </div>
              ))}
            </div>
            {/* Payment Bar */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Payment Breakdown</p>
              <div className="h-3 rounded-full bg-muted/60 overflow-hidden flex">
                {contract.totalMilestoneAmount > 0 && (
                  <>
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-700" 
                      style={{ width: `${(contract.releasedAmount / contract.totalMilestoneAmount) * 100}%` }} 
                    />
                    <div 
                      className="h-full bg-blue-500 transition-all duration-700" 
                      style={{ width: `${(contract.escrowAmount / contract.totalMilestoneAmount) * 100}%` }} 
                    />
                  </>
                )}
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Released</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/>In Escrow</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/30 inline-block"/>Pending</span>
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
                  <span className="text-sm font-medium text-muted-foreground">({contract.milestones.length})</span>
                </h2>
                <p className="text-xs text-muted-foreground font-medium">Complete project roadmap & escrow status</p>
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
                const history = Array.isArray(milestone.history) ? milestone.history : [];
                const revisionHistory = history.filter(e => e.type === "REVISION_REQUEST");
                const submissionHistory = history.filter(e => e.type === "SUBMISSION");

                return (
                  <Card
                    key={milestone.id}
                    className={cn(
                      "rounded-2xl border-border/40 bg-card/60 transition-all duration-300 group/mcard",
                      "hover:border-primary/40 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer",
                      milestone.status === "APPROVED" && "opacity-80",
                      milestone.status === "SUBMITTED" && "border-purple-400/50 shadow-purple-500/10 shadow-lg",
                      milestone.status === "REVISION_REQUESTED" && "border-orange-400/40",
                      isExpanded && "ring-2 ring-primary/20 bg-card shadow-lg translate-y-0 border-primary/30"
                    )}
                    onClick={() => setExpandedMilestoneId(isExpanded ? null : milestone.id)}
                  >
                    {/* Milestone Header — always visible */}
                    <div
                      className="p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          {/* Order indicator */}
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 mt-0.5",
                            milestone.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-600" :
                            milestone.status === "SUBMITTED" ? "bg-purple-500/20 text-purple-600" :
                            milestone.status === "REVISION_REQUESTED" ? "bg-orange-500/20 text-orange-600" :
                            "bg-muted/60 text-muted-foreground"
                          )}>
                            {milestone.status === "APPROVED" ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-black text-base">{milestone.title}</h3>
                              {submissionHistory.length > 0 && (
                                <span className="text-[10px] font-black bg-purple-500/10 text-purple-600 border border-purple-400/20 px-2 py-0.5 rounded-full">
                                  {submissionHistory.length} submission{submissionHistory.length > 1 ? "s" : ""}
                                </span>
                              )}
                              {revisionHistory.length > 0 && (
                                <span className="text-[10px] font-black bg-orange-500/10 text-orange-600 border border-orange-400/20 px-2 py-0.5 rounded-full">
                                  {revisionHistory.length} revision{revisionHistory.length > 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                            {milestone.description && (
                              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{milestone.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              {milestone.dueDate && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  Due {new Date(milestone.dueDate).toLocaleDateString()}
                                </span>
                              )}
                              <span className={cn(
                                "flex items-center gap-1 text-xs font-bold",
                                milestone.allowedRevisions !== -1 && milestone.revisionsUsed >= milestone.allowedRevisions
                                  ? "text-red-600" : "text-muted-foreground"
                              )}>
                                <RotateCcw className="w-3 h-3" />
                                Revisions: {milestone.revisionsUsed}/{milestone.allowedRevisions === -1 ? "∞" : milestone.allowedRevisions}
                                {milestone.allowedRevisions !== -1 && milestone.revisionsUsed >= milestone.allowedRevisions && " (Limit reached)"}
                              </span>
                              <div className="flex items-center gap-1 text-primary/60 group-hover/mcard:text-primary transition-colors ml-1">
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                  {isExpanded ? "Close" : "Details"}
                                </span>
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 group-hover/mcard:translate-y-0.5 transition-transform" />}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end gap-2">
                          <p className="text-xl font-black">${milestone.amount.toLocaleString()}</p>
                          <Badge variant="outline" className={cn("text-[10px] font-bold flex items-center gap-1", cfg.color)}>
                            {cfg.icon} {cfg.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Current Deliverables Preview (SUBMITTED or APPROVED state) */}
                      {(milestone.status === "SUBMITTED" || milestone.status === "APPROVED") && (
                        <div className={cn(
                          "mt-3 p-3 rounded-xl border space-y-1.5",
                          milestone.status === "SUBMITTED" ? "bg-purple-500/10 border-purple-400/25" : "bg-emerald-500/5 border-emerald-400/20"
                        )}>
                          <div className="flex items-center justify-between">
                            <p className={cn(
                              "text-xs font-black uppercase tracking-widest flex items-center gap-1.5",
                              milestone.status === "SUBMITTED" ? "text-purple-700" : "text-emerald-700"
                            )}>
                              <Package className="w-3.5 h-3.5" /> 
                              {milestone.status === "SUBMITTED" ? "Latest Submission — Awaiting Review" : "Final Deliverables"}
                            </p>
                            {milestone.status === "SUBMITTED" && (
                              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-400/30 text-[10px] font-black gap-1 animate-pulse">
                                <AlertCircle className="w-3 h-3" /> Review / Auto-release in 3 days
                              </Badge>
                            )}
                          </div>
                          {milestone.deliverables && <p className="text-sm leading-relaxed">{milestone.deliverables}</p>}
                          {milestone.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {milestone.attachments.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-background rounded-lg border border-border/50 text-xs font-bold hover:bg-primary/5 transition-colors">
                                  <FileText className="w-3.5 h-3.5 text-primary" /> Attachment {i + 1}
                                </a>
                              ))}
                            </div>
                          )}
                          {milestone.submittedAt && (
                            <p className="text-[10px] text-muted-foreground">
                              {milestone.status === "SUBMITTED" ? "Submitted" : "Final version submitted"} {new Date(milestone.submittedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Current Revision Note (REVISION_REQUESTED state) */}
                      {milestone.status === "REVISION_REQUESTED" && milestone.revisionNote && (
                        <div className="mt-3 p-3 rounded-xl bg-orange-500/10 border border-orange-400/25">
                          <p className="text-xs font-black text-orange-700 mb-1 flex items-center gap-1">
                            <RotateCcw className="w-3.5 h-3.5" /> Your Latest Revision Request
                          </p>
                          <p className="text-sm">{milestone.revisionNote}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2.5 mt-3 pt-3 border-t border-border/30" onClick={e => e.stopPropagation()}>
                        {milestone.status === "PENDING" && (
                          <div className="space-y-1">
                            <Button
                              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black"
                              onClick={() => handleFund(milestone.id)}
                              disabled={isProcessing || contract.status === "OFFER_PENDING"}
                            >
                              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                              Fund ${milestone.amount.toLocaleString()} into Escrow
                            </Button>
                            {contract.status === "OFFER_PENDING" && (
                              <p className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Awaiting freelancer approval first.
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
                              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              Approve &amp; Release Payment
                            </Button>
                            <Button
                              variant="outline"
                              className={cn("gap-2 rounded-xl font-black",
                                milestone.allowedRevisions !== -1 && milestone.revisionsUsed >= milestone.allowedRevisions
                                  ? "border-border/40 text-muted-foreground cursor-not-allowed"
                                  : "border-orange-400/40 text-orange-600 hover:bg-orange-500/10"
                              )}
                              onClick={() => setRevisionModal({ open: true, milestoneId: milestone.id, note: "" })}
                              disabled={isProcessing || (milestone.allowedRevisions !== -1 && milestone.revisionsUsed >= milestone.allowedRevisions)}
                            >
                              <RotateCcw className="w-4 h-4" />
                              {milestone.allowedRevisions !== -1 && milestone.revisionsUsed >= milestone.allowedRevisions
                                ? "Revision Limit Reached" : `Request Revision (${milestone.revisionsUsed}/${milestone.allowedRevisions === -1 ? "∞" : milestone.allowedRevisions} used)`}
                            </Button>
                          </div>
                        )}
                        {milestone.status === "APPROVED" && (
                          <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            ${milestone.amount.toLocaleString()} Payment Released
                            {milestone.approvedAt && <span className="text-muted-foreground font-medium">— {new Date(milestone.approvedAt).toLocaleDateString()}</span>}
                          </div>
                        )}
                        {["FUNDED", "IN_PROGRESS"].includes(milestone.status) && (
                          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                            <Clock className="w-4 h-4" /> Waiting for freelancer to submit work…
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
                              {history.length} event{history.length > 1 ? "s" : ""}
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
                              const eCfg = eventConfig[event.type];
                              const isLatest = idx === history.length - 1;
                              return (
                                <div key={idx} className="relative flex gap-4 pb-5 last:pb-0">
                                  {/* Timeline dot */}
                                  <div className={cn(
                                    "w-9 h-9 shrink-0 rounded-full flex items-center justify-center z-10 border-4 border-background shadow-sm transition-transform hover:scale-110",
                                    eCfg.color
                                  )}>
                                    {eCfg.icon}
                                  </div>
                                  {/* Content card */}
                                  <div className={cn(
                                    "flex-1 min-w-0 rounded-xl border-l-4 bg-muted/20 border border-border/20 overflow-hidden",
                                    eCfg.border
                                  )}>
                                    <div className="p-3 flex items-center justify-between gap-2 border-b border-border/10">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-black text-foreground">{eCfg?.label || event.type}</p>
                                      {event.actorName && (
                                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-muted text-muted-foreground font-black uppercase tracking-tight">
                                          {event.actorName} ({event.actorRole})
                                        </Badge>
                                      )}
                                      {isLatest && (
                                        <span className="text-[9px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-widest">Latest</span>
                                      )}
                                    </div>
                                      <span className="text-[10px] font-bold text-muted-foreground bg-muted/40 px-2 py-1 rounded-full shrink-0">
                                        {new Date(event.timestamp).toLocaleString("en-US", {
                                          month: "short", day: "numeric", year: "numeric",
                                          hour: "2-digit", minute: "2-digit"
                                        })}
                                      </span>
                                    </div>
                                    <div className="p-3 space-y-2">
                                      <p className="text-sm leading-relaxed">{event.content}</p>
                                      {event.attachments && event.attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                          {event.attachments.map((url, i) => (
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background border border-border/40 text-[11px] font-bold text-primary hover:bg-primary/5 transition-colors">
                                              <FileText className="w-3 h-3" /> File {i + 1}
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
                              <span className="font-black text-foreground">{submissionHistory.length}</span> total submission{submissionHistory.length > 1 ? "s" : ""} made •{" "}
                              <span className="font-black text-foreground">{revisionHistory.length}</span> revision{revisionHistory.length !== 1 ? "s" : ""} requested
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

        {/* Completed Banner */}
        {contract.status === "COMPLETED" && (
          <Card className="rounded-2xl border-emerald-400/30 bg-emerald-500/5 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Star className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-black text-emerald-700 dark:text-emerald-400">Contract Completed! 🎉</h2>
            <p className="text-muted-foreground mt-2">
              All milestones approved and ${contract.releasedAmount.toLocaleString()} released to the freelancer.
            </p>
            {contract.endDate && (
              <p className="text-sm text-muted-foreground mt-1">
                Completed on {new Date(contract.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </Card>
        )}

        {/* Revision Modal */}
        <Dialog open={revisionModal.open} onOpenChange={(o) => !o && setRevisionModal({ open: false, milestoneId: "", note: "" })}>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="font-black text-lg">Request Revision</DialogTitle>
              <DialogDescription>
                Describe clearly what changes you need. The freelancer will be notified immediately.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {revisionModal.milestoneId && (() => {
                const m = contract.milestones.find(m => m.id === revisionModal.milestoneId);
                const prevRevisions = (Array.isArray(m?.history) ? m!.history : []).filter(e => e.type === "REVISION_REQUEST");
                if (prevRevisions.length > 0) {
                  return (
                    <div className="space-y-2">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Previous Revision Notes</p>
                      <div className="max-h-36 overflow-y-auto space-y-2">
                        {prevRevisions.map((r, i) => (
                          <div key={i} className="p-3 rounded-xl bg-orange-500/5 border border-orange-400/20">
                            <p className="text-[10px] font-black text-orange-600 mb-1">Revision #{i + 1} — {new Date(r.timestamp).toLocaleDateString()}</p>
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
                onChange={(e) => setRevisionModal(p => ({ ...p, note: e.target.value }))}
                rows={4}
                className="rounded-xl resize-none"
              />
              <p className="text-[10px] text-muted-foreground text-right font-medium">{revisionModal.note.length} characters</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setRevisionModal({ open: false, milestoneId: "", note: "" })}>
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black gap-2"
                onClick={handleRevision}
                disabled={!!processingId}
              >
                {processingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Revision Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
