import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  CheckCircle,
  XCircle,
  Search,
  MoreVertical,
  ExternalLink,
  Copy,
  RotateCcw,
  Trash2,
  Star,
  MessageSquare,
  TrendingUp,
  Inbox,
  ChevronDown,
  ChevronUp,
  Loader2,
  Zap,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function FreelancerProposals() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [expandedLetters, setExpandedLetters] = useState<
    Record<string, boolean>
  >({});
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const toggleExpand = (id: string) => {
    setExpandedLetters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Fetch freelancer's own proposals
  useEffect(() => {
    const fetchProposals = async () => {
      setLoading(true);
      try {
        const res = await api.get("/proposals/my");
        setProposals(res.data.proposals);
      } catch (err) {
        toast.error("Failed to load proposals");
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  // Withdraw a proposal
  const handleWithdraw = async (proposalId: string) => {
    try {
      await api.delete(`/proposals/${proposalId}/withdraw`);
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, status: "WITHDRAWN" } : p
        )
      );
      toast.success("Proposal withdrawn successfully.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to withdraw proposal",
      );
    }
  };

  const handleAcceptChanges = async (proposalId: string) => {
    try {
      await api.post(`/proposals/${proposalId}/accept-changes`);
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId ? { ...p, negotiationStatus: "FREELANCER_ACCEPTED" } : p
        )
      );
      toast.success("Milestone changes accepted! Waiting for client to hire you.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to accept changes",
      );
    }
  };

  const filteredProposals = useMemo(() => {
    return proposals
      .filter((proposal) => {
        const effectiveStatus =
          proposal.project?.status === "CANCELLED"
            ? "cancelled"
            : proposal.status?.toLowerCase();
        const matchesTab = activeTab === "all" || effectiveStatus === activeTab;
        const matchesSearch =
          proposal.project?.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          proposal.project?.client?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "newest")
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        if (sortBy === "oldest")
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        if (sortBy === "highest") return b.bidAmount - a.bidAmount;
        if (sortBy === "lowest") return a.bidAmount - b.bidAmount;
        return 0;
      });
  }, [proposals, activeTab, searchQuery, sortBy]);

  const stats = {
    total: proposals.length,
    pending: proposals.filter(
      (p) =>
        p.status?.toUpperCase() === "PENDING" &&
        p.project?.status !== "CANCELLED",
    ).length,
    shortlisted: proposals.filter(
      (p) =>
        p.status?.toUpperCase() === "SHORTLISTED" &&
        p.project?.status !== "CANCELLED",
    ).length,
    accepted: proposals.filter((p) => p.status?.toUpperCase() === "ACCEPTED")
      .length,
    rejected: proposals.filter((p) => p.status?.toUpperCase() === "REJECTED")
      .length,
    withdrawn: proposals.filter((p) => p.status?.toUpperCase() === "WITHDRAWN")
      .length,
    cancelled: proposals.filter(
      (p) =>
        p.status?.toUpperCase() === "CANCELLED" ||
        p.project?.status === "CANCELLED",
    ).length,
    winRate:
      proposals.length > 0
        ? Math.round(
            (proposals.filter((p) => p.status?.toUpperCase() === "ACCEPTED")
              .length /
              proposals.length) *
              100,
          )
        : 0,
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-8 min-w-0">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              My Proposals
            </h1>
            <p className="text-muted-foreground font-medium tracking-wide mt-1">
              Track and manage all your bids
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          <StatCard
            icon={<Inbox className="w-6 h-6 text-blue-500" />}
            label="Total Sent"
            value={stats.total}
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-yellow-500" />}
            label="Pending"
            value={stats.pending}
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6 text-green-500" />}
            label="Accepted"
            value={stats.accepted}
          />
          <StatCard
            icon={<XCircle className="w-6 h-6 text-red-500" />}
            label="Rejected"
            value={stats.rejected}
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
            label="Win Rate"
            value={`${stats.winRate}%`}
          />
        </div>

        {/* Filters Section */}
        <div className="space-y-4">
          {/* Status Tabs Row */}
          <div className="bg-card p-2 rounded-xl border border-border shadow-sm w-full overflow-hidden">
            <Tabs
              defaultValue="all"
              className="w-full overflow-x-auto scrollbar-none pb-2 lg:pb-0"
              onValueChange={setActiveTab}
            >
              <TabsList className="bg-transparent border-none w-max">
                {[
                  { value: "all", label: `All (${stats.total})` },
                  { value: "pending", label: `Pending (${stats.pending})` },
                  {
                    value: "shortlisted",
                    label: `Shortlisted ⭐ (${stats.shortlisted})`,
                  },
                  { value: "accepted", label: `Accepted (${stats.accepted})` },
                  { value: "rejected", label: `Rejected (${stats.rejected})` },
                  {
                    value: "withdrawn",
                    label: `Withdrawn (${stats.withdrawn})`,
                  },
                  {
                    value: "cancelled",
                    label: `Cancelled (${stats.cancelled})`,
                  },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-lg px-6 data-[state=active]:bg-[#4051B5] data-[state=active]:text-primary-foreground transition-all"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Search & Sort Row */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-3 rounded-xl border border-border shadow-sm">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-10 bg-primary/5 border-none focus-visible:ring-1 h-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px] bg-primary/5 border-none h-10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="highest">Highest Bid</SelectItem>
                <SelectItem value="lowest">Lowest Bid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your proposals...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProposals.length > 0 ? (
              filteredProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  isExpanded={!!expandedLetters[proposal.id]}
                  onToggleExpand={() => toggleExpand(proposal.id)}
                  onWithdraw={handleWithdraw}
                  onAcceptChanges={handleAcceptChanges}
                />
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-card/50 rounded-3xl border border-dashed border-border">
                <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                  <Inbox className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {proposals.length === 0
                      ? "No proposals yet"
                      : "No matching proposals"}
                  </h3>
                  <p className="text-muted-foreground">
                    {proposals.length === 0
                      ? "Start browsing projects and submit your first proposal"
                      : "Try adjusting your filters"}
                  </p>
                </div>
                {proposals.length === 0 && (
                  <Button
                    asChild
                    className="rounded-full px-8 h-11 font-semibold"
                  >
                    <Link to="/freelancer/browse">Browse Projects →</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="bg-card/40 backdrop-blur-xl border-border/40 shadow-sm hover:shadow-md transition-all rounded-[2rem]">
      <CardContent className="p-6 flex flex-col items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex flex-shrink-0 items-center justify-center p-3">
          {icon}
        </div>
        <div>
          <p className="text-3xl font-black text-foreground">{value}</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ProposalCard({
  proposal,
  isExpanded,
  onToggleExpand,
  onWithdraw,
  onAcceptChanges,
}: {
  proposal: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onWithdraw: (id: string) => void;
  onAcceptChanges: (id: string) => void;
}) {
  const statusConfig: Record<
    string,
    { label: string; className: string; icon: React.ElementType }
  > = {
    PENDING: {
      label: "Pending",
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      icon: Clock,
    },
    SHORTLISTED: {
      label: "Shortlisted ⭐",
      className: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: Star,
    },
    ACCEPTED: {
      label: "Accepted",
      className: "bg-green-500/10 text-green-500 border-green-500/20",
      icon: CheckCircle,
    },
    REJECTED: {
      label: "Rejected",
      className: "bg-red-500/10 text-red-500 border-red-500/20",
      icon: XCircle,
    },
    WITHDRAWN: {
      label: "Withdrawn",
      className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      icon: Trash2,
    },
    CANCELLED: {
      label: "Project Cancelled",
      className: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      icon: XCircle,
    },
  };

  const project = proposal.project;
  const client = project?.client;
  const contract = proposal.contract;

  let statusKey = proposal.status?.toUpperCase() || "PENDING";
  if (project?.status === "CANCELLED") statusKey = "CANCELLED";
  const status = statusConfig[statusKey] || statusConfig["PENDING"];

  return (
    <Card className="group border-border/40 hover:border-primary/40 rounded-[2.5rem] transition-all duration-300 overflow-hidden bg-card/40 backdrop-blur-sm shadow-sm hover:shadow-xl w-full">
      <CardContent className="p-8 space-y-8 max-w-full overflow-hidden">
        {/* Top Row */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={cn("px-2.5 py-0.5 font-semibold", status.className)}
            >
              <status.icon className="w-3.5 h-3.5 mr-1.5" />
              {status.label}
            </Badge>
            {proposal.tokenCost > 0 && (
              <Badge
                variant="secondary"
                className="bg-amber-500/5 text-amber-600 border-amber-500/10 flex items-center gap-1.5 px-2.5 py-0.5 font-bold"
              >
                <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                {proposal.tokenCost} tokens
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              Submitted{" "}
              {new Date(proposal.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="gap-2"
                onClick={() => {
                  navigator.clipboard.writeText(proposal.coverLetter || "");
                  toast.success("Cover letter copied!");
                }}
              >
                <RotateCcw className="w-4 h-4" /> Reuse Letter
              </DropdownMenuItem>
              {(statusKey === "PENDING" || statusKey === "SHORTLISTED") && (
                <DropdownMenuItem
                  className="gap-2 text-destructive"
                  onClick={() => onWithdraw(proposal.id)}
                >
                  <Trash2 className="w-4 h-4" /> Withdraw
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Project Info */}
        <div className="space-y-4 max-w-full">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2 max-w-full">
              <Link
                to={`/freelancer/projects/${project?.id}`}
                className="text-2xl font-black hover:text-primary transition-colors inline-block break-words whitespace-pre-wrap max-w-full line-clamp-3"
              >
                {project?.title || "Project"}
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                {client && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 rounded-full text-xs font-bold text-foreground">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={client.profileImage} />
                      <AvatarFallback>{client.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {client.name}
                  </div>
                )}
                {project?.category && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/5 text-primary text-[10px] uppercase tracking-[0.2em] font-black py-1 px-3"
                  >
                    {project.category.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bid Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-xl bg-primary/5 border border-border/50">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
              Your Bid
            </p>
            <p className="text-lg font-bold">
              ${proposal.bidAmount?.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
              Project Budget
            </p>
            <p className="text-sm font-semibold">
              ${project?.budget?.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
              Delivery
            </p>
            <p className="text-sm font-semibold">
              {proposal.deliveryDays} days
            </p>
          </div>
        </div>

        {/* Cover Letter */}
        {proposal.coverLetter && (
          <div className="space-y-3 bg-primary/5 p-6 rounded-3xl border border-border/30 max-w-full overflow-hidden">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
              Your Cover Letter
            </h4>
            <p
              className={cn(
                "text-sm text-foreground/80 font-medium leading-relaxed transition-all duration-300 w-full min-w-0",
                !isExpanded
                  ? "line-clamp-1 break-words"
                  : "break-words whitespace-pre-wrap",
              )}
            >
              {proposal.coverLetter}
            </p>
            <button
              onClick={onToggleExpand}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  Show Less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  Read More <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Status-specific sections */}
        <div className="pt-4 border-t border-border/50">
          {(statusKey === "PENDING" || statusKey === "SHORTLISTED") && (
            proposal.negotiationStatus === "CLIENT_PROPOSED" ? (
             <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shrink-0">
                    <ListChecks className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-blue-600 dark:text-blue-400">
                      Client proposed milestone changes!
                    </h4>
                    <p className="text-sm text-foreground/80">
                      Please review the suggested milestones and accept them to proceed, or withdraw your proposal.
                    </p>

                    {/* Comparison Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Original Side */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase">Your Original Plan</p>
                        <div className="p-3 rounded-xl bg-background/30 border border-border/40 space-y-2">
                          <p className="text-xs font-bold flex justify-between">
                            Revisions: <span>{proposal.generalRevisionLimit === -1 ? "Unlimited" : proposal.generalRevisionLimit || 3}</span>
                          </p>
                          <div className="space-y-1">
                            {(!proposal.proposalMilestones || proposal.proposalMilestones.length === 0) ? (
                              <p className="text-[10px] italic text-muted-foreground">No milestones defined</p>
                            ) : (
                              proposal.proposalMilestones.map((m: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-[10px]">
                                  <span className="truncate max-w-[100px]">{m.title}</span>
                                  <span className="font-bold">${m.amount}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Client Side */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-blue-500 uppercase">Client's Request</p>
                        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-2">
                          <p className="text-xs font-bold flex justify-between text-blue-700">
                            Revisions: <span>{proposal.clientRequestedMilestones?.[0]?.allowedRevisions === -1 ? "Unlimited" : (proposal.clientRequestedMilestones?.[0]?.allowedRevisions || proposal.generalRevisionLimit || 3)}</span>
                          </p>
                          <div className="space-y-1">
                            {proposal.clientRequestedMilestones?.map((m: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-[10px] text-blue-600">
                                <span className="truncate max-w-[100px] font-bold">{m.title}</span>
                                <span className="font-bold">${m.amount}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
                    onClick={() => onAcceptChanges(proposal.id)}
                  >
                    Accept Changes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full px-6 border-destructive/30 hover:bg-destructive/10 text-destructive"
                    onClick={() => onWithdraw(proposal.id)}
                  >
                    Reject & Withdraw
                  </Button>
                </div>
              </div>
            ) : proposal.negotiationStatus === "FREELANCER_ACCEPTED" ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Changes Accepted</p>
                    <p className="text-xs text-muted-foreground">Waiting for client to finalize the contract.</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                  onClick={() => onWithdraw(proposal.id)}
                >
                  Withdraw Proposal
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full animate-pulse",
                        statusKey === "SHORTLISTED"
                          ? "bg-blue-500"
                          : "bg-yellow-500",
                      )}
                    />
                    <div
                      className={cn(
                        "absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-75",
                        statusKey === "SHORTLISTED"
                          ? "bg-blue-500"
                          : "bg-yellow-500",
                      )}
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      {statusKey === "SHORTLISTED"
                        ? "You are shortlisted! ⭐"
                        : "Awaiting client response"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {proposal.isViewedByClient ? (
                        <span className="text-green-500 flex items-center gap-1">
                          Client viewed your proposal{" "}
                          <CheckCircle className="w-3 h-3" />
                        </span>
                      ) : (
                        "Not yet viewed by client"
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                  onClick={() => onWithdraw(proposal.id)}
                >
                  Withdraw Proposal
                </Button>
              </div>
            )
          )}

          {statusKey === "ACCEPTED" && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-green-600 dark:text-green-400">
                    🎉 Your proposal was accepted!
                  </h4>
                  {contract?.createdAt && (
                    <p className="text-sm text-muted-foreground">
                      Contract created on{" "}
                      {new Date(contract.createdAt).toLocaleDateString(
                        "en-US",
                        { month: "long", day: "numeric", year: "numeric" },
                      )}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {contract?.id && (
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6"
                    asChild
                  >
                    <Link to={`/freelancer/contracts/${contract.id}`}>
                      View Contract{" "}
                      <ExternalLink className="w-3.5 h-3.5 ml-2" />
                    </Link>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full px-6 border-green-500/30 hover:bg-green-500/10 text-green-600"
                  asChild
                >
                  <Link to="/freelancer/messages">
                    <MessageSquare className="w-3.5 h-3.5 mr-2" /> Message
                    Client
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {statusKey === "REJECTED" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Client chose another freelancer
                </p>
                <p className="text-xs text-muted-foreground">
                  Don't give up! Your next opportunity is waiting.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs rounded-full"
                  asChild
                >
                  <Link to="/freelancer/browse">Find Similar Projects</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-xs rounded-full text-muted-foreground"
                  onClick={() => {
                    navigator.clipboard.writeText(proposal.coverLetter || "");
                    toast.success("Cover letter copied!");
                  }}
                >
                  <Copy className="w-3.5 h-3.5 mr-2" /> Copy Letter
                </Button>
              </div>
            </div>
          )}

          {statusKey === "WITHDRAWN" && (
            <div className="bg-gray-500/5 border border-gray-500/10 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    You withdrew your proposal from this project
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your SkillTokens have been refunded to your wallet. You are no longer under consideration for this role.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs rounded-full"
                    asChild
                  >
                    <Link to="/freelancer/browse">Find Other Projects</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
