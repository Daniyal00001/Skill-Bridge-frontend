import { useState, useMemo, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  LayoutGrid,
  List,
  Star,
  Clock,
  ArrowRight,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

// --- Types ---
interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  createdAt: string;
  deadline: string;
  budget: number;
  budgetType: string;
  proposalCount: number;
  skills: string[];
  experienceLevel: string;
  projectSize: string;
  client: {
    id: string;
    name: string;
    profileImage?: string;
    rating?: number;
    paymentVerified?: boolean;
    totalHires?: number;
  };
}

const CATEGORIES = ["web", "mobile", "ai", "design", "other"];

const CATEGORY_LABELS: Record<string, string> = {
  web: "Web Dev",
  mobile: "Mobile",
  ai: "AI/ML",
  design: "Design",
  other: "Other",
};

// Freelancer ke skills (baad mein profile se aayenge)
const FREELANCER_SKILLS = ["React", "TypeScript", "Node.js", "MongoDB", "AWS"];

const calculateMatch = (projectSkills: string[]): number => {
  if (!projectSkills?.length) return 0;
  const overlap = projectSkills.filter((skill) =>
    FREELANCER_SKILLS.includes(skill),
  );
  return Math.round((overlap.length / projectSkills.length) * 100);
};

const getCompetition = (count: number) => {
  if (count <= 3)
    return {
      label: "Low Competition",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    };
  if (count <= 7)
    return { label: "Medium", color: "text-amber-500", bg: "bg-amber-500/10" };
  return {
    label: "High Competition",
    color: "text-red-500",
    bg: "bg-red-500/10",
  };
};

// --- Main Component ---
export default function FreelancerBrowseProjects() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // API se projects fetch karo
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      // Query params banao
      const params = new URLSearchParams();
      params.set("status", "OPEN");
      params.set("limit", "20");

      if (searchTerm) params.set("search", searchTerm);
      if (selectedCategory !== "All") params.set("category", selectedCategory);

      // Sort
      if (sortBy === "newest") {
        params.set("sortBy", "createdAt");
        params.set("sortOrder", "desc");
      } else if (sortBy === "highest_budget") {
        params.set("sortBy", "budget");
        params.set("sortOrder", "desc");
      }

      const res = await api.get(`/projects?${params.toString()}`);
      setProjects(res.data.projects);
      setTotalCount(res.data.total || res.data.projects.length);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, sortBy]);

  // Pehli baar aur jab filters change hon
  useEffect(() => {
    // Debounce search — 400ms wait karo type karne ke baad
    const timer = setTimeout(() => {
      fetchProjects();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  // Client side best_match sort (API ke baad)
  const sortedProjects = useMemo(() => {
    if (sortBy === "best_match") {
      return [...projects].sort(
        (a, b) => calculateMatch(b.skills) - calculateMatch(a.skills),
      );
    }
    return projects;
  }, [projects, sortBy]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4">
        {/* Header */}
        <header className="space-y-8 pt-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tight mb-2">
                Browse Projects
              </h1>
              <p className="text-muted-foreground text-lg font-medium">
                {loading
                  ? "Finding projects..."
                  : `${totalCount} projects available for you`}
              </p>
            </div>

            {/* Grid / List Toggle */}
            <div className="flex items-center gap-3 bg-muted/50 p-1 rounded-2xl border border-border/40 w-fit self-center md:self-auto">
              <Button
                variant={view === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("grid")}
                className={cn(
                  "rounded-xl transition-all font-bold px-4",
                  view === "grid" && "bg-background text-primary shadow-sm",
                )}
              >
                <LayoutGrid className="h-4 w-4 mr-2" /> Grid
              </Button>
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
                className={cn(
                  "rounded-xl transition-all font-bold px-4",
                  view === "list" && "bg-background text-primary shadow-sm",
                )}
              >
                <List className="h-4 w-4 mr-2" /> List
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative group max-w-2xl mx-auto md:mx-0">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by keywords, skills, or titles..."
              className="pl-14 h-16 bg-card/50 border-border/40 rounded-[2rem] text-lg focus:ring-primary/20 transition-all font-medium backdrop-blur-md shadow-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sticky top-4 z-20 backdrop-blur-md py-4 rounded-3xl">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar max-w-full">
            {["All", ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border-2",
                  selectedCategory === cat
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-card/40 border-border/40 hover:border-primary/40 text-muted-foreground",
                )}
              >
                {cat === "All" ? "All" : CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>

          <div className="h-8 w-px bg-border/40 mx-2 hidden md:block" />

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] h-11 bg-card/40 border-border/40 rounded-full font-bold">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border/40">
              <SelectItem value="best_match" className="font-medium">
                Best Match
              </SelectItem>
              <SelectItem value="newest" className="font-medium">
                Newest First
              </SelectItem>
              <SelectItem value="highest_budget" className="font-medium">
                Highest Budget
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">
              Fetching projects...
            </p>
          </div>
        ) : (
          <>
            {/* Projects Grid/List */}
            <div
              className={cn(
                "grid gap-6",
                view === "grid"
                  ? "md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1",
              )}
            >
              <AnimatePresence mode="popLayout">
                {sortedProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    {view === "grid" ? (
                      <ProjectCardGrid project={project} />
                    ) : (
                      <ProjectCardList project={project} />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty State */}
            {sortedProjects.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 space-y-4"
              >
                <div className="bg-muted/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                  <X className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-xl font-bold">No projects found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("All");
                  }}
                  className="rounded-full px-8"
                >
                  Reset Filters
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// --- Grid Card ---
const ProjectCardGrid = ({ project }: { project: Project }) => {
  const competition = getCompetition(project.proposalCount || 0);
  const match = calculateMatch(project.skills || []);

  return (
    <Card className="h-full group hover:shadow-2xl transition-all duration-500 border-border/40 bg-card/40 backdrop-blur-sm rounded-[2rem] overflow-hidden flex flex-col">
      <CardHeader className="p-8 pb-4">
        <div className="flex justify-between items-start mb-4">
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1 font-bold text-[10px] uppercase border-primary/20 text-primary"
          >
            {CATEGORY_LABELS[project.category] || project.category}
          </Badge>
          {/* Match % badge */}
          {match > 0 && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border-0 font-black text-[10px]">
              {match}% Match
            </Badge>
          )}
        </div>
        <Link to={`/freelancer/projects/${project.id}`}>
          <CardTitle className="text-xl font-black group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {project.title}
          </CardTitle>
        </Link>
      </CardHeader>

      <CardContent className="p-8 pt-0 flex-1 flex flex-col gap-6">
        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
          {project.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2">
          {project.skills?.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-[10px] font-bold px-3 py-1 bg-muted/50 rounded-full text-foreground/70"
            >
              {skill}
            </span>
          ))}
          {project.skills?.length > 3 && (
            <span className="text-[10px] font-bold px-3 py-1 bg-muted/30 rounded-full text-muted-foreground">
              +{project.skills.length - 3}
            </span>
          )}
        </div>

        {/* Competition badge */}
        <div
          className={cn(
            "text-[10px] font-bold px-3 py-1 rounded-full w-fit",
            competition.bg,
            competition.color,
          )}
        >
          {competition.label} · {project.proposalCount || 0} proposals
        </div>

        {/* Budget & CTA */}
        <div className="mt-auto pt-6 border-t border-border/20 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none">
              Budget
            </p>
            <p className="text-lg font-black text-foreground">
              ${project.budget?.toLocaleString()}
              <span className="text-xs font-bold text-muted-foreground ml-1">
                {project.budgetType === "hourly" ? "/hr" : " fixed"}
              </span>
            </p>
          </div>
          <Link to={`/freelancer/projects/${project.id}`}>
            <Button
              size="icon"
              className="rounded-full h-12 w-12 shadow-lg shadow-primary/20 hover:scale-110 transition-transform"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// --- List Card ---
const ProjectCardList = ({ project }: { project: Project }) => {
  const match = calculateMatch(project.skills || []);

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-border/40 bg-card/40 backdrop-blur-sm rounded-[1.5rem] overflow-hidden p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              variant="outline"
              className="rounded-full text-[9px] font-bold border-primary/20 text-primary uppercase"
            >
              {CATEGORY_LABELS[project.category] || project.category}
            </Badge>
            {match > 0 && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-0 font-black text-[10px]">
                {match}% Match
              </Badge>
            )}
            <span className="text-[10px] font-bold text-muted-foreground">
              <Clock className="w-3 h-3 inline mr-1" />
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
          <Link to={`/freelancer/projects/${project.id}`}>
            <h3 className="text-xl font-black group-hover:text-primary transition-colors">
              {project.title}
            </h3>
          </Link>
          <div className="flex flex-wrap gap-2 pt-1">
            {project.skills?.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="text-[9px] font-bold text-muted-foreground/60"
              >
                #{skill}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8 md:gap-12 shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">
              Budget
            </p>
            <p className="text-lg font-black text-foreground">
              ${project.budget?.toLocaleString()}
              <span className="text-xs font-bold text-muted-foreground ml-1">
                {project.budgetType === "hourly" ? "/hr" : "fixed"}
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {project.proposalCount || 0} proposals
            </p>
          </div>
          <Link to={`/freelancer/projects/${project.id}`}>
            <Button variant="ghost" className="rounded-full font-bold group">
              View{" "}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
