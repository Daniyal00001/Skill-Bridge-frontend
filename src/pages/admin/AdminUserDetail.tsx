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
  TrendingUp,
  Gavel,
  History,
  User,
  Building2,
  Award,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminService } from "@/services/admin.service";
import { toast } from "sonner";

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
                <Button className="rounded-2xl font-black uppercase text-[10px] tracking-widest px-6 shadow-lg shadow-primary/20">
                  Broadcast Notice
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Main Content Area (Tabbed) ───────────────────────────── */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-muted/50 p-1 rounded-2xl border border-border/40 w-full justify-start h-14">
                <TabsTrigger value="overview" className="rounded-xl px-6 h-full font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="activity" className="rounded-xl px-6 h-full font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Activity
                </TabsTrigger>
                <TabsTrigger value="feedback" className="rounded-xl px-6 h-full font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Feedback
                </TabsTrigger>
                <TabsTrigger value="disputes" className="rounded-xl px-6 h-full font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Disputes
                </TabsTrigger>
              </TabsList>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
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
                        value={profile?.hireRate ? `${Math.round(profile.hireRate * 100)}%` : "0%"}
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
              <TabsContent value="activity" className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <Card className="rounded-[2.5rem] border-border/50 shadow-sm overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b border-border/40">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                      <History className="w-4 h-4" />
                      {isFreelancer ? "Recent Contract History" : "Recent Project Activity"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isFreelancer ? (
                      <div className="p-12 text-center text-muted-foreground italic text-sm">
                        No contract history found in active scrolls.
                      </div>
                    ) : (
                      <div className="divide-y divide-border/40">
                        {profile?.projects?.map((prj: any) => (
                          <div key={prj.id} className="p-6 hover:bg-muted/20 transition-colors flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-bold text-sm">{prj.title}</p>
                              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                Budget: ${prj.budget.toLocaleString()}
                              </p>
                            </div>
                            <Badge variant="secondary" className="rounded-lg text-[9px] font-black">{prj.status}</Badge>
                          </div>
                        ))}
                        {profile?.projects?.length === 0 && (
                          <div className="p-12 text-center text-muted-foreground italic text-sm">
                            No projects launched under this identity.
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* FEEDBACK TAB */}
              <TabsContent value="feedback" className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
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
                                <AvatarFallback className="text-[10px] font-black">{review.giver?.name?.[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-black">{review.giver?.name}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Verified Reviewer</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                              <span className="text-xs font-black text-amber-700">{review.rating.toFixed(1)}</span>
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            </div>
                          </div>
                          <p className="text-sm text-foreground/80 font-medium italic leading-relaxed pl-1">
                            "{review.comment || "The reviewer left no written comments, but provided a high-quality rating for the interaction."}"
                          </p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest pl-1">
                            {new Date(review.submittedAt).toLocaleDateString()} · Contract Protocol
                          </p>
                        </div>
                      ))}
                      {(!user.reviews || user.reviews.length === 0) && (
                        <div className="p-16 text-center space-y-4 bg-muted/5">
                          <div className="w-16 h-16 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto border border-border/40">
                            <Zap className="w-8 h-8 text-muted-foreground/40" />
                          </div>
                          <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No Feedback Transmissions Found</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* DISPUTES TAB */}
              <TabsContent value="disputes" className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
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
