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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  LayoutGrid,
  List,
  Star,
  Check,
  Zap,
  Clock,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Filter,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProjects = useMemo(() => {
    let result = [...MOCK_PROJECTS];

    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.skills.some((s) =>
            s.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "best_match")
        return calculateMatch(b.skills) - calculateMatch(a.skills);
      if (sortBy === "newest")
        return (
          new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
        );
      if (sortBy === "highest_budget") return b.budget.max - a.budget.max;
      return 0;
    });

    return result;
  }, [searchTerm, selectedCategory, sortBy]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4">
        {/* Simple Header & Search */}
        <header className="space-y-8 pt-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tight mb-2">
                Browse Projects
              </h1>
              <p className="text-muted-foreground text-lg font-medium">
                Simple, smooth, and filtered for your expertise.
              </p>
            </div>

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

          <div className="relative group max-w-2xl mx-auto md:mx-0">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by keywords, skills, or titles..."
              className="pl-14 h-16 bg-card/50 border-border/40 rounded-[2rem] text-lg focus:ring-primary/20 transition-all font-medium backdrop-blur-md shadow-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* Minimal Horizontal Filters */}
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
                {cat}
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

        {/* Project List with Framer Motion */}
        <div
          className={cn(
            "grid gap-6",
            view === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1",
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                {view === "grid" ? (
                  <SimpleProjectCardGrid project={project} />
                ) : (
                  <SimpleProjectCardList project={project} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProjects.length === 0 && (
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
      </div>
    </DashboardLayout>
  );
}

// --- Simplified Card Components ---

const SimpleProjectCardGrid = ({ project }: { project: Project }) => {
  return (
    <Card className="h-full group hover:shadow-2xl transition-all duration-500 border-border/40 bg-card/40 backdrop-blur-sm rounded-[2rem] overflow-hidden flex flex-col">
      <CardHeader className="p-8 pb-4">
        <div className="flex justify-between items-start mb-4">
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1 font-bold text-[10px] uppercase border-primary/20 text-primary"
          >
            {project.category}
          </Badge>
          <div className="flex items-center text-amber-500 font-bold text-sm">
            <Star className="w-3.5 h-3.5 fill-current mr-1" />
            {project.client.rating}
          </div>
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

        <div className="flex flex-wrap gap-2">
          {project.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-[10px] font-bold px-3 py-1 bg-muted/50 rounded-full text-foreground/70"
            >
              {skill}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-border/20 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none">
              Budget
            </p>
            <p className="text-lg font-black text-foreground">
              ${project.budget.min.toLocaleString()} - $
              {project.budget.max.toLocaleString()}
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

const SimpleProjectCardList = ({ project }: { project: Project }) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-border/40 bg-card/40 backdrop-blur-sm rounded-[1.5rem] overflow-hidden p-6">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="rounded-full text-[9px] font-bold border-primary/20 text-primary uppercase"
            >
              {project.category}
            </Badge>
            <span className="text-[10px] font-bold text-muted-foreground">
              <Clock className="w-3 h-3 inline mr-1" />
              {project.postedDate}
            </span>
          </div>
          <Link to={`/freelancer/projects/${project.id}`}>
            <h3 className="text-xl font-black group-hover:text-primary transition-colors">
              {project.title}
            </h3>
          </Link>
          <div className="flex flex-wrap gap-2 pt-1">
            {project.skills.slice(0, 5).map((skill) => (
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
              ${project.budget.min.toLocaleString()} - $
              {project.budget.max.toLocaleString()}
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
