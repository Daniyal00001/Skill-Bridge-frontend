import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
  ChevronRight,
  Calendar,
  ShieldCheck,
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
  milestones: Milestone[];
  totalMilestoneAmount: number;
  releasedAmount: number;
  escrowAmount: number;
  pendingAmount: number;
}

const statusConfig: Record<
  MilestoneStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pending Funding",
    color: "bg-slate-500/10 text-slate-600 border-slate-300",
    icon: <Lock className="w-3.5 h-3.5" />,
  },
  FUNDED: {
    label: "Funded — Ready",
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

export default function ClientContractDetail() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Revision modal
  const [revisionModal, setRevisionModal] = useState<{
    open: boolean;
    milestoneId: string;
    note: string;
  }>({ open: false, milestoneId: "", note: "" });

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

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  const handleFund = async (milestoneId: string) => {
    setProcessingId(milestoneId);
    try {
      await api.post(`/contracts/${contractId}/milestones/${milestoneId}/fund`);
      toast.success("Milestone funded! Freelancer can now start work. 🎉");
      await fetchContract();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fund milestone");
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = async (milestoneId: string) => {
    setProcessingId(milestoneId);
    try {
      await api.post(
        `/contracts/${contractId}/milestones/${milestoneId}/approve`
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
        { note: revisionModal.note }
      );
      toast.success("Revision requested.");
      setRevisionModal({ open: false, milestoneId: "", note: "" });
      await fetchContract();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to request revision");
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
    (m) => m.status === "APPROVED"
  ).length;
  const progress =
    contract.milestones.length > 0
      ? Math.round((approvedCount / contract.milestones.length) * 100)
      : 0;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="w-10 h-10 p-0 rounded-xl"
            onClick={() => navigate(`/client/projects/${contract.projectId}`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-black tracking-tight">
              {contract.projectTitle}
            </h1>
            <p className="text-muted-foreground font-medium">
              Contract Dashboard
            </p>
          </div>
          <Badge
            className={cn(
              "font-bold px-4 py-1.5 text-sm",
              contract.status === "ACTIVE"
                ? "bg-blue-500/10 text-blue-600 border-blue-300"
                : contract.status === "OFFER_PENDING"
                ? "bg-amber-500/10 text-amber-600 border-amber-300"
                : contract.status === "COMPLETED"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-300"
                : "bg-muted text-muted-foreground"
            )}
          >
            {contract.status === "OFFER_PENDING"
                ? "Hired - Pending Approval"
                : contract.status}
          </Badge>
        </div>

        {/* Pending Approval Alert */}
        {contract.status === "OFFER_PENDING" && (
          <Card className="rounded-2xl border-amber-500/30 bg-amber-500/5 border-2">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-black text-amber-800 dark:text-amber-400">Awaiting Freelancer Approval</h3>
                <p className="text-sm text-amber-700/80 dark:text-amber-400/80">
                  You've modified the milestones. The freelancer needs to review and approve them before work can officially begin.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Freelancer + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-2xl border-border/40 bg-card/60">
            <CardContent className="p-6 flex items-center gap-4">
              <Avatar className="h-14 w-14 ring-4 ring-border/30">
                <AvatarImage src={contract.freelancerImage} />
                <AvatarFallback className="text-lg font-black">
                  {contract.freelancerName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Freelancer
                </p>
                <p className="text-lg font-black">{contract.freelancerName}</p>
                <p className="text-sm text-muted-foreground">
                  Since{" "}
                  {new Date(contract.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/40 bg-card/60">
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Overall Progress
                </span>
                <span className="text-sm font-black text-primary">
                  {approvedCount}/{contract.milestones.length} milestones
                </span>
              </div>
              <Progress value={progress} className="h-2.5 rounded-full" />
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="text-center">
                  <p className="text-lg font-black text-emerald-600">
                    ${contract.releasedAmount.toFixed(0)}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Released
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-blue-600">
                    ${contract.escrowAmount.toFixed(0)}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    In Escrow
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-slate-500">
                    ${contract.pendingAmount.toFixed(0)}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Remaining
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Milestones */}
        <div className="space-y-4">
          <h2 className="text-xl font-black">Milestones</h2>
          {contract.milestones.length === 0 ? (
            <Card className="rounded-2xl border-2 border-dashed border-border/40 p-12 text-center">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <p className="font-black text-lg">No milestones defined yet</p>
              <p className="text-muted-foreground text-sm">
                Contact the freelancer to discuss milestones.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {contract.milestones.map((milestone, index) => {
                const cfg = statusConfig[milestone.status];
                const isProcessing = processingId === milestone.id;

                return (
                  <Card
                    key={milestone.id}
                    className={cn(
                      "rounded-2xl border-border/40 bg-card/60 transition-all duration-300",
                      milestone.status === "APPROVED" && "opacity-75",
                      milestone.status === "SUBMITTED" &&
                        "border-purple-400/40 shadow-purple-500/10 shadow-lg"
                    )}
                  >
                    <CardContent className="p-6 space-y-4">
                      {/* Milestone header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0",
                              milestone.status === "APPROVED"
                                ? "bg-emerald-500/20 text-emerald-600"
                                : "bg-muted/50 text-muted-foreground"
                            )}
                          >
                            {milestone.status === "APPROVED" ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div>
                            <h3 className="font-black text-base leading-tight">
                              {milestone.title}
                            </h3>
                            {milestone.description && (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {milestone.description}
                              </p>
                            )}
                            {milestone.dueDate && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Calendar className="w-3 h-3" />
                                Due:{" "}
                                {new Date(
                                  milestone.dueDate
                                ).toLocaleDateString()}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-xs mt-1.5">
                              <RotateCcw className={cn(
                                "w-3 h-3",
                                milestone.allowedRevisions !== -1 && milestone.revisionsUsed >= milestone.allowedRevisions 
                                  ? "text-red-500" 
                                  : "text-orange-500"
                              )} />
                              <span className={cn(
                                "font-bold",
                                milestone.allowedRevisions !== -1 && milestone.revisionsUsed >= milestone.allowedRevisions 
                                  ? "text-red-600" 
                                  : "text-muted-foreground"
                              )}>
                                Revisions: {milestone.revisionsUsed} / {milestone.allowedRevisions === -1 ? "∞" : milestone.allowedRevisions}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-black">
                            ${milestone.amount.toLocaleString()}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-bold flex items-center gap-1 mt-1",
                              cfg.color
                            )}
                          >
                            {cfg.icon}
                            {cfg.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Revision note */}
                      {milestone.revisionNote &&
                        milestone.status === "REVISION_REQUESTED" && (
                          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                            <p className="text-xs font-black text-orange-600 mb-1">
                              Your Revision Request:
                            </p>
                            <p className="text-sm">{milestone.revisionNote}</p>
                          </div>
                        )}

                      {/* Submitted deliverables */}
                      {milestone.status === "SUBMITTED" && (
                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-black text-purple-600 uppercase tracking-widest">
                              Freelancer's Deliverables
                            </p>
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] font-black gap-1.5 animate-pulse">
                              <AlertCircle className="w-3 h-3" />
                              Review within 3 days or payment releases automatically
                            </Badge>
                          </div>
                          {milestone.deliverables && (
                            <p className="text-sm">{milestone.deliverables}</p>
                          )}
                          {milestone.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {milestone.attachments.map((url, i) => (
                                <a
                                  key={i}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border border-border/40 text-xs font-bold hover:bg-primary/5 transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5 text-primary" />
                                  Attachment {i + 1}
                                </a>
                              ))}
                            </div>
                          )}
                          {milestone.submittedAt && (
                            <p className="text-xs text-muted-foreground">
                              Submitted:{" "}
                              {new Date(
                                milestone.submittedAt
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-3 pt-2 border-t border-border/40">
                        {/* Fund button */}
                        {milestone.status === "PENDING" && (
                          <div className="flex flex-col gap-2">
                            <Button
                              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black"
                              onClick={() => handleFund(milestone.id)}
                              disabled={isProcessing || contract.status === "OFFER_PENDING"}
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <DollarSign className="w-4 h-4" />
                              )}
                              Fund ${milestone.amount.toLocaleString()} (Escrow)
                            </Button>
                            {contract.status === "OFFER_PENDING" && (
                              <p className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Awaiting freelancer approval of the offer/milestone plan.
                              </p>
                            )}
                          </div>
                        )}

                        {/* Approve + Revision buttons */}
                        {milestone.status === "SUBMITTED" && (
                          <>
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
                              Approve & Release Payment
                            </Button>
                            <Button
                              variant="outline"
                              className="gap-2 rounded-xl font-black border-orange-500/40 text-orange-600 hover:bg-orange-500/10"
                              onClick={() =>
                                setRevisionModal({
                                  open: true,
                                  milestoneId: milestone.id,
                                  note: "",
                                })
                              }
                              disabled={isProcessing || (milestone.allowedRevisions !== -1 && milestone.revisionsUsed >= milestone.allowedRevisions)}
                            >
                              <RotateCcw className="w-4 h-4" />
                              {milestone.allowedRevisions !== -1 && milestone.revisionsUsed >= milestone.allowedRevisions 
                                ? "Revision Limit Reached" 
                                : "Request Revision"}
                            </Button>
                          </>
                        )}

                        {milestone.status === "APPROVED" && (
                          <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            Payment Released —{" "}
                            {milestone.approvedAt &&
                              new Date(
                                milestone.approvedAt
                              ).toLocaleDateString()}
                          </div>
                        )}

                        {["FUNDED", "IN_PROGRESS"].includes(
                          milestone.status
                        ) && (
                          <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                            <Clock className="w-4 h-4" />
                            Waiting for freelancer to submit work…
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed */}
        {contract.status === "COMPLETED" && (
          <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              Contract Completed! 🎉
            </h2>
            <p className="text-muted-foreground mt-2">
              All milestones approved and payments released.
            </p>
          </Card>
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
              <DialogTitle className="font-black">Request Revision</DialogTitle>
              <DialogDescription>
                Describe what changes you need from the freelancer.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Explain what needs to be revised or improved..."
              value={revisionModal.note}
              onChange={(e) =>
                setRevisionModal((p) => ({ ...p, note: e.target.value }))
              }
              rows={4}
              className="rounded-xl"
            />
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
                className="flex-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black"
                onClick={handleRevision}
                disabled={!!processingId}
              >
                {processingId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Send Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
