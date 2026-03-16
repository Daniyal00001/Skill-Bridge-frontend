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
      setProposals((prev) => prev.filter((p) => p.id !== proposalId));
      toast.success("Proposal withdrawn.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to withdraw proposal",
      );
    }
  };

  const filteredProposals = useMemo(() => {
    return proposals
      .filter((proposal) => {
        const matchesTab =
          activeTab === "all" || proposal.status?.toLowerCase() === activeTab;
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
    pending: proposals.filter((p) => p.status?.toUpperCase() === "PENDING")
      .length,
    accepted: proposals.filter((p) => p.status?.toUpperCase() === "ACCEPTED")
      .length,
    rejected: proposals.filter((p) => p.status?.toUpperCase() === "REJECTED")
      .length,
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
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            My Proposals
          </h1>
          <p className="text-muted-foreground text-lg">
            Track and manage all your bids
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            icon={<Inbox className="w-5 h-5 text-blue-500" />}
            label="Total Sent"
            value={stats.total}
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-yellow-500" />}
            label="Pending"
            value={stats.pending}
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-green-500" />}
            label="Accepted"
            value={stats.accepted}
          />
          <StatCard
            icon={<XCircle className="w-5 h-5 text-red-500" />}
            label="Rejected"
            value={stats.rejected}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-purple-500" />}
            label="Win Rate"
            value={`${stats.winRate}%`}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-card p-2 rounded-xl border border-border shadow-sm">
          <Tabs
            defaultValue="all"
            className="w-full lg:w-auto"
            onValueChange={setActiveTab}
          >
            <TabsList className="bg-transparent border-none">
              {[
                { value: "all", label: `All (${stats.total})` },
                { value: "pending", label: `Pending (${stats.pending})` },
                { value: "accepted", label: `Accepted (${stats.accepted})` },
                { value: "rejected", label: `Rejected (${stats.rejected})` },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-10 bg-accent/50 border-none focus-visible:ring-1 h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] bg-accent/50 border-none h-10">
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
    <Card className="bg-card/50 border-none shadow-none ring-1 ring-border">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
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
}: {
  proposal: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onWithdraw: (id: string) => void;
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
  };

  const statusKey = proposal.status?.toUpperCase() || "PENDING";
  const status = statusConfig[statusKey] || statusConfig["PENDING"];
  const project = proposal.project;
  const client = project?.client;
  const contract = proposal.contract;

  return (
    <Card className="group border-border hover:border-primary/50 transition-all duration-300 overflow-hidden bg-card/40 backdrop-blur-sm">
      <CardContent className="p-6 space-y-6">
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
              {statusKey === "PENDING" && (
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
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <Link
                to={`/freelancer/projects/${project?.id}`}
                className="text-xl font-bold hover:text-primary transition-colors inline-block"
              >
                {project?.title || "Project"}
              </Link>
              <div className="flex items-center gap-2">
                {client && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-accent/50 rounded-full text-xs font-medium">
                    <Avatar className="w-4 h-4">
                      <AvatarImage src={client.profileImage} />
                      <AvatarFallback>{client.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {client.name}
                  </div>
                )}
                {project?.category && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/5 text-primary text-[10px] uppercase tracking-wider font-bold"
                  >
                    {project.category.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bid Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-xl bg-accent/30 border border-border/50">
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
          <div className="space-y-2">
            <p
              className={cn(
                "text-sm text-muted-foreground leading-relaxed transition-all duration-300",
                !isExpanded && "line-clamp-2",
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
          {statusKey === "PENDING" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-2 h-2 bg-yellow-500 rounded-full animate-ping opacity-75" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">
                    Awaiting client response
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
        </div>
      </CardContent>
    </Card>
  );
}
