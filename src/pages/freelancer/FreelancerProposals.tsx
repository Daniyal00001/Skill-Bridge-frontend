import { useState } from "react";
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
  Edit2,
  Trash2,
  Star,
  MessageSquare,
  Calendar,
  DollarSign,
  TrendingUp,
  Inbox,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Proposal {
  id: string;
  projectId: string;
  projectTitle: string;
  client: {
    name: string;
    avatar: string;
    rating: number;
  };
  category: string;
  status: string;
  dateSubmitted: string;
  yourBid: number;
  clientBudget: {
    min: number;
    max: number;
  };
  deliveryTime: string;
  coverLetter: string;
  viewedByClient?: boolean;
  contractCreatedDate?: string;
}

// Mock Data
const MOCK_PROPOSALS = [
  {
    id: "prop-1",
    projectId: "proj-1",
    projectTitle: "Build a Modern SaaS Landing Page with Next.js",
    client: {
      name: "TechCorp",
      avatar: "https://github.com/shadcn.png",
      rating: 4.8,
    },
    category: "Web Development",
    status: "pending",
    dateSubmitted: "2024-03-01T10:00:00Z",
    yourBid: 7500,
    clientBudget: { min: 5000, max: 8000 },
    deliveryTime: "45 days",
    coverLetter:
      "I have extensive experience building SaaS landing pages using Next.js and Tailwind CSS. I've worked on similar projects where performance and SEO were top priorities. I can ensure a pixel-perfect design and smooth animations.",
    viewedByClient: true,
  },
  {
    id: "prop-2",
    projectId: "proj-2",
    projectTitle: "Mobile App UI/UX Design for E-commerce",
    client: {
      name: "ShopifyPlus",
      avatar: "https://github.com/shadcn.png",
      rating: 4.9,
    },
    category: "Design",
    status: "accepted",
    dateSubmitted: "2024-02-25T14:30:00Z",
    contractCreatedDate: "2024-03-01T09:00:00Z",
    yourBid: 3200,
    clientBudget: { min: 3000, max: 4000 },
    deliveryTime: "20 days",
    coverLetter:
      "My focus is on creating intuitive user experiences that drive conversions. I have designed over 10 e-commerce apps with a consistent track record of user satisfaction.",
    viewedByClient: true,
  },
  {
    id: "prop-3",
    projectId: "proj-3",
    projectTitle: "Python Backend API Integration",
    client: {
      name: "DataFlow",
      avatar: "https://github.com/shadcn.png",
      rating: 4.5,
    },
    category: "Backend",
    status: "rejected",
    dateSubmitted: "2024-02-20T11:15:00Z",
    yourBid: 5000,
    clientBudget: { min: 6000, max: 9000 },
    deliveryTime: "30 days",
    coverLetter:
      "I specializing in building scalable Python APIs using FastAPI and PostgreSQL. I have implemented complex data processing pipelines for various clients.",
    viewedByClient: true,
  },
  {
    id: "prop-4",
    projectId: "proj-4",
    projectTitle: "React Native Cross-Platform App",
    client: {
      name: "AppVentures",
      avatar: "https://github.com/shadcn.png",
      rating: 4.7,
    },
    category: "Mobile",
    status: "pending",
    dateSubmitted: "2024-03-02T16:45:00Z",
    yourBid: 12000,
    clientBudget: { min: 10000, max: 15000 },
    deliveryTime: "60 days",
    coverLetter:
      "Highly experienced React Native developer with multiple successful apps in both App Store and Play Store. Expertise in Push Notifications, Maps, and In-app Purchases.",
    viewedByClient: false,
  },
];

export default function FreelancerProposals() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [expandedLetters, setExpandedLetters] = useState<
    Record<string, boolean>
  >({});

  const toggleExpand = (id: string) => {
    setExpandedLetters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredProposals = MOCK_PROPOSALS.filter((proposal) => {
    const matchesTab = activeTab === "all" || proposal.status === activeTab;
    const matchesSearch =
      proposal.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.client.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "newest")
      return (
        new Date(b.dateSubmitted).getTime() -
        new Date(a.dateSubmitted).getTime()
      );
    if (sortBy === "oldest")
      return (
        new Date(a.dateSubmitted).getTime() -
        new Date(b.dateSubmitted).getTime()
      );
    if (sortBy === "highest") return b.yourBid - a.yourBid;
    if (sortBy === "lowest") return a.yourBid - b.yourBid;
    return 0;
  });

  const stats = {
    total: MOCK_PROPOSALS.length,
    pending: MOCK_PROPOSALS.filter((p) => p.status === "pending").length,
    accepted: MOCK_PROPOSALS.filter((p) => p.status === "accepted").length,
    rejected: MOCK_PROPOSALS.filter((p) => p.status === "rejected").length,
    winRate: Math.round(
      (MOCK_PROPOSALS.filter((p) => p.status === "accepted").length /
        MOCK_PROPOSALS.length) *
        100,
    ),
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

        {/* Filters Row */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-card p-2 rounded-xl border border-border shadow-sm">
          <Tabs
            defaultValue="all"
            className="w-full lg:w-auto"
            onValueChange={setActiveTab}
          >
            <TabsList className="bg-transparent border-none">
              <TabsTrigger
                value="all"
                className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                All ({stats.total})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Pending ({stats.pending})
              </TabsTrigger>
              <TabsTrigger
                value="accepted"
                className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Accepted ({stats.accepted})
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Rejected ({stats.rejected})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-10 bg-accent/50 border-none focus-visible:ring-1 focus-visible:ring-primary h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] bg-accent/50 border-none focus:ring-1 focus:ring-primary h-10">
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

        {/* Proposal List */}
        <div className="space-y-4">
          {filteredProposals.length > 0 ? (
            filteredProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                isExpanded={!!expandedLetters[proposal.id]}
                onToggleExpand={() => toggleExpand(proposal.id)}
              />
            ))
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-card/50 rounded-3xl border border-dashed border-border">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                <Inbox className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">No proposals yet</h3>
                <p className="text-muted-foreground">
                  Start browsing projects and submit your first proposal
                </p>
              </div>
              <Button
                asChild
                className="rounded-full px-8 h-11 bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all font-semibold"
              >
                <Link to="/freelancer/browse">Browse Projects →</Link>
              </Button>
            </div>
          )}
        </div>
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
}: {
  proposal: Proposal;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const statusConfig: Record<
    string,
    { label: string; className: string; icon: React.ElementType }
  > = {
    pending: {
      label: "Pending",
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      icon: Clock,
    },
    accepted: {
      label: "Accepted",
      className: "bg-green-500/10 text-green-500 border-green-500/20",
      icon: CheckCircle,
    },
    rejected: {
      label: "Rejected",
      className: "bg-red-500/10 text-red-500 border-red-500/20",
      icon: XCircle,
    },
  };

  const status = statusConfig[proposal.status];

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
              {new Date(proposal.dateSubmitted).toLocaleDateString("en-US", {
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
              <DropdownMenuItem className="gap-2">
                <Edit2 className="w-4 h-4" /> Edit Proposal
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-destructive">
                <Trash2 className="w-4 h-4" /> Withdraw
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <RotateCcw className="w-4 h-4" /> Reuse Letter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Project Info */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <Link
                to={`/freelancer/projects/${proposal.projectId}`}
                className="text-xl font-bold hover:text-primary transition-colors inline-block"
              >
                {proposal.projectTitle}
              </Link>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-accent/50 rounded-full text-xs font-medium">
                  <Avatar className="w-4 h-4">
                    <AvatarImage src={proposal.client.avatar} />
                    <AvatarFallback>
                      {proposal.client.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {proposal.client.name}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  {proposal.client.rating}
                </div>
                <span className="text-muted-foreground/30">•</span>
                <Badge
                  variant="secondary"
                  className="bg-primary/5 text-primary text-[10px] uppercase tracking-wider font-bold"
                >
                  {proposal.category}
                </Badge>
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
              ${proposal.yourBid?.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
              Client Budget
            </p>
            <p className="text-sm font-semibold">
              ${proposal.clientBudget.min / 1000}k-$
              {proposal.clientBudget.max / 1000}k
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
              Delivery
            </p>
            <p className="text-sm font-semibold">{proposal.deliveryTime}</p>
          </div>
        </div>

        {/* Cover Letter */}
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

        {/* Status Section */}
        <div className="pt-4 border-t border-border/50">
          {proposal.status === "pending" && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-2 h-2 bg-yellow-500 rounded-full animate-ping opacity-75" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Submitted 3 days ago</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {proposal.viewedByClient ? (
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
              >
                Withdraw Proposal
              </Button>
            </div>
          )}

          {proposal.status === "accepted" && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-green-600 dark:text-green-400">
                    🎉 Your proposal was accepted!
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Contract created on{" "}
                    {new Date(proposal.contractCreatedDate).toLocaleDateString(
                      "en-US",
                      { month: "long", day: "numeric", year: "numeric" },
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 shadow-lg shadow-green-500/20"
                >
                  View Contract <ExternalLink className="w-3.5 h-3.5 ml-2" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full px-6 border-green-500/30 hover:bg-green-500/10 text-green-600 dark:text-green-400"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-2" /> Message Client
                </Button>
              </div>
            </div>
          )}

          {proposal.status === "rejected" && (
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
                >
                  Find Similar Projects
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-xs rounded-full text-muted-foreground group"
                  onClick={() => {
                    navigator.clipboard.writeText(proposal.coverLetter);
                    // Trigger a toast here if possible
                  }}
                >
                  <Copy className="w-3.5 h-3.5 mr-2 transition-transform group-hover:scale-110" />{" "}
                  Copy Letter
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
