import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  Clock,
  Star,
  ExternalLink,
  CheckCircle2,
  GraduationCap,
  Award,
  Zap,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  Mail,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { InviteFreelancerModal } from "@/components/modals/InviteFreelancerModal";

const FreelancerProfileDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [freelancer, setFreelancer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/freelancers/${id}`);
        setFreelancer(res.data.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        toast.error("Profile not found");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const handleMessage = async () => {
    try {
      await api.post(`/freelancers/${id}/message`);
      toast.success("Chat initiated successfully");
    } catch (err) {
      toast.error("Could not start chat");
    }
  };

  const handleInvite = () => {
    setIsInviteModalOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
            Loading Profile...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!freelancer) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold">Freelancer Not Found</h2>
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/client/browse">Return to Talent Feed</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Simple Navigation */}
        <div className="mb-8">
          <Button
            variant="ghost"
            asChild
            className="text-slate-500 hover:text-slate-900 -ml-4"
          >
            <Link
              to="/client/browse"
              className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Browsing
            </Link>
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-8 border-slate-200 shadow-sm overflow-hidden">
          <div className="h-24 bg-slate-50 border-b border-slate-100" />
          <CardContent className="px-8 pb-8 -mt-12">
            <div className="flex flex-col md:flex-row items-end md:items-start justify-between gap-6">
              <div className="flex flex-col md:flex-row gap-6 md:items-end">
                <Avatar className="h-32 w-32 ring-4 ring-white shadow-md border border-slate-200">
                  <AvatarImage
                    src={freelancer.user?.profileImage}
                    alt={freelancer.fullName}
                  />
                  <AvatarFallback className="text-3xl font-bold bg-slate-50 text-slate-400">
                    {freelancer.fullName
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1 pb-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-slate-900">
                      {freelancer.fullName}
                    </h1>
                    <CheckCircle2 className="w-5 h-5 text-primary fill-primary/10" />
                  </div>
                  <p className="text-lg font-medium text-slate-600">
                    {freelancer.tagline}
                  </p>
                  <div className="flex items-center gap-4 text-sm font-medium text-slate-500 pt-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {freelancer.location}
                    </div>
                    <span>•</span>
                    <Badge
                      variant="outline"
                      className="text-primary border-primary/20 bg-primary/5 uppercase text-[10px] tracking-widest font-bold"
                    >
                      {freelancer.experienceLevel}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 md:pb-2">
                <Button
                  variant="outline"
                  className="h-11 rounded-lg font-bold border-slate-200 hover:bg-slate-50"
                  onClick={handleMessage}
                >
                  <MessageSquare className="w-4 h-4 mr-2" /> Message
                </Button>
                <Button
                  className="h-11 rounded-lg px-8 font-bold shadow-sm"
                  onClick={handleInvite}
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Invite to Project
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Professional Summary
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                {freelancer.bio}
              </p>
            </section>

            <Separator className="bg-slate-100" />

            {/* Skills */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Expertise & Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {freelancer.skills?.map((s: any) => (
                  <Badge
                    key={s.id}
                    variant="secondary"
                    className="bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200 border px-3 py-1 text-xs font-semibold"
                  >
                    {s.skill.name}
                  </Badge>
                ))}
              </div>
            </section>

            <Separator className="bg-slate-100" />

            {/* Portfolio */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Portfolio Highlights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {freelancer.portfolioItems?.length > 0 ? (
                  freelancer.portfolioItems.map((item: any) => (
                    <Card
                      key={item.id}
                      className="border-slate-200 overflow-hidden hover:border-primary/30 transition-colors"
                    >
                      <div className="aspect-video bg-slate-50 flex items-center justify-center">
                        <Zap className="w-8 h-8 text-slate-200" />
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-bold text-slate-900 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-100 flex items-center justify-center">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                      No portfolio items added yet
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Quick Stats */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase text-slate-400">
                    Hourly Rate
                  </span>
                  <span className="text-2xl font-bold text-slate-900">
                    {freelancer.hourlyRate
                      ? `$${freelancer.hourlyRate}`
                      : "Rate TBD"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="text-xl font-bold text-slate-900">100%</p>
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Success Rate
                    </p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <p className="text-xl font-bold text-slate-900">0</p>
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Completed Jobs
                    </p>
                  </div>
                </div>

                <Separator className="bg-slate-100" />

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    ID Verified Professional
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Credentials */}
            <div className="space-y-4 px-2">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Certifications
              </h3>
              <div className="space-y-4">
                {freelancer.certificates?.map((cert: any) => (
                  <div key={cert.id} className="flex gap-3">
                    <Award className="w-5 h-5 text-primary shrink-0 opacity-40" />
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs text-slate-900">
                        {cert.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {cert.issuer}
                      </p>
                    </div>
                  </div>
                ))}
                {(!freelancer.certificates ||
                  freelancer.certificates.length === 0) && (
                  <p className="text-xs text-slate-400 italic">
                    No certificates listed.
                  </p>
                )}
              </div>
            </div>

            <Button
              className="w-full h-12 shadow-md rounded-xl font-bold"
              onClick={handleInvite}
            >
              Secure This Talent
            </Button>
          </aside>
        </div>
      </div>

      <InviteFreelancerModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        freelancerId={id || ""}
        freelancerName={freelancer.fullName}
      />
    </DashboardLayout>
  );
};

export default FreelancerProfileDetail;
