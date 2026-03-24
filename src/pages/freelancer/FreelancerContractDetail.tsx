import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  agreedPrice: number;
  status: string;
  startDate: string;
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

export default function FreelancerContractDetail() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Submit deliverables modal
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
        `/contracts/${contractId}/milestones/${milestoneId}/start`
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
      toast.error("Please add deliverables description or attach files.");
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
        { headers: { "Content-Type": "multipart/form-data" } }
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
    if (!window.confirm("Are you sure you want to reject this offer? The project will go back to the bidding stage.")) {
      return;
    }
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
            onClick={() => navigate(`/freelancer/contracts`)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-black tracking-tight">
              {contract.projectTitle}
            </h1>
            <p className="text-muted-foreground font-medium">
              Client: {contract.clientName}
            </p>
          </div>
          <Badge
            className={cn(
              "font-bold px-4 py-1.5 text-sm",
              contract.status === "ACTIVE"
                ? "bg-blue-500/10 text-blue-600 border-blue-300"
                : contract.status === "OFFER_PENDING"
                ? "bg-primary/10 text-primary border-primary/30"
                : contract.status === "COMPLETED"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-300"
                : "bg-muted text-muted-foreground"
            )}
          >
            {contract.status === "OFFER_PENDING"
                ? "Offer Pending"
                : contract.status}
          </Badge>
        </div>

        {/* Approval Banner */}
        {contract.status === "OFFER_PENDING" && (
          <Card className="rounded-2xl border-primary/30 bg-primary/5 border-2 overflow-hidden shadow-xl shadow-primary/5">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-black tracking-tight flex items-center justify-center md:justify-start gap-2">
                    Review Contract Offer
                    {contract.milestonesModifiedByClient && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                        Milestones Modified
                      </Badge>
                    )}
                  </h3>
                  <p className="text-muted-foreground text-sm font-medium mt-1">
                    Please review the milestone plan and revision limits below. 
                    The client has proposed these terms. You can accept to start work immediately, 
                    reject to cancel the hire, or message the client to negotiate.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <Button 
                    variant="outline"
                    className="rounded-xl border-border/40 font-black gap-2 h-11"
                    onClick={() => navigate(`/messages?projectId=${contract.projectId}`)}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message Client
                  </Button>
                  <Button 
                    variant="outline"
                    className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-black gap-2 h-11"
                    onClick={handleReject}
                    disabled={!!processingId}
                  >
                    {processingId === "contract-rejection" ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    Reject Offer
                  </Button>
                  <Button 
                    className="rounded-xl px-6 font-black bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 gap-2 h-11"
                    onClick={async () => {
                      try {
                        setProcessingId("contract-approval");
                        await api.patch(`/contracts/${contract.id}/approve`);
                        toast.success("Contract approved! Let's get to work! 🚀");
                        fetchContract();
                      } catch (err: any) {
                        toast.error(err?.response?.data?.message || "Failed to approve contract");
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
                    Accept & Start Work
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Earnings summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-2xl border-border/40 bg-card/60">
            <CardContent className="p-5 text-center">
              <p className="text-2xl font-black text-emerald-600">
                ${contract.releasedAmount.toFixed(0)}
              </p>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-1">
                Earned
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/40 bg-card/60">
            <CardContent className="p-5 text-center">
              <p className="text-2xl font-black text-blue-600">
                ${contract.escrowAmount.toFixed(0)}
              </p>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-1">
                In Escrow
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/40 bg-card/60">
            <CardContent className="p-5 text-center">
              <p className="text-2xl font-black text-slate-500">
                ${contract.pendingAmount.toFixed(0)}
              </p>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-1">
                Pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card className="rounded-2xl border-border/40 bg-card/60">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-black">Project Progress</span>
              <span className="font-black text-primary">
                {approvedCount}/{contract.milestones.length} milestones approved
              </span>
            </div>
            <Progress value={progress} className="h-3 rounded-full" />
          </CardContent>
        </Card>

        {/* Milestones */}
        <div className="space-y-4">
          <h2 className="text-xl font-black">Milestones</h2>
          {contract.milestones.map((milestone, index) => {
            const cfg = statusConfig[milestone.status];
            const isProcessing = processingId === milestone.id;
            const canStart = milestone.status === "FUNDED";
            const canSubmit = ["IN_PROGRESS", "FUNDED", "REVISION_REQUESTED"].includes(
              milestone.status
            );

            return (
              <Card
                key={milestone.id}
                className={cn(
                  "rounded-2xl border-border/40 bg-card/60 transition-all duration-300",
                  milestone.status === "APPROVED" && "opacity-70",
                  canSubmit && "border-primary/30 shadow-primary/10 shadow-md"
                )}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0",
                          milestone.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-600"
                            : canSubmit
                            ? "bg-primary/10 text-primary"
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
                        <h3 className="font-black text-base">{milestone.title}</h3>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground">
                            {milestone.description}
                          </p>
                        )}
                        {milestone.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3" />
                            Due:{" "}
                            {new Date(milestone.dueDate).toLocaleDateString()}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs mt-1.5">
                          <RotateCcw className={cn(
                            "w-3 h-3 text-orange-500",
                            milestone.allowedRevisions !== -1 && milestone.revisionsUsed >= milestone.allowedRevisions && "text-red-500"
                          )} />
                          <span className="text-muted-foreground font-bold">
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
                  {milestone.revisionNote && (
                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <p className="text-xs font-black text-orange-600 mb-1">
                        Client Revision Request:
                      </p>
                      <p className="text-sm">{milestone.revisionNote}</p>
                    </div>
                  )}

                  {/* Status-appropriate action */}
                  <div className="flex flex-wrap gap-3 pt-2 border-t border-border/40">
                    {milestone.status === "PENDING" && (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold">
                        <Lock className="w-4 h-4" />
                        Waiting for client to fund this milestone
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
                        className="gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black"
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
                        Submit Deliverables
                      </Button>
                    )}

                    {milestone.status === "SUBMITTED" && (
                      <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                        <Package className="w-4 h-4" />
                        Submitted on{" "}
                        {milestone.submittedAt &&
                          new Date(
                            milestone.submittedAt
                          ).toLocaleDateString()} — Awaiting client review
                      </div>
                    )}

                    {milestone.status === "APPROVED" && (
                      <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                        <CheckCircle2 className="w-4 h-4" />$
                        {milestone.amount.toLocaleString()} released to your
                        account
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contract complete */}
        {contract.status === "COMPLETED" && (
          <Card className="rounded-2xl border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              Contract Completed! 🎉
            </h2>
            <p className="text-muted-foreground mt-2">
              All milestones approved. Great work!
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
              <DialogTitle className="font-black">
                Submit Deliverables
              </DialogTitle>
              <DialogDescription>
                Describe your work and/or attach files for the client's review.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                  className="rounded-xl mt-2"
                />
              </div>

              <div>
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  Attachments (Optional)
                </Label>
                <div className="mt-2 border-2 border-dashed border-border/40 rounded-xl p-6 text-center relative">
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
                      const valid = selected.filter((f) => ALLOWED.includes(f.type));
                      const invalid = selected.filter((f) => !ALLOWED.includes(f.type));

                      if (invalid.length > 0) {
                        toast.error(`${invalid.length} file(s) skipped — only JPG, PNG, PDF, Word, TXT, and ZIP are allowed.`);
                      }

                      setSubmitModal((p) => ({
                        ...p,
                        files: [...p.files, ...valid].slice(0, 5),
                      }));
                      e.target.value = "";
                    }}
                  />
                  <UploadCloud className="w-8 h-8 text-primary/60 mx-auto mb-2" />
                  <p className="text-sm font-bold text-muted-foreground">
                    Click to upload files
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, PDF, Word, TXT, ZIP — Max 5 files
                  </p>
                </div>
                {submitModal.files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {submitModal.files.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs font-bold p-2 bg-muted/30 rounded-lg"
                      >
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        {f.name}
                        <button
                          className="ml-auto text-red-500 hover:text-red-600"
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
                  className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black"
                  onClick={handleSubmit}
                  disabled={!!processingId}
                >
                  {processingId ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <UploadCloud className="w-4 h-4 mr-2" />
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
