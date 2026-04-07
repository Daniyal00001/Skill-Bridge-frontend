import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Briefcase,
  Star,
  Zap,
  Globe,
  DollarSign,
  TrendingUp,
  Gavel,
  History,
  User,
  Building2,
  Award,
  GraduationCap,
  FileText,
  Clock,
  CheckCircle2,
  Paperclip,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await adminService.getUserProfile(id!);
        setUser(data);
      } catch (err) {
        toast.error("Failed to fetch user profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">
            Decrypting User Profile...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
          <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center border border-rose-100">
            <ShieldAlert className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black italic">
            Unauthorized or Invalid Identity
          </h2>
          <p className="text-muted-foreground max-w-xs">
            The requested user protocol does not exist in the secure database.
          </p>
          <Button asChild variant="outline" className="rounded-2xl">
            <Link to="/admin/users">Return to Directory</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isFreelancer = user.role === "FREELANCER";
  const profile = isFreelancer ? user.freelancerProfile : user.clientProfile;
  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2);

  // Unified list of activity (projects for client, contracts for freelancer)
  const activityItems = isFreelancer ? user.freelancerProfile?.contracts : user.clientProfile?.projects;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/users"
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>
          <Badge
            variant="outline"
            className={cn(
              "rounded-xl px-4 py-1.5 font-black tracking-widest text-[10px] shadow-sm",
              isFreelancer
                ? "bg-purple-50 text-purple-700 border-purple-200"
                : "bg-blue-50 text-blue-700 border-blue-200",
            )}
          >
            {user.role} CASE FILE
          </Badge>
        </div>

        {/* ── Profile Header ─────────────────────────────────────────── */}
        <Card className="overflow-hidden border-border/50 shadow-xl rounded-[2.5rem]">
          <div className="h-32 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[length:24px_24px]" />
          </div>
          <CardContent className="relative px-8 pb-10 -mt-16">
            <div className="flex flex-col md:flex-row gap-8 items-end justify-between">
              <div className="flex flex-col md:flex-row gap-8 items-end">
                <Avatar className="w-40 h-40 ring-8 ring-background border-border/50 border shadow-2xl">
                  <AvatarImage src={user.profileImage} />
                  <AvatarFallback className="text-4xl font-black bg-muted text-muted-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-3 pb-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-4xl font-black tracking-tight">
                      {user.name}
                    </h1>
                    {user.isIdVerified && (
                      <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    )}
                  </div>
                  <p className="text-lg font-bold text-muted-foreground italic leading-none">
                    {isFreelancer
                      ? profile?.tagline
                      : profile?.company || "Independent Client"}
                  </p>
                  <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-muted-foreground pt-1">
                    <span className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      {user.email}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      {profile?.location || "Location Unknown"}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pb-2">
                <Button
                  variant="outline"
                  className="rounded-2xl font-black uppercase text-[10px] tracking-widest px-6 shadow-sm"
                >
                  Suspend Account
                </Button>
                {/* <Button className="rounded-2xl font-black uppercase text-[10px] tracking-widest px-6 shadow-lg shadow-primary/20">
                  Broadcast Notice
                </Button> */}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Main Content Area (Tabbed) ───────────────────────────── */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="overview" className="space-y-8">
              <div className="flex justify-center sm:justify-start">
                <TabsList className="bg-muted/30 backdrop-blur-md p-1.5 rounded-[1.5rem] border border-border/50 w-full sm:w-auto flex flex-wrap h-auto sm:h-14 gap-1">
                  <TabsTrigger
                    value="overview"
                    className="flex-1 sm:flex-none rounded-xl px-6 py-2.5 sm:py-0 h-full font-black uppercase text-[10px] tracking-[0.15em] flex items-center gap-2.5 transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary group"
                  >
                    <User className="w-4 h-4 transition-transform group-hover:scale-110" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="flex-1 sm:flex-none rounded-xl px-6 py-2.5 sm:py-0 h-full font-black uppercase text-[10px] tracking-[0.15em] flex items-center gap-2.5 transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary group"
                  >
                    <Briefcase className="w-4 h-4 transition-transform group-hover:scale-110" />
                    Activity
                  </TabsTrigger>
                  <TabsTrigger
                    value="feedback"
                    className="flex-1 sm:flex-none rounded-xl px-6 py-2.5 sm:py-0 h-full font-black uppercase text-[10px] tracking-[0.15em] flex items-center gap-2.5 transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary group"
                  >
                    <Star className="w-4 h-4 transition-transform group-hover:scale-110" />
                    Feedback
                  </TabsTrigger>
                  <TabsTrigger
                    value="disputes"
                    className="flex-1 sm:flex-none rounded-xl px-6 py-2.5 sm:py-0 h-full font-black uppercase text-[10px] tracking-[0.15em] flex items-center gap-2.5 transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-rose-600 group"
                  >
                    <Gavel className="w-4 h-4 transition-transform group-hover:scale-110" />
                    Disputes
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* OVERVIEW TAB */}
              <TabsContent
                value="overview"
                className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {isFreelancer ? (
                    <>
                      <MetricCard
                        label="Avg Rating"
                        value={profile?.averageRating?.toFixed(1) || "5.0"}
                        icon={Star}
                        accent="bg-amber-400"
                      />
                      <MetricCard
                        label="Contracts"
                        value={profile?._count?.contracts || 0}
                        icon={Briefcase}
                        accent="bg-emerald-500"
                      />
                      <MetricCard
                        label="Hourly Rate"
                        value={
                          profile?.hourlyRate ? `$${profile.hourlyRate}` : "TBD"
                        }
                        icon={TrendingUp}
                        accent="bg-sky-500"
                      />
                      <MetricCard
                        label="Reviews"
                        value={user._count?.reviewsReceived || 0}
                        icon={Zap}
                        accent="bg-violet-500"
                      />
                    </>
                  ) : (
                    <>
                      <MetricCard
                        label="Avg Rating"
                        value={profile?.averageRating?.toFixed(1) || "0.0"}
                        icon={Star}
                        accent="bg-amber-400"
                      />
                      <MetricCard
                        label="Hire Rate"
                        value={
                          profile?.hireRate
                            ? `${Math.round(profile.hireRate * 100)}%`
                            : "0%"
                        }
                        icon={TrendingUp}
                        accent="bg-emerald-500"
                      />
                      <MetricCard
                        label="Projects"
                        value={profile?._count?.projects || 0}
                        icon={Building2}
                        accent="bg-sky-500"
                      />
                      <MetricCard
                        label="Total Hires"
                        value={profile?.totalHires || 0}
                        icon={Zap}
                        accent="bg-amber-400"
                      />
                    </>
                  )}
                </div>

                <Card className="rounded-[2rem] border-border/50 shadow-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b border-border/40">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
                      Case Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <p className="text-base text-muted-foreground font-medium leading-relaxed italic whitespace-pre-wrap">
                      "
                      {profile?.bio ||
                        "No detailed summary provided for this user identity."}
                      "
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ACTIVITY TAB */}
              <TabsContent
                value="activity"
                className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <Card className="rounded-[2.5rem] border-border/50 shadow-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b border-border/40">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                      <History className="w-4 h-4" />
                      {isFreelancer
                        ? "Recent Contract History"
                        : "Recent Project Activity"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {(!activityItems || activityItems.length === 0) ? (
                      <div className="p-12 text-center text-muted-foreground italic text-sm">
                         No activity logs encrypted for this user.
                      </div>
                    ) : (
                      <div className="divide-y divide-border/40">
                        {activityItems.map((item: any) => {
                          const project = isFreelancer ? item.project : item;
                          const contract = isFreelancer ? item : item.contract;
                          const milestoneCount = contract?.milestones?.length || 0;
                          
                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelectedProject({ ...project, contract })}
                              className="p-6 hover:bg-muted/20 transition-all flex items-center justify-between cursor-pointer group active:scale-[0.99]"
                            >
                              <div className="space-y-1 pr-4 max-w-[70%]">
                                <p className="font-bold text-sm text-foreground line-clamp-2 break-words transition-colors group-hover:text-primary">
                                  {project?.title}
                                </p>
                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                                   <span>Budget: ${project?.budget?.toLocaleString() || item.agreedPrice?.toLocaleString()}</span>
                                   {milestoneCount > 0 && <span>· {milestoneCount} Milestones</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge
                                  variant="secondary"
                                  className="rounded-lg text-[9px] font-black uppercase tracking-tight"
                                >
                                  {project?.status || item.status}
                                </Badge>
                                <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors group-hover:translate-x-1" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* FEEDBACK TAB */}
              <TabsContent
                value="feedback"
                className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <Card className="rounded-[2.5rem] border-border/50 shadow-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b border-border/40">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      Platform Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/40">
                      {user.reviews?.map((review: any) => (
                        <div key={review.id} className="p-8 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border border-border/50">
                                <AvatarImage src={review.giver?.profileImage} />
                                <AvatarFallback className="text-[10px] font-black">
                                  {review.giver?.name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-black">
                                  {review.giver?.name}
                                </p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                  Verified Reviewer
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                              <span className="text-xs font-black text-amber-700">
                                {review.rating.toFixed(1)}
                              </span>
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            </div>
                          </div>
                          <p className="text-sm text-foreground/80 font-medium italic leading-relaxed pl-1">
                            "
                            {review.comment ||
                              "The reviewer left no written comments, but provided a high-quality rating for the interaction."}
                            "
                          </p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest pl-1">
                            {new Date(review.submittedAt).toLocaleDateString()}{" "}
                            · Contract Protocol
                          </p>
                        </div>
                      ))}
                      {(!user.reviews || user.reviews.length === 0) && (
                        <div className="p-16 text-center space-y-4 bg-muted/5">
                          <div className="w-16 h-16 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto border border-border/40">
                            <Zap className="w-8 h-8 text-muted-foreground/40" />
                          </div>
                          <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">
                            No Feedback Transmissions Found
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* DISPUTES TAB */}
              <TabsContent
                value="disputes"
                className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                <Card className="rounded-[2.5rem] border-border/50 shadow-sm overflow-hidden">
                  <CardHeader className="bg-rose-500/5 border-b border-rose-500/10">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-rose-700 flex items-center gap-2">
                      <Gavel className="w-4 h-4" />
                      Dispute Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/40">
                      {user.disputeHistory.map((d: any) => (
                        <Link
                          key={d.id}
                          to={`/admin/disputes/${d.id}`}
                          className="p-6 hover:bg-rose-500/5 transition-colors flex items-center justify-between group"
                        >
                          <div className="space-y-1">
                            <p className="font-bold text-sm group-hover:text-rose-600 transition-colors">
                              Case #{d.id.substring(0, 8).toUpperCase()}
                            </p>
                            <p className="text-xs text-muted-foreground italic line-clamp-1">
                              "{d.reason}"
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                Opened
                              </p>
                              <p className="text-[11px] font-bold">
                                {new Date(d.openedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge
                              className={cn(
                                "rounded-lg font-black text-[9px] tracking-tight px-2 py-0.5",
                                d.status === "RESOLVED"
                                  ? "bg-emerald-500"
                                  : "bg-amber-500",
                              )}
                            >
                              {d.status}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                      {user.disputeHistory.length === 0 && (
                        <div className="p-16 text-center text-muted-foreground italic text-sm">
                          No historical disputes recorded. Protocol clean.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* ── Right Column: Sidebar Specs ──────────────────────────── */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Verification Matrix */}
            <Card className="rounded-[2.5rem] border-border/50 shadow-lg overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/40">
                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-foreground">
                  Trust Matrix
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <VerificationRow
                  label="Email Authenticated"
                  ok={user.isEmailVerified}
                />
                <VerificationRow
                  label="Identity Verified"
                  ok={user.isIdVerified}
                />
                <VerificationRow
                  label="Phone Verified"
                  ok={user.isPhoneVerified}
                />
                <VerificationRow
                  label="Payment Methods"
                  ok={user.isPaymentVerified}
                />
              </CardContent>
            </Card>

            {/* Specialist Attributes (Freelancer Only) */}
            {isFreelancer && (
              <Card className="rounded-[2.5rem] border-border/50 shadow-lg overflow-hidden">
                <CardHeader className="bg-purple-500/5 border-b border-purple-500/10">
                  <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-purple-700">
                    Technical Schematics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Certified Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile?.skills?.map((s: any) => (
                        <Badge
                          key={s.id}
                          variant="outline"
                          className="rounded-xl px-3 py-1 bg-purple-500/5 border-purple-200 text-purple-700 font-bold text-[10px]"
                        >
                          {s.skill?.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Education
                    </p>
                    {profile?.educations?.map((edu: any) => (
                      <div
                        key={edu.id}
                        className="flex gap-3 items-start p-3 bg-muted/30 rounded-2xl"
                      >
                        <GraduationCap className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-black leading-tight uppercase">
                            {edu.degree}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-bold">
                            {edu.school}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Credentials
                    </p>
                    {profile?.certificates?.map((cert: any) => (
                      <div
                        key={cert.id}
                        className="flex gap-3 items-start p-3 bg-muted/30 rounded-2xl"
                      >
                        <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-black leading-tight uppercase">
                            {cert.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-bold">
                            {cert.issuingOrganization}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Network History */}
            <Card className="rounded-[2.5rem] border-border/50 shadow-lg overflow-hidden p-6 bg-foreground text-background">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <History className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                    System Log
                  </p>
                  <p className="text-sm font-bold">
                    Last active protocol:{" "}
                    {user.lastActiveAt
                      ? new Date(user.lastActiveAt).toLocaleString()
                      : "Recently active"}
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>

      {/* ── Project/Contract Detail Dialog ───────────────────────────── */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-border/50 shadow-2xl p-0 gap-0 outline-none scrollbar-hide">
          <div className="h-28 bg-gradient-to-br from-primary/20 via-primary/5 to-background sticky top-0 z-10 border-b border-border/40 backdrop-blur-xl">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--primary)_1px,_transparent_1px)] bg-[length:16px_16px]" />
            <div className="relative h-full flex flex-col justify-end px-8 pb-4">
              <div className="flex items-center gap-3 mb-1.5">
                <Badge variant="outline" className="rounded-xl px-2.5 py-0.5 bg-background/50 text-primary border-primary/20 font-black tracking-widest text-[8px] uppercase backdrop-blur-sm">
                  Protocol Insight
                </Badge>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm">
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
                    selectedProject?.status === "COMPLETED" ? "bg-emerald-500" : "bg-primary"
                  )} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{selectedProject?.status}</span>
                </div>
              </div>
              <DialogTitle className="text-xl font-black leading-tight break-all line-clamp-2 pr-16 max-w-full">
                {selectedProject?.title}
              </DialogTitle>
            </div>
          </div>
          
          <div className="px-8 py-8 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Identified Protocol</p>
                <p className="text-[10px] font-bold truncate text-foreground/80">#{selectedProject?.contract?.id || "N/A"}</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/40">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Financial Allocation</p>
                <p className="text-[10px] font-bold text-foreground/80">${selectedProject?.budget?.toLocaleString() || selectedProject?.agreedPrice?.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-primary" />
                  Submission Timeline
                </h4>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  {selectedProject?.contract?.milestones?.length || 0} Phase(s)
                </p>
              </div>

              <div className="space-y-6">
                {selectedProject?.contract?.milestones?.map((milestone: any, idx: number) => (
                  <div key={milestone.id} className="relative pl-12 group">
                    {/* Timeline Line */}
                    {idx !== selectedProject.contract.milestones.length - 1 && (
                      <div className="absolute left-[19px] top-8 bottom-0 w-0.5 bg-border/40 group-hover:bg-primary/20 transition-colors" />
                    )}
                    
                    {/* Timeline Node */}
                    <div className={cn(
                      "absolute left-0 top-0 w-10 h-10 rounded-2xl flex items-center justify-center border transition-all shadow-sm z-10",
                      milestone.status === "APPROVED" ? "bg-emerald-500 border-emerald-600 shadow-emerald-500/20" : 
                      milestone.status === "SUBMITTED" ? "bg-primary border-primary shadow-primary/20" : "bg-muted border-border/50"
                    )}>
                       {milestone.status === "APPROVED" ? (
                         <CheckCircle2 className="w-5 h-5 text-white" />
                       ) : milestone.status === "SUBMITTED" ? (
                         <Zap className="w-5 h-5 text-white animate-pulse" />
                       ) : (
                         <span className="text-xs font-black text-muted-foreground">{idx + 1}</span>
                       )}
                    </div>

                    <div className="space-y-4 bg-muted/20 hover:bg-muted/30 p-6 rounded-[2rem] border border-border/40 transition-all">
                       <div className="flex items-center justify-between">
                         <h5 className="font-bold text-sm tracking-tight text-foreground/90">{milestone.title}</h5>
                         <Badge variant="outline" className={cn(
                           "rounded-lg text-[8px] font-black uppercase tracking-tighter backdrop-blur-sm",
                           milestone.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                           milestone.status === "SUBMITTED" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/50 text-muted-foreground border-border/50"
                         )}>
                            {milestone.status}
                         </Badge>
                       </div>

                       {milestone.deliverables && (
                         <div className="bg-background/40 backdrop-blur-md p-4 rounded-2xl border border-border/40 space-y-2">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5">
                               <FileText className="w-3 h-3 text-primary opacity-70" />
                               Submission Deliverable
                            </p>
                            <p className="text-[11px] text-foreground/70 leading-relaxed font-medium italic">
                               "{milestone.deliverables}"
                            </p>
                         </div>
                       )}

                       {milestone.attachments?.length > 0 && (
                         <div className="space-y-3">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5 px-1">
                               <Paperclip className="w-3 h-3 text-primary opacity-70" />
                               Artifact Evidence
                            </p>
                            <div className="flex flex-wrap gap-2 px-1">
                               {milestone.attachments.map((url: string, aidx: number) => (
                                 <a 
                                   key={aidx} 
                                   href={url} 
                                   target="_blank" 
                                   rel="noreferrer"
                                   className="text-[9px] font-black bg-primary/5 hover:bg-primary/10 text-primary px-3 py-1.5 rounded-xl border border-primary/20 transition-all flex items-center gap-2 active:scale-95 hover:shadow-sm"
                                 >
                                    <Globe className="w-3 h-3 shrink-0" />
                                    Artifact #{aidx + 1}
                                 </a>
                               ))}
                            </div>
                         </div>
                       )}

                       <div className="flex items-center justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40 px-1 pt-2">
                          <span className="flex items-center gap-1"><DollarSign className="w-2.5 h-2.5" />{milestone.amount?.toLocaleString()}</span>
                          {milestone.submittedAt && <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{new Date(milestone.submittedAt).toLocaleDateString()}</span>}
                       </div>
                    </div>
                  </div>
                ))}

                {(!selectedProject?.contract?.milestones || selectedProject.contract.milestones.length === 0) && (
                  <div className="p-12 text-center space-y-4 bg-muted/5 rounded-[2.5rem] border border-dashed border-border/40">
                     <div className="w-12 h-12 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-2 opacity-50">
                        <Clock className="w-6 h-6 text-muted-foreground" />
                     </div>
                     <p className="text-muted-foreground font-black uppercase tracking-widest text-[9px] opacity-60">No encrypted milestones found in protocol logs.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function MetricCard({ label, value, icon: Icon, accent }: any) {
  return (
    <Card className="rounded-3xl border-border/50 shadow-sm p-4 overflow-hidden group hover:bg-muted/20 transition-all">
      <div
        className={cn(
          "w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
          accent,
        )}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-black tracking-tight">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </Card>
  );
}

function VerificationRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-bold text-muted-foreground uppercase">
        {label}
      </span>
      <div
        className={cn(
          "flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg border",
          ok
            ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/10"
            : "bg-rose-500/5 text-rose-600 border-rose-500/10",
        )}
      >
        {ok ? (
          <ShieldCheck className="w-3.5 h-3.5" />
        ) : (
          <ShieldAlert className="w-3.5 h-3.5" />
        )}
        {ok ? "AUTHENTICATED" : "PENDING"}
      </div>
    </div>
  );
}
