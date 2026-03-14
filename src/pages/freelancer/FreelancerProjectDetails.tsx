import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";

// Freelancer's skills — in future, pull from profile API
const FREELANCER_SKILLS = ["React", "TypeScript", "Node.js", "MongoDB", "AWS"];

const calculateMatchScore = (projectSkills: string[]): number => {
  if (!projectSkills?.length) return 0;
  const overlap = projectSkills.filter((s) => FREELANCER_SKILLS.includes(s));
  return Math.round((overlap.length / projectSkills.length) * 100);
};

const getDaysLeft = (deadline: string) => {
  if (!deadline) return null;
  const diff = (new Date(deadline).getTime() - Date.now()) / (1000 * 3600 * 24);
  return Math.max(0, Math.ceil(diff));
};

export default function FreelancerProjectDetails() {
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myProposal, setMyProposal] = useState<any>(null); // existing proposal if any

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch project
        const res = await api.get(`/projects/${projectId}`);
        setProject(res.data.project);

        // Check if freelancer already submitted a proposal
        try {
          const myRes = await api.get("/proposals/my");
          const existing = myRes.data.proposals?.find(
            (p: any) =>
              p.project?.id === projectId || p.projectId === projectId,
          );
          if (existing) setMyProposal(existing);
        } catch {}
      } catch (err) {
        toast.error("Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const matchScore = useMemo(
    () => calculateMatchScore(project?.skills || []),
    [project],
  );
  const daysLeft = useMemo(() => getDaysLeft(project?.deadline), [project]);
  const isUrgent = daysLeft !== null && daysLeft < 7;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">
            Loading project...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground/30" />
          <h2 className="text-xl font-black">Project not found</h2>
          <Button asChild>
            <Link to="/freelancer/browse">Back to Browse</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const client = project.client;

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-primary font-bold group"
          >
            <Link to="/freelancer/browse">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Browse Projects
            </Link>
          </Button>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
          {/* ── LEFT: Project Info ── */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header */}
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[10px] py-1.5 px-3">
                  {project.category}
                </Badge>
                {isUrgent && (
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-black uppercase tracking-widest text-[10px] py-1.5 px-3 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 fill-current" /> URGENT
                  </Badge>
                )}
                {myProposal && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black uppercase tracking-widest text-[10px] py-1.5 px-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" /> Applied
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1]">
                {project.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Posted {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{project._count?.proposals || 0} proposals</span>
                </div>
                {project.budget && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span className="font-black text-foreground">
                      ${project.budget?.toLocaleString()}
                    </span>
                    <span className="capitalize text-xs">
                      {project.budgetType}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Client Info Card */}
            {client && (
              <Card className="bg-card/40 backdrop-blur-xl border-border/40 rounded-[2.5rem] overflow-hidden shadow-2xl p-8 border-l-4 border-l-primary/40">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-20 w-20 border-4 border-background shadow-2xl">
                        <AvatarImage src={client.profileImage} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xl font-black">
                          {client.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-4 border-background">
                        <BadgeCheck className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black tracking-tight">
                        {client.name}
                      </h2>
                      {client.rating && (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center text-amber-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="ml-1.5 font-black text-lg">
                              {client.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      )}
                      <p className="text-primary font-black text-sm opacity-90">
                        {client.totalProjects || 0} projects posted
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                    <VerificationItem label="Payment" verified={true} />
                    <VerificationItem label="Identity" verified={true} />
                    {client.location && (
                      <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                        <MapPin className="w-4 h-4 text-primary" />
                        {client.location}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Description */}
            <div className="space-y-10 py-4">
              <section className="space-y-4">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                  <div className="w-1 h-6 bg-primary rounded-full" /> About This
                  Project
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed font-medium whitespace-pre-line">
                  {project.description}
                </p>
              </section>

              {project.requirements && (
                <section className="space-y-4">
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                    <div className="w-1 h-6 bg-primary rounded-full" /> What We
                    Need
                  </h3>
                  <div className="bg-muted/30 p-8 rounded-[2rem] border border-border/40 font-medium text-lg leading-loose text-foreground/80 whitespace-pre-line">
                    {project.requirements}
                  </div>
                </section>
              )}

              {project.referenceLinks && (
                <section className="space-y-4">
                  <p className="text-muted-foreground/60 uppercase text-[10px] font-black tracking-[0.2em]">
                    Reference Assets
                  </p>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer py-2 px-4 rounded-xl font-bold flex items-center gap-2 w-fit"
                  >
                    {project.referenceLinks}
                    <ExternalLink className="w-3 h-3" />
                  </Badge>
                </section>
              )}
            </div>

            {/* Project Details Grid */}
            <Card className="bg-card/40 backdrop-blur-xl border-border/40 rounded-[2.5rem] p-8 shadow-xl overflow-hidden relative">
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
                  value={`$${project.budget?.toLocaleString()}`}
                  subValue={project.budgetType || "Fixed"}
                  accent="text-emerald-500"
                />
                <DetailGridItem
                  icon={Briefcase}
                  label="Project Size"
                  value={project.projectSize || "Medium"}
                  subValue="Duration varies"
                />
                <DetailGridItem
                  icon={Star}
                  label="Experience"
                  value={project.experienceLevel || "Any"}
                  subValue="Preferred"
                  accent="text-amber-500"
                />
                <DetailGridItem
                  icon={Calendar}
                  label="Deadline"
                  value={
                    project.deadline
                      ? new Date(project.deadline).toLocaleDateString()
                      : "Flexible"
                  }
                  subValue={daysLeft !== null ? `${daysLeft} days left` : ""}
                  accent={isUrgent ? "text-red-500" : "text-primary"}
                />
                <DetailGridItem
                  icon={Users}
                  label="Hiring Mode"
                  value={project.hiringMethod || "Open Bidding"}
                  subValue="Actively reviewing"
                />
                <DetailGridItem
                  icon={Users}
                  label="Language"
                  value={project.language || "English"}
                  subValue="Preferred"
                />
              </div>
            </Card>

            {/* Required Skills */}
            <Card className="bg-card/40 backdrop-blur-xl border-border/40 rounded-[2.5rem] p-8 shadow-xl border-t-4 border-t-emerald-500/40">
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
                    {matchScore >= 60
                      ? "Great fit!"
                      : matchScore >= 30
                        ? "Partial match"
                        : "Low match"}
                  </p>
                </div>
              </div>
              <div className="space-y-8">
                {project.skills?.filter((s: string) =>
                  FREELANCER_SKILLS.includes(s),
                ).length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-70">
                      Your Matching Skills
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {project.skills
                        .filter((s: string) => FREELANCER_SKILLS.includes(s))
                        .map((skill: string) => (
                          <Badge
                            key={skill}
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 py-2 px-5 rounded-xl font-bold text-sm"
                          >
                            {skill}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
                {project.skills?.filter(
                  (s: string) => !FREELANCER_SKILLS.includes(s),
                ).length > 0 && (
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-70">
                      Other Requirements
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {project.skills
                        .filter((s: string) => !FREELANCER_SKILLS.includes(s))
                        .map((skill: string) => (
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
                )}
              </div>
            </Card>
          </div>

          {/* ── RIGHT: Proposal Sidebar ── */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-10 space-y-8">
              {/* Competition Card */}
              <Card className="bg-card/40 backdrop-blur-xl border-border/40 rounded-[2.5rem] p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" /> Competition
                    </h3>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-black uppercase text-[10px]",
                        (project._count?.proposals || 0) > 15
                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                          : (project._count?.proposals || 0) > 8
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                      )}
                    >
                      {(project._count?.proposals || 0) > 15
                        ? "High"
                        : (project._count?.proposals || 0) > 8
                          ? "Medium"
                          : "Low"}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
                      <span>Proposals Sent</span>
                      <span className="text-foreground">
                        {project._count?.proposals || 0} / 20
                      </span>
                    </div>
                    <div className="h-3 w-full bg-muted/40 rounded-full overflow-hidden border border-border/20">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-1000"
                        style={{
                          width: `${Math.min(((project._count?.proposals || 0) / 20) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-[11px] font-bold text-muted-foreground italic">
                      "Clients review first 10 proposals within 24 hours. Apply
                      early!"
                    </p>
                  </div>
                </div>
              </Card>

              {/* Already applied banner */}
              {myProposal ? (
                <Card className="bg-emerald-500/10 border-emerald-500/30 rounded-[2.5rem] p-8 shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      <h3 className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                        Proposal Submitted!
                      </h3>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        <span className="font-black text-foreground">Bid:</span>{" "}
                        ${myProposal.bidAmount?.toLocaleString()}
                      </p>
                      <p>
                        <span className="font-black text-foreground">
                          Delivery:
                        </span>{" "}
                        {myProposal.deliveryDays} days
                      </p>
                      <p>
                        <span className="font-black text-foreground">
                          Status:
                        </span>{" "}
                        {myProposal.status}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl font-black border-emerald-500/30 text-emerald-700"
                      asChild
                    >
                      <Link to="/freelancer/proposals">View My Proposals</Link>
                    </Button>
                  </div>
                </Card>
              ) : project.status !== "OPEN" ? (
                <Card className="bg-muted/30 border-border/40 rounded-[2.5rem] p-8 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                  <p className="font-black text-muted-foreground">
                    This project is no longer accepting proposals.
                  </p>
                </Card>
              ) : (
                <>
                  {/* Proposal Form */}
                  <Card className="bg-card/40 backdrop-blur-2xl border-border/40 rounded-[2.5rem] shadow-2xl overflow-hidden border-t-8 border-t-primary">
                    <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-2xl font-black tracking-tight">
                        Submit Proposal
                      </CardTitle>
                      <CardDescription className="font-medium pt-2 italic">
                        Applying for{" "}
                        <span className="font-black text-foreground">
                          {project.experienceLevel || "this"}
                        </span>{" "}
                        level position.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                      <ProposalForm
                        project={project}
                        onSuccess={(p) => setMyProposal(p)}
                      />
                    </CardContent>
                  </Card>

                  {/* Tips */}
                  <Card className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Info className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-black text-primary">
                        Tips for a Great Proposal
                      </h4>
                    </div>
                    <ul className="space-y-3">
                      {[
                        "Personalize your cover letter for this specific project",
                        "Clearly outline your approach and milestones",
                        "Mention relevant past work and results",
                        "Be realistic about your bid and timeline",
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
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────────

const VerificationItem = ({
  label,
  verified,
}: {
  label: string;
  verified: boolean;
}) => (
  <div className="flex items-center gap-2.5">
    <div
      className={cn(
        "p-1 rounded-full border",
        verified
          ? "bg-emerald-500/10 border-emerald-500/20"
          : "bg-red-500/10 border-red-500/20",
      )}
    >
      {verified ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
      )}
    </div>
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

// ── Proposal Form ───────────────────────────────────────────────────────────────
const ProposalForm = ({
  project,
  onSuccess,
}: {
  project: any;
  onSuccess: (p: any) => void;
}) => {
  const [bid, setBid] = useState<number>(project.budget || 0);
  const [deliveryDays, setDeliveryDays] = useState("30");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);

  const fee = Math.round(bid * 0.1);
  const total = bid - fee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (coverLetter.length < 50) {
      toast.error("Cover letter too short!", {
        description: "Write at least 50 characters about your approach.",
      });
      return;
    }
    if (!bid || bid <= 0) {
      toast.error("Enter a valid bid amount");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post(`/proposals/project/${project.id}`, {
        bidAmount: bid,
        deliveryDays: parseInt(deliveryDays),
        coverLetter,
      });
      const newProposal = res.data.proposal;
      toast.success("Proposal submitted! 🎉", {
        description: `Your $${bid.toLocaleString()} bid is under review by the client.`,
      });
      onSuccess(newProposal);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit proposal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Bid */}
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          Your Bid Amount
        </Label>
        <div className="relative group">
          <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="number"
            value={bid}
            onChange={(e) => setBid(Number(e.target.value))}
            placeholder={`Budget: $${project.budget?.toLocaleString()}`}
            className="pl-14 h-16 bg-background/50 border-border/40 rounded-2xl font-black text-xl"
          />
        </div>
        <div className="bg-muted/30 p-5 rounded-2xl border border-border/40 space-y-3">
          <div className="flex justify-between text-xs font-bold text-muted-foreground">
            <span>Platform Fee (10%)</span>
            <span>-${fee.toLocaleString()}</span>
          </div>
          <Separator className="bg-border/20" />
          <div className="flex justify-between text-base font-black text-foreground">
            <span>You Receive</span>
            <span className="text-emerald-500">${total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Delivery (days)
        </Label>
        <Select value={deliveryDays} onValueChange={setDeliveryDays}>
          <SelectTrigger className="h-14 bg-background/50 border-border/40 rounded-xl font-bold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {[
              { label: "1 Week", value: "7" },
              { label: "2 Weeks", value: "14" },
              { label: "1 Month", value: "30" },
              { label: "2 Months", value: "60" },
              { label: "3 Months", value: "90" },
            ].map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="font-bold"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cover Letter */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Cover Letter
          </Label>
          <span
            className={cn(
              "text-[9px] font-black uppercase",
              coverLetter.length < 50 ? "text-amber-500" : "text-emerald-500",
            )}
          >
            {coverLetter.length} / 1000
          </span>
        </div>
        <Textarea
          placeholder="Explain why you're the best fit for this project. Mention relevant experience, your approach, and why the client should pick you..."
          className="min-h-[200px] bg-background/50 border-border/40 rounded-[2rem] p-6 font-medium text-sm leading-relaxed"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value.slice(0, 1000))}
        />
      </div>

      <div className="space-y-4 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-2xl font-black text-lg gap-3 shadow-2xl shadow-primary/40 group hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              Submit Proposal{" "}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
