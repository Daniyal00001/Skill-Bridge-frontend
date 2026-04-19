import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  Edit,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Zap,
  ChevronRight,
  Star,
  Loader2,
  MapPin,
  Languages,
  File as FileIcon,
  Sparkles,
  Copy,
  CheckCheck,
  FileText,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";

// ─── Main Page ─────────────────────────────────────────────────────────────────

const ClientProjectDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/projects/${projectId}`);
        setProject(res.data.project);
      } catch (err) {
        toast.error("Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleApproveMilestone = async (milestoneId: string) => {
    const contractId = project?.contract?.id;
    if (!contractId) return;
    try {
      await toast.promise(
        api.patch(`/contracts/${contractId}/milestones/${milestoneId}/approve`),
        {
          loading: "Releasing funds...",
          success: "Milestone approved & payment released! ✅",
          error: "Failed to approve milestone.",
        },
      );
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data.project);
    } catch {}
  };

  const handleRevision = async (milestoneId: string) => {
    const contractId = project?.contract?.id;
    if (!contractId) return;
    try {
      await api.patch(
        `/contracts/${contractId}/milestones/${milestoneId}/revision`,
        { feedback: "Please review and make the requested changes." },
      );
      toast.info("Revision request sent.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send revision");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success("Project deleted.");
      navigate("/client/projects");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Cannot delete project with active proposals",
      );
    }
  };

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
          <AlertCircle className="w-12 h-12 text-muted-foreground/40" />
          <h2 className="text-xl font-black">Project not found</h2>
          <Button asChild>
            <Link to="/client/projects">Back to Projects</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const contract = project.contract;
  const hiredDeveloper = contract?.freelancer;
  const milestones = contract?.milestones || [];
  const completedMilestones = milestones.filter(
    (m: any) => m.status === "APPROVED",
  ).length;
  const progress =
    milestones.length > 0
      ? Math.round((completedMilestones / milestones.length) * 100)
      : 0;
  const pendingReview = milestones.find((m: any) => m.status === "SUBMITTED");
  const proposalsPreview = project.proposals?.slice(0, 3) || [];
  const daysRemaining = project.deadline
    ? Math.ceil(
        (new Date(project.deadline).getTime() - Date.now()) / (1000 * 86400),
      )
    : null;

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      OPEN: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      IN_PROGRESS: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      COMPLETED: "bg-violet-500/10 text-violet-500 border-violet-500/20",
      DRAFT: "bg-muted text-muted-foreground",
    };
    return (
      <Badge
        className={cn(
          "font-bold uppercase tracking-widest text-[10px]",
          map[status] || "bg-muted text-muted-foreground",
        )}
      >
        {status}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 md:p-6 space-y-6 animate-fade-in max-w-7xl">
        {/* <Button
          variant="ghost"
          asChild
          className="gap-2 -ml-4 text-muted-foreground hover:text-foreground"
        >
          <Link to="/client/projects">
            <ChevronLeft className="w-4 h-4" /> Back to My Projects
          </Link>
        </Button> */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Main Content ── */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <div className="flex justify-between items-start mb-6">
                  {getStatusBadge(project.status)}
                </div>
                <h1 className="text-3xl font-black tracking-tight leading-tight break-words">
                  {project.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  {project.category && (
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/20"
                    >
                      {project.category.name}
                    </Badge>
                  )}
                  {project.subCategory && (
                    <Badge
                      variant="outline"
                      className="bg-blue-500/5 text-blue-500 border-blue-500/20"
                    >
                      {project.subCategory.name}
                    </Badge>
                  )}
                  {project.experienceLevel && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="font-medium">
                        {project.experienceLevel} Level
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Posted {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {daysRemaining !== null && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span
                        className={cn(
                          daysRemaining < 7 ? "text-destructive font-bold" : "",
                        )}
                      >
                        Deadline:{" "}
                        {new Date(project.deadline).toLocaleDateString()} (
                        {daysRemaining} days left)
                      </span>
                    </div>
                  )}
                </div>
                {project.status === "IN_PROGRESS" && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-muted-foreground">
                      <span>Execution Progress</span>
                      <span className="text-primary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5 bg-muted/60" />
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-0">
                {/* ── 2 Tabs: overview / requirements ── */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid grid-cols-2 w-full rounded-none border-b bg-transparent h-14 px-0">
                    {["overview", "requirements"].map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-bold px-0 capitalize text-sm"
                      >
                        {tab.replace("-", " ")}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent
                    value="overview"
                    className="p-6 space-y-6 animate-in fade-in duration-300 border-x border-b border-border/40 rounded-b-[2rem]"
                  >
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold">Project Description</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                    {project.requirements && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold">
                          Functional Requirements
                        </h4>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {project.requirements}
                        </p>
                      </div>
                    )}
                    {project.referenceLinks && (
                      <div className="space-y-3">
                        <h4 className="text-lg font-bold">Reference Links</h4>
                        <a
                          href={
                            project.referenceLinks.startsWith("http")
                              ? project.referenceLinks
                              : `https://${project.referenceLinks}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Badge
                            variant="secondary"
                            className="gap-2 py-2 px-4 cursor-pointer hover:bg-muted transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {project.referenceLinks}
                          </Badge>
                        </a>
                      </div>
                    )}
                    {project.attachments && project.attachments.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-bold">Project Assets</h4>
                          <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
                        </div>
                        <div className="p-4 rounded-[1.5rem] border border-primary/10 bg-primary/5 backdrop-blur-sm shadow-sm transition-all hover:border-primary/20">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {project.attachments.map(
                              (url: string, i: number) => {
                                const fileName =
                                  url.split("/").pop() || `Attachment ${i + 1}`;
                                return (
                                  <a
                                    key={i}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-3 rounded-xl border border-white/40 bg-white/40 hover:bg-white/80 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10 transition-all group lg:hover:-translate-y-1 hover:shadow-lg"
                                  >
                                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/10 shadow-inner text-primary group-hover:scale-110 transition-transform">
                                      <FileIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-black truncate text-foreground/80">
                                        {fileName}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-0.5 opacity-60">
                                        Click to view
                                      </p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                  </a>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Requirements Tab */}
                  <TabsContent
                    value="requirements"
                    className="p-6 space-y-6 animate-in fade-in duration-300 border-x border-b border-border/40 rounded-b-[2rem]"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold">Required Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.skills?.map((skill: any, i: number) => (
                            <Badge
                              key={skill.id || i}
                              variant="outline"
                              className="font-bold py-1.5 px-3"
                            >
                              {skill.skill?.name || skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              label: "Hiring Method",
                              value: project.hiringMethod,
                              icon: Zap,
                              color: "text-amber-500",
                              bgColor: "bg-amber-500/10",
                            },
                            {
                              label: "Location",
                              value: project.locationPref,
                              icon: MapPin,
                              color: "text-rose-500",
                              bgColor: "bg-rose-500/10",
                            },
                            {
                              label: "Language",
                              value: project.language,
                              icon: Languages,
                              color: "text-indigo-500",
                              bgColor: "bg-indigo-500/10",
                            },
                            {
                              label: "Level",
                              value: project.experienceLevel,
                              icon: Star,
                              color: "text-amber-500",
                              bgColor: "bg-amber-500/10",
                            },
                          ].map((item, i) => (
                            <div
                              key={i}
                              className="flex flex-col items-center justify-center p-6 rounded-[2rem] border border-border/40 bg-card/60 backdrop-blur-sm text-center space-y-3 hover:border-primary/20 transition-all group"
                            >
                              <div
                                className={cn(
                                  "p-3.5 rounded-2xl transition-transform group-hover:scale-110",
                                  item.bgColor,
                                  item.color,
                                )}
                              >
                                <item.icon className="w-6 h-6" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                  {item.label}
                                </p>
                                <p className="text-sm font-black capitalize">
                                  {item.value || "Any"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Pending Review Alert */}
            {pendingReview && (
              <div className="p-6 rounded-[1.5rem] bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-2 border-amber-500/30 space-y-4">
                <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5" /> Work Submitted — Pending
                  Your Review
                </div>
                <h4 className="text-xl font-black break-words">
                  {hiredDeveloper?.name} submitted "{pendingReview.title}"
                </h4>
                {pendingReview.submissionNote && (
                  <div className="bg-background/40 p-5 rounded-2xl border border-amber-500/20">
                    <p className="text-xs font-black text-muted-foreground uppercase mb-2">
                      Developer Notes:
                    </p>
                    <p className="text-sm italic">
                      "{pendingReview.submissionNote}"
                    </p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-black h-14 rounded-2xl flex-1 text-lg gap-3"
                    onClick={() => handleApproveMilestone(pendingReview.id)}
                  >
                    <CheckCircle2 className="w-6 h-6" /> Approve & Release $
                    {pendingReview.amount?.toLocaleString()}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-amber-500/50 text-amber-600 font-black h-14 rounded-2xl px-10 text-lg"
                    onClick={() => handleRevision(pendingReview.id)}
                  >
                    Request Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Proposals Preview */}
            {project.status === "OPEN" && proposalsPreview.length > 0 && (
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-6 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-xl font-black">
                      Top Proposals
                    </CardTitle>
                    <Badge className="bg-primary/10 text-primary">
                      {project._count?.proposals || proposalsPreview.length}
                    </Badge>
                  </div>
                  <Button
                    variant="link"
                    className="font-bold gap-2 text-primary"
                    asChild
                  >
                    <Link to={`/client/projects/${project.id}/proposals`}>
                      View All <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                  {proposalsPreview.map((proposal: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/40 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={proposal.freelancer?.profileImage}
                          />
                          <AvatarFallback>
                            {proposal.freelancer?.name?.[0] || "F"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-sm">
                            {proposal.freelancer?.name}
                          </p>
                          {proposal.freelancer?.rating && (
                            <div className="flex items-center gap-1 text-xs text-amber-500 font-black">
                              <Star className="w-3 h-3 fill-amber-500" />{" "}
                              {proposal.freelancer.rating.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm">
                          ${proposal.bidAmount?.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {proposal.deliveryDays} days
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-blue-600" />
              <CardContent className="p-6 space-y-6">
                <div className="space-y-1">
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                    Budget
                  </p>
                  <p className="text-3xl font-black">
                    ${project.budget?.toLocaleString()}
                  </p>
                  <p className="text-sm text-primary font-bold capitalize">
                    {project.budgetType || "Fixed Price"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                      Views
                    </p>
                    <p className="text-2xl font-black">
                      {project.viewCount || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                      Bids
                    </p>
                    <p className="text-2xl font-black">
                      {project._count?.proposals || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm shadow-2xl shadow-primary/10">
              <CardContent className="p-6 space-y-4">
                {project.status === "OPEN" ? (
                  <>
                    <Button
                      className="w-full h-12 rounded-xl font-black text-base gap-3 shadow-lg shadow-primary/30"
                      asChild
                    >
                      <Link to={`/client/projects/${project.id}/proposals`}>
                        <Users className="w-5 h-5" /> View All Proposals
                      </Link>
                    </Button>
                  </>
                ) : project.status === "IN_PROGRESS" ? (
                  <>
                    <Button
                      className="w-full h-12 rounded-xl font-black text-base gap-3"
                      asChild
                    >
                      <Link to="/client/messages">
                        <MessageSquare className="w-5 h-5" /> Message Developer
                      </Link>
                    </Button>
                    {contract && (
                      <Button
                        variant="outline"
                        className="w-full h-12 rounded-xl font-black bg-background/50"
                        asChild
                      >
                        <Link to={`/client/contracts/${contract.id}`}>
                          View Contract
                        </Link>
                      </Button>
                    )}
                  </>
                ) : project.status === "COMPLETED" ? (
                  <Button className="w-full h-12 rounded-xl font-black" asChild>
                    <Link to={`/client/contracts/${contract?.id}`}>
                      View Final Contract
                    </Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            {hiredDeveloper && (
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="p-6 border-b bg-muted/30">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    Active Specialist
                  </p>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16 ring-4 ring-primary/10">
                        <AvatarImage src={hiredDeveloper.profileImage} />
                        <AvatarFallback>
                          {hiredDeveloper.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-background rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-black text-lg break-words">
                          {hiredDeveloper.name}
                        </h5>
                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {hiredDeveloper.title || "Freelancer"}
                      </p>
                      {hiredDeveloper.rating && (
                        <div className="flex items-center gap-1 mt-1 font-black text-xs text-amber-500">
                          <Star className="w-3 h-3 fill-amber-500" />{" "}
                          {hiredDeveloper.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="secondary"
                      className="font-black text-xs h-10 rounded-xl"
                      asChild
                    >
                      <Link to="/client/messages">Chat</Link>
                    </Button>
                    {contract && (
                      <Button
                        variant="outline"
                        className="font-black text-xs h-10 rounded-xl"
                        asChild
                      >
                        <Link to={`/client/contracts/${contract.id}`}>
                          Contract
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientProjectDetailsPage;
