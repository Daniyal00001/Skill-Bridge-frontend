import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Clock,
  ArrowRight,
  Loader2,
  Filter,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// --- Types ---
interface Project {
  id: string;
  title: string;
  category: { id: string; name: string; slug: string };
  description: string;
  createdAt: string;
  deadline: string;
  budget: number;
  budgetType: string;
  proposalCount: number;
  skills: any[];
  experienceLevel: string;
  size: string;
  clientProfile: { fullName: string; company?: string };
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
    const timer = setTimeout(() => fetchProjects(1), 400);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) fetchProjects(page);
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

  // ── Filter Bar (horizontal, used both inline and in mobile Sheet) ──────────
  const FilterBar = ({ compact = false }: { compact?: boolean }) => (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2.5 bg-white border border-blue-100 rounded-2xl relative overflow-hidden",
        compact ? "p-4 flex-col items-start gap-4" : "px-5 py-3",
      )}
      style={{
        background: compact
          ? "white"
          : "linear-gradient(135deg, rgba(55,138,221,0.04) 0%, white 60%)",
      }}
    >
      {/* Search */}
      <div className="relative min-w-[180px] flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-300" />
        <Input
          placeholder="Search skills or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 h-8 text-xs bg-blue-50/50 border-blue-100 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-300 placeholder:text-slate-400"
        />
      </div>

      <div className="w-px h-6 bg-blue-100 hidden sm:block" />

      {/* Category */}
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs bg-blue-50/50 border-blue-100 rounded-lg focus:ring-1 focus:ring-blue-300">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-blue-100">
          <SelectItem value="All" className="text-xs">
            All Categories
          </SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.slug} className="text-xs">
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-px h-6 bg-blue-100 hidden sm:block" />

      {/* Budget */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
          Budget
        </span>
        <div className="flex items-center gap-1">
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
              $
            </span>
            <Input
              placeholder="Min"
              type="number"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              className="pl-5 h-8 w-16 text-xs bg-blue-50/50 border-blue-100 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-300"
            />
          </div>
          <span className="text-slate-300 text-xs">—</span>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
              $
            </span>
            <Input
              placeholder="Max"
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="pl-5 h-8 w-16 text-xs bg-blue-50/50 border-blue-100 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-300"
            />
          </div>
        </div>
      </div>

      <div className="w-px h-6 bg-blue-100 hidden sm:block" />

      {/* Experience chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
          Exp
        </span>
        {EXP_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() =>
              setSelectedExpLevel(selectedExpLevel === level ? null : level)
            }
            className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border",
              selectedExpLevel === level
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-blue-50/60 border-blue-100 text-slate-500 hover:border-blue-300 hover:text-blue-600",
            )}
          >
            {level.charAt(0) + level.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-blue-100 hidden sm:block" />

      {/* Size chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">
          Size
        </span>
        {PROJECT_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => setSelectedSize(selectedSize === size ? null : size)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border",
              selectedSize === size
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-blue-50/60 border-blue-100 text-slate-500 hover:border-blue-300 hover:text-blue-600",
            )}
          >
            {size.charAt(0) + size.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <button
        onClick={resetFilters}
        className="ml-auto text-[10px] font-semibold text-slate-400 hover:text-blue-500 transition-colors whitespace-nowrap px-1"
      >
        Reset
      </button>
    </div>
  );

  return (
    <DashboardLayout>
      {/* Blue arc gradient – top right */}
      <div
        className="pointer-events-none fixed top-0 right-0 z-0"
        style={{
          width: 560,
          height: 560,
          borderRadius: "50%",
          transform: "translate(35%, -35%)",
          background:
            "radial-gradient(ellipse at 65% 30%, rgba(55,138,221,0.18) 0%, rgba(24,95,165,0.08) 45%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none fixed top-0 right-0 z-0"
        style={{
          width: 300,
          height: 300,
          borderRadius: "50%",
          transform: "translate(25%, -25%)",
          background:
            "radial-gradient(ellipse at 60% 25%, rgba(133,183,235,0.16) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Header row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Project Marketplace
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {loading
                ? "Searching projects..."
                : `Found ${pagination.total} opportunities for you`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 bg-white border-blue-100 rounded-xl px-3 w-[150px] text-xs font-medium focus:ring-blue-200">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-blue-100">
                <SelectItem value="newest" className="text-xs">
                  Newest First
                </SelectItem>
                <SelectItem value="highest_budget" className="text-xs">
                  Highest Budget
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Grid / List toggle */}
            <div className="flex p-1 bg-blue-50 rounded-xl border border-blue-100">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-lg transition-all",
                  view === "grid"
                    ? "bg-white shadow-sm text-blue-500"
                    : "text-slate-400 hover:text-slate-600",
                )}
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 rounded-lg transition-all",
                  view === "list"
                    ? "bg-white shadow-sm text-blue-500"
                    : "text-slate-400 hover:text-slate-600",
                )}
                onClick={() => setView("list")}
              >
                <List className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Mobile filter sheet */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl border-blue-100 bg-white"
                  >
                    <Filter className="w-3.5 h-3.5 text-blue-400" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[300px] border-r border-blue-100 bg-white"
                >
                  <div className="pt-6">
                    <FilterBar compact />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Filter bar – desktop */}
        <div className="hidden md:block">
          <FilterBar />
        </div>

        {/* Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="w-7 h-7 animate-spin text-blue-300" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Loading Market...
            </span>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "grid gap-4",
                view === "grid"
                  ? "md:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1",
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
              <div className="flex flex-col items-center justify-center py-32 bg-blue-50/40 rounded-2xl border border-dashed border-blue-100 text-center">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-5 h-5 text-blue-300" />
                </div>
                <h3 className="text-base font-bold text-slate-700">
                  No results found
                </h3>
                <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
                  Adjust your filters or search keywords to find what you're
                  looking for.
                </p>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="mt-5 rounded-lg text-xs font-bold border-blue-200 text-blue-500 hover:bg-blue-50"
                >
                  Clear filters
                </Button>
              </div>
            )}

            {projects.length > 0 && pagination.totalPages > 1 && (
              <div className="flex justify-center pt-8">
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
                          className="cursor-pointer font-semibold"
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
      </div>
    </DashboardLayout>
  );
}

// ── Grid Card ──────────────────────────────────────────────────────────────────
const ProjectCardGrid = ({ project }: { project: Project }) => {
  const match = calculateMatch(project.skills || []);

  return (
    <Card className="h-full bg-white border border-blue-100 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/60 transition-all duration-300 rounded-2xl overflow-hidden flex flex-col group">
      <CardHeader className="p-5 pb-0">
        <div className="flex items-start justify-between mb-3">
          <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] font-semibold py-0.5 px-2.5 rounded-lg">
            {project.category?.name || "Uncategorized"}
          </Badge>
          {match > 0 && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
              {match}% Match
            </span>
          )}
        </div>
        <Link to={`/freelancer/projects/${project.id}`}>
          <h3 className="text-sm font-bold leading-snug line-clamp-2 text-slate-800 hover:text-blue-500 transition-colors">
            {project.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="p-5 pt-3 flex-1 flex flex-col gap-4">
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.skills?.slice(0, 4).map((s: any) => {
            const name = typeof s === "string" ? s : s.skill?.name || s.name;
            return (
              <span
                key={name}
                className="text-[10px] font-medium bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-slate-500"
              >
                {name}
              </span>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 mt-auto border-t border-blue-50">
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
              Budget
            </span>
            <div className="text-base font-bold text-slate-800">
              ${project.budget?.toLocaleString()}
              {project.budgetType === "hourly" && (
                <span className="text-xs font-normal text-slate-400 ml-0.5">
                  /hr
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <MapPin className="w-3 h-3 text-blue-400" />
              {project.locationObj?.name || project.locationPref || "Global"}
            </div>
            <Link to={`/freelancer/projects/${project.id}`}>
              <Button
                size="icon"
                className="h-8 w-8 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-sm shadow-blue-200 group-hover:translate-x-0.5 transition-all"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ── List Card ──────────────────────────────────────────────────────────────────
const ProjectCardList = ({ project }: { project: Project }) => {
  const match = calculateMatch(project.skills || []);

  return (
    <Card className="bg-white border border-blue-100 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100/50 transition-all duration-300 rounded-2xl p-5 group">
      <div className="flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] font-semibold py-0.5 px-2 rounded-md">
              {project.category?.name}
            </Badge>
            {match > 0 && (
              <span className="text-[10px] font-bold text-emerald-600">
                {match}% Match
              </span>
            )}
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-400" />
              {project.locationObj?.name || project.locationPref || "Global"}
            </span>
          </div>

          <Link to={`/freelancer/projects/${project.id}`}>
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-500 transition-colors">
              {project.title}
            </h3>
          </Link>

          <div className="flex flex-wrap gap-2">
            {project.skills?.slice(0, 5).map((s: any) => {
              const name = typeof s === "string" ? s : s.skill?.name || s.name;
              return (
                <span key={name} className="text-[10px] text-slate-400">
                  #{name.toLowerCase()}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-8 shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-0.5">
              {project.budgetType === "hourly" ? "Hourly" : "Fixed Price"}
            </span>
            <div className="text-lg font-bold text-slate-800">
              ${project.budget?.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">
              {project.proposalCount || 0} proposals
            </span>
          </div>
          <Link to={`/freelancer/projects/${project.id}`}>
            <Button
              variant="outline"
              className="h-9 px-4 rounded-xl text-xs font-bold border-blue-200 text-blue-500 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all"
            >
              View Brief
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};
