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
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

// Mock Draft Data
const MOCK_DRAFTS = [
  {
    id: "d1",
    title: "Crypto Wallet Mobile App",
    description:
      "A secure mobile wallet for storing and trading cryptocurrencies. Needs to support multiple chains.",
    status: "draft",
    budget: { min: 8000, max: 12000 },
    deadline: "2024-06-01",
    skills: ["React Native", "Blockchain", "Security"],
    lastSaved: "2 hours ago",
  },
  {
    id: "d2",
    title: "Internal HR Portal",
    description:
      "Web portal for employee management, leave requests, and payroll viewing.",
    status: "draft",
    budget: { min: 4000, max: 6000 },
    deadline: null,
    skills: ["React", "Node.js"],
    lastSaved: "1 day ago",
  },
];

const ClientDraftsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [drafts, setDrafts] = useState(MOCK_DRAFTS);

  const handleDelete = (id: string) => {
    setDrafts(drafts.filter((d) => d.id !== id));
    toast.error("Draft deleted successfully");
  };

  const filteredDrafts = drafts.filter((draft) =>
    draft.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-8 space-y-10 animate-fade-in max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-2xl bg-muted/50 hover:bg-muted text-muted-foreground transition-all active:scale-95"
              asChild
            >
              <Link to="/client/projects">
                <ArrowLeft className="h-6 w-6" />
              </Link>
            </Button>
            <div>
              <Badge
                variant="secondary"
                className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/10 mb-2 font-black uppercase tracking-widest text-[10px]"
              >
                Creative Workspace
              </Badge>
              <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Project Drafts
              </h1>
              <p className="text-muted-foreground font-medium mt-1">
                Continue refining your vision before going live.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center bg-card/40 backdrop-blur-md p-5 rounded-[2rem] border border-border/40 shadow-xl shadow-foreground/5">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              placeholder="Find a saved draft..."
              className="pl-11 h-12 bg-background/50 border-border/40 rounded-2xl focus:ring-primary/20 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 ml-auto w-full md:w-auto">
            <Button
              variant="outline"
              className="h-12 rounded-2xl font-black px-6 border-2 flex-1 md:flex-none"
            >
              <Plus className="w-4 h-4 mr-2" /> Quick Draft
            </Button>
          </div>
        </div>

        {/* Drafts Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Create New Draft Card */}
          <Link to="/client/post-project" className="group relative">
            <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] -rotate-1 group-hover:rotate-0 transition-transform duration-500" />
            <Card className="relative h-full min-h-[320px] bg-card/20 backdrop-blur-sm border-2 border-dashed border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-500 flex flex-col items-center justify-center p-8 rounded-[2.5rem] group-hover:shadow-2xl group-hover:shadow-primary/10 overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileEdit className="w-24 h-24" />
              </div>
              <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-inner">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-black text-2xl tracking-tight text-foreground/80 group-hover:text-primary transition-colors">
                New Masterpiece
              </h3>
              <p className="text-muted-foreground text-center mt-3 font-medium leading-relaxed">
                Start from scratch and let our AI assist you in crafting the
                perfect brief.
              </p>
              <div className="mt-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                <Badge className="bg-primary hover:bg-primary text-white font-black px-4 py-1.5 rounded-full">
                  Get Started
                </Badge>
              </div>
            </Card>
          </Link>

          {filteredDrafts.map((draft) => (
            <Card
              key={draft.id}
              className="group flex flex-col bg-card/60 backdrop-blur-xl border-border/40 hover:border-primary/30 transition-all duration-500 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-foreground/5 relative"
            >
              <div className="absolute top-0 right-0 p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-muted/80 backdrop-blur-sm"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 rounded-2xl border-border/40 backdrop-blur-xl"
                  >
                    <DropdownMenuItem
                      onClick={() => handleDelete(draft.id)}
                      className="text-destructive font-bold p-3 focus:bg-destructive/10"
                    >
                      <Trash2 className="mr-3 h-5 w-5" /> Delete Forever
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardHeader className="p-8 pb-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-black uppercase tracking-widest text-[10px] py-1 px-3">
                      Draft
                    </Badge>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                      Saved {draft.lastSaved}
                    </span>
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                    {draft.title}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent className="px-8 flex-1 space-y-6">
                <p className="text-muted-foreground font-medium text-sm line-clamp-2 leading-relaxed">
                  {draft.description}
                </p>

                <div className="grid grid-cols-1 gap-4 bg-muted/30 p-4 rounded-2xl border border-border/40">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="p-2 bg-background/50 rounded-lg">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="font-black text-foreground text-sm tracking-tight">
                      ${draft.budget.min.toLocaleString()} - $
                      {draft.budget.max.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="p-2 bg-background/50 rounded-lg">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-bold text-sm">
                      {draft.deadline
                        ? new Date(draft.deadline).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" },
                          )
                        : "Open Deadline"}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {draft.skills.slice(0, 3).map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-primary/5 text-primary border-primary/10 font-bold text-[10px] px-2.5"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {draft.skills.length > 3 && (
                    <Badge variant="outline" className="font-bold text-[10px]">
                      +{draft.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-8 pt-4">
                <Button
                  className="w-full h-14 rounded-2xl font-black text-lg gap-3 shadow-lg shadow-primary/20 group-hover:scale-[1.02] active:scale-[0.98] transition-all"
                  asChild
                >
                  <Link to={`/client/post-project?draftId=${draft.id}`}>
                    <FileEdit className="h-5 w-5" /> Continue Work
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredDrafts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 bg-card/20 rounded-[3rem] border-4 border-dashed border-border/40 text-center">
            <div className="p-10 bg-muted/40 rounded-full mb-8 relative">
              <FileEdit className="w-20 h-20 text-muted-foreground/30" />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-foreground/80">
              No matches found
            </h3>
            <p className="text-muted-foreground mt-3 font-medium max-w-xs mx-auto">
              Try adjusting your search or create a new project draft.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientDraftsPage;
