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
  Star,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
  Clock,
  Briefcase,
  ExternalLink,
  ListChecks,
  AlertCircle,
  Loader2,
  ChevronRight,
  Plus,
  Trash2,
  Shield,
  Edit2,
  PlusCircle,
  DollarSign,
  History,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MilestoneInput {
  title: string;
  description: string;
  amount: string;
  dueDate: string;
  allowedRevisions: string;
}

const ClientProposalDetail = () => {
  const { projectId, proposalId } = useParams();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

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

  const milestoneTotal = milestoneModal.milestones.reduce(
    (s, m) => s + Number(m.amount || 0),
    0,
  );
  const milestoneTotalMatch =
    Math.abs(milestoneTotal - milestoneModal.bidAmount) < 0.01;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [proposalRes, projectRes] = await Promise.all([
          api.get(`/proposals/${proposalId}`),
          api.get(`/projects/${projectId}`),
        ]);
        setProposal(proposalRes.data.proposal);
        setProject(projectRes.data.project);
      } catch (err) {
        toast.error("Failed to load proposal details");
        navigate(`/client/projects/${projectId}/proposals`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId, proposalId, navigate]);

  const handleStatusUpdate = async (newStatus: string) => {
    setProcessingAction(newStatus);
    try {
      await api.patch(`/proposals/${proposalId}/status`, { status: newStatus });
      toast.success(
        newStatus === "ACCEPTED"
          ? "Freelancer hired! 🚀"
          : `Proposal ${newStatus.toLowerCase()}!`,
      );

      if (newStatus === "ACCEPTED") {
        try {
          const res = await api.get(`/contracts/project/${projectId}`);
          navigate(`/client/contracts/${res.data.contract.id}`);
        } catch {
          navigate("/client/dashboard");
        }
      } else {
        setProposal({ ...proposal, status: newStatus });
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          `Failed to update status to ${newStatus}`,
      );
    } finally {
      setProcessingAction(null);
    }
  };

  const openRevisionModal = () => {
    setRevisionModal({
      open: true,
      proposalId: proposal.id,
      freelancerRevisions:
        proposal.generalRevisionLimit === -1
          ? -1
          : proposal.generalRevisionLimit || 3,
      requested: String(
        (proposal.generalRevisionLimit === -1
          ? 5
          : proposal.generalRevisionLimit || 3) + 2,
      ),
    });
  };

  const handleSubmitRevisionRequest = async () => {
    try {
      setProcessingAction("REVISION_REQUEST");
      await api.post(`/proposals/${proposalId}/request-revisions`, {
        requestedRevisions: Number(revisionModal.requested),
      });
      toast.success("Revision request sent to freelancer.");
      setRevisionModal({
        open: false,
        proposalId: "",
        freelancerRevisions: 3,
        requested: "5",
      });
      const res = await api.get(`/proposals/${proposalId}`);
      setProposal(res.data.proposal);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to send revision request.",
      );
    } finally {
      setProcessingAction(null);
    }
  };

  const getActiveMilestonesList = (p: any) => {
    return (p.negotiationStatus === "FREELANCER_ACCEPTED" ||
      p.negotiationStatus === "CLIENT_PROPOSED") &&
      p.clientRequestedMilestones
      ? p.clientRequestedMilestones
      : p.proposalMilestones || [];
  };

  const openNegotiationModal = () => {
    const rawMilestones: any[] = getActiveMilestonesList(proposal);
    setMilestoneModal({
      open: true,
      proposalId: proposal.id,
      purpose: "NEGOTIATE",
      mode: rawMilestones.length > 0 ? "edit" : "setup",
      bidAmount: proposal.bidAmount || 0,
      milestones:
        rawMilestones.length > 0
          ? rawMilestones.map((m: any) => ({
              title: m.title || "",
              description: m.description || "",
              amount: String(m.amount || ""),
              dueDate: m.dueDate ? m.dueDate.substring(0, 10) : "",
              allowedRevisions: String(m.allowedRevisions || 3),
            }))
          : [
              {
                title: "",
                description: "",
                amount: "",
                dueDate: "",
                allowedRevisions: "3",
              },
            ],
    });
  };

  const confirmNegotiation = async () => {
    const { milestones, bidAmount } = milestoneModal;

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
        { description: `Current total: $${total.toFixed(2)}` },
      );
      return;
    }

    setProcessingAction("NEGOTIATE");
    try {
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
      toast.success(
        "Changes suggested to the freelancer. Waiting for approval.",
      );
      setMilestoneModal({
        open: false,
        proposalId: "",
        mode: "setup",
        purpose: "HIRE",
        milestones: [],
        bidAmount: 0,
      });
      const res = await api.get(`/proposals/${proposalId}`);
      setProposal(res.data.proposal);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to process request.");
    } finally {
      setProcessingAction(null);
    }
  };

  const addMilestone = () =>
    setMilestoneModal((p) => ({
      ...p,
      milestones: [
        ...p.milestones,
        {
          title: "",
          description: "",
          amount: "",
          dueDate: "",
          allowedRevisions: "3",
        },
      ],
    }));

  const removeMilestone = (idx: number) =>
    setMilestoneModal((p) => ({
      ...p,
      milestones: p.milestones.filter((_, i) => i !== idx),
    }));

  const updateMilestone = (
    idx: number,
    field: keyof MilestoneInput,
    value: string,
  ) =>
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
          : m,
      ),
    }));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-black animate-pulse uppercase tracking-[0.2em] text-[10px]">
            Loading Professional Review...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!proposal || !project) return null;

  const freelancer = proposal.freelancer;
  const milestones =
    (proposal.negotiationStatus === "FREELANCER_ACCEPTED" ||
      proposal.negotiationStatus === "CLIENT_PROPOSED") &&
    proposal.clientRequestedMilestones
      ? proposal.clientRequestedMilestones
      : proposal.proposalMilestones || [];

  return (
    <DashboardLayout>
      <div className="container max-w-6xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="h-12 w-12 rounded-2xl bg-muted/50 hover:bg-muted"
              onClick={() =>
                navigate(`/client/projects/${projectId}/proposals`)
              }
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Review Proposal
              </h1>
              <p className="text-muted-foreground font-medium flex items-center gap-2 mt-1">
                Project:{" "}
                <span className="text-foreground font-bold">
                  {project.title}
                </span>
              </p>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-4 py-1.5 rounded-xl uppercase tracking-widest text-[10px]">
            {proposal.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Withdrawn/Cancelled Status Banner */}
            {(proposal.status === "WITHDRAWN" || proposal.status === "CANCELLED") && (
              <div className="bg-amber-500/10 border-amber-500/20 p-4 rounded-[1.5rem] flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm border-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div className="space-y-1 py-1">
                  <h4 className="text-base font-black text-amber-900 dark:text-amber-400 uppercase tracking-tight">
                    Proposal No Longer Available
                  </h4>
                  <p className="text-sm font-bold text-amber-800/80 dark:text-amber-400/80 leading-relaxed">
                    Freelancer has withdrawn this proposal. You can no longer hire
                    or negotiate for this bid.
                  </p>
                </div>
              </div>
            )}

            {/* Freelancer Header */}
            <Card className="border-border/40 bg-card/60 backdrop-blur-xl rounded-[1.5rem] overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <Avatar className="h-24 w-24 ring-8 ring-primary/5">
                    <AvatarImage src={freelancer?.profileImage} />
                    <AvatarFallback className="text-3xl font-black">
                      {freelancer?.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h2 className="text-xl font-black tracking-tight">
                          {freelancer?.name}
                        </h2>
                        <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest opacity-60">
                          {freelancer?.title || "Professional Developer"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-lg font-black text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-xl">
                        <Star className="w-4 h-4 fill-amber-500" />
                        {freelancer?.rating?.toFixed(1) || "5.0"}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                        <Briefcase className="w-4 h-4 text-primary/60" />
                        {freelancer?.completedProjects || 0} Projects Completed
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground border-l border-border/40 pl-4">
                        <Clock className="w-4 h-4 text-primary/60" />
                        Joined{" "}
                        {new Date(freelancer?.createdAt).toLocaleDateString(
                          undefined,
                          { month: "long", year: "numeric" },
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cover Letter Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 ml-2">
                <div className="w-1.5 h-6 bg-primary rounded-full" />
                <h3 className="text-xl font-black tracking-tight">
                  Cover Letter
                </h3>
              </div>
              <Card className="border-border/40 bg-card/40 backdrop-blur-sm rounded-[1.5rem] overflow-hidden">
                <CardContent className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                  <div
                    className="prose prose-base dark:prose-invert max-w-none break-words prose-p:leading-relaxed prose-p:text-foreground/90 prose-p:mb-4 last:prose-p:mb-0 prose-headings:font-black prose-strong:font-black"
                    dangerouslySetInnerHTML={{ __html: proposal.coverLetter }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Milestone Plan Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 ml-2 pr-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-primary rounded-full" />
                  <h3 className="text-xl font-black tracking-tight">
                    Milestone Strategy
                  </h3>
                </div>
                {proposal.status !== "ACCEPTED" &&
                  proposal.status !== "REJECTED" &&
                  proposal.status !== "WITHDRAWN" &&
                  proposal.status !== "CANCELLED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 rounded-2xl font-black gap-2 text-primary hover:bg-primary/10 bg-primary/5 px-4"
                      onClick={openNegotiationModal}
                    >
                      <Edit2 className="w-4 h-4" />
                      {milestones.length === 0 ? "Setup Plan" : "Edit Plan"}
                    </Button>
                  )}
              </div>

              {/* Milestone Plan Sections */}
              {proposal.negotiationStatus === "CLIENT_PROPOSED" ? (
                <div className="space-y-10">
                  {/* Freelancer's Original Plan */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                      <div className="w-1 h-3 bg-muted-foreground/30 rounded-full" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">
                        Freelancer's Original Plan
                      </p>
                    </div>
                    <MilestoneList
                      items={proposal.proposalMilestones || []}
                      variant="original"
                    />
                  </div>

                  {/* Client's Proposed Changes */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                      <div className="w-1 h-3 bg-primary rounded-full" />
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest pl-1">
                        Your Proposed Changes
                      </p>
                    </div>
                    <MilestoneList
                      items={proposal.clientRequestedMilestones || []}
                      variant="requested"
                    />
                  </div>
                </div>
              ) : milestones.length > 0 ? (
                <MilestoneList items={milestones} />
              ) : (
                <Card className="border-dashed border-2 border-border/40 bg-muted/5 rounded-[1.5rem] p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
                    <ListChecks className="w-6 h-6 text-primary/40" />
                  </div>
                  <h4 className="text-lg font-black opacity-80 mb-2">
                    No Milestone Plan Defined
                  </h4>
                  <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto mb-8">
                    Defining milestones early ensures payment clarity and
                    project predictability. You can propose a custom milestone
                    schedule to the freelancer.
                  </p>
                  <Button
                    variant="outline"
                    className="h-12 rounded-xl font-black gap-2 border-2 border-primary/20 text-primary hover:bg-primary/5 px-8"
                    onClick={openNegotiationModal}
                  >
                    <Plus className="w-4 h-4" /> Setup Milestone Strategy
                  </Button>
                </Card>
              )}
            </div>

            {/* Attachments Section */}
            {proposal.attachments && proposal.attachments.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 ml-2">
                  <div className="w-1.5 h-6 bg-primary rounded-full" />
                  <h3 className="text-xl font-black tracking-tight">
                    Supporting Documents ({proposal.attachments.length})
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {proposal.attachments.map((url: string, i: number) => {
                    const isImage = url.match(
                      /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i,
                    );
                    return (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex flex-col items-center gap-3 p-4 rounded-[2rem] bg-card/60 border border-border/40 hover:bg-primary/5 hover:border-primary/20 transition-all overflow-hidden"
                      >
                        {isImage ? (
                          <div className="w-full aspect-video rounded-2xl overflow-hidden border border-border/20 shadow-sm">
                            <img
                              src={url}
                              alt="attachment"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <div className="w-full aspect-video rounded-2xl bg-muted/50 flex items-center justify-center border border-border/20 group-hover:scale-105 transition-transform duration-500">
                            <FileText className="w-10 h-10 text-muted-foreground/40" />
                          </div>
                        )}
                        <span className="text-[10px] font-black uppercase text-muted-foreground text-center line-clamp-1">
                          Attachment {i + 1}
                        </span>
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-primary text-white p-2 rounded-xl shadow-xl shadow-primary/20 scale-90 group-hover:scale-100 transition-transform">
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Actions (Right) */}
          <div className="space-y-6 lg:sticky lg:top-8 self-start">
            {/* Action Card */}
            <Card className="border-primary/20 bg-primary/5 rounded-[1.5rem] overflow-hidden shadow-2xl shadow-primary/5 border-2">
              <CardContent className="p-6 space-y-6 text-center md:text-left">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">
                      Your Investment
                    </p>
                    <p className="text-4xl font-black text-center">
                      ${proposal.bidAmount?.toLocaleString()}
                    </p>
                    <p className="text-center text-xs font-bold text-muted-foreground mt-2 italic opacity-60">
                      vs {project.budget?.toLocaleString()} Project Budget
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background/40 p-4 rounded-3xl border border-border/20 text-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">
                        Delivery
                      </p>
                      <p className="text-lg font-black">
                        {proposal.deliveryDays} Days
                      </p>
                    </div>
                    <div className="bg-background/40 p-4 rounded-3xl border border-border/20 text-center">
                      <p className="text-[10px] font-black text-muted-foreground uppercase opacity-60">
                        Revisions
                      </p>
                      <p className="text-lg font-black">
                        {milestones.length > 0
                          ? "Milestone-based"
                          : proposal.generalRevisionLimit === -1
                            ? "Inf."
                            : proposal.generalRevisionLimit || 3}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {proposal.status === "ACCEPTED" && proposal.contract?.id ? (
                    <Button
                      className="w-full h-12 rounded-xl font-black text-base gap-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                      onClick={() =>
                        navigate(`/client/contracts/${proposal.contract.id}`)
                      }
                    >
                      <Shield className="w-5 h-5" /> View Contract
                    </Button>
                  ) : (
                    <>
                      {proposal.status !== "REJECTED" &&
                        proposal.status !== "WITHDRAWN" &&
                        proposal.status !== "CANCELLED" && (
                        <>
                          <Button
                            className="w-full h-12 rounded-xl font-black text-base gap-3 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                            onClick={() => handleStatusUpdate("ACCEPTED")}
                            disabled={
                              !!processingAction ||
                              proposal.status === "ACCEPTED"
                            }
                          >
                            {processingAction === "ACCEPTED" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                            {proposal.status === "ACCEPTED"
                              ? "Hired ✓"
                              : proposal.negotiationStatus ===
                                  "FREELANCER_ACCEPTED"
                                ? "Finalize Contract & Hire"
                                : "Hire Freelancer"}
                          </Button>

                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              variant="outline"
                              className="h-10 rounded-lg font-black text-xs gap-2 border-2 border-primary/20 text-primary hover:bg-primary/5"
                              onClick={() => handleStatusUpdate("SHORTLISTED")}
                              disabled={
                                !!processingAction ||
                                proposal.status === "SHORTLISTED"
                              }
                            >
                              <Star
                                className={cn(
                                  "w-3.5 h-3.5",
                                  proposal.status === "SHORTLISTED" &&
                                    "fill-primary",
                                )}
                              />{" "}
                              {proposal.status === "SHORTLISTED"
                                ? "Shortlisted"
                                : "Shortlist"}
                            </Button>
                            <Button
                              variant="outline"
                              className="h-10 rounded-lg font-black text-xs gap-2 border-2 text-muted-foreground hover:text-red-500 hover:border-red-500/30"
                              onClick={() => handleStatusUpdate("REJECTED")}
                              disabled={
                                !!processingAction ||
                                proposal.status === "REJECTED"
                              }
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </Button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Negotiation Tools */}
            {proposal.status !== "ACCEPTED" &&
              proposal.status !== "REJECTED" &&
              proposal.status !== "WITHDRAWN" &&
              proposal.status !== "CANCELLED" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-4">
                    <div className="w-1 h-4 bg-primary rounded-full" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Negotiation Tools
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <Button
                      variant="outline"
                      className="h-12 rounded-xl font-bold border-2 border-primary/20 text-primary hover:bg-primary/5 flex items-center justify-between px-6 group"
                      onClick={openNegotiationModal}
                      disabled={!!processingAction}
                    >
                      <div className="flex items-center gap-3">
                        <ListChecks className="w-4 h-4" />
                        {milestones.length === 0
                          ? "Setup Milestone Plan"
                          : "Negotiate Milestones"}
                      </div>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full h-12 rounded-xl font-bold border-2 border-border/40 text-muted-foreground hover:text-primary hover:border-primary/20 flex items-center justify-between px-6 group"
                        onClick={openRevisionModal}
                        disabled={!!processingAction || milestones.length > 0}
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4" />
                          Request More Revisions
                        </div>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      {milestones.length > 0 && (
                        <p className="text-[10px] text-muted-foreground font-medium px-4 leading-tight italic opacity-70">
                          Revisions are now managed within individual
                          milestones. Use "Negotiate Milestones" to adjust
                          limits.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

            {/* Negotiation Status Banners */}
            {(proposal.negotiationStatus === "CLIENT_PROPOSED" ||
              proposal.negotiationStatus === "CLIENT_PROPOSED_REVISIONS") && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2rem] p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-600">
                    <History className="w-5 h-5" />
                    <h4 className="text-sm font-black uppercase tracking-wider">
                      Negotiation Summary
                    </h4>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-black px-3 py-1"
                  >
                    Pending Review
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">
                      Freelancer's Original
                    </p>
                    <div className="bg-muted/30 p-4 rounded-2xl border border-border/20 space-y-1">
                      <p className="text-lg font-black leading-tight">
                        {(proposal.proposalMilestones || []).length > 0
                          ? `${proposal.proposalMilestones?.length || 0} Milestones`
                          : `${
                              proposal.generalRevisionLimit === -1
                                ? "Unlimited"
                                : proposal.generalRevisionLimit || 3
                            } Revisions`}
                      </p>
                      {(proposal.proposalMilestones || []).length > 0 && (
                        <p className="text-xs font-bold text-muted-foreground">
                          Total: ${proposal.bidAmount?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest pl-1">
                      Your Request
                    </p>
                    <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 space-y-1">
                      <p className="text-base font-black text-amber-600 leading-tight">
                        {(proposal.clientRequestedMilestones || []).length > 0
                          ? `${proposal.clientRequestedMilestones?.length || 0} Milestones`
                          : `${
                              proposal.clientRequestedRevisions === -1
                                ? "Unlimited"
                                : proposal.clientRequestedRevisions
                            } Revisions`}
                      </p>
                      {(proposal.clientRequestedMilestones || []).length > 0 && (
                        <p className="text-xs font-black text-amber-700/70">
                          Total: $
                          {(proposal.clientRequestedMilestones || [])
                            .reduce(
                              (s: number, m: any) => s + Number(m.amount || 0),
                              0,
                            )
                            .toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs font-medium text-muted-foreground italic border-t border-border/10 pt-4 px-1">
                  Waiting for the freelancer to review and accept these changes.
                </p>
              </div>
            )}

            {proposal.negotiationStatus === "FREELANCER_ACCEPTED" && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] p-6 flex gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-lg shadow-emerald-500/5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 text-white shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
                    Changes Accepted! 🎉
                  </h4>
                  <p className="text-xs text-foreground/80 font-bold leading-relaxed">
                    The freelancer has accepted your proposed terms and
                    milestones. You can now finalize the contract to start the
                    project.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Revision Request Modal ── */}
        <Dialog
          open={revisionModal.open}
          onOpenChange={(o) => {
            if (!o)
              setRevisionModal({
                open: false,
                proposalId: "",
                freelancerRevisions: 3,
                requested: "5",
              });
          }}
        >
          <DialogContent className="rounded-[2rem] max-w-md border-border/40 bg-card/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="font-black text-xl flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Request More Revisions
              </DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground/80">
                The freelancer offered{" "}
                <span className="text-foreground font-bold">
                  {revisionModal.freelancerRevisions === -1
                    ? "unlimited"
                    : revisionModal.freelancerRevisions}
                </span>{" "}
                revision{revisionModal.freelancerRevisions !== 1 ? "s" : ""}.
                You can request more below. The freelancer must accept before
                you hire.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Revisions You Need
                </Label>
                <Select
                  value={revisionModal.requested}
                  onValueChange={(v) =>
                    setRevisionModal((p) => ({ ...p, requested: v }))
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl bg-background/60 border-border/40">
                    <SelectValue placeholder="Select revisions" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border/40 shadow-2xl">
                    {[1, 2, 3, 5, 7, 10].map((n) => (
                      <SelectItem
                        key={n}
                        value={String(n)}
                        className="font-bold"
                      >
                        {n} Revision{n !== 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                    <SelectItem value="-1" className="font-bold">
                      Unlimited Revisions
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator className="opacity-40" />
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10 rounded-xl font-black border-2 border-border/40 text-xs"
                  onClick={() =>
                    setRevisionModal({
                      open: false,
                      proposalId: "",
                      freelancerRevisions: 3,
                      requested: "5",
                    })
                  }
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-black gap-2 shadow-xl shadow-primary/20 text-xs"
                  onClick={handleSubmitRevisionRequest}
                  disabled={!!processingAction}
                >
                  {processingAction === "REVISION_REQUEST" ? (
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

        {/* ── Milestone Negotiation Modal ── */}
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
          <DialogContent className="rounded-[2.5rem] max-w-2xl max-h-[90vh] overflow-y-auto border-border/40 bg-card/95 backdrop-blur-xl custom-scrollbar shadow-2xl">
            <DialogHeader className="px-2">
              <DialogTitle className="font-black text-2xl flex items-center gap-3 tracking-tight">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <ListChecks className="w-6 h-6 text-primary" />
                </div>
                {milestoneModal.mode === "setup"
                  ? "Define Milestone Plan"
                  : "Suggest Milestone Changes"}
              </DialogTitle>
              <DialogDescription className="font-medium text-muted-foreground/80 mt-2">
                {milestoneModal.mode === "setup"
                  ? "No milestones were provided. Define the payment plan and revision limits, then send it to the freelancer for approval."
                  : "Suggest changes to the freelancer's milestones. If you submit changes, the freelancer must review and approve them before the contract can begin."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4 px-2">
              {/* Validation Banner */}
              <div
                className={cn(
                  "p-4 rounded-2xl border-2 flex items-center justify-between gap-4 transition-all",
                  milestoneTotalMatch
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-amber-500/5 border-amber-500/20",
                )}
              >
                <div className="flex items-center gap-3">
                  {milestoneTotalMatch ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  )}
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight">
                      {milestoneTotalMatch
                        ? "Total Matches Bid"
                        : "Amounts Must Match Bid"}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground">
                      Must equal exactly $
                      {milestoneModal.bidAmount?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "text-lg font-black",
                      milestoneTotalMatch
                        ? "text-emerald-600"
                        : "text-amber-600",
                    )}
                  >
                    ${milestoneTotal.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-bold opacity-40">
                    / ${milestoneModal.bidAmount?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Milestones List */}
              <div className="space-y-4">
                {milestoneModal.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-[1.5rem] border border-border/40 bg-muted/20 space-y-4 group relative animate-in zoom-in-95 duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-xs">
                          {idx + 1}
                        </div>
                        <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
                          Milestone
                        </span>
                      </div>
                      {milestoneModal.milestones.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMilestone(idx)}
                          className="w-8 h-8 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Title *
                        </Label>
                        <Input
                          value={m.title}
                          onChange={(e) =>
                            updateMilestone(idx, "title", e.target.value)
                          }
                          placeholder="e.g. Design Prototype"
                          className="h-10 rounded-xl bg-background/60"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Amount ($) *
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="number"
                            value={m.amount}
                            onChange={(e) =>
                              updateMilestone(idx, "amount", e.target.value)
                            }
                            className="h-10 pl-10 rounded-xl bg-background/60"
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Deliverables
                        </Label>
                        <Textarea
                          value={m.description}
                          onChange={(e) =>
                            updateMilestone(idx, "description", e.target.value)
                          }
                          rows={2}
                          placeholder="What will be delivered in this phase?"
                          className="rounded-xl bg-background/60 p-3 resize-none min-h-[60px] text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Due Date
                        </Label>
                        <Input
                          type="date"
                          value={m.dueDate}
                          onChange={(e) =>
                            updateMilestone(idx, "dueDate", e.target.value)
                          }
                          className="h-10 rounded-xl bg-background/60"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Revisions
                        </Label>
                        <Select
                          value={m.allowedRevisions}
                          onValueChange={(val) =>
                            updateMilestone(idx, "allowedRevisions", val)
                          }
                        >
                          <SelectTrigger className="h-10 rounded-xl bg-background/60">
                            <SelectValue placeholder="Standard (3)" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-border/40">
                            <SelectItem value="1" className="font-bold">
                              1 Revision
                            </SelectItem>
                            <SelectItem value="2" className="font-bold">
                              2 Revisions
                            </SelectItem>
                            <SelectItem value="3" className="font-bold">
                              3 Revisions
                            </SelectItem>
                            <SelectItem value="5" className="font-bold">
                              5 Revisions
                            </SelectItem>
                            <SelectItem value="7" className="font-bold">
                              7 Revisions
                            </SelectItem>
                            <SelectItem value="-1" className="font-bold">
                              Unlimited
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={addMilestone}
                className="w-full h-12 rounded-xl border-2 border-dashed border-primary/20 text-primary font-black flex items-center justify-center gap-2 hover:bg-primary/5 transition-all"
              >
                <PlusCircle className="w-5 h-5" /> Add New Phase
              </Button>

              <Separator className="opacity-40" />

              <div className="flex gap-4 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl font-black border-2 border-border/40 text-sm"
                  onClick={() =>
                    setMilestoneModal({
                      open: false,
                      proposalId: "",
                      mode: "setup",
                      purpose: "HIRE",
                      milestones: [],
                      bidAmount: 0,
                    })
                  }
                >
                  Discard Changes
                </Button>
                <Button
                  className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black gap-2 shadow-xl shadow-primary/20 text-sm"
                  onClick={confirmNegotiation}
                  disabled={!!processingAction || !milestoneTotalMatch}
                >
                  {processingAction === "NEGOTIATE" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {milestoneModal.mode === "setup"
                    ? "Send Proposal"
                    : "Send Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

// ── Milestone List Sub-component ──────────────────────────────────────────

const MilestoneList = ({
  items,
  variant = "default",
}: {
  items: any[];
  variant?: "default" | "original" | "requested";
}) => {
  return (
    <div className="space-y-3">
      {items.map((m: any, i: number) => (
        <div
          key={i}
          className={cn(
            "p-4 rounded-[1.5rem] border transition-all",
            variant === "requested"
              ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
              : variant === "original"
                ? "bg-muted/10 border-border/20 opacity-80 grayscale-[0.5] hover:opacity-100 hover:grayscale-0"
                : "bg-muted/20 border-border/40 hover:bg-muted/30",
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border",
                  variant === "requested"
                    ? "bg-primary text-white border-primary/20"
                    : "bg-primary/10 text-primary border-primary/20",
                )}
              >
                {i + 1}
              </div>
              <div className="space-y-1 min-w-0">
                <p
                  className={cn(
                    "font-black text-base break-words",
                    variant === "requested" ? "text-primary" : "text-foreground",
                  )}
                >
                  {m.title}
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] font-black uppercase tracking-tighter rounded-md",
                      variant === "requested"
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-primary/20 bg-primary/5 text-primary",
                    )}
                  >
                    {m.allowedRevisions === -1
                      ? "Unlimited"
                      : m.allowedRevisions}{" "}
                    Revisions
                  </Badge>
                  <span className="text-[9px] font-black text-muted-foreground uppercase opacity-40">
                    Milestone {i + 1}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-1">
                Release Amount
              </p>
              <p
                className={cn(
                  "text-xl font-black",
                  variant === "requested" ? "text-primary" : "text-foreground/90",
                )}
              >
                ${Number(m.amount).toLocaleString()}
              </p>
            </div>
          </div>
          {m.description && (
            <div className="space-y-2 mt-3">
              <Separator
                className={cn(
                  "bg-border/10",
                  variant === "requested" && "bg-primary/10",
                )}
              />
              <div className="flex gap-3">
                <div
                  className={cn(
                    "w-0.5 h-full bg-primary/20 rounded-full shrink-0",
                    variant === "requested" && "bg-primary/40",
                  )}
                />
                <p className="text-xs text-muted-foreground font-medium leading-relaxed italic opacity-80">
                  {m.description}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ClientProposalDetail;
