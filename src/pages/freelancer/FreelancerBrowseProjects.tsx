import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Star,
  Check,
  Zap,
  RotateCcw,
  Clock,
  DollarSign,
  Users,
  ChevronRight,
  BadgeCheck,
  AlertCircle,
  Briefcase,
  ArrowRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Link } from "react-router-dom";

// --- Types ---
interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  postedDate: string;
  deadline: string;
  budget: { min: number; max: number; type: "Fixed" | "Hourly" };
  proposals: number;
  skills: string[];
  experienceLevel: "Entry" | "Intermediate" | "Expert";
  projectSize: "Small" | "Medium" | "Large";
  client: {
    name: string;
    avatar: string;
    rating: number;
    paymentVerified: boolean;
    totalHires: number;
  };
}

// --- Mock Data ---
const FREELANCER_SKILLS = ["React", "TypeScript", "Node.js", "MongoDB", "AWS"];

const MOCK_PROJECTS: Project[] = [
  {
    id: "p1",
    title: "Crypto Wallet Mobile App Development",
    category: "Mobile",
    description:
      "Looking for a specialized developer to build a high-security crypto wallet with multi-chain support. Must be familiar with web3 libraries and secure key storage.",
    postedDate: "2024-03-01",
    deadline: "2024-04-01",
    budget: { min: 8000, max: 12000, type: "Fixed" },
    proposals: 12,
    skills: ["React Native", "Blockchain", "Security", "TypeScript", "Web3"],
    experienceLevel: "Expert",
    projectSize: "Large",
    client: {
      name: "ChainTech",
      avatar: "https://i.pravatar.cc/150?u=chain",
      rating: 4.9,
      paymentVerified: true,
      totalHires: 45,
    },
  },
  {
    id: "p2",
    title: "AI Product Recommendation Engine",
    category: "AI/ML",
    description:
      "Build a recommendation system based on user browsing history and purchase patterns for a fashion e-commerce platform.",
    postedDate: "2024-03-02",
    deadline: "2024-03-15",
    budget: { min: 5000, max: 8000, type: "Fixed" },
    proposals: 5,
    skills: ["Python", "TensorFlow", "Scikit-learn", "MongoDB", "AWS"],
    experienceLevel: "Intermediate",
    projectSize: "Medium",
    client: {
      name: "Trendify",
      avatar: "https://i.pravatar.cc/150?u=trend",
      rating: 4.7,
      paymentVerified: true,
      totalHires: 12,
    },
  },
  {
    id: "p3",
    title: "Full-stack E-commerce Backend Refactor",
    category: "Backend",
    description:
      "Our current monolithic backend needs a refactor. We're moving to a microservices architecture using Node.js and PostgreSQL.",
    postedDate: "2024-03-03",
    deadline: "2024-05-01",
    budget: { min: 3000, max: 6000, type: "Fixed" },
    proposals: 8,
    skills: ["Node.js", "PostgreSQL", "AWS", "Microservices", "Docker"],
    experienceLevel: "Expert",
    projectSize: "Large",
    client: {
      name: "ShopMax",
      avatar: "https://i.pravatar.cc/150?u=shop",
      rating: 4.5,
      paymentVerified: true,
      totalHires: 89,
    },
  },
  {
    id: "p4",
    title: "Modern UI/UX Portfolio Redesign",
    category: "Design",
    description:
      "Looking for a creative designer to revamp our agency portfolio. Needs to be high-impact, minimalist, and mobile-first.",
    postedDate: "2024-03-02",
    deadline: "2024-03-10",
    budget: { min: 500, max: 1500, type: "Fixed" },
    proposals: 2,
    skills: ["Figma", "UI/UX", "Tailwind CSS", "React", "Adobe XD"],
    experienceLevel: "Entry",
    projectSize: "Small",
    client: {
      name: "DesignWorks",
      avatar: "https://i.pravatar.cc/150?u=design",
      rating: 5.0,
      paymentVerified: false,
      totalHires: 0,
    },
  },
  {
    id: "p5",
    title: "DevOps Pipeline Automation",
    category: "DevOps",
    description:
      "Help us automate our deployment pipelines using Docker, Kubernetes, and GitHub Actions. Currently using too much manual work.",
    postedDate: "2024-03-01",
    deadline: "2024-03-25",
    budget: { min: 40, max: 80, type: "Hourly" },
    proposals: 4,
    skills: ["Docker", "Kubernetes", "Jenkins", "AWS", "Terraform"],
    experienceLevel: "Expert",
    projectSize: "Medium",
    client: {
      name: "CloudScale",
      avatar: "https://i.pravatar.cc/150?u=cloud",
      rating: 4.8,
      paymentVerified: true,
      totalHires: 22,
    },
  },
  {
    id: "p6",
    title: "Real Estate Listings Scraper & AI Tagger",
    category: "AI/ML",
    description:
      "Automate the collection of real estate data and use NLP to tag key features like 'renovated' or 'luxury' from descriptions.",
    postedDate: "2024-03-02",
    deadline: "2024-03-12",
    budget: { min: 1000, max: 2500, type: "Fixed" },
    proposals: 15,
    skills: ["Python", "NLP", "BeautifulSoup", "Node.js", "ElasticSearch"],
    experienceLevel: "Intermediate",
    projectSize: "Small",
    client: {
      name: "Properly",
      avatar: "https://i.pravatar.cc/150?u=prop",
      rating: 4.2,
      paymentVerified: true,
      totalHires: 34,
    },
  },
  {
    id: "p7",
    title: "Enterprise SaaS Dashboard Development",
    category: "Web Dev",
    description:
      "Build a complex dashboard with real-time data visualization using React and GraphQL. Figma files are ready.",
    postedDate: "2024-03-03",
    deadline: "2024-06-01",
    budget: { min: 4000, max: 9000, type: "Fixed" },
    proposals: 7,
    skills: ["React", "GraphQL", "TypeScript", "D3.js", "MongoDB"],
    experienceLevel: "Expert",
    projectSize: "Large",
    client: {
      name: "SaaSify",
      avatar: "https://i.pravatar.cc/150?u=saas",
      rating: 4.9,
      paymentVerified: true,
      totalHires: 120,
    },
  },
  {
    id: "p8",
    title: "Solidity Smart Contract Security Audit",
    category: "Web Dev",
    description:
      "Urgent audit needed for a DeFi protocol launching next week. Deep understanding of reentrancy and flash loan attacks required.",
    postedDate: "2024-03-03",
    deadline: "2024-03-06",
    budget: { min: 12000, max: 18000, type: "Fixed" },
    proposals: 3,
    skills: ["Solidity", "Hardhat", "Security", "TypeScript", "Ethers.js"],
    experienceLevel: "Expert",
    projectSize: "Small",
    client: {
      name: "DeFi Labs",
      avatar: "https://i.pravatar.cc/150?u=defi",
      rating: 5.0,
      paymentVerified: true,
      totalHires: 8,
    },
  },
  {
    id: "p9",
    title: "iOS Health & Fitness Tracking App",
    category: "Mobile",
    description:
      "Developing a fitness app that syncs with Apple Watch and HealthKit. Need an expert iOS dev for 3 months.",
    postedDate: "2024-03-02",
    deadline: "2024-07-01",
    budget: { min: 60, max: 120, type: "Hourly" },
    proposals: 9,
    skills: ["Swift", "iOS", "Firebase", "HealthKit", "Combine"],
    experienceLevel: "Expert",
    projectSize: "Large",
    client: {
      name: "HealthFlow",
      avatar: "https://i.pravatar.cc/150?u=health",
      rating: 4.6,
      paymentVerified: true,
      totalHires: 56,
    },
  },
  {
    id: "p10",
    title: "Inventory Management System Implementation",
    category: "Backend",
    description:
      "Looking for a reliable developer to build an internal inventory system for a warehouse. Basic CRUD with reporting.",
    postedDate: "2024-03-01",
    deadline: "2024-04-15",
    budget: { min: 1500, max: 3500, type: "Fixed" },
    proposals: 25,
    skills: ["Java", "Spring Boot", "MySQL", "React", "AWS"],
    experienceLevel: "Intermediate",
    projectSize: "Medium",
    client: {
      name: "GlobalLogistics",
      avatar: "https://i.pravatar.cc/150?u=logistics",
      rating: 4.1,
      paymentVerified: true,
      totalHires: 210,
    },
  },
];

const CATEGORIES = [
  "Web Dev",
  "Mobile",
  "AI/ML",
  "Design",
  "Backend",
  "DevOps",
];

// --- Helper Functions ---
const calculateMatch = (projectSkills: string[]): number => {
  const overlap = projectSkills.filter((skill) =>
    FREELANCER_SKILLS.includes(skill),
  );
  return Math.round((overlap.length / projectSkills.length) * 100);
};

const getDeadlineStatus = (deadline: string) => {
  const diff =
    (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
  if (diff < 3)
    return { label: "Urgent", color: "text-red-500", bg: "bg-red-500/10" };
  if (diff < 7)
    return { label: "Soon", color: "text-orange-500", bg: "bg-orange-500/10" };
  return { label: "Flexible", color: "text-muted-foreground", bg: "bg-muted" };
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
  const [sortBy, setSortBy] = useState("best_match");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState([0, 20000]);
  const [projectSize, setProjectSize] = useState("any");
  const [expLevel, setExpLevel] = useState("any");
  const [deadlineFilter, setDeadlineFilter] = useState("any");
  const [extraFilters, setExtraFilters] = useState({
    lowComp: false,
    verifiedOnly: false,
    newClients: false,
  });

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setBudgetRange([0, 20000]);
    setProjectSize("any");
    setExpLevel("any");
    setDeadlineFilter("any");
    setExtraFilters({ lowComp: false, verifiedOnly: false, newClients: false });
  };

  const filteredProjects = useMemo(() => {
    let result = MOCK_PROJECTS.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.skills.some((s) =>
          s.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(p.category);
      const matchesBudget =
        p.budget.max >= budgetRange[0] && p.budget.min <= budgetRange[1];
      const matchesSize =
        projectSize === "any" || p.projectSize.toLowerCase() === projectSize;
      const matchesExp = expLevel === "any" || p.experienceLevel === expLevel;

      const deadlineDays =
        (new Date(p.deadline).getTime() - new Date().getTime()) /
        (1000 * 3600 * 24);
      const matchesDeadline =
        deadlineFilter === "any" ||
        (deadlineFilter === "urgent" && deadlineDays < 7) ||
        (deadlineFilter === "month" && deadlineDays <= 30);

      const matchesLowComp = !extraFilters.lowComp || p.proposals < 5;
      const matchesVerified =
        !extraFilters.verifiedOnly || p.client.paymentVerified;
      const matchesNewClient =
        !extraFilters.newClients || p.client.totalHires === 0;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesBudget &&
        matchesSize &&
        matchesExp &&
        matchesDeadline &&
        matchesLowComp &&
        matchesVerified &&
        matchesNewClient
      );
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === "best_match")
        return calculateMatch(b.skills) - calculateMatch(a.skills);
      if (sortBy === "newest")
        return (
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        );
      if (sortBy === "highest_budget") return b.budget.max - a.budget.max;
      if (sortBy === "deadline")
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (sortBy === "least_comp") return a.proposals - b.proposals;
      return 0;
    });

    return result;
  }, [
    searchTerm,
    selectedCategories,
    budgetRange,
    projectSize,
    expLevel,
    deadlineFilter,
    extraFilters,
    sortBy,
  ]);

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-8 items-start animate-fade-in pb-20">
        {/* --- Filters Sidebar --- */}
        <aside className="w-full lg:w-80 space-y-8 bg-card/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-border/40 shadow-2xl shadow-foreground/5 shrink-0 transition-all duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight text-foreground">
              Filters
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-primary hover:bg-primary/5 font-bold h-8"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
            </Button>
          </div>

          <Separator className="bg-border/40" />

          {/* Keyword */}
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Search Keywords
            </Label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="React, Mobile, UI..."
                className="pl-10 h-11 bg-background/50 border-border/40 rounded-xl focus:ring-primary/20 transition-all font-medium text-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Categories
            </Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={
                    selectedCategories.includes(cat) ? "default" : "outline"
                  }
                  className={cn(
                    "cursor-pointer px-3 py-1.5 rounded-full font-bold text-[11px] transition-all",
                    selectedCategories.includes(cat)
                      ? "bg-primary text-white shadow-lg shadow-primary/20 border-primary"
                      : "bg-background border-border/60 hover:border-primary/40 text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() =>
                    setSelectedCategories((prev) =>
                      prev.includes(cat)
                        ? prev.filter((c) => c !== cat)
                        : [...prev, cat],
                    )
                  }
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Budget Range
              </Label>
              <span className="text-xs font-bold text-primary">
                ${budgetRange[0]} – ${budgetRange[1]}
              </span>
            </div>
            <Slider
              value={budgetRange}
              min={0}
              max={20000}
              step={500}
              onValueChange={setBudgetRange}
              className="py-2"
            />
          </div>

          {/* Project Size */}
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Project Size
            </Label>
            <RadioGroup
              value={projectSize}
              onValueChange={setProjectSize}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-3 bg-background/50 p-3 rounded-xl border border-border/40 cursor-pointer hover:border-primary/40 transition-all group">
                <RadioGroupItem value="any" id="size-any" />
                <Label
                  htmlFor="size-any"
                  className="font-bold cursor-pointer text-foreground group-hover:text-primary transition-colors"
                >
                  Any Size
                </Label>
              </div>
              <div className="flex items-center space-x-3 bg-background/50 p-3 rounded-xl border border-border/40 cursor-pointer hover:border-primary/40 transition-all group">
                <RadioGroupItem value="small" id="size-small" />
                <Label
                  htmlFor="size-small"
                  className="font-bold cursor-pointer flex-1 text-foreground group-hover:text-primary transition-colors"
                >
                  Small{" "}
                  <span className="text-[10px] font-medium text-muted-foreground block">
                    1-2 weeks
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 bg-background/50 p-3 rounded-xl border border-border/40 cursor-pointer hover:border-primary/40 transition-all group">
                <RadioGroupItem value="medium" id="size-medium" />
                <Label
                  htmlFor="size-medium"
                  className="font-bold cursor-pointer flex-1 text-foreground group-hover:text-primary transition-colors"
                >
                  Medium{" "}
                  <span className="text-[10px] font-medium text-muted-foreground block">
                    1-2 months
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 bg-background/50 p-3 rounded-xl border border-border/40 cursor-pointer hover:border-primary/40 transition-all group">
                <RadioGroupItem value="large" id="size-large" />
                <Label
                  htmlFor="size-large"
                  className="font-bold cursor-pointer flex-1 text-foreground group-hover:text-primary transition-colors"
                >
                  Large{" "}
                  <span className="text-[10px] font-medium text-muted-foreground block">
                    3+ months
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Exp Level */}
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Experience Level
            </Label>
            <RadioGroup
              value={expLevel}
              onValueChange={setExpLevel}
              className="grid grid-cols-1 gap-2"
            >
              {["any", "Entry", "Intermediate", "Expert"].map((lvl) => (
                <div
                  key={lvl}
                  className="flex items-center space-x-3 bg-background/50 p-3 rounded-xl border border-border/40 cursor-pointer hover:border-primary/40 transition-all group"
                >
                  <RadioGroupItem value={lvl} id={`exp-${lvl}`} />
                  <Label
                    htmlFor={`exp-${lvl}`}
                    className="font-bold cursor-pointer text-foreground group-hover:text-primary transition-colors"
                  >
                    {lvl === "any" ? "Any Level" : lvl + " Level"}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Deadline */}
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Deadline
            </Label>
            <RadioGroup
              value={deadlineFilter}
              onValueChange={setDeadlineFilter}
              className="grid grid-cols-1 gap-2"
            >
              <div className="flex items-center space-x-3 bg-background/50 p-3 rounded-xl border border-border/40 cursor-pointer hover:border-primary/40 transition-all group">
                <RadioGroupItem value="any" id="dl-any" />
                <Label
                  htmlFor="dl-any"
                  className="font-bold cursor-pointer text-foreground group-hover:text-primary transition-colors"
                >
                  Any
                </Label>
              </div>
              <div className="flex items-center space-x-3 bg-background/50 p-3 rounded-xl border border-border/40 cursor-pointer hover:border-primary/40 transition-all group">
                <RadioGroupItem value="urgent" id="dl-urgent" />
                <Label
                  htmlFor="dl-urgent"
                  className="font-bold cursor-pointer text-foreground group-hover:text-primary transition-colors"
                >
                  Urgent (&lt; 1 week)
                </Label>
              </div>
              <div className="flex items-center space-x-3 bg-background/50 p-3 rounded-xl border border-border/40 cursor-pointer hover:border-primary/40 transition-all group">
                <RadioGroupItem value="month" id="dl-month" />
                <Label
                  htmlFor="dl-month"
                  className="font-bold cursor-pointer text-foreground group-hover:text-primary transition-colors"
                >
                  This Month
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Extra */}
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Extras
            </Label>
            <div className="space-y-3">
              {[
                { id: "lowComp", label: "Low competition (< 5 proposals)" },
                { id: "verifiedOnly", label: "Payment verified only" },
                { id: "newClients", label: "New clients (0 hires)" },
              ].map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center space-x-3 group"
                >
                  <Checkbox
                    id={filter.id}
                    checked={
                      extraFilters[filter.id as keyof typeof extraFilters]
                    }
                    onCheckedChange={(checked) =>
                      setExtraFilters((prev) => ({
                        ...prev,
                        [filter.id]: !!checked,
                      }))
                    }
                    className="border-border/60 data-[state=checked]:bg-primary"
                  />
                  <Label
                    htmlFor={filter.id}
                    className="text-sm font-bold leading-none cursor-pointer text-muted-foreground group-hover:text-foreground transition-colors"
                  >
                    {filter.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* --- Main Area --- */}
        <main className="flex-1 space-y-8 min-w-0">
          {/* Header Bar */}
          <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between bg-card/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-border/40 shadow-xl shadow-foreground/5 overflow-hidden">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                Explore Projects
              </h1>
              <p className="text-sm font-medium text-muted-foreground">
                Found{" "}
                <span className="text-foreground font-black">
                  {filteredProjects.length}
                </span>{" "}
                high-impact matches
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex bg-muted/30 p-1 rounded-2xl border border-border/40">
                <Button
                  variant={view === "grid" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setView("grid")}
                  className={cn(
                    "h-10 w-10 rounded-xl transition-all",
                    view === "grid" && "bg-background text-primary shadow-sm",
                  )}
                >
                  <LayoutGrid className="h-5 w-5" />
                </Button>
                <Button
                  variant={view === "list" ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setView("list")}
                  className={cn(
                    "h-10 w-10 rounded-xl transition-all",
                    view === "list" && "bg-background text-primary shadow-sm",
                  )}
                >
                  <List className="h-5 w-5" />
                </Button>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-12 bg-background/50 border-border/40 rounded-2xl font-black text-foreground">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40 shadow-2xl bg-card/90 backdrop-blur-xl">
                  <SelectItem value="best_match" className="font-bold p-3">
                    Best Match
                  </SelectItem>
                  <SelectItem value="newest" className="font-bold p-3">
                    Newest First
                  </SelectItem>
                  <SelectItem value="highest_budget" className="font-bold p-3">
                    Highest Budget
                  </SelectItem>
                  <SelectItem value="deadline" className="font-bold p-3">
                    Deadline Soonest
                  </SelectItem>
                  <SelectItem value="least_comp" className="font-bold p-3">
                    Least Competition
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Project List */}
          <div
            className={cn(
              "grid gap-8 transition-all duration-500",
              view === "grid" ? "md:grid-cols-2" : "grid-cols-1",
            )}
          >
            {filteredProjects.map((project) =>
              view === "grid" ? (
                <ProjectCardGrid key={project.id} project={project} />
              ) : (
                <ProjectCardList key={project.id} project={project} />
              ),
            )}
          </div>

          {filteredProjects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 bg-card/20 rounded-[3rem] border-4 border-dashed border-border/40 text-center animate-fade-in">
              <div className="p-10 bg-muted/40 rounded-full mb-8 relative">
                <SlidersHorizontal className="w-20 h-20 text-muted-foreground/30" />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-foreground/80">
                No results found
              </h3>
              <p className="text-muted-foreground mt-3 font-medium max-w-xs mx-auto text-sm leading-relaxed">
                Try widening your search keywords or resetting specific filters
                to find more opportunities.
              </p>
              <Button
                onClick={resetFilters}
                variant="ghost"
                className="mt-8 font-black text-primary hover:bg-primary/5 h-12 px-8 rounded-2xl transition-all active:scale-95 border-2 border-primary/20"
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Final floating mobile CTA or similar if needed... currently relying on layout */}
    </DashboardLayout>
  );
}

// --- Sub-components ---

const ProjectCardGrid = ({ project }: { project: Project }) => {
  const match = calculateMatch(project.skills);
  const dl = getDeadlineStatus(project.deadline);
  const comp = getCompetition(project.proposals);

  return (
    <Card className="group relative flex flex-col bg-card/40 backdrop-blur-xl border-border/40 hover:border-primary/40 transition-all duration-500 rounded-[2.5rem] overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] h-full">
      <div className="absolute top-6 right-6 z-10">
        <Badge
          className={cn(
            "px-4 py-2 rounded-2xl font-black text-[10px] uppercase shadow-lg backdrop-blur-md border-0 transition-transform group-hover:scale-110 duration-500",
            match > 80
              ? "bg-emerald-500 text-white shadow-emerald-500/30"
              : "bg-primary text-white shadow-primary/30",
          )}
        >
          {match}% MATCH
        </Badge>
      </div>

      <CardHeader className="p-8 pb-4">
        <div className="space-y-4">
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px] py-1 shadow-inner"
          >
            {project.category}
          </Badge>
          <CardTitle className="text-2xl font-black tracking-tight leading-tight text-foreground transition-colors group-hover:text-primary cursor-pointer hover:underline underline-offset-8 decoration-primary/40">
            {project.title}
          </CardTitle>
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Posted {project.postedDate}</span>
            <span>•</span>
            <div className="flex items-center gap-1 group/client">
              <span className="group-hover/client:text-foreground transition-colors">
                by {project.client.name}
              </span>
              <div className="flex items-center text-amber-500">
                <Star className="w-3 h-3 fill-current" />
                <span className="ml-0.5">{project.client.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-8 flex-1 space-y-6">
        <p className="text-muted-foreground font-medium text-sm line-clamp-2 leading-relaxed h-[2.8rem]">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.skills.slice(0, 3).map((skill) => (
            <Badge
              key={skill}
              variant="outline"
              className="bg-background/40 border-border/60 hover:border-primary/40 font-bold text-[10px] px-2.5 py-1 text-muted-foreground hover:text-foreground transition-all"
            >
              {skill}
            </Badge>
          ))}
          {project.skills.length > 3 && (
            <Badge
              variant="secondary"
              className="text-[10px] font-bold text-muted-foreground hover:bg-muted/30"
            >
              +{project.skills.length - 3} more
            </Badge>
          )}
        </div>

        <Separator className="bg-border/20" />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-foreground font-black tracking-tight text-sm">
              <DollarSign className="w-4 h-4 text-emerald-500" />$
              {project.budget.min.toLocaleString()} – $
              {project.budget.max.toLocaleString()}
            </div>
            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60 tracking-wider flex items-center gap-1.5 ml-6">
              {project.budget.type} Rate
            </span>
          </div>
          <div className="space-y-1">
            <div
              className={cn(
                "flex items-center gap-2 font-black tracking-tight text-sm",
                dl.color,
              )}
            >
              <Clock className="w-4 h-4" />
              {dl.label}
            </div>
            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60 tracking-wider ml-6">
              {project.deadline}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-muted/20 p-4 rounded-3xl border border-border/40 group-hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-9 w-9 border-2 border-background shadow-inner transition-transform group-hover:scale-110">
                <AvatarImage src={project.client.avatar} />
                <AvatarFallback className="font-black text-xs bg-primary/10 text-primary">
                  CL
                </AvatarFallback>
              </Avatar>
              {project.client.paymentVerified && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-background shadow-sm">
                  <Check className="w-2.5 h-2.5 text-white stroke-[4]" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black leading-tight flex items-center gap-1 text-foreground">
                {project.client.name}
                {project.client.paymentVerified && (
                  <BadgeCheck className="w-3 h-3 text-primary fill-primary/10" />
                )}
              </span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                Top 5% · {project.client.totalHires}+ Hires
              </span>
            </div>
          </div>
          <div
            className={cn(
              "px-3 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-sm",
              comp.bg,
              comp.color,
            )}
          >
            {project.proposals} Proposals
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-8 pt-4 flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-14 rounded-2xl font-black text-xs border-2 transition-all active:scale-[0.98] border-border/60 hover:bg-muted/50 hover:border-border"
          asChild
        >
          <Link to={`/freelancer/projects/${project.id}`}>View Details</Link>
        </Button>
        <QuickApplySheet project={project} />
      </CardFooter>
    </Card>
  );
};

const ProjectCardList = ({ project }: { project: Project }) => {
  const match = calculateMatch(project.skills);
  const dl = getDeadlineStatus(project.deadline);

  return (
    <Card className="group flex flex-col md:flex-row bg-card/40 backdrop-blur-xl border-border/40 hover:border-primary/40 transition-all duration-500 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-foreground/5 p-6 md:items-center gap-8 h-full">
      <div className="flex-1 space-y-3 min-w-0">
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] uppercase shadow-inner">
            {project.category}
          </Badge>
          <Link to={`/freelancer/projects/${project.id}`}>
            <h3 className="text-xl font-black tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors cursor-pointer hover:underline underline-offset-4 decoration-primary/30">
              {project.title}
            </h3>
          </Link>
        </div>
        <div className="flex flex-wrap gap-2 text-muted-foreground font-medium text-[11px]">
          <p className="line-clamp-1 flex-1">{project.description}</p>
          <div className="flex gap-2 shrink-0">
            {project.skills.slice(0, 4).map((s) => (
              <span key={s} className="font-bold text-primary/70">
                #{s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap md:flex-nowrap items-center gap-6 md:gap-12 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-border/20">
        <div className="text-center min-w-[120px]">
          <span className="block text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 opacity-60 text-left">
            Budget Range
          </span>
          <span className="font-black text-sm text-foreground flex items-center gap-1.5 leading-none">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />$
            {project.budget.min.toLocaleString()} – $
            {project.budget.max.toLocaleString()}
          </span>
        </div>
        <div className="text-center min-w-[100px]">
          <span className="block text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 opacity-60 text-left">
            Timeline
          </span>
          <span
            className={cn(
              "font-black text-sm leading-none flex items-center gap-1.5",
              dl.color,
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            {dl.label}
          </span>
        </div>
        <div className="text-center min-w-[80px]">
          <Badge className="bg-emerald-500 text-white font-black text-[10px] px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/20">
            {match}% MATCH
          </Badge>
        </div>
        <div className="flex gap-2">
          <QuickApplySheet
            project={project}
            trigger={
              <Button className="h-12 w-12 rounded-2xl bg-primary shadow-xl shadow-primary/30 group-hover:scale-110 group-hover:-rotate-3 transition-all">
                <ArrowRight className="w-5 h-5 text-white" />
              </Button>
            }
          />
        </div>
      </div>
    </Card>
  );
};

const QuickApplySheet = ({
  project,
  trigger,
}: {
  project: Project;
  trigger?: React.ReactNode;
}) => {
  const [bid, setBid] = useState(project.budget.min);
  const [delivery, setDelivery] = useState("2 weeks");
  const [availability, setAvailability] = useState("immediately");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (coverLetter.length < 50) {
      toast.error("Cover letter too short", {
        description:
          "Please write at least 50 characters to express your value properly.",
        duration: 4000,
      });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Proposal Submitted Successfully!", {
        description: `Your application for "${project.title}" has been sent to the client.`,
        duration: 5000,
      });
    }, 2000);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button className="flex-1 h-14 rounded-2xl font-black text-sm gap-2 shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary group-hover:shadow-primary/40">
            Apply <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-[550px] overflow-y-auto bg-card/60 backdrop-blur-3xl border-l border-border/40 p-0 shadow-[0_0_100px_rgba(0,0,0,0.2)]">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-full min-h-screen"
        >
          <div className="p-10 space-y-10 flex-1">
            <SheetHeader className="text-left space-y-6">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/10 text-primary uppercase font-black tracking-widest text-[9px] py-1 shadow-inner border-primary/20">
                  PROPOSAL BUILDER
                </Badge>
                <div className="h-0.5 w-12 bg-border/40 rounded-full" />
              </div>
              <SheetTitle className="text-4xl font-black tracking-tighter leading-[1.1] text-foreground">
                Apply for <span className="text-primary">{project.title}</span>
              </SheetTitle>
              <SheetDescription className="flex items-center gap-4 text-foreground bg-muted/30 p-6 rounded-[2rem] border border-border/40 shadow-xl shadow-foreground/5 backdrop-blur-sm">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <DollarSign className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                    Client Budget
                  </p>
                  <p className="text-2xl font-black tracking-tight">
                    ${project.budget.min.toLocaleString()} – $
                    {project.budget.max.toLocaleString()}
                  </p>
                </div>
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Bid Amount */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Your Bid Price
                  </Label>
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <Input
                      type="number"
                      required
                      value={bid}
                      onChange={(e) => setBid(Number(e.target.value))}
                      className="pl-12 h-14 bg-background/50 border-border/40 rounded-2xl font-black text-lg focus:ring-primary/20 transition-all text-foreground"
                    />
                  </div>
                </div>

                {/* Delivery */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Handoff Time
                  </Label>
                  <Select value={delivery} onValueChange={setDelivery}>
                    <SelectTrigger className="h-14 bg-background/50 border-border/40 rounded-2xl font-black text-foreground focus:ring-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40 bg-card/90 backdrop-blur-xl">
                      <SelectItem value="1 week" className="font-bold py-3">
                        1 Week
                      </SelectItem>
                      <SelectItem value="2 weeks" className="font-bold py-3">
                        2 Weeks
                      </SelectItem>
                      <SelectItem value="1 month" className="font-bold py-3">
                        1 Month
                      </SelectItem>
                      <SelectItem value="3 months" className="font-bold py-3">
                        3 Months
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Earliest Start
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {["immediately", "1 week", "2 weeks"].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAvailability(val)}
                      className={cn(
                        "py-3 px-4 rounded-xl border-2 font-bold text-xs capitalize transition-all",
                        availability === val
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-background/50 border-border/40 text-muted-foreground hover:border-primary/20",
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cover Letter */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Pitch Your Value
                  </Label>
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase flex items-center gap-2",
                      coverLetter.length < 50
                        ? "text-amber-500"
                        : "text-emerald-500",
                    )}
                  >
                    {coverLetter.length < 50 ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    {coverLetter.length} / 50 min chars
                  </span>
                </div>
                <Textarea
                  required
                  placeholder="Tell the client why your specific stack (React, Node.js etc.) makes you the best fit for this crypto wallet build..."
                  className="min-h-[220px] bg-background/50 border-border/40 rounded-[2rem] p-8 font-medium text-sm leading-[1.8] focus:ring-primary/20 shadow-inner scrollbar-hide text-foreground"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              {/* Milestones */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Execution Strategy (Optional)
                </Label>
                <Textarea
                  placeholder="Phase 1: Wireframing & Tech Stack Setup ($1,000)&#10;Phase 2: Core Auth & Wallet Integration ($3,000)..."
                  className="min-h-[140px] bg-background/50 border-border/40 rounded-[2rem] p-8 font-medium text-sm leading-relaxed text-foreground"
                />
              </div>

              {/* Portfolio */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Proof of Work
                </Label>
                <div className="space-y-3">
                  <div className="relative group">
                    <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
                    <Input
                      placeholder="GitHub / Case Study Link"
                      className="pl-12 h-12 bg-background/50 border-border/40 rounded-xl font-medium text-foreground"
                    />
                  </div>
                  <div className="relative group">
                    <List className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
                    <Input
                      placeholder="Live Application / Prototype"
                      className="pl-12 h-12 bg-background/50 border-border/40 rounded-xl font-medium text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="p-10 bg-card/80 border-t border-border/40 backdrop-blur-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
            <div className="w-full space-y-6">
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                SkillBridge platform takes a standard 10% service fee.
              </div>
              <div className="flex gap-4">
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 h-16 rounded-2xl font-black transition-all active:scale-[0.98] border-2 border-transparent hover:border-border/40 hover:bg-muted/50"
                  >
                    CANCEL
                  </Button>
                </SheetTrigger>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] h-16 rounded-2xl bg-primary font-black text-lg gap-3 shadow-[0_15px_40px_-10px_rgba(var(--primary-rgb),0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] group"
                >
                  {loading ? (
                    "SUBMITTING..."
                  ) : (
                    <>
                      SEND PROPOSAL{" "}
                      <Zap className="w-5 h-5 fill-current group-hover:animate-bounce" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
