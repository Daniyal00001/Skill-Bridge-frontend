import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  FileText,
  ListChecks,
  Plus,
  Trash2,
  AlertCircle,
  Shield,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface MilestoneInput {
  title: string;
  description: string;
  amount: string;
  dueDate: string;
  allowedRevisions: string;
}

const ProjectProposalsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isProcessing, setIsProcessing] = useState(false); // Added for handleDirectHire

  // Milestone modal state
  const [milestoneModal, setMilestoneModal] = useState<{
    open: boolean;
    proposalId: string;
    mode: "setup" | "edit";
    purpose: "HIRE" | "NEGOTIATE";
    milestones: MilestoneInput[];
    bidAmount: number;
  }>({
    open: false,
    proposalId: "",
    mode: "setup",
    purpose: "HIRE",
    milestones: [],
    bidAmount: 0,
  });

  // Revision request modal state
  const [revisionModal, setRevisionModal] = useState<{
    open: boolean;
    proposalId: string;
    freelancerRevisions: number;
    requested: string;
  }>({
    open: false,
    proposalId: "",
    freelancerRevisions: 3,
    requested: "5",
  });

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
      await api.patch(`/proposals/${proposal.id}/status`, { status: "ACCEPTED" });
      toast.success("Freelancer hired successfully! 🚀");
      navigate("/client/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to hire freelancer");
    } finally {
      setIsProcessing(false);
    }
  };

  const openRevisionModal = (proposal: any) => {
    setRevisionModal({
      open: true,
      proposalId: proposal.id,
      freelancerRevisions:
        proposal.generalRevisionLimit === -1 ? -1 : proposal.generalRevisionLimit || 3,
      requested: String(
        (proposal.generalRevisionLimit === -1 ? 5 : (proposal.generalRevisionLimit || 3)) + 2
      ),
    });
  };

  const handleSubmitRevisionRequest = async () => {
    try {
      setProcessingId(revisionModal.proposalId);
      await api.post(`/proposals/${revisionModal.proposalId}/request-revisions`, {
        requestedRevisions: Number(revisionModal.requested),
      });
      toast.success("Revision request sent to freelancer.");
      setRevisionModal({ open: false, proposalId: "", freelancerRevisions: 3, requested: "5" });
      const res = await api.get(`/proposals/project/${projectId}`);
      setProposals(res.data.proposals);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send revision request.");
    } finally {
      setProcessingId(null);
    }
  };

  const getActiveMilestones = (proposal: any) => {
    return (proposal.negotiationStatus === "FREELANCER_ACCEPTED" || proposal.negotiationStatus === "CLIENT_PROPOSED") && proposal.clientRequestedMilestones
      ? proposal.clientRequestedMilestones
      : proposal.proposalMilestones || [];
  };

  // Opens the milestone modal for NEGOTIATION (Suggesting changes)
  const openNegotiationModal = (proposal: any) => {
    const rawMilestones: any[] = getActiveMilestones(proposal);
    setMilestoneModal({
      open: true,
      proposalId: proposal.id,
      purpose: "NEGOTIATE",
      mode: rawMilestones.length > 0 ? "edit" : "setup",
      bidAmount: proposal.bidAmount || 0,
      milestones: rawMilestones.length > 0
        ? rawMilestones.map((m: any) => ({
            title: m.title || "",
            description: m.description || "",
            amount: String(m.amount || ""),
            dueDate: m.dueDate ? m.dueDate.substring(0, 10) : "",
            allowedRevisions: String(m.allowedRevisions || 3),
          }))
        : [{ title: "", description: "", amount: "", dueDate: "", allowedRevisions: "3" }],
    });
  };

  // The direct hire logic has replaced openHireModal. Missing milestones are now routed to openNegotiationModal.

  const confirmAction = async () => {
    const { proposalId, milestones, purpose, bidAmount } = milestoneModal;

    // Validate milestones
    for (const m of milestones) {
      if (!m.title.trim() || !m.amount) {
        toast.error("Each milestone needs a title and amount.");
        return;
      }
      if (Number(m.amount) <= 0) {
        toast.error("Milestone amounts must be greater than 0.");
        return;
      }
    }
    const total = milestones.reduce((s, m) => s + Number(m.amount), 0);
    if (Math.abs(total - bidAmount) > 0.01) {
      toast.error(
        `Milestone amounts must add up to the bid amount ($${bidAmount.toLocaleString()}).`,
        { description: `Current total: $${total.toFixed(2)}` }
      );
      return;
    }

    setProcessingId(proposalId);
    try {
      if (purpose === "NEGOTIATE") {
        await api.post(`/proposals/${proposalId}/negotiate`, {
          milestones: milestones.map((m, i) => ({
            title: m.title,
            description: m.description || undefined,
            amount: Number(m.amount),
            dueDate: m.dueDate || undefined,
            allowedRevisions: Number(m.allowedRevisions),
            order: i,
          })),
        });
        toast.success("Changes suggested to the freelancer. Waiting for approval.");
        setMilestoneModal({
          open: false,
          proposalId: "",
          mode: "setup",
          purpose: "HIRE",
          milestones: [],
          bidAmount: 0,
        });
        const res = await api.get(`/proposals/project/${projectId}`);
        setProposals(res.data.proposals);
      }
      // purpose: "HIRE" branch has been removed as direct hire takes place without the modal.
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to process request.");
    } finally {
      setProcessingId(null);
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
          p.id === proposalId ? { ...p, status: "SHORTLISTED" } : p
        )
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
      await api.patch(`/proposals/${proposalId}/status`, { status: "REJECTED" });
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, status: "REJECTED" } : p
        )
      );
      toast.success("Proposal rejected.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject proposal");
    } finally {
      setProcessingId(null);
    }
  };

  const addMilestone = () =>
    setMilestoneModal((p) => ({
      ...p,
      milestones: [
        ...p.milestones,
        { title: "", description: "", amount: "", dueDate: "", allowedRevisions: "3" },
      ],
    }));

  const removeMilestone = (idx: number) =>
    setMilestoneModal((p) => ({
      ...p,
      milestones: p.milestones.filter((_, i) => i !== idx),
    }));

  const updateMilestone = (idx: number, field: keyof MilestoneInput, value: string) =>
    setMilestoneModal((p) => ({
      ...p,
      milestones: p.milestones.map((m, i) =>
        i === idx
          ? {
              ...m,
              [field]:
                field === "amount"
                  ? value === ""
                    ? ""
                    : String(Math.max(0, Number(value)))
                  : value,
            }
          : m
      ),
    }));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading proposals...</p>
        </div>
      </DashboardLayout>
    );
  }

  const pendingCount = proposals.filter((p) => p.status === "PENDING").length;
  const acceptedCount = proposals.filter((p) => p.status === "ACCEPTED").length;
  const shortlistedCount = proposals.filter((p) => p.status === "SHORTLISTED").length;

  const displayedProposals =
    activeTab === "all"
      ? proposals
      : proposals.filter((p) => p.status === activeTab.toUpperCase());

  const milestoneTotal = milestoneModal.milestones.reduce(
    (s, m) => s + Number(m.amount || 0),
    0
  );
  const milestoneTotalMatch =
    Math.abs(milestoneTotal - milestoneModal.bidAmount) < 0.01;

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
                        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
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
                <div className="text-center p-4 rounded-2xl bg-muted/30 border border-border/40 min-w-[70px]">
                  <p className="text-2xl font-black text-primary">
                    {proposals.length}
                  </p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Total
                  </p>
                </div>
                <div className="text-center p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 min-w-[70px]">
                  <p className="text-2xl font-black text-amber-600">
                    {pendingCount}
                  </p>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Pending
                  </p>
                </div>
                {shortlistedCount > 0 && (
                  <div className="text-center p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 min-w-[70px]">
                    <p className="text-2xl font-black text-blue-600">
                      {shortlistedCount}
                    </p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Shortlisted
                    </p>
                  </div>
                )}
                {acceptedCount > 0 && (
                  <div className="text-center p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 min-w-[70px]">
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
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <p className="font-black text-emerald-700 dark:text-emerald-400">
                Freelancer hired!
              </p>
              <p className="text-sm text-muted-foreground">
                Contract has been created with milestones defined.
              </p>
            </div>
            <Button
              size="sm"
              className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
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
                Your project is live. Freelancers will start sending proposals soon.
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
                  onNegotiate={() => openNegotiationModal(proposal)}
                  onRequestRevisions={() => openRevisionModal(proposal)}
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

      {/* ── Revision Request Modal ── */}
      <Dialog
        open={revisionModal.open}
        onOpenChange={(o) => {
          if (!o)
            setRevisionModal({ open: false, proposalId: "", freelancerRevisions: 3, requested: "5" });
        }}
      >
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black text-xl flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Request More Revisions
            </DialogTitle>
            <DialogDescription>
              The freelancer offered{" "}
              <strong>
                {revisionModal.freelancerRevisions === -1
                  ? "unlimited"
                  : revisionModal.freelancerRevisions}
              </strong>{" "}
              revision{revisionModal.freelancerRevisions !== 1 ? "s" : ""}. You can request more
              below. The freelancer must accept before you hire.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Revisions You Need
              </Label>
              <Select
                value={revisionModal.requested}
                onValueChange={(v) =>
                  setRevisionModal((p) => ({ ...p, requested: v }))
                }
              >
                <SelectTrigger className="h-10 rounded-xl bg-background/60">
                  <SelectValue placeholder="Select revisions" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border/40">
                  {[1, 2, 3, 5, 7, 10].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} Revision{n !== 1 ? "s" : ""}
                    </SelectItem>
                  ))}
                  <SelectItem value="-1">Unlimited Revisions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() =>
                  setRevisionModal({ open: false, proposalId: "", freelancerRevisions: 3, requested: "5" })
                }
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-white font-black gap-2"
                onClick={handleSubmitRevisionRequest}
                disabled={!!processingId}
              >
                {processingId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Send Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Milestone Setup / Edit Modal ── */}
      <Dialog
        open={milestoneModal.open}
        onOpenChange={(o) => {
          if (!o)
            setMilestoneModal({
              open: false,
              proposalId: "",
              mode: "setup",
              purpose: "HIRE",
              milestones: [],
              bidAmount: 0,
            });
        }}
      >
        <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-black text-xl flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-primary" />
              {milestoneModal.purpose === "NEGOTIATE"
                ? milestoneModal.mode === "setup"
                  ? "Define & Propose Milestone Plan"
                  : "Suggest Milestone Changes"
                : "Review & Edit Milestone Plan"}
            </DialogTitle>
            <DialogDescription>
              {milestoneModal.purpose === "NEGOTIATE"
                ? milestoneModal.mode === "setup"
                  ? "No milestones were provided. Define the payment plan and revision limits, then send it to the freelancer for approval."
                  : "Suggest changes to the freelancer's milestones. If you submit changes, the freelancer must review and approve them before the contract can begin."
                : "The freelancer proposed these milestones. You can edit titles, amounts, and revision limits before finalizing the contract."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            {/* Info banner */}
            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 leading-relaxed">
                Milestone amounts must total exactly{" "}
                <strong>${(milestoneModal.bidAmount || 0).toLocaleString()}</strong>{" "}
                (the agreed bid). Work begins only after you fund each
                milestone.
              </p>
            </div>

            {/* Milestones */}
            <div className="space-y-4">
              {milestoneModal.milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-border/40 bg-muted/20 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-muted-foreground uppercase tracking-widest">
                      Milestone {idx + 1}
                    </span>
                    {milestoneModal.milestones.length > 1 && (
                      <button
                        onClick={() => removeMilestone(idx)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Title *
                      </Label>
                      <Input
                        value={m.title}
                        onChange={(e) =>
                          updateMilestone(idx, "title", e.target.value)
                        }
                        placeholder="e.g. UI Design"
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Amount ($) *
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          value={m.amount}
                          onChange={(e) =>
                            updateMilestone(idx, "amount", e.target.value)
                          }
                          placeholder="500"
                          className="h-10 pl-9 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Description
                      </Label>
                      <Textarea
                        value={m.description}
                        onChange={(e) =>
                          updateMilestone(idx, "description", e.target.value)
                        }
                        rows={3}
                        placeholder="What will be delivered?"
                        className="rounded-xl bg-background/60 p-3 resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Due Date (Optional)
                      </Label>
                      <Input
                        type="date"
                        value={m.dueDate}
                        onChange={(e) =>
                          updateMilestone(idx, "dueDate", e.target.value)
                        }
                        className="h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Allowed Revisions
                      </Label>
                      <Select
                        value={m.allowedRevisions}
                        onValueChange={(val) =>
                          updateMilestone(idx, "allowedRevisions", val)
                        }
                      >
                        <SelectTrigger className="h-10 rounded-xl bg-background/60">
                          <SelectValue placeholder="Select revisions" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/40">
                          <SelectItem value="1">1 Revision</SelectItem>
                          <SelectItem value="2">2 Revisions</SelectItem>
                          <SelectItem value="3">3 Revisions (Standard)</SelectItem>
                          <SelectItem value="5">5 Revisions</SelectItem>
                          <SelectItem value="10">10 Revisions</SelectItem>
                          <SelectItem value="-1">Unlimited Revisions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addMilestone}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-black text-primary hover:bg-primary/10 transition-colors border-2 border-dashed border-primary/20"
            >
              <Plus className="w-4 h-4" /> Add Another Milestone
            </button>

            {/* Total validation */}
            <div
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border-2",
                milestoneTotalMatch
                  ? "bg-emerald-500/5 border-emerald-500/30"
                  : "bg-red-500/5 border-red-500/30"
              )}
            >
              <div className="flex items-center gap-2">
                {milestoneTotalMatch ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
                <span className="font-black text-sm">
                  {milestoneTotalMatch
                    ? "Milestone total matches bid"
                    : "Amounts must match bid"}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={cn(
                    "font-black text-lg",
                    milestoneTotalMatch ? "text-emerald-600" : "text-red-500"
                  )}
                >
                  ${milestoneTotal.toLocaleString()}
                </span>
                <span className="text-muted-foreground font-medium text-sm ml-1">
                  / ${(milestoneModal.bidAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() =>
                  setMilestoneModal({
                    open: false,
                    proposalId: "",
                    mode: "setup",
                    milestones: [],
                    bidAmount: 0,
                  })
                }
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black gap-2"
                onClick={confirmAction}
                disabled={!!processingId || !milestoneTotalMatch}
              >
                {processingId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {milestoneModal.purpose === "NEGOTIATE" 
                  ? milestoneModal.mode === "setup" 
                    ? "Send Plan for Approval" 
                    : "Send Edit Request" 
                  : "Confirm & Create Contract"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

// ─── Proposal Card (updated) ────────────────────────────────────────────────────
const ProposalCard = ({
  proposal,
  isExpanded,
  onToggleExpand,
  onHire,
  onNegotiate,
  onRequestRevisions,
  onShortlist,
  onReject,
  isProcessing,
  projectBudget,
}: {
  proposal: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onHire: () => void;
  onNegotiate: () => void;
  onRequestRevisions: () => void;
  onShortlist: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing: boolean;
  projectBudget?: number;
}) => {
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
      ? Math.round(
          ((proposal.bidAmount - projectBudget) / projectBudget) * 100
        )
      : null;

  const activeMilestones = (proposal.negotiationStatus === "FREELANCER_ACCEPTED" || proposal.negotiationStatus === "CLIENT_PROPOSED") && proposal.clientRequestedMilestones
      ? proposal.clientRequestedMilestones
      : proposal.proposalMilestones || [];
  
  const hasMilestones = Array.isArray(activeMilestones) && activeMilestones.length > 0;

  return (
    <Card
      className={cn(
        "border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300 overflow-hidden",
        status === "ACCEPTED" && "border-emerald-500/30 bg-emerald-500/5",
        status === "REJECTED" && "opacity-60",
        status === "WITHDRAWN" && "opacity-50 grayscale-0 border-gray-500/10 bg-muted/10 ring-0",
        status === "PENDING" && "hover:border-primary/30 hover:shadow-lg"
      )}
    >
      <CardContent className="p-6 space-y-6">
        {status === "WITHDRAWN" && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm font-bold text-amber-700 leading-tight">
              Freelancer has withdrawn this proposal. You can no longer hire or negotiate for this bid.
            </p>
          </div>
        )}
        {/* Top Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-4 ring-border/40">
                <AvatarImage src={freelancer?.profileImage} />
                <AvatarFallback className="text-lg font-black">
                  {freelancer?.name?.[0] || "F"}
                </AvatarFallback>
              </Avatar>
              {hasMilestones && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <ListChecks className="w-3 h-3 text-white" />
                </div>
              )}
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
                {hasMilestones && (
                  <div className="flex items-center gap-1 text-xs font-bold text-primary">
                    <ListChecks className="w-3 h-3" />{" "}
                    {activeMilestones.length} milestones
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

        {/* Negotiation Comparison Banner */}
        {(proposal.negotiationStatus === "CLIENT_PROPOSED" || proposal.negotiationStatus === "FREELANCER_ACCEPTED") && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-3">
             <div className="flex items-center gap-2 text-primary">
                <ListChecks className="w-4 h-4" />
                <h4 className="text-sm font-black uppercase tracking-wider">Negotiation Summary</h4>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Freelancer's Original</p>
                  <p className="text-xs font-bold">Revisions: <span className="text-muted-foreground">{proposal.generalRevisionLimit === -1 ? "Unlimited" : (proposal.generalRevisionLimit || 3)}</span></p>
                  <p className="text-[10px] text-muted-foreground">Milestones: {proposal.proposalMilestones?.length || 0}</p>
                </div>
                <div className="space-y-1 border-l border-border/40 pl-4">
                  <p className="text-[10px] font-black text-primary uppercase">{proposal.negotiationStatus === "FREELANCER_ACCEPTED" ? "Agreed Plan" : "Your Request"}</p>
                  <p className="text-xs font-bold">Revisions: <span className="text-primary">{proposal.clientRequestedMilestones?.[0]?.allowedRevisions === -1 ? "Unlimited" : (proposal.clientRequestedMilestones?.[0]?.allowedRevisions || proposal.generalRevisionLimit || 3)}</span></p>
                  <p className="text-[10px] text-primary">Milestones: {proposal.clientRequestedMilestones?.length || 0}</p>
                </div>
             </div>
             {proposal.negotiationStatus === "CLIENT_PROPOSED" ? (
                <p className="text-[10px] italic text-muted-foreground pt-1 border-t border-border/20">
                  Waiting for the freelancer to review and accept these changes.
                </p>
             ) : (
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-1 border-t border-emerald-500/20 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {freelancer?.name || "The freelancer"} has accepted your changes! You can now hire them to start the contract.
                </p>
             )}
          </div>
        )}

        {/* Bid Details */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-muted/30 border border-border/40">
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
                  budgetDiff > 0 ? "text-red-500" : "text-emerald-500"
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
            <p className="text-lg font-black">
              {hasMilestones 
                ? "Milestone-based" 
                : ((proposal.generalRevisionLimit === -1 || proposal.generalRevisionLimit === "-1") ? "Unlimited" : `${proposal.generalRevisionLimit || 3}`)}
            </p>
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
              onClick={() => setMilestoneExpanded((p) => !p)}
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
                      i % 2 === 0 ? "bg-muted/20" : "bg-background/40"
                    )}
                  >
                    <div>
                      <span className="font-black">
                        {i + 1}. {m.title}
                      </span>
                      <Badge variant="outline" className="ml-2 text-[9px] font-bold py-0 h-4 border-primary/20 bg-primary/5 text-primary">
                        {m.allowedRevisions === -1 || m.allowedRevisions === "-1" ? "Unlimited Revisions" : `${m.allowedRevisions || 3} Revisions`}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNegotiate();
                        }}
                        title="Negotiate/Edit this milestone"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
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
            <div className="bg-muted/30 p-5 rounded-2xl border border-border/40 relative group/cover">
              <div
                className={cn(
                  "text-sm text-foreground/80 leading-relaxed transition-all duration-300 prose prose-sm dark:prose-invert max-w-none prose-p:mb-4 last:prose-p:mb-0 whitespace-pre-wrap",
                  !isExpanded && "line-clamp-[5] max-h-[120px] overflow-hidden"
                )}
                dangerouslySetInnerHTML={{ __html: proposal.coverLetter }}
              />
              {!isExpanded && (
                 <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-muted/50 to-transparent pointer-events-none rounded-b-2xl" />
              )}
            </div>
            <button
              onClick={onToggleExpand}
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

        {/* Attachments */}
        {proposal.attachments && proposal.attachments.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3 h-3" /> Attachments (
              {proposal.attachments.length})
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
                      <div className="w-20 h-14 rounded-lg overflow-hidden border border-border/20">
                        <img
                          src={url}
                          alt="attachment"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-14 rounded-lg bg-background flex items-center justify-center border border-border/20">
                        <FileText className="w-6 h-6 text-muted-foreground" />
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

        {/* Action Buttons — for PENDING or SHORTLISTED */}
        {(status === "PENDING" || status === "SHORTLISTED") && (
          <div className="space-y-3 pt-2 border-t border-border/40">
            {/* Primary hire row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 h-12 rounded-xl font-black text-base gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                onClick={onHire}
                disabled={
                  isProcessing ||
                  proposal.negotiationStatus === "CLIENT_PROPOSED" ||
                  proposal.negotiationStatus === "CLIENT_PROPOSED_REVISIONS"
                }
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                {isProcessing
                  ? "Processing..."
                  : proposal.negotiationStatus === "CLIENT_PROPOSED"
                  ? "Waiting for Freelancer..."
                  : proposal.negotiationStatus === "CLIENT_PROPOSED_REVISIONS"
                  ? "Waiting for Freelancer..."
                  : proposal.negotiationStatus === "FREELANCER_ACCEPTED"
                  ? "Accept & Hire Freelancer"
                  : "Hire Freelancer"}
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

            {/* Optional negotiation actions — only show when not already in a pending negotiation */}
            {!proposal.negotiationStatus && (
              <div className="flex flex-wrap gap-2">
                {!hasMilestones && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-xs font-bold border-primary/30 text-primary hover:bg-primary/5 gap-1.5"
                      onClick={onRequestRevisions}
                      disabled={isProcessing}
                    >
                      <Edit2 className="w-3 h-3" /> Request More Revisions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-lg text-xs font-bold border-blue-500/30 text-blue-600 hover:bg-blue-500/5 gap-1.5"
                      onClick={onNegotiate}
                      disabled={isProcessing}
                    >
                      <ListChecks className="w-3 h-3" /> Add Milestones
                    </Button>
                  </>
                )}
                {hasMilestones && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs font-bold border-border/50 text-muted-foreground hover:text-primary gap-1.5"
                    onClick={onNegotiate}
                    disabled={isProcessing}
                  >
                    <Edit2 className="w-3 h-3" /> Edit Milestones
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectProposalsPage;
