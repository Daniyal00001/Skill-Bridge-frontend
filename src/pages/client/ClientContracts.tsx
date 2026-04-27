import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Search,
  PlusCircle,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Loader2,
  Shield,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Eye,
  Lock,
  Layers,
  Calendar,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ContractSummary {
  id: string;
  projectId: string;
  title: string;
  status: string;
  totalAmount: number;
  earnedAmount: number;
  escrowAmount: number;
  progress: number;
  createdAt: string;
  endDate?: string;
  milestonesTotal: number;
  milestonesApproved: number;
  milestonesSubmitted: number;
  freelancer: { name: string; image?: string };
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  ACTIVE: { label: "Active", color: "bg-emerald-500/10 text-emerald-700 border-emerald-400/30", dot: "bg-emerald-500" },
  OFFER_PENDING: { label: "Offer Pending", color: "bg-amber-500/10 text-amber-700 border-amber-400/30", dot: "bg-amber-500" },
  COMPLETED: { label: "Completed", color: "bg-blue-500/10 text-blue-700 border-blue-400/30", dot: "bg-blue-500" },
  CANCELLED: { label: "Cancelled", color: "bg-red-500/10 text-red-700 border-red-400/30", dot: "bg-red-500" },
  DISPUTED: { label: "Disputed", color: "bg-rose-500/10 text-rose-700 border-rose-400/30", dot: "bg-rose-500" },
};

const ClientContractsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [contracts, setContracts] = useState<ContractSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const initialTab = searchParams.get("tab") || "active";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const res = await api.get("/contracts");
        const raw: any[] = res.data.contracts || [];
        setContracts(
          raw.map((c) => ({
            id: c.id,
            projectId: c.projectId,
            title: c.title,
            status: c.status,
            totalAmount: c.totalAmount || 0,
            earnedAmount: c.earnedAmount || 0,
            escrowAmount: c.escrowAmount || 0,
            progress: c.progress || 0,
            createdAt: c.createdAt,
            endDate: c.endDate,
            milestonesTotal: c.milestonesTotal || 0,
            milestonesApproved: c.milestonesApproved || 0,
            milestonesSubmitted: c.milestonesSubmitted || 0,
            freelancer: c.freelancer,
          }))
        );
      } catch {
        toast.error("Failed to load contracts");
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  const stats = useMemo(() => {
    const total = contracts.reduce((s, c) => s + c.totalAmount, 0);
    const released = contracts.reduce((s, c) => s + c.earnedAmount, 0);
    const escrow = contracts.reduce((s, c) => s + (c.escrowAmount || 0), 0);
    const active = contracts.filter((c) => c.status === "ACTIVE").length;
    const needsReview = contracts.filter((c) => (c.milestonesSubmitted || 0) > 0).length;
    const disputed = contracts.filter((c) => c.status === "DISPUTED").length;
    return { total, released, escrow, active, needsReview, disputed };
  }, [contracts]);

  const filtered = useMemo(() => {
    return contracts.filter((c) => {
      const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.freelancer.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
      if (activeTab === "active") return c.status === "ACTIVE" || c.status === "OFFER_PENDING";
      if (activeTab === "completed") return c.status === "COMPLETED";
      if (activeTab === "disputed") return c.status === "DISPUTED";
      return true;
    });
  }, [contracts, searchTerm, activeTab]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Contract Hub</h1>
            <p className="text-muted-foreground font-medium mt-1">
              Manage escrow, track milestones, and oversee payments for all your contracts.
            </p>
          </div>
          <Button asChild className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20 gap-2">
            <Link to="/client/post-project">
              <PlusCircle className="w-4 h-4" /> Post New Project
            </Link>
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Asset Value", value: `$${stats.total.toLocaleString()}`, icon: <DollarSign className="w-5 h-5" />, color: "text-primary", bg: "bg-primary/5 border-primary/10" },
            { label: "Total Released", value: `$${stats.released.toLocaleString()}`, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-emerald-600", bg: "bg-emerald-500/5 border-emerald-500/10" },
            { label: "In Escrow", value: `$${stats.escrow.toLocaleString()}`, icon: <Shield className="w-5 h-5" />, color: "text-blue-600", bg: "bg-blue-500/5 border-blue-500/10" },
            { label: "Active Jobs", value: stats.active.toString(), icon: <TrendingUp className="w-5 h-5" />, color: "text-violet-600", bg: "bg-violet-500/5 border-violet-500/10" },
            { label: "Needs Review", value: stats.needsReview.toString(), icon: <AlertTriangle className="w-5 h-5" />, color: "text-orange-600", bg: "bg-orange-500/5 border-orange-500/10" },
          ].map((s, i) => (
            <Card key={i} className={cn("rounded-2xl border", s.bg)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-xl bg-background", s.color)}>{s.icon}</div>
                <div className="min-w-0">
                  <p className={cn("text-xl font-black", s.color)}>{s.value}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Needs-Review Alert */}
        {stats.needsReview > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
            <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0" />
            <p className="text-sm font-bold text-orange-700">
              <span className="font-black">{stats.needsReview}</span> contract{stats.needsReview > 1 ? "s have" : " has"} milestones awaiting your review. Please act within 3 days to avoid automatic payment release.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-muted/50 p-1 rounded-2xl border border-border/30">
            <TabsList className="bg-transparent gap-1 h-11">
              {[
                { value: "active", label: "Active" },
                { value: "completed", label: "Completed" },
                { value: "all", label: "All" },
              ].map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="rounded-xl font-black px-5 data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm">
                  {t.label}
                  {t.value === "active" && contracts.filter(c => c.status === "ACTIVE" || c.status === "OFFER_PENDING").length > 0 && (
                    <span className="ml-1.5 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      {contracts.filter(c => c.status === "ACTIVE" || c.status === "OFFER_PENDING").length}
                    </span>
                  )}
                  {t.value === "disputed" && stats.disputed > 0 && (
                    <span className="ml-1.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      {stats.disputed}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by project or freelancer..."
              className="pl-12 h-12 bg-card/40 border-border/40 rounded-2xl font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Contract Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">Fetching contracts...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-2 border-dashed border-border/50 bg-card/20 py-20 rounded-[2rem]">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-2xl font-black">{searchTerm ? "No matching contracts" : "No contracts yet"}</h3>
              <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                {searchTerm ? "Try adjusting your search terms." : "Hire a freelancer from your project proposals to start a contract."}
              </p>
              {!searchTerm && (
                <Button asChild variant="outline" className="rounded-xl h-12 border-2 px-8 font-bold">
                  <Link to="/client/projects">Browse My Projects</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((contract) => (
              <ClientContractCard key={contract.id} contract={contract} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const ClientContractCard = ({ contract }: { contract: ContractSummary }) => {
  const cfg = statusConfig[contract.status] || statusConfig.ACTIVE;
  const detailLink = `/client/contracts/${contract.id}`;
  const hasSubmitted = (contract.milestonesSubmitted || 0) > 0;

  return (
    <Card className={cn(
      "group overflow-hidden border-border/40 hover:border-primary/30 transition-all duration-300 rounded-[2rem] bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-xl",
      hasSubmitted && "border-orange-400/40 shadow-orange-500/10 shadow-md"
    )}>
      <CardContent className="p-0">
        {hasSubmitted && (
          <div className="px-5 py-2.5 bg-orange-500/10 border-b border-orange-400/20 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <p className="text-xs font-black text-orange-700">
              {contract.milestonesSubmitted} milestone{contract.milestonesSubmitted > 1 ? "s" : ""} awaiting your review
            </p>
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Title + Status */}
          <div className="flex justify-between items-start gap-3">
            <Link to={detailLink} className="flex-1 min-w-0">
              <h3 className="font-black text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                {contract.title}
              </h3>
            </Link>
            <Badge className={cn("font-bold text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg border shrink-0", cfg.color)}>
              <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", cfg.dot)} />
              {cfg.label}
            </Badge>
          </div>

          {/* Freelancer */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/20">
            <Avatar className="h-9 w-9 border-2 border-background shadow-sm shrink-0">
              <AvatarImage src={contract.freelancer?.image} />
              <AvatarFallback className="font-black text-xs">{contract.freelancer?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Freelancer</p>
              <p className="font-bold text-sm truncate">{contract.freelancer?.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Deadline</p>
              <p className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                {contract.endDate ? (
                  <>
                    <Calendar className="w-3 h-3" />
                    {new Date(contract.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </>
                ) : (
                  "N/A"
                )}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground flex items-center gap-1">
                <Layers className="w-3 h-3" /> Milestone Progress
              </span>
              <span className="text-xs font-black text-primary">
                {contract.milestonesApproved || 0}/{contract.milestonesTotal || 0} done
              </span>
            </div>
            <Progress value={contract.progress} className="h-2 rounded-full" />
          </div>

          {/* Money Grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Contract", value: contract.totalAmount, icon: <DollarSign className="w-3 h-3" />, color: "text-foreground" },
              { label: "Released", value: contract.earnedAmount, icon: <CheckCircle2 className="w-3 h-3" />, color: "text-emerald-600" },
              { label: "Escrow", value: contract.escrowAmount || 0, icon: <Lock className="w-3 h-3" />, color: "text-blue-600" },
            ].map((m, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-muted/30 border border-border/10 text-center">
                <p className={cn("text-sm font-black", m.color)}>${m.value.toLocaleString()}</p>
                <p className="text-[9px] uppercase tracking-widest font-black text-muted-foreground mt-0.5 flex items-center justify-center gap-0.5">
                  {m.icon}{m.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          className={cn(
            "w-full rounded-none h-12 font-black border-t border-border/20 text-primary hover:bg-primary hover:text-white transition-all gap-2",
            hasSubmitted && "bg-orange-500/5 hover:bg-orange-600 hover:text-white border-orange-400/20 text-orange-700"
          )}
          asChild
        >
          <Link to={detailLink}>
            {hasSubmitted ? <><Eye className="w-4 h-4" /> Review Submission</> : <><RefreshCw className="w-4 h-4" /> Manage Contract</>}
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClientContractsPage;
