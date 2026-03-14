import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  ArrowUpRight,
  DollarSign,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const MyProposalsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      setLoading(true);
      try {
        // Client apne saare projects ke proposals dekhta hai
        // GET /api/projects/client/my se projects lo, phir har project ke proposals
        // Ya agar backend mein client proposals route hai toh woh use karo
        const projectsRes = await api.get("/projects/client/my");
        const allProjects = projectsRes.data.projects;

        // Har project ke proposals fetch karo
        const proposalPromises = allProjects
          .filter((p: any) => p.status !== "DRAFT")
          .map((p: any) =>
            api
              .get(`/proposals/project/${p.id}`)
              .then((res) =>
                res.data.proposals.map((prop: any) => ({
                  ...prop,
                  projectTitle: p.title,
                  projectId: p.id,
                })),
              )
              .catch(() => []),
          );

        const results = await Promise.all(proposalPromises);
        setProposals(results.flat());
      } catch (err) {
        toast.error("Failed to load proposals");
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const filteredProposals = useMemo(() => {
    return proposals.filter((proposal) => {
      const matchesSearch =
        proposal.projectTitle
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        proposal.freelancer?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        proposal.status?.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [proposals, searchTerm, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACCEPTED":
        return (
          <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200">
            Accepted
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="destructive"
            className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200"
          >
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 border-yellow-200"
          >
            Pending
          </Badge>
        );
    }
  };

  // Stats
  const stats = {
    total: proposals.length,
    pending: proposals.filter((p) => p.status?.toUpperCase() === "PENDING")
      .length,
    accepted: proposals.filter((p) => p.status?.toUpperCase() === "ACCEPTED")
      .length,
    rejected: proposals.filter((p) => p.status?.toUpperCase() === "REJECTED")
      .length,
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Proposals</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage all proposals received for your projects.
            </p>
          </div>
          {/* Quick stats */}
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 bg-muted rounded-full font-bold">
              {stats.total} Total
            </span>
            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-700 rounded-full font-bold">
              {stats.pending} Pending
            </span>
            <span className="px-3 py-1 bg-green-500/10 text-green-700 rounded-full font-bold">
              {stats.accepted} Accepted
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by project or freelancer..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto ml-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading proposals...</p>
          </div>
        ) : (
          <Card>
            <CardHeader className="px-6 py-4 border-b">
              <CardTitle>Received Proposals</CardTitle>
              <CardDescription>
                Review the details and status of each proposal.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Freelancer</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Budget & Time</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProposals.map((proposal) => (
                    <TableRow key={proposal.id} className="group">
                      <TableCell className="pl-6 font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            <AvatarImage
                              src={proposal.freelancer?.profileImage}
                            />
                            <AvatarFallback>
                              {proposal.freelancer?.name?.charAt(0) || "F"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {proposal.freelancer?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {proposal.freelancer?.title || "Freelancer"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className="font-medium text-sm line-clamp-1 max-w-[200px]"
                          title={proposal.projectTitle}
                        >
                          {proposal.projectTitle}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>${proposal.bidAmount?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{proposal.deliveryDays} days</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {proposal.createdAt
                          ? new Date(proposal.createdAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>{getStatusBadge(proposal.status)}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Link
                            to={`/client/projects/${proposal.projectId}/proposals`}
                          >
                            View Project{" "}
                            <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredProposals.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {proposals.length === 0
                      ? "No proposals received yet. Post a project to start receiving bids."
                      : "No proposals match your search."}
                  </p>
                  {proposals.length === 0 && (
                    <Button className="mt-4" asChild>
                      <Link to="/client/post-project">Post a Project</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyProposalsPage;
