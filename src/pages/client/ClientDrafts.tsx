import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreVertical,
    Search,
    Plus,
    Calendar,
    DollarSign,
    FileEdit,
    Trash2,
    ArrowLeft
} from "lucide-react";

// Mock Draft Data
const MOCK_DRAFTS = [
    {
        id: "d1",
        title: "Crypto Wallet Mobile App",
        description: "A secure mobile wallet for storing and trading cryptocurrencies. Needs to support multiple chains.",
        status: "draft",
        budget: { min: 8000, max: 12000 },
        deadline: "2024-06-01",
        skills: ["React Native", "Blockchain", "Security"],
        lastSaved: "2 hours ago"
    },
    {
        id: "d2",
        title: "Internal HR Portal",
        description: "Web portal for employee management, leave requests, and payroll viewing.",
        status: "draft",
        budget: { min: 4000, max: 6000 },
        deadline: null,
        skills: ["React", "Node.js"],
        lastSaved: "1 day ago"
    }
];

const ClientDraftsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");

    // In a real app, delete would make an API call
    const [drafts, setDrafts] = useState(MOCK_DRAFTS);

    const handleDelete = (id: string) => {
        setDrafts(drafts.filter(d => d.id !== id));
    };

    const filteredDrafts = drafts.filter((draft) =>
        draft.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link to="/client/projects">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Draft Projects</h1>
                            <p className="text-muted-foreground mt-1">
                                Continue working on your saved projects.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-card p-4 rounded-lg border shadow-sm">
                    <div className="relative max-w-md">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search drafts..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Drafts Grid */}
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredDrafts.map((draft) => (
                        <Card key={draft.id} className="flex flex-col border-dashed hover:border-solid transition-all duration-200">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">
                                            DRAFT
                                        </Badge>
                                        <span className="text-xs text-muted-foreground block mt-1">
                                            Saved {draft.lastSaved}
                                        </span>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleDelete(draft.id)} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Draft
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <CardTitle className="text-xl mt-2 line-clamp-1">
                                    {draft.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4 pb-4">
                                <p className="text-muted-foreground text-sm line-clamp-2 min-h-[40px]">
                                    {draft.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <DollarSign className="h-4 w-4" />
                                        <span>${draft.budget.min} - ${draft.budget.max}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {draft.deadline ? new Date(draft.deadline).toLocaleDateString() : "No deadline"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {draft.skills.map(skill => (
                                        <Badge key={skill} variant="outline" className="text-xs font-normal">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 pb-6 px-6">
                                <Button className="w-full gap-2" asChild>
                                    <Link to={`/client/post-project?draftId=${draft.id}`}>
                                        <FileEdit className="h-4 w-4" /> Continue Editing
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {/* Create New Draft Card */}
                    <Link to="/client/post-project" className="group">
                        <Card className="flex flex-col items-center justify-center h-full min-h-[300px] border-dashed text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                            <div className="h-12 w-12 rounded-full bg-muted group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
                                <Plus className="h-6 w-6" />
                            </div>
                            <h3 className="font-semibold text-lg">Create New Draft</h3>
                            <p className="text-sm">Start a new project from scratch</p>
                        </Card>
                    </Link>
                </div>

                {filteredDrafts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">
                            No drafts found.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ClientDraftsPage;
