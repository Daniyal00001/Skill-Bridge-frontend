import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Calendar,
  Clock,
  Send,
  Star,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Users,
  Eye,
  MapPin,
  MessageSquare,
  BadgeCheck,
  ChevronRight,
  Zap,
  ExternalLink,
  ChevronDown,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- Types ---
interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  requirements: string;
  postedDate: string;
  deadline: string;
  budget: { min: number; max: number; type: "Fixed" | "Hourly" };
  proposals: number;
  views: number;
  skills: string[];
  experienceLevel: "Entry" | "Intermediate" | "Expert";
  projectSize: "Small" | "Medium" | "Large";
  hiringStatus: "Open Bidding" | "Interviewing" | "Closed";
  developersNeeded: number;
  referenceLinks?: string[];
  client: {
    name: string;
    avatar: string;
    rating: number;
    reviewsCount: number;
    totalHires: number;
    totalPaid: number;
    paymentVerified: boolean;
    emailVerified: boolean;
    location: string;
    responseTime: string;
  };
}

// --- Mock Data ---
const FREELANCER_SKILLS = ["React", "TypeScript", "Node.js", "MongoDB", "AWS"];

const MOCK_PROJECTS: Record<string, Project> = {
  p1: {
    id: "p1",
    title: "Crypto Wallet Mobile App Development",
    category: "Mobile",
    description:
      "Looking for a specialized developer to build a high-security crypto wallet with multi-chain support. The application needs to handle private key management with industry-standard encryption and provide a seamless user interface for managing multiple assets across Ethereum, Solana, and Bitcoin. \n\nWe prioritize security above all else. The successful candidate will need to demonstrate deep knowledge of elliptic curve cryptography and secure storage mechanisms on mobile platforms (iOS/Android).",
    requirements:
      "• Implement multi-chain wallet functionality (BIP-44/BIP-39)\n• Secure key storage using Keychain/Keystores\n• Real-time price tracking via WebSocket integration\n• Cross-platform UI using React Native or Flutter\n• Integration with Web3.js / Ethers.js",
    postedDate: "2024-03-01",
    deadline: "2024-04-01",
    budget: { min: 8000, max: 12000, type: "Fixed" },
    proposals: 12,
    views: 145,
    skills: ["React Native", "Blockchain", "Security", "TypeScript", "Web3"],
    experienceLevel: "Expert",
    projectSize: "Large",
    hiringStatus: "Open Bidding",
    developersNeeded: 1,
    referenceLinks: ["GitHub Repo Draft", "Figma Design", "API Spec"],
    client: {
      name: "ChainTech Solutions",
      avatar: "https://i.pravatar.cc/150?u=chain",
      rating: 4.9,
      reviewsCount: 23,
      totalHires: 45,
      totalPaid: 48200,
      paymentVerified: true,
      emailVerified: true,
      location: "New York, USA",
      responseTime: "< 2hrs",
    },
  },
};

// Default project if ID not found for demo purposes
const DEFAULT_PROJECT = MOCK_PROJECTS.p1;

// --- Helper Functions ---
const calculateMatchScore = (projectSkills: string[]): number => {
  const overlap = projectSkills.filter((skill) =>
    FREELANCER_SKILLS.includes(skill),
  );
  return Math.round((overlap.length / projectSkills.length) * 100);
};

const getDaysLeft = (deadline: string) => {
  const diff =
    (new Date(deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
  return Math.max(0, Math.ceil(diff));
};

// --- Main Page Component ---
export default function FreelancerProjectDetails() {
  const { projectId } = useParams();
  const project = MOCK_PROJECTS[projectId || "p1"] || DEFAULT_PROJECT;

  const matchScore = useMemo(
    () => calculateMatchScore(project.skills),
    [project],
  );
  const daysLeft = useMemo(() => getDaysLeft(project.deadline), [project]);
  const isUrgent = daysLeft < 7;

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Breadcrumb Navigation */}
        <div className="mb-8 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-primary transition-colors font-bold group"
          >
            <Link to="/freelancer/browse">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Browse Projects
            </Link>
          </Button>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
          {/* --- LEFT SIDE: Project Info (65%) --- */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Project Header */}
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[10px] py-1.5 px-3 shadow-inner">
                  {project.category}
                </Badge>
                {isUrgent && (
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-black uppercase tracking-widest text-[10px] py-1.5 px-3 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 fill-current" /> URGENT
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] text-foreground">
                {project.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Posted 3 days ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{project.views} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{project.proposals} proposals</span>
                </div>
              </div>
            </div>

            {/* 2. Client Info Card */}
            <Card className="bg-card/40 backdrop-blur-xl border-border/40 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-foreground/5 p-8 border-l-4 border-l-primary/40">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-4 border-background shadow-2xl transition-transform hover:scale-105 duration-500">
                      <AvatarImage src={project.client.avatar} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xl font-black">
                        {project.client.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-4 border-background shadow-lg">
                      <BadgeCheck className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black tracking-tight">
                      {project.client.name}
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="ml-1.5 font-black text-lg">
                          {project.client.rating}
                        </span>
                      </div>
                      <span className="text-muted-foreground font-bold">•</span>
                      <span className="text-muted-foreground font-bold">
                        {project.client.reviewsCount} reviews
                      </span>
                    </div>
                    <p className="text-primary font-black text-sm tracking-tight opacity-90">
                      {project.client.totalHires} projects • $
                      {project.client.totalPaid.toLocaleString()} total paid
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                  <VerificationItem
                    label="Payment"
                    verified={project.client.paymentVerified}
                  />
                  <VerificationItem
                    label="Identity"
                    verified={project.client.emailVerified}
                  />
                  <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    {project.client.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    {project.client.responseTime}
                  </div>
                </div>
              </div>
            </Card>

            {/* 3. Description Section */}
            <div className="space-y-10 py-4">
              <section className="space-y-4">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  About This Project
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed font-medium whitespace-pre-line">
                  {project.description}
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                  <div className="w-1 h-6 bg-primary rounded-full" />
                  What We Need
                </h3>
                <div className="bg-muted/30 p-8 rounded-[2rem] border border-border/40 font-medium text-lg leading-loose text-foreground/80">
                  {project.requirements}
                </div>
              </section>

              {project.referenceLinks && (
                <section className="space-y-4">
                  <h3 className="text-xl font-black flex items-center gap-2 text-muted-foreground/60 uppercase text-[10px] tracking-[0.2em] mb-4">
                    Reference Assets
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {project.referenceLinks.map((link) => (
                      <Badge
                        key={link}
                        variant="secondary"
                        className="bg-background/80 hover:bg-primary/10 border-border/60 hover:border-primary/40 cursor-pointer py-2 px-4 rounded-xl font-bold transition-all flex items-center gap-2 group"
                      >
                        {link}
                        <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Badge>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* 4. Project Details Card */}
            <Card className="bg-card/40 backdrop-blur-xl border-border/40 rounded-[2.5rem] p-8 shadow-xl shadow-foreground/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 py-2 px-10 bg-primary/10 border-b border-l border-primary/20 rounded-bl-[2rem] text-[10px] font-black uppercase tracking-widest text-primary">
                Quick specs
              </div>
              <h3 className="text-2xl font-black tracking-tight mb-8">
                Project Details
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
                <DetailGridItem
                  icon={DollarSign}
                  label="Budget"
                  value={`$${project.budget.min.toLocaleString()} – $${project.budget.max.toLocaleString()}`}
                  subValue={project.budget.type + " Rate"}
                  accent="text-emerald-500"
                />
                <DetailGridItem
                  icon={Briefcase}
                  label="Project Size"
                  value={project.projectSize}
                  subValue="1-2 months"
                />
                <DetailGridItem
                  icon={Star}
                  label="Experience"
                  value={project.experienceLevel}
                  subValue="Best fit"
                  accent="text-amber-500"
                />
                <DetailGridItem
                  icon={Calendar}
                  label="Deadline"
                  value={project.deadline}
                  subValue={`${daysLeft} days remaining`}
                  accent={isUrgent ? "text-red-500" : "text-primary"}
                />
                <DetailGridItem
                  icon={Users}
                  label="Hiring Mode"
                  value={project.hiringStatus}
                  subValue="Actively reviewing"
                />
                <DetailGridItem
                  icon={Users}
                  label="Resources"
                  value={project.developersNeeded + " Developer"}
                  subValue="Needed"
                />
              </div>
            </Card>

            {/* 5. Required Skills Card */}
            <Card className="bg-card/40 backdrop-blur-xl border-border/40 rounded-[2.5rem] p-8 shadow-xl shadow-foreground/5 border-t-4 border-t-emerald-500/40">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <h3 className="text-2xl font-black tracking-tight">
                  Required Skills
                </h3>
                <div className="flex items-center gap-4 bg-emerald-500/10 py-3 px-6 rounded-2xl border border-emerald-500/20">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      Match Score
                    </span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                      {matchScore}%
                    </span>
                  </div>
                  <div className="h-10 w-px bg-emerald-500/20" />
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    Great fit for you!
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-70">
                    Your Matching Skills
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {project.skills
                      .filter((s) => FREELANCER_SKILLS.includes(s))
                      .map((skill) => (
                        <Badge
                          key={skill}
                          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 py-2 px-5 rounded-xl font-bold text-sm shadow-sm"
                        >
                          {skill}
                        </Badge>
                      ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-70">
                    Other Requirements
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {project.skills
                      .filter((s) => !FREELANCER_SKILLS.includes(s))
                      .map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="bg-background/40 border-border/60 py-2 px-5 rounded-xl font-bold text-sm text-muted-foreground"
                        >
                          {skill}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* 6. Similar Projects */}
            <div className="space-y-6 pt-10">
              <h3 className="text-2xl font-black tracking-tight flex items-center justify-between">
                <span>Similar Projects</span>
                <Button
                  variant="ghost"
                  className="font-bold text-primary group underline-offset-4 hover:underline"
                >
                  View All{" "}
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    className="bg-card/40 backdrop-blur-xl border-border/40 p-5 rounded-3xl hover:-translate-y-2 transition-all duration-500 group shadow-lg shadow-foreground/5"
                  >
                    <div className="space-y-4">
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-2 py-0.5"
                      >
                        {i === 1 ? "Backend" : i === 2 ? "Figma" : "Security"}
                      </Badge>
                      <h4 className="font-black tracking-tight leading-tight line-clamp-2 group-hover:underline underline-offset-4 decoration-primary/40">
                        {i === 1
                          ? "Enterprise Rust API Build"
                          : i === 2
                            ? "FinTech UI/UX Overhaul"
                            : "Smart Contract Security Audit"}
                      </h4>
                      <div className="flex items-center justify-between pt-2">
                        <div className="space-y-0.5">
                          <span className="block text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                            Budget
                          </span>
                          <span className="text-sm font-black">
                            ${i * 2000}+
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className="h-8 w-10 p-0 rounded-lg group-hover:bg-primary transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* --- RIGHT SIDEBAR: Proposal Form (35%) --- */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-10 space-y-8">
              {/* 1. Competition Card */}
              <Card className="bg-card/40 backdrop-blur-xl border-border/40 rounded-[2.5rem] p-8 shadow-2xl shadow-foreground/5 relative overflow-hidden group">
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" /> Competition
                    </h3>
                    <Badge
                      variant="outline"
                      className="bg-red-500/10 text-red-500 border-red-500/20 font-black uppercase text-[10px]"
                    >
                      High
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
                      <span>Proposals Sent</span>
                      <span className="text-foreground">
                        {project.proposals} / 20 capacity
                      </span>
                    </div>
                    <div className="h-3 w-full bg-muted/40 rounded-full overflow-hidden border border-border/20">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary-foreground transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                        style={{ width: `${(project.proposals / 20) * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] font-bold text-muted-foreground leading-relaxed italic">
                      "Clients typically review the first 10 proposals within 24
                      hours. Be among the first to apply with a strong pitch!"
                    </p>
                  </div>
                </div>
              </Card>

              {/* 2. Full Proposal Form Card */}
              <Card className="bg-card/40 backdrop-blur-2xl border-border/40 rounded-[2.5rem] shadow-2xl shadow-foreground/5 overflow-hidden border-t-8 border-t-primary">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl font-black tracking-tight leading-none text-foreground">
                    Submit Proposal
                  </CardTitle>
                  <CardDescription className="text-muted-foreground font-medium pt-2 italic">
                    You're applying for the{" "}
                    <span className="font-black text-foreground">
                      {project.experienceLevel}
                    </span>{" "}
                    level position.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <ProposalForm project={project} />
                </CardContent>
              </Card>

              {/* 3. Tips Card (Collapsible style) */}
              <Card className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 group hover:bg-primary/10 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-black tracking-tight text-primary flex items-center gap-2">
                    <Info className="w-4 h-4" /> Tips for a Great Proposal
                  </h4>
                  <ChevronDown className="w-4 h-4 text-primary group-hover:rotate-180 transition-transform" />
                </div>
                <ul className="space-y-3">
                  {[
                    "Personalize your cover letter for this specific crypto use case",
                    "Clearly outline milestones for the audit phase",
                    "Mention your experience with Elliptic Curve Cryptography",
                    "Set a 24-month availability commitment if needed",
                  ].map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[11px] font-bold text-muted-foreground leading-snug"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}

// --- Sub-components ---

const VerificationItem = ({
  label,
  verified,
}: {
  label: string;
  verified: boolean;
}) => (
  <div className="flex items-center gap-2.5">
    {verified ? (
      <div className="bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
      </div>
    ) : (
      <div className="bg-red-500/10 p-1 rounded-full border border-red-500/20">
        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
      </div>
    )}
    <span
      className={cn(
        "text-xs font-black uppercase tracking-widest",
        verified
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-muted-foreground",
      )}
    >
      {label} {verified ? "Verified" : "Unverified"}
    </span>
  </div>
);

const DetailGridItem = ({
  icon: Icon,
  label,
  value,
  subValue,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue: string;
  accent?: string;
}) => (
  <div className="space-y-2 group/item">
    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover/item:text-primary transition-colors">
      <Icon className="w-3.5 h-3.5" /> {label}
    </div>
    <div className="space-y-0.5">
      <p
        className={cn(
          "text-lg font-black tracking-tight leading-none",
          accent || "text-foreground",
        )}
      >
        {value}
      </p>
      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
        {subValue}
      </p>
    </div>
  </div>
);

const ProposalForm = ({ project }: { project: Project }) => {
  const [bid, setBid] = useState(project.budget.min);
  const [delivery, setDelivery] = useState("2 weeks");
  const [availability, setAvailability] = useState("immediately");
  const [coverLetter, setCoverLetter] = useState("");
  const [milestones, setMilestones] = useState("");
  const [loading, setLoading] = useState(false);

  const fee = Math.round(bid * 0.1);
  const total = bid - fee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (coverLetter.length < 50) {
      toast.error("Pitch too short!", {
        description: "Focus on your technical value for this specific stack.",
      });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Proposal Sent Successfully!", {
        description: `Your $${bid.toLocaleString()} bid is now under review by ${project.client.name}.`,
      });
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Bid Input */}
      <div className="space-y-6">
        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Your Bid Amount
          </Label>
          <div className="relative group">
            <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              type="number"
              value={bid}
              onChange={(e) => setBid(Number(e.target.value))}
              placeholder={`Min: $${project.budget.min}`}
              className="pl-14 h-16 bg-background/50 border-border/40 rounded-2xl font-black text-xl shadow-inner transition-all focus:ring-primary/20"
            />
          </div>
          <div className="bg-muted/30 p-5 rounded-2xl border border-border/40 space-y-3">
            <div className="flex justify-between text-xs font-bold text-muted-foreground tracking-tight">
              <span>Platform Service Fee (10%)</span>
              <span>-${fee.toLocaleString()}</span>
            </div>
            <Separator className="bg-border/20" />
            <div className="flex justify-between text-base font-black text-foreground tracking-tight">
              <span>You Receive</span>
              <span className="text-emerald-500">
                ${total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Delivery
            </Label>
            <Select value={delivery} onValueChange={setDelivery}>
              <SelectTrigger className="h-14 bg-background/50 border-border/40 rounded-xl font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="1 week" className="font-bold">
                  1 Week
                </SelectItem>
                <SelectItem value="2 weeks" className="font-bold">
                  2 Weeks
                </SelectItem>
                <SelectItem value="1 month" className="font-bold">
                  1 Month
                </SelectItem>
                <SelectItem value="3 months" className="font-bold">
                  3 Months
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Start
            </Label>
            <Select value={availability} onValueChange={setAvailability}>
              <SelectTrigger className="h-14 bg-background/50 border-border/40 rounded-xl font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="immediately" className="font-bold">
                  Immediately
                </SelectItem>
                <SelectItem value="1 week" className="font-bold">
                  Next Week
                </SelectItem>
                <SelectItem value="flexible" className="font-bold">
                  Flexible
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Cover Letter */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Pitch Your Value
          </Label>
          <span
            className={cn(
              "text-[9px] font-black uppercase",
              coverLetter.length < 50 ? "text-amber-500" : "text-emerald-500",
            )}
          >
            {coverLetter.length} / 500
          </span>
        </div>
        <Textarea
          placeholder="I have built 3 high-security mobile wallets using React Native and Solidity. For this project, I will implement Secure Enclave storage for private keys..."
          className="min-h-[220px] bg-background/50 border-border/40 rounded-[2rem] p-8 font-medium text-sm leading-relaxed shadow-inner"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
        />
      </div>

      {/* Milestone Plan */}
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Milestone Strategy (Optional)
        </Label>
        <Textarea
          placeholder="PHASE 1: Core Architecture & Setup ($1000)&#10;PHASE 2: Wallet Integration & Security ($3000)..."
          className="min-h-[120px] bg-background/50 border-border/40 rounded-[2rem] p-8 font-medium text-sm leading-relaxed"
          value={milestones}
          onChange={(e) => setMilestones(e.target.value)}
        />
      </div>

      <div className="space-y-6 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-18 rounded-2xl bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-xl gap-3 shadow-2xl shadow-primary/40 group"
        >
          {loading ? (
            "SENDING..."
          ) : (
            <>
              Submit Proposal{" "}
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
        <button
          type="button"
          className="w-full text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
        >
          Save for Later
        </button>
      </div>
    </form>
  );
};
