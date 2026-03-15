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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ChevronLeft,
  Edit,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Eye,
  Bookmark,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ExternalLink,
  PlusCircle,
  Zap,
  Trash2,
  Archive,
  Pause,
  Layout,
  ChevronRight,
  Star,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { api } from "@/lib/api";

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

  // Approve milestone
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

  // Request revision
  const handleRevision = async (milestoneId: string) => {
    const contractId = project?.contract?.id;
    if (!contractId) return;
    try {
      await api.patch(
        `/contracts/${contractId}/milestones/${milestoneId}/revision`,
        {
          feedback: "Please review and make the requested changes.",
        },
      );
      toast.info("Revision request sent.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send revision");
    }
  };

  // Delete project (only OPEN/DRAFT)
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

  // Derived data from API
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
      <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in max-w-7xl">
        {/* Back */}
        <Button
          variant="ghost"
          asChild
          className="gap-2 -ml-4 text-muted-foreground hover:text-foreground"
        >
          <Link to="/client/projects">
            <ChevronLeft className="w-4 h-4" /> Back to My Projects
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Main Content ── */}
          <div className="lg:col-span-8 space-y-8">
            {/* Project Header Card */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <div className="flex justify-between items-start mb-6">
                  {getStatusBadge(project.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 font-bold h-9"
                    asChild
                  >
                    <Link to={`/client/post-project?editId=${project.id}`}>
                      <Edit className="w-4 h-4" /> Edit Project
                    </Link>
                  </Button>
                </div>
                <h1 className="text-3xl font-black tracking-tight leading-tight">
                  {project.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-6">
                  <Badge
                    variant="outline"
                    className="bg-primary/5 text-primary border-primary/20"
                  >
                    {project.category}
                  </Badge>
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
                  <div className="mt-8 space-y-3">
                    <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-muted-foreground">
                      <span>Execution Progress</span>
                      <span className="text-primary">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2.5 bg-muted/60" />
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-0">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-14 px-8 gap-8">
                    {["overview", "requirements", "milestones"].map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full font-bold px-0 capitalize"
                      >
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent
                    value="overview"
                    className="p-8 space-y-8 animate-in fade-in duration-300"
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
                        <Badge
                          variant="secondary"
                          className="gap-2 py-2 px-4 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {project.referenceLinks}
                        </Badge>
                      </div>
                    )}
                  </TabsContent>

                  {/* Requirements Tab */}
                  <TabsContent
                    value="requirements"
                    className="p-8 space-y-8 animate-in fade-in duration-300"
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
                        {[
                          {
                            label: "Experience Level",
                            value: project.experienceLevel,
                            icon: Zap,
                            color: "text-amber-500",
                          },
                          {
                            label: "Project Size",
                            value: project.projectSize,
                            icon: Layout,
                            color: "text-blue-500",
                          },
                          {
                            label: "Budget Type",
                            value: project.budgetType,
                            icon: DollarSign,
                            color: "text-emerald-500",
                          },
                          {
                            label: "Budget",
                            value: `$${project.budget?.toLocaleString()}`,
                            icon: DollarSign,
                            color: "text-primary",
                          },
                        ].map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "p-2 rounded-lg bg-card border shadow-sm",
                                  item.color,
                                )}
                              >
                                <item.icon className="w-4 h-4" />
                              </div>
                              <span className="text-sm font-medium text-muted-foreground">
                                {item.label}
                              </span>
                            </div>
                            <span className="font-bold text-sm">
                              {item.value || "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Milestones Tab */}
                  <TabsContent
                    value="milestones"
                    className="p-8 space-y-6 animate-in fade-in duration-300"
                  >
                    {milestones.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No milestones added yet.</p>
                        {contract && (
                          <p className="text-sm mt-1">
                            Add milestones from the contract page.
                          </p>
                        )}
                      </div>
                    ) : (
                      milestones.map((milestone: any, idx: number) => (
                        <div
                          key={milestone.id}
                          className={cn(
                            "flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border group hover:border-primary/20 transition-all",
                            milestone.status === "APPROVED"
                              ? "bg-emerald-500/5 border-emerald-500/20"
                              : milestone.status === "SUBMITTED"
                                ? "bg-amber-500/10 border-amber-500/30"
                                : "bg-muted/20 border-border/50",
                          )}
                        >
                          <div className="flex items-center gap-5">
                            <div
                              className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border",
                                milestone.status === "APPROVED"
                                  ? "bg-emerald-500 text-white border-0"
                                  : milestone.status === "SUBMITTED"
                                    ? "bg-amber-500 text-white border-0"
                                    : "bg-background",
                              )}
                            >
                              {milestone.status === "APPROVED" ? (
                                <CheckCircle2 className="w-6 h-6" />
                              ) : (
                                idx + 1
                              )}
                            </div>
                            <div>
                              <h5 className="font-black text-lg">
                                {milestone.title}
                              </h5>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5 font-bold text-foreground">
                                  <DollarSign className="w-3.5 h-3.5" /> $
                                  {milestone.amount?.toLocaleString()}
                                </span>
                                {milestone.dueDate && (
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(
                                      milestone.dueDate,
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "px-4 py-1.5 font-black tracking-widest text-[10px]",
                                milestone.status === "APPROVED"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : milestone.status === "SUBMITTED"
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    : "bg-muted text-muted-foreground",
                              )}
                            >
                              {milestone.status}
                            </Badge>
                            {milestone.status === "SUBMITTED" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold gap-1"
                                  onClick={() =>
                                    handleApproveMilestone(milestone.id)
                                  }
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl font-bold border-amber-500/30 text-amber-600"
                                  onClick={() => handleRevision(milestone.id)}
                                >
                                  Revise
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Pending Review Alert */}
            {pendingReview && (
              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-2 border-amber-500/30 space-y-6">
                <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5" /> Work Submitted — Pending
                  Your Review
                </div>
                <h4 className="text-xl font-black">
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

            {/* Proposals Preview (only for OPEN projects) */}
            {project.status === "OPEN" && proposalsPreview.length > 0 && (
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="p-8 flex flex-row items-center justify-between">
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
                <CardContent className="p-8 pt-0 space-y-4">
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
            {/* Stats Card */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary to-blue-600" />
              <CardContent className="p-8 space-y-8">
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

            {/* Actions Card */}
            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm shadow-2xl shadow-primary/10">
              <CardContent className="p-8 space-y-4">
                {project.status === "OPEN" ? (
                  <>
                    <Button
                      className="w-full h-14 rounded-2xl font-black text-lg gap-3 shadow-lg shadow-primary/30"
                      asChild
                    >
                      <Link to={`/client/projects/${project.id}/proposals`}>
                        <Users className="w-5 h-5" /> View All Proposals
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-14 rounded-2xl font-black bg-background/50"
                      asChild
                    >
                      <Link to={`/client/post-project?editId=${project.id}`}>
                        Edit Project Details
                      </Link>
                    </Button>
                  </>
                ) : project.status === "IN_PROGRESS" ? (
                  <>
                    <Button
                      className="w-full h-14 rounded-2xl font-black text-lg gap-3"
                      asChild
                    >
                      <Link to="/client/messages">
                        <MessageSquare className="w-5 h-5" /> Message Developer
                      </Link>
                    </Button>
                    {contract && (
                      <Button
                        variant="outline"
                        className="w-full h-14 rounded-2xl font-black bg-background/50"
                        asChild
                      >
                        <Link to={`/client/contracts/${contract.id}`}>
                          View Contract
                        </Link>
                      </Button>
                    )}
                  </>
                ) : project.status === "COMPLETED" ? (
                  <Button
                    className="w-full h-14 rounded-2xl font-black"
                    asChild
                  >
                    <Link to={`/client/contracts/${contract?.id}`}>
                      View Final Contract
                    </Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            {/* Hired Developer Card */}
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
                        <h5 className="font-black text-lg truncate">
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
