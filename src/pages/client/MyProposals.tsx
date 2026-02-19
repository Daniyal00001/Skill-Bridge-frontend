import { useState } from "react";
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
import { Search, Filter, Eye, ArrowUpRight, DollarSign, Clock } from "lucide-react";

// Mock Data for Received Proposals
const MOCK_ALL_PROPOSALS = [
    {
        id: "prop-1",
        projectId: "1",
        projectTitle: "E-Commerce Mobile App Redesign",
        developer: {
            id: "dev-1",
            name: "Alex Chen",
            avatar: "https://i.pravatar.cc/150?u=alex",
            title: "Senior Full Stack Dev"
        },
        budget: 7500,
        deliveryTime: "4 weeks",
        status: "pending",
        date: "2024-02-15",
    },
    {
        id: "prop-2",
        projectId: "1",
        projectTitle: "E-Commerce Mobile App Redesign",
        developer: {
            id: "dev-2",
            name: "Sarah Jones",
            avatar: "https://i.pravatar.cc/150?u=sarah",
            title: "Mobile Specialist"
        },
        budget: 8200,
        deliveryTime: "3 weeks",
        status: "rejected",
        date: "2024-02-14",
    },
    {
        id: "prop-3",
        projectId: "2",
        projectTitle: "AI-Powered Customer Support Chatbot",
        developer: {
            id: "dev-3",
            name: "Michael Brown",
            avatar: "https://i.pravatar.cc/150?u=mike",
            title: "AI Engineer"
        },
        budget: 4500,
        deliveryTime: "2 weeks",
        status: "accepted",
        date: "2024-02-12",
    },
    {
        id: "prop-4",
        projectId: "3",
        projectTitle: "Corporate Website Migration",
        developer: {
            id: "dev-4",
            name: "Emily Davis",
            avatar: "https://i.pravatar.cc/150?u=emily",
            title: "Frontend Developer"
        },
        budget: 3000,
        deliveryTime: "1 week",
        status: "pending",
        date: "2024-02-10",
    },
    {
        id: "prop-5",
        projectId: "1",
        projectTitle: "E-Commerce Mobile App Redesign",
        developer: {
            id: "dev-5",
            name: "David Wilson",
            avatar: "https://i.pravatar.cc/150?u=david",
            title: "React Native Expert"
        },
        budget: 6800,
        deliveryTime: "5 weeks",
        status: "pending",
        date: "2024-02-16",
    }
];

const MyProposalsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredProposals = MOCK_ALL_PROPOSALS.filter((proposal) => {
        const matchesSearch =
            proposal.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            proposal.developer.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "all" || proposal.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "accepted":
                return <Badge className="bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200">Accepted</Badge>;
            case "rejected":
                return <Badge variant="destructive" className="bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200">Rejected</Badge>;
            default:
                return <Badge variant="secondary" className="bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 border-yellow-200">Pending</Badge>;
        }
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
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-lg border shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by project or developer..."
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

                {/* Proposals Table */}
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
                                    <TableHead className="pl-6">Developer</TableHead>
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
                                                    <AvatarImage src={proposal.developer.avatar} />
                                                    <AvatarFallback>{proposal.developer.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">{proposal.developer.name}</p>
                                                    <p className="text-xs text-muted-foreground">{proposal.developer.title}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium text-sm line-clamp-1 max-w-[200px]" title={proposal.projectTitle}>
                                                {proposal.projectTitle}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span>${proposal.budget.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{proposal.deliveryTime}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {proposal.date}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(proposal.status)}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 hover:text-primary">
                                                <Link to={`/client/projects/${proposal.projectId}/proposals`}>
                                                    View Project <ArrowUpRight className="ml-1 h-3 w-3" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {filteredProposals.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No proposals found.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default MyProposalsPage;
