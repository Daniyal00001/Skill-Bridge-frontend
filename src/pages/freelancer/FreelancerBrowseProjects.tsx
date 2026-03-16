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
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Briefcase,
  Zap,
  Tag,
  CircleDollarSign,
  Layers,
  BarChart3,
  MapPin,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { Separator } from "@/components/ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// --- Types ---
interface Project {
  id: string;
  title: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  description: string;
  createdAt: string;
  deadline: string;
  budget: number;
  budgetType: string;
  proposalCount: number;
  skills: any[];
  experienceLevel: string;
  size: string;
  clientProfile: {
    fullName: string;
    company?: string;
  };
  languageObj?: { name: string };
  locationObj?: { name: string };
  language?: string;
  locationPref?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Freelancer ke skills (baad mein profile se aayenge)
const FREELANCER_SKILLS = ["React", "TypeScript", "Node.js", "MongoDB", "AWS"];

const calculateMatch = (projectSkills: any[]): number => {
  if (!projectSkills?.length) return 0;

  const skillNames = projectSkills
    .map((s: any) =>
      typeof s === "string" ? s : s.skill?.name || s.name || "",
    )
    .filter((name) => name !== "");

  if (skillNames.length === 0) return 0;

  const overlap = skillNames.filter((skill) =>
    FREELANCER_SKILLS.includes(skill),
  );
  return Math.round((overlap.length / skillNames.length) * 100);
};

const getCompetitionData = (count: number) => {
  if (count <= 3)
    return { label: "Low", color: "text-emerald-500", bg: "bg-emerald-500/5" };
  if (count <= 10)
    return { label: "Average", color: "text-blue-500", bg: "bg-blue-500/5" };
  return { label: "High", color: "text-amber-500", bg: "bg-amber-500/5" };
};

const EXP_LEVELS = ["ENTRY", "MID", "SENIOR", "EXPERT"];
const PROJECT_SIZES = ["SMALL", "MEDIUM", "LARGE"];

export default function FreelancerBrowseProjects() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [selectedExpLevel, setSelectedExpLevel] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get("/categories");
        setCategories(res.data.categories);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCats();
  }, []);

  const fetchProjects = useCallback(
    async (pageIdx = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("status", "OPEN");
        params.set("limit", "25");
        params.set("page", pageIdx.toString());

        if (searchTerm) params.set("search", searchTerm);
        if (selectedCategory !== "All")
          params.set("category", selectedCategory);
        if (minBudget) params.set("budgetMin", minBudget);
        if (maxBudget) params.set("budgetMax", maxBudget);
        if (selectedExpLevel) params.set("experienceLevel", selectedExpLevel);
        if (selectedSize) params.set("projectSize", selectedSize);

        if (sortBy === "newest") {
          params.set("sortBy", "createdAt");
          params.set("sortOrder", "desc");
        } else if (sortBy === "highest_budget") {
          params.set("sortBy", "budget");
          params.set("sortOrder", "desc");
        }

        const res = await api.get(`/projects?${params.toString()}`);
        setProjects(res.data.projects);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoading(false);
      }
    },
    [
      searchTerm,
      selectedCategory,
      sortBy,
      minBudget,
      maxBudget,
      selectedExpLevel,
      selectedSize,
    ],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchProjects(page);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setMinBudget("");
    setMaxBudget("");
    setSelectedExpLevel(null);
    setSelectedSize(null);
    setSortBy("newest");
  };

  const FilterSidebar = () => (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Filters</h3>
        <Button
          variant="link"
          size="sm"
          onClick={resetFilters}
          className="text-primary p-0 h-auto font-medium"
        >
          Clear all
        </Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
            <Tag className="w-3 h-3" /> Category
          </label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-10 bg-muted/30 border-none shadow-none focus:ring-1 focus:ring-primary text-xs font-medium rounded-xl">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              <SelectItem value="All" className="text-xs font-medium">
                All Categories
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem
                  key={cat.id}
                  value={cat.slug}
                  className="text-xs font-medium"
                >
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-4">
          <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
            <CircleDollarSign className="w-3 h-3" /> Budget Range ($)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Min"
              type="number"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              className="bg-muted/30 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary h-9 text-xs"
            />
            <Input
              placeholder="Max"
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="bg-muted/30 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary h-9 text-xs"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
            <BarChart3 className="w-3 h-3" /> Experience
          </label>
          <div className="space-y-2">
            {EXP_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() =>
                  setSelectedExpLevel(selectedExpLevel === level ? null : level)
                }
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group border",
                  selectedExpLevel === level
                    ? "bg-primary/5 border-primary/50 text-primary"
                    : "bg-transparent border-transparent hover:bg-muted/50 text-muted-foreground",
                )}
              >
                {level.charAt(0) + level.slice(1).toLowerCase()}
                {selectedExpLevel === level && <Zap className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
            <Layers className="w-3 h-3" /> Project Size
          </label>
          <div className="flex flex-col gap-2">
            {PROJECT_SIZES.map((size) => (
              <button
                key={size}
                onClick={() =>
                  setSelectedSize(selectedSize === size ? null : size)
                }
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group border",
                  selectedSize === size
                    ? "bg-primary/5 border-primary/50 text-primary"
                    : "bg-transparent border-transparent hover:bg-muted/50 text-muted-foreground",
                )}
              >
                {size.charAt(0) + size.slice(1).toLowerCase()}
                {selectedSize === size && <Zap className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-10">
        <div className="flex flex-col gap-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Marketplace
            </h1>
            <p className="text-muted-foreground font-medium">
              {loading
                ? "Finding opportunities..."
                : `Showing ${pagination.total} open projects`}
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search projects..."
                className="pl-11 h-12 bg-card border-border/50 rounded-xl shadow-sm focus-visible:ring-1 focus-visible:ring-primary/30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-12 bg-card border-border/50 rounded-xl px-4 w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="highest_budget">High Budget</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex p-1 bg-muted/40 rounded-xl border border-border/50">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-lg",
                    view === "grid" && "bg-background shadow-sm text-primary",
                  )}
                  onClick={() => setView("grid")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 rounded-lg",
                    view === "list" && "bg-background shadow-sm text-primary",
                  )}
                  onClick={() => setView("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-xl"
                    >
                      <Filter className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[300px] border-r border-border/50"
                  >
                    <FilterSidebar />
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <aside className="hidden lg:block lg:col-span-3 h-fit sticky top-24">
            <FilterSidebar />
          </aside>

          <main className="lg:col-span-9 space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Loading Market...
                </span>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "grid gap-6",
                    view === "grid" ? "md:grid-cols-2" : "grid-cols-1",
                  )}
                >
                  <AnimatePresence mode="popLayout">
                    {projects.map((project, idx) => (
                      <motion.div
                        key={project.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
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

                {projects.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-32 bg-muted/20 rounded-2xl border border-dashed border-border text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Search className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-bold">No results found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                      Adjust your filters or search keywords to find what you're
                      looking for.
                    </p>
                    <Button
                      variant="outline"
                      onClick={resetFilters}
                      className="mt-6 rounded-lg text-xs font-bold uppercase"
                    >
                      Clear filters
                    </Button>
                  </div>
                )}

                {projects.length > 0 && pagination.totalPages > 1 && (
                  <div className="flex justify-center pt-10">
                    <Pagination>
                      <PaginationContent>
                        <PaginationPrevious
                          onClick={() => handlePageChange(pagination.page - 1)}
                          className={cn(
                            "cursor-pointer",
                            pagination.page === 1 &&
                              "opacity-30 pointer-events-none",
                          )}
                        />
                        {Array.from(
                          { length: Math.min(pagination.totalPages, 5) },
                          (_, i) => i + 1,
                        ).map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink
                              isActive={pagination.page === p}
                              onClick={() => handlePageChange(p)}
                              className="cursor-pointer font-bold"
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationNext
                          onClick={() => handlePageChange(pagination.page + 1)}
                          className={cn(
                            "cursor-pointer",
                            pagination.page === pagination.totalPages &&
                              "opacity-30 pointer-events-none",
                          )}
                        />
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}

const ProjectCardGrid = ({ project }: { project: Project }) => {
  const match = calculateMatch(project.skills || []);

  return (
    <Card className="h-full bg-card border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl overflow-hidden flex flex-col group">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-start justify-between mb-4">
          <Badge
            variant="secondary"
            className="bg-muted text-muted-foreground border-none text-[10px] font-bold py-1 px-2.5 rounded-lg"
          >
            {project.category?.name || "Uncategorized"}
          </Badge>
          {match > 0 && (
            <div className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
              {match}% Match
            </div>
          )}
        </div>
        <Link to={`/freelancer/projects/${project.id}`}>
          <h3 className="text-lg font-bold leading-tight line-clamp-2 hover:text-primary transition-colors">
            {project.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="p-6 pt-0 flex-1 flex flex-col gap-6">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {project.skills?.slice(0, 3).map((s: any) => {
            const name = typeof s === "string" ? s : s.skill?.name || s.name;
            return (
              <span
                key={name}
                className="text-[9px] font-semibold bg-muted/50 px-2 py-1 rounded-md text-muted-foreground"
              >
                {name}
              </span>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-border/50">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
              Budget
            </span>
            <div className="text-lg font-bold">
              ${project.budget?.toLocaleString()}
              <span className="text-xs font-medium text-muted-foreground ml-1">
                {project.budgetType === "hourly" ? "/hr" : ""}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
              <MapPin className="w-3 h-3 text-primary" />
              <span>{project.locationObj?.name || project.locationPref || "Global"}</span>
            </div>
            <Link to={`/freelancer/projects/${project.id}`}>
              <Button
                size="icon"
                className="h-10 w-10 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 group-hover:translate-x-1 transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ProjectCardList = ({ project }: { project: Project }) => {
  const match = calculateMatch(project.skills || []);

  return (
    <Card className="bg-card border-border/50 hover:border-primary/30 transition-all duration-300 rounded-2xl p-6 group">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className="text-[9px] font-bold py-0.5 px-2 rounded-md"
            >
              {project.category?.name}
            </Badge>
            {match > 0 && (
              <span className="text-[10px] font-bold text-emerald-500">
                {match}% Match
              </span>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />{" "}
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-2">
              <MapPin className="w-3 h-3 text-primary" />
              {project.locationObj?.name || project.locationPref || "Global"}
            </span>
          </div>

          <Link to={`/freelancer/projects/${project.id}`}>
            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
              {project.title}
            </h3>
          </Link>

          <div className="flex flex-wrap gap-2 pt-1 opacity-70 group-hover:opacity-100 transition-opacity">
            {project.skills?.slice(0, 5).map((s: any) => {
              const name = typeof s === "string" ? s : s.skill?.name || s.name;
              return (
                <span
                  key={name}
                  className="text-[10px] font-medium text-muted-foreground"
                >
                  #{name.toLowerCase()}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-8 md:gap-12 shrink-0 border-t md:border-t-0 pt-6 md:pt-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider mb-1">
              Fixed Price
            </span>
            <div className="text-xl font-bold">
              ${project.budget?.toLocaleString()}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {project.proposalCount || 0} proposals
            </span>
          </div>
          <Link to={`/freelancer/projects/${project.id}`}>
            <Button
              variant="outline"
              className="h-10 px-4 rounded-xl font-bold hover:bg-primary hover:text-white transition-all"
            >
              View Brief
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
