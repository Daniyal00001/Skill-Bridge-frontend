import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MoreVertical,
  Search,
  Filter,
  DollarSign,
  Clock,
  CheckCircle2,
  MessageSquare,
  PlayCircle,
  Layout,
  AlertTriangle,
  Briefcase,
  ChevronRight,
  MapPin,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";

const FreelancerProjects = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [submitMilestone, setSubmitMilestone] = useState<{
    contractId: string;
    milestone: any;
  } | null>(null);

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const res = await api.get("/contracts/my");
        setContracts(res.data.contracts || []);
      } catch (err) {
        toast.error("Failed to load contracts");
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchSearch = c.project?.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
      if (activeTab === "active")
        return c.status === "ACTIVE" || c.project?.status === "IN_PROGRESS";
      if (activeTab === "completed")
        return c.status === "COMPLETED" || c.project?.status === "COMPLETED";
      return true;
    });
  }, [contracts, searchTerm, activeTab]);

  // Stats
  const totalEarned = contracts.reduce((sum, c) => {
    const approved =
      c.milestones?.filter((m: any) => m.status === "APPROVED") || [];
    return sum + approved.reduce((s: number, m: any) => s + (m.amount || 0), 0);
  }, 0);
  const activeCount = contracts.filter(
    (c) => c.project?.status === "IN_PROGRESS",
  ).length;
  const completedCount = contracts.filter(
    (c) => c.project?.status === "COMPLETED",
  ).length;

  // Milestone submit
  const handleMilestoneSubmit = async (
    contractId: string,
    milestoneId: string,
    note: string,
  ) => {
    try {
      await api.patch(
        `/contracts/${contractId}/milestones/${milestoneId}/submit`,
        {
          submissionNote: note,
        },
      );
      toast.success("Work submitted! Waiting for client approval.");
      // Refresh
      const res = await api.get("/contracts/my");
      setContracts(res.data.contracts || []);
      setSubmitMilestone(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit milestone");
    }
  };

  const getStatusConfig = (contract: any) => {
    const status = contract.project?.status || contract.status;
    switch (status) {
      case "IN_PROGRESS":
      case "ACTIVE":
        return {
          label: "In Flight",
          color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
          icon: PlayCircle,
        };
      case "COMPLETED":
        return {
          label: "Completed",
          color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
          icon: CheckCircle2,
        };
      default:
        return {
          label: status || "Active",
          color: "bg-muted text-muted-foreground",
          icon: Layout,
        };
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-10 animate-fade-in pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary mb-2 font-black uppercase tracking-widest text-[10px] px-3 py-1"
            >
              Work Management Hub
            </Badge>
            <h1 className="text-4xl font-black tracking-tight">My Contracts</h1>
            <p className="text-muted-foreground text-lg max-w-xl font-medium">
              Manage active projects, milestones, and client communications in
              one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-14 px-8 rounded-2xl font-black border-2"
              asChild
            >
              <Link to="/freelancer/proposals">Active Bids</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="gap-2 shadow-2xl shadow-primary/40 font-black h-14 px-8 rounded-2xl hover:scale-[1.02] transition-all"
            >
              <Link to="/freelancer/browse">
                <Search className="h-5 w-5" /> Find More Work
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Earned",
              value: `$${totalEarned.toLocaleString()}`,
              icon: DollarSign,
              color: "text-emerald-500",
            },
            {
              label: "Ongoing",
              value: activeCount,
              icon: PlayCircle,
              color: "text-blue-500",
            },
            {
              label: "Contracts",
              value: contracts.length,
              icon: Briefcase,
              color: "text-amber-500",
            },
            {
              label: "Completed",
              value: completedCount,
              icon: CheckCircle2,
              color: "text-violet-500",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-[2rem] bg-card/40 backdrop-blur-md border border-border/40 flex items-center gap-5 group hover:border-primary/20 transition-all shadow-xl overflow-hidden relative"
            >
              <div
                className={cn(
                  "p-3 rounded-2xl bg-muted/50 transition-transform group-hover:scale-110",
                  stat.color,
                )}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest opacity-60">
                  {stat.label}
                </p>
                <p className="text-2xl font-black tracking-tight">
                  {loading ? "—" : stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="bg-muted/50 p-1 rounded-2xl border border-border/20"
            >
              <TabsList className="bg-transparent gap-2 h-12">
                {[
                  { value: "active", label: "Active Work" },
                  { value: "completed", label: "Completed" },
                  { value: "all", label: "All" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-xl font-black px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contracts..."
                  className="pl-12 h-14 bg-card/40 border-border/40 rounded-2xl font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 rounded-2xl border-2"
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Contract List */}
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground font-medium">
                Loading contracts...
              </p>
            </div>
          ) : filteredContracts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {filteredContracts.map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  statusConfig={getStatusConfig(contract)}
                  onSubmitMilestone={(milestoneId) =>
                    setSubmitMilestone({
                      contractId: contract.id,
                      milestone: contract.milestones?.find(
                        (m: any) => m.id === milestoneId,
                      ),
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4 bg-card/20 rounded-[3rem] border-4 border-dashed border-border/40">
              <div className="p-8 bg-muted/40 rounded-full w-fit mx-auto">
                <Briefcase className="w-12 h-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black text-foreground/80">
                No contracts found
              </h3>
              <p className="text-muted-foreground font-medium max-w-xs mx-auto">
                {activeTab === "active"
                  ? "No active work right now."
                  : "Nothing here yet."}{" "}
                Browse new opportunities!
              </p>
              <Button
                asChild
                className="h-12 px-8 rounded-xl font-black mt-4"
                variant="secondary"
              >
                <Link to="/freelancer/browse">Discover Jobs</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Submit Milestone Dialog */}
      {submitMilestone && (
        <SubmitMilestoneDialog
          milestone={submitMilestone.milestone}
          contractId={submitMilestone.contractId}
          onClose={() => setSubmitMilestone(null)}
          onSubmit={handleMilestoneSubmit}
        />
      )}
    </DashboardLayout>
  );
};

// ── Contract Card ───────────────────────────────────────────────────────────────
const ContractCard = ({
  contract,
  statusConfig,
  onSubmitMilestone,
}: {
  contract: any;
  statusConfig: { label: string; color: string; icon: React.ElementType };
  onSubmitMilestone: (milestoneId: string) => void;
}) => {
  const project = contract.project;
  const client = contract.client;
  const milestones = contract.milestones || [];
  const isCompleted = project?.status === "COMPLETED";

  // Progress calculation
  const approved = milestones.filter(
    (m: any) => m.status === "APPROVED",
  ).length;
  const progress =
    milestones.length > 0
      ? Math.round((approved / milestones.length) * 100)
      : 0;

  // Financial summary
  const totalBudget = milestones.reduce(
    (sum: number, m: any) => sum + (m.amount || 0),
    0,
  );
  const earned = milestones
    .filter((m: any) => m.status === "APPROVED")
    .reduce((sum: number, m: any) => sum + (m.amount || 0), 0);
  const inEscrow = totalBudget - earned;

  // Next pending milestone
  const nextMilestone = milestones.find((m: any) => m.status === "PENDING");
  const submittedMilestone = milestones.find(
    (m: any) => m.status === "SUBMITTED",
  );
  const hasDeadlineWarning =
    project?.deadline &&
    new Date(project.deadline) < new Date(Date.now() + 3 * 86400000);

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-500 group rounded-[2.5rem]">
      {/* Header */}
      <CardHeader className="p-8 pb-4 flex flex-row items-start justify-between">
        <div className="space-y-4 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight group-hover:underline underline-offset-8 decoration-primary/30">
              <Link to={`/freelancer/contracts/${contract.id}`}>
                {project?.title || "Contract"}
              </Link>
            </h2>
            <Badge
              className={cn(
                "font-black uppercase tracking-[0.2em] text-[10px] py-1 px-4 rounded-full border-0",
                statusConfig.color,
              )}
            >
              {statusConfig.label}
            </Badge>
            {hasDeadlineWarning && !isCompleted && (
              <Badge
                variant="destructive"
                className="gap-2 font-black uppercase tracking-widest text-[10px] py-1 px-3 animate-pulse"
              >
                <AlertTriangle className="w-3 h-3" /> Deadline Soon
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-muted-foreground">
            {client?.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {client.location}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Started {new Date(contract.createdAt).toLocaleDateString()}
            </div>
            {project?.deadline && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Due {new Date(project.deadline).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-2xl hover:bg-muted/80"
            >
              <MoreVertical className="w-6 h-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 p-2 rounded-2xl bg-card/90 backdrop-blur-xl border-border/40"
          >
            <DropdownMenuItem className="rounded-xl p-3 font-bold" asChild>
              <Link to={`/freelancer/contracts/${contract.id}`}>
                View Contract
              </Link>
            </DropdownMenuItem>
            {nextMilestone && (
              <DropdownMenuItem
                className="rounded-xl p-3 font-bold"
                onClick={() => onSubmitMilestone(nextMilestone.id)}
              >
                Submit Milestone Work
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-8 pt-4 space-y-8">
        {/* Client Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] bg-primary/5 border border-primary/10 gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-4 ring-primary/10 shadow-2xl">
                <AvatarImage src={client?.profileImage} />
                <AvatarFallback className="font-black bg-primary/20 text-primary text-lg">
                  {client?.name?.[0] || "C"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest opacity-80">
                Client
              </p>
              <h3 className="text-xl font-black tracking-tight">
                {client?.name || "Client"}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="lg"
              variant="secondary"
              className="font-black rounded-2xl gap-3 h-14 px-8"
              asChild
            >
              <Link to="/freelancer/messages">
                <MessageSquare className="w-5 h-5" /> Message
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="font-black rounded-2xl h-14 px-8 border-2"
              asChild
            >
              <Link to={`/freelancer/contracts/${contract.id}`}>
                View Contract
              </Link>
            </Button>
          </div>
        </div>

        {/* Submitted milestone review banner */}
        {submittedMilestone && (
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-4">
            <Clock className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-black text-amber-700 dark:text-amber-400 text-sm">
                "{submittedMilestone.title}" is awaiting client review
              </p>
              <p className="text-xs text-muted-foreground">
                You'll be notified when client approves or requests changes.
              </p>
            </div>
          </div>
        )}

        {/* Progress */}
        {!isCompleted && milestones.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 bg-card px-5 py-3 rounded-2xl border border-border/40 shadow-sm">
                <Briefcase className="w-5 h-5 text-primary" />
                <span className="text-sm font-black">
                  Milestone {approved + 1} of {milestones.length}
                </span>
              </div>
              <span className="text-2xl font-black text-primary">
                {progress}%
              </span>
            </div>
            <Progress
              value={progress}
              className="h-4 bg-muted/60 rounded-full border border-border/20"
            />
          </div>
        )}

        {/* Milestones + Financials */}
        <div className="grid md:grid-cols-2 gap-10">
          {/* Milestones */}
          {milestones.length > 0 && (
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground border-b border-border/20 pb-2">
                Roadmap
              </h4>
              <div className="space-y-3">
                {milestones.map((m: any, idx: number) => (
                  <div
                    key={m.id}
                    className={cn(
                      "p-4 rounded-2xl border flex items-center justify-between shadow-sm",
                      m.status === "APPROVED"
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : m.status === "SUBMITTED"
                          ? "bg-amber-500/10 border-amber-500/30"
                          : "bg-card border-border/40",
                    )}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                          m.status === "APPROVED"
                            ? "bg-emerald-500 text-white"
                            : m.status === "SUBMITTED"
                              ? "bg-amber-500 text-white animate-pulse"
                              : "bg-muted/60 text-muted-foreground border border-border/60",
                        )}
                      >
                        {m.status === "APPROVED" ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : m.status === "SUBMITTED" ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <span className="font-black text-sm">{idx + 1}</span>
                        )}
                      </div>
                      <div className="truncate">
                        <p className="font-black text-sm truncate">{m.title}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                          ${m.amount?.toLocaleString()} • {m.status}
                        </p>
                      </div>
                    </div>
                    {m.status === "PENDING" && !isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-xl font-bold text-xs border-primary/30 text-primary hover:bg-primary/10 shrink-0 ml-2"
                        onClick={() => onSubmitMilestone(m.id)}
                      >
                        Submit
                      </Button>
                    )}
                    {m.status === "REVISION_REQUESTED" && (
                      <Badge
                        variant="outline"
                        className="bg-red-500/10 text-red-500 border-red-500/20 font-black text-[8px] shrink-0"
                      >
                        Revise
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Summary */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground border-b border-border/20 pb-2">
              Financial Summary
            </h4>
            <div className="bg-muted/20 p-8 rounded-[2rem] border border-border/40 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Contract Value
                  </p>
                  <p className="text-3xl font-black tracking-tighter">
                    ${totalBudget.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-primary opacity-20" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Earned</span>
                  <span className="text-emerald-500">
                    ${earned.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={totalBudget > 0 ? (earned / totalBudget) * 100 : 0}
                  className="h-2 bg-muted/60 rounded-full"
                />
              </div>
              <div className="flex gap-4 border-t border-border/20 pt-4">
                <div className="flex-1 p-4 bg-background/50 rounded-2xl border border-border/40">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                    In Escrow
                  </p>
                  <p className="font-black text-primary">
                    ${inEscrow.toLocaleString()}
                  </p>
                </div>
                <div className="flex-1 p-4 bg-background/50 rounded-2xl border border-border/40">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                    Milestones
                  </p>
                  <p className="font-black text-primary">
                    {approved}/{milestones.length} Done
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-8 pt-0 flex flex-col md:flex-row items-center justify-end gap-4 border-t border-border/20 bg-muted/5">
        <Button
          variant="outline"
          className="h-14 px-8 rounded-2xl font-black border-2"
          asChild
        >
          <Link to={`/freelancer/contracts/${contract.id}`}>
            Open Contract Dashboard
          </Link>
        </Button>
        {nextMilestone && (
          <Button
            className="h-14 px-10 rounded-2xl font-black shadow-lg shadow-primary/20 gap-3 group"
            onClick={() => onSubmitMilestone(nextMilestone.id)}
          >
            Submit Milestone Work{" "}
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// ── Submit Milestone Dialog ─────────────────────────────────────────────────────
const SubmitMilestoneDialog = ({
  milestone,
  contractId,
  onClose,
  onSubmit,
}: {
  milestone: any;
  contractId: string;
  onClose: () => void;
  onSubmit: (
    contractId: string,
    milestoneId: string,
    note: string,
  ) => Promise<void>;
}) => {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!note.trim()) {
      toast.error("Please add submission notes");
      return;
    }
    setLoading(true);
    await onSubmit(contractId, milestone.id, note);
    setLoading(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="rounded-[2rem] max-w-lg border-border/40 bg-card/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Submit Work</DialogTitle>
          <DialogDescription>
            Submitting:{" "}
            <span className="font-black text-foreground">
              {milestone?.title}
            </span>
            {milestone?.amount && (
              <>
                {" "}
                —{" "}
                <span className="text-emerald-500 font-black">
                  ${milestone.amount.toLocaleString()}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Submission Notes *
            </label>
            <Textarea
              placeholder="Describe what you've completed, any important details, and links to work delivered..."
              className="min-h-[150px] bg-background/50 border-border/40 rounded-2xl p-5 font-medium"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-2xl font-black"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 h-12 rounded-2xl font-black"
              onClick={handleSubmit}
              disabled={loading || !note.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                  Submitting...
                </>
              ) : (
                "Submit for Review"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FreelancerProjects;
