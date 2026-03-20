import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  Search,
  PlusCircle,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Loader2,
  FileText,
  Filter,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useMemo } from "react";

const ClientContractsPage = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    const fetchContracts = async () => {
      setLoading(true);
      try {
        const res = await api.get("/contracts");
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
      const title = c.title || c.project?.title || "";
      const matchSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      if (activeTab === "active") return c.status === "ACTIVE";
      if (activeTab === "completed") return c.status === "COMPLETED";
      return true;
    });
  }, [contracts, searchTerm, activeTab]);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Contract Management</h1>
            <p className="text-muted-foreground font-medium mt-1">
              Track work, fund milestones, and manage payments for your active contracts.
            </p>
          </div>
          <Button asChild className="rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
            <Link to="/client/post-project">
              <PlusCircle className="w-4 h-4 mr-2" /> Post New Project
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="bg-muted/50 p-1 rounded-2xl border border-border/20"
          >
            <TabsList className="bg-transparent gap-2 h-12">
              {[
                { value: "active", label: "Active" },
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

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contracts..."
              className="pl-12 h-14 bg-card/40 border-border/40 rounded-2xl font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">Fetching contracts...</p>
          </div>
        ) : filteredContracts.length === 0 ? (
          <Card className="border-2 border-dashed border-border/60 bg-card/20 py-24 rounded-[2.5rem]">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black">{searchTerm ? "No matching contracts" : "No active contracts"}</h3>
                <p className="text-muted-foreground max-w-xs mx-auto">
                  {searchTerm ? "Try adjusting your search terms." : "Hire a freelancer from your project proposals to start a milestone-based contract."}
                </p>
              </div>
              {!searchTerm && (
                <Button asChild variant="outline" className="rounded-xl h-12 border-2 px-8">
                  <Link to="/client/projects">Browse My Projects</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContracts.map((contract) => (
              <ContractCard key={contract.id} contract={contract} role="CLIENT" />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const ContractCard = ({ contract, role }: { contract: any; role: "CLIENT" | "FREELANCER" }) => {
  const isFreelancer = role === "FREELANCER";
  const detailLink = isFreelancer 
    ? `/freelancer/contracts/${contract.id}` 
    : `/client/contracts/${contract.id}`;

  return (
    <Card className="group overflow-hidden border-border/40 hover:border-primary/40 transition-all duration-300 rounded-[2rem] bg-card/60 backdrop-blur-sm shadow-sm hover:shadow-xl">
      <CardContent className="p-0">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start gap-4">
            <Link to={detailLink} className="group-hover:text-primary transition-colors flex-1 min-w-0">
              <h3 className="font-black text-lg line-clamp-2 leading-tight break-words">
                {contract.title}
              </h3>
            </Link>
            <Badge className={cn(
              "font-bold text-[10px] uppercase tracking-widest px-2 py-1",
              contract.status === "ACTIVE" 
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-blue-500/10 text-blue-600 border-blue-500/20"
            )}>
              {contract.status}
            </Badge>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/20">
            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
              <AvatarImage src={contract.freelancer.image} />
              <AvatarFallback className="font-black text-xs">
                {contract.freelancer.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-0.5">
                {isFreelancer ? "For Client" : "Freelancer"}
              </p>
              <p className="font-bold text-sm truncate">{contract.freelancer.name}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                  Contract Value
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black">${contract.totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">
                  Completion
                </p>
                <p className="font-black text-sm text-primary">{contract.progress}%</p>
              </div>
            </div>
            <Progress value={contract.progress} className="h-2 rounded-full bg-muted shadow-inner" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground flex items-center gap-1 mb-1">
                <DollarSign className="w-3 h-3 text-emerald-500" /> Earned
              </p>
              <p className="font-black text-lg">${contract.earnedAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
              <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-blue-500" /> Started
              </p>
              <p className="font-black text-xs text-foreground/80 mt-1">
                {new Date(contract.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full rounded-none h-14 font-black border-t border-border/20 text-primary hover:bg-primary hover:text-white transition-all gap-2"
          asChild
        >
          <Link to={detailLink}>
            Manage Milestone System <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClientContractsPage;
