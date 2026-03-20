import { DashboardLayout } from "@/components/layout/DashboardLayout";

/*
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
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
        </div>
      </div>
    </DashboardLayout>
  );
};
*/

const FreelancerProjects = () => {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-black opacity-20 italic">Screen Disabled</h2>
        <p className="text-muted-foreground">This screen is no longer in use.</p>
      </div>
    </DashboardLayout>
  );
};

export default FreelancerProjects;
