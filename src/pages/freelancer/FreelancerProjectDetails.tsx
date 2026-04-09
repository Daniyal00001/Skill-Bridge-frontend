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
  ShieldCheck,
  ChevronRight,
  Zap,
  ExternalLink,
  ChevronDown,
  Info,
  Loader2,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";

const getDaysLeft = (deadline: string) => {
  if (!deadline) return null;
  const diff = (new Date(deadline).getTime() - Date.now()) / (1000 * 3600 * 24);
  return Math.max(0, Math.ceil(diff));
};

export default function FreelancerProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
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

  const client = project.clientProfile || project.client;

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] w-full mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 md:px-6 min-w-0">
        {/* Breadcrumb */}
        <div className="mb-4">
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

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
          {/* ── LEFT: Project Info ── */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[10px] py-1.5 px-3">
                  {project.category?.name}
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
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-[1.1] break-words">
                {project.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Posted {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {/* <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{project._count?.proposals || 0} proposals</span>
                </div> */}
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


            {/* Description */}
            <div className="space-y-6 py-2">
              <section className="space-y-4">
                <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                  <div className="w-1 h-6 bg-primary rounded-full" /> About This
                  Project
                </h3>
                {project.shortDesc && (
                  <p className="text-lg text-foreground/90 font-bold mb-4 break-words">
                    {project.shortDesc}
                  </p>
                )}
                <p className="text-muted-foreground text-lg leading-relaxed font-medium whitespace-pre-line break-words">
                  {project.description}
                </p>
              </section>

              {project.requirements && (
                <section className="space-y-4">
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                    <div className="w-1 h-6 bg-primary rounded-full" /> What We
                    Need
                  </h3>
                  <div className="bg-muted/30 p-6 rounded-[1.5rem] border border-border/40 font-medium text-lg leading-loose text-foreground/80 whitespace-pre-line break-words">
                    {project.requirements}
                  </div>
                </section>
              )}

              {project.referenceLinks && (
                <section className="space-y-4">
                  <p className="text-muted-foreground/60 uppercase text-[10px] font-black tracking-[0.2em]">
                    Reference Assets
                  </p>
                  <Button
                    asChild
                    variant="secondary"
                    className="rounded-xl font-bold flex items-center gap-2 w-fit"
                  >
                    <a
                      href={project.referenceLinks}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="w-4 h-4" />
                      View External Link
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                </section>
              )}

              {project.attachments && project.attachments.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                    <div className="w-1 h-6 bg-primary rounded-full" /> Attached
                    Documents
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.attachments.map((url: string, index: number) => {
                      const isImage = /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(
                        url,
                      );
                      return (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative flex flex-col items-center justify-center p-4 rounded-2xl border border-border/40 bg-card hover:border-primary/40 hover:shadow-lg transition-all h-32 overflow-hidden"
                        >
                          {isImage ? (
                            <img
                              src={url}
                              alt={`Attachment ${index + 1}`}
                              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <ExternalLink className="w-6 h-6" />
                            </div>
                          )}
                          <div
                            className={cn(
                              "mt-2 text-xs font-bold truncate w-full text-center z-10",
                              isImage
                                ? "text-white drop-shadow-md bg-black/40 px-2 py-1 rounded-md"
                                : "",
                            )}
                          >
                            Document {index + 1}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Project Details Grid */}
            <Card className="bg-card/40 backdrop-blur-xl border-border/40 rounded-[2rem] p-6 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 py-2 px-10 bg-primary/10 border-b border-l border-primary/20 rounded-bl-[2rem] text-[10px] font-black uppercase tracking-widest text-primary">
                Quick specs
              </div>
              <h3 className="text-xl font-black tracking-tight mb-6">
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
                  icon={Globe}
                  label="Language"
                  value={
                    project.languageObj?.name || project.language || "English"
                  }
                  subValue="Preferred"
                />
                <DetailGridItem
                  icon={MapPin}
                  label="Location"
                  value={
                    project.locationObj?.name ||
                    project.locationPref ||
                    "Any location"
                  }
                  subValue="Preference"
                />
              </div>
            </Card>

            {/* Required Skills */}
            {project.skills && project.skills.length > 0 && (
              <Card className="bg-card/40 backdrop-blur-xl border-border/40 rounded-[2rem] p-6 shadow-xl border-t-4 border-t-emerald-500/40">
                <div className="mb-6">
                  <h3 className="text-2xl font-black tracking-tight">
                    Required Skills
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {project.skills.map((skill: any) => {
                    const name = skill.skill?.name || skill.name;
                    return (
                      <Badge
                        key={skill.id || name}
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 py-2 px-5 rounded-xl font-bold text-sm"
                      >
                        {name}
                      </Badge>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>

          {/* ── RIGHT: Proposal Sidebar ── */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-10 space-y-6">
              {/* Client Info Box */}
              {client && (
                <Card className="bg-card/40 backdrop-blur-xl border-border/40 rounded-[2rem] p-6 shadow-xl border-t-4 border-t-primary/40">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" /> About the Client
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-background shadow-md">
                        <AvatarImage src={client.user?.profileImage || client.profileImage} referrerPolicy="no-referrer" />
                        <AvatarFallback className="bg-primary/20 text-primary font-black">
                          {client.user?.name?.[0] || client.name?.[0] || client.fullName?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black leading-tight text-foreground">
                          {client.user?.name || client.name || client.fullName}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span className="text-xs font-bold">
                            {client.averageRating?.toFixed(1) || "5.0"}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-bold">
                            ({client.totalReviews || 0} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1 pb-1">
                      {client.user?.isIdVerified ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                          <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">Identity Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 border border-border/50 rounded-lg">
                          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Identity Unverified</span>
                        </div>
                      )}
                      
                      {client.user?.isPaymentVerified ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">Payment Verified</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 border border-border/50 rounded-lg">
                          <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Payment Unverified</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-4 border-t border-border/50">
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Member Since</p>
                        <p className="font-bold text-sm leading-none flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary"/> {client.createdAt ? new Date(client.createdAt).getFullYear() : 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Total Hired</p>
                        <p className="font-bold text-sm leading-none flex items-center gap-1.5"><Users className="w-3 h-3 text-primary"/> {client.totalHires || 0}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Total Released</p>
                        <p className="font-bold text-sm leading-none flex items-center gap-1.5"><DollarSign className="w-3 h-3 text-emerald-500"/> ${client.totalSpent?.toLocaleString() || 0}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Hire Rate</p>
                        <p className="font-bold text-sm leading-none flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500"/> {client.hireRate ? `${Math.round(client.hireRate <= 1 ? client.hireRate * 100 : client.hireRate)}%` : 'N/A'}</p>
                      </div>
                      {client.location && (
                        <div className="space-y-1 col-span-2 text-center flex flex-col items-center pt-2 border-t border-border/30 mt-2">
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Location</p>
                          <p className="font-bold text-sm leading-none flex items-center gap-1.5 justify-center mt-1">
                            <MapPin className="w-3 h-3 text-primary" />
                            {client.location}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Already applied banner */}
              {myProposal ? (
                <Card className="bg-emerald-500/10 border-emerald-500/30 rounded-[2rem] p-6 shadow-xl">
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
                <Card className="bg-muted/30 border-border/40 rounded-[2rem] p-6 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                  <p className="font-black text-muted-foreground">
                    This project is no longer accepting proposals.
                  </p>
                </Card>
              ) : (
                <>
                  {/* Competition Info */}
                  <Card className="bg-card/40 backdrop-blur-xl border-border/40 rounded-[2rem] p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                          Competition
                        </h4>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "font-black px-3 py-1 text-[10px] uppercase",
                          (project.proposalCount || 0) < 15
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : (project.proposalCount || 0) < 35
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-red-500/10 text-red-600 border-red-500/20",
                        )}
                      >
                        {(project.proposalCount || 0) < 15
                          ? "Low"
                          : (project.proposalCount || 0) < 35
                            ? "Medium"
                            : "High"}
                      </Badge>
                    </div>

                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-3xl font-black text-foreground">
                          {Math.max(0, project.proposalCount || 0)}{" "}
                          <span className="text-sm text-muted-foreground font-bold">
                            / 50
                          </span>
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          Proposals Sent
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-muted-foreground max-w-[140px] leading-tight">
                          High competition means you need to stand out.{" "}
                          <span className="text-primary italic">
                            Make your bid count!
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Visual bar */}
                    <div className="h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-1000",
                          (project.proposalCount || 0) < 15
                            ? "bg-emerald-500"
                            : (project.proposalCount || 0) < 35
                              ? "bg-amber-500"
                              : "bg-red-500",
                        )}
                        style={{
                          width: `${Math.min(((project.proposalCount || 0) / 50) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </Card>

                  {/* Submit Proposal CTA */}
                  <Card className="bg-primary/5 border-primary/20 backdrop-blur-2xl rounded-[2rem] shadow-xl overflow-hidden border-t-8 border-t-primary p-6 text-center space-y-4">
                    <h3 className="text-2xl font-black tracking-tight">
                      Ready to start working?
                    </h3>
                    <p className="text-muted-foreground font-medium pb-2 text-sm">
                      Draft a professional proposal and offer your best rate for
                      this project.
                    </p>
                    <Button
                      size="lg"
                      className="w-full h-16 rounded-2xl text-sm font-black bg-gradient-to-r from-primary to-primary/80 hover:scale-[1.02] shadow-xl hover:shadow-primary/25 transition-all text-white"
                      asChild
                    >
                      <Link to={`/freelancer/projects/${projectId}/proposal`}>
                        Create Proposal Now
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    </Button>
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
