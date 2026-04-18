import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Star,
  ExternalLink,
  CheckCircle2,
  GraduationCap,
  Award,
  Zap,
  MessageSquare,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  UserPlus,
  Briefcase,
  Calendar,
  TrendingUp,
  BarChart3,
  Sparkles,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { InviteFreelancerModal } from "@/components/modals/InviteFreelancerModal";
import { getFreelancerLevel } from "@/lib/levelUtils";
import { LevelBadge } from "@/components/common/LevelBadge";
import { LevelInfoPopover } from "@/components/common/LevelInfoPopover";

/* ─── Proficiency bar ─────────────────────────────────────────── */
const ProficiencyBar = ({ level = 3 }) => (
  <div className="flex gap-[3px] items-center">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className={cn(
          "h-[5px] w-5 rounded-full transition-all",
          i <= level ? "bg-emerald-500" : "bg-slate-200",
        )}
      />
    ))}
  </div>
);

/* ─── Stat pill ───────────────────────────────────────────────── */
const StatPill = ({ icon: Icon, label, value, accent }) => (
  <div className="flex flex-col gap-1 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div
      className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center mb-1",
        accent,
      )}
    >
      <Icon className="w-4 h-4 text-white" />
    </div>
    <span className="text-2xl font-black text-slate-900 tracking-tight">
      {value}
    </span>
    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
      {label}
    </span>
  </div>
);

/* ─── Section label ───────────────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
      {children}
    </span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

/* ─── Availability dot ────────────────────────────────────────── */
const AvailabilityDot = ({ status }) => {
  const map = {
    AVAILABLE: { color: "bg-emerald-400", label: "Available Now" },
    BUSY: { color: "bg-amber-400", label: "Busy" },
    UNAVAILABLE: { color: "bg-rose-400", label: "Unavailable" },
  };
  const { color, label } = map[status] || map.UNAVAILABLE;
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
      <span className={cn("w-2 h-2 rounded-full animate-pulse", color)} />
      {label}
    </span>
  );
};

const FreelancerProfileDetail = () => {
  const { id } = useParams();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMessage = async () => {
    if (isMessaging) return;
    setIsMessaging(true);
    try {
      const res = await api.post(`/freelancers/${id}/message`);
      const chatRoomId = res.data.data.id;
      toast.success("Chat initiated successfully");
      window.location.href = `/client/messages?room=${chatRoomId}`;
    } catch {
      toast.error("Could not start chat");
      setIsMessaging(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          <p
            className="text-slate-400 font-bold uppercase tracking-widest text-[11px]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Loading Profile…
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

  const initials = freelancer.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
  const memberSince = freelancer.user?.createdAt
    ? new Date(freelancer.user.createdAt).getFullYear()
    : "—";
  // ── Presence & activity logic ──────────────────────────
  const lastActiveDate = freelancer.user?.lastActiveAt ? new Date(freelancer.user.lastActiveAt) : null;
  const isOnline = lastActiveDate && (Date.now() - lastActiveDate.getTime() < 5 * 60 * 1000);

  const lastActive = lastActiveDate
    ? (() => {
        const diff = Date.now() - lastActiveDate.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 3) return "Now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
      })()
    : "Recently";

  const isTopRated = (freelancer.averageRating || 0) >= 4.5;
  const tabs = ["overview", "gigs", "reviews", "credentials"];

  const languages = Array.isArray(freelancer.languages)
    ? freelancer.languages.map((l: any) => {
        if (typeof l === "string") return { lang: l, level: null };
        if (typeof l === "object" && l !== null) {
          return {
            lang: l.lang || l.name || l.label || "Unknown",
            level: l.level || null,
          };
        }
        return { lang: String(l), level: null };
      })
    : [];

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        .fp-root { font-family: 'Sora', sans-serif; }
        .fp-mono { font-family: 'DM Mono', monospace; }
        .fp-hero-bg { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 45%, #f8fafc 100%); }
        .fp-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.04); }
        .fp-tab { font-family: 'Sora', sans-serif; position: relative; font-weight: 700; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; padding: 9px 18px; border-radius: 12px; transition: all 0.15s ease; cursor: pointer; color: #94a3b8; border: none; background: transparent; white-space: nowrap; }
        .fp-tab.active { background: #fff; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06); }
        .fp-tab:hover:not(.active) { color: #64748b; }
        .fp-portfolio-card { border-radius: 16px; overflow: hidden; border: 1px solid #f1f5f9; background: #fff; transition: all 0.2s ease; }
        .fp-portfolio-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.09); border-color: #e2e8f0; }
        .fp-skill-chip { transition: all 0.15s ease; }
        .fp-skill-chip:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); background: #f8fafc; }
        .fp-review-card { border-left: 3px solid #f1f5f9; padding-left: 16px; transition: border-color 0.2s; }
        .fp-review-card:hover { border-left-color: #10b981; }
        .fp-sticky { position: fixed; bottom: 0; left: 0; right: 0; z-index: 50; transform: translateY(100%); transition: transform 0.3s ease; }
        .fp-sticky.show { transform: translateY(0); }
        .fp-dot-grid { background-image: radial-gradient(circle, #94a3b8 1px, transparent 1px); background-size: 24px 24px; }
      `}</style>

      <div className="fp-root max-w-6xl mx-auto py-6 px-4 pb-28 md:pb-10">
        <div className="mb-6">
          <Link
            to="/client/browse"
            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Browse
          </Link>
        </div>

        <div className="fp-card mb-6 overflow-hidden" ref={headerRef}>
          <div className="fp-hero-bg h-28 relative overflow-hidden">
            <div className="fp-dot-grid absolute inset-0 opacity-25" />
            <div className="absolute top-4 right-5">
              <span className="fp-mono text-[10px] font-medium bg-white/70 backdrop-blur border border-white/50 text-slate-600 px-3 py-1 rounded-full">
                {freelancer.experienceLevel?.replace(/_/g, " ")} LEVEL
              </span>
            </div>
          </div>

          <div className="px-6 md:px-8 pb-7 -mt-14 relative z-10">
            <div className="flex flex-col md:flex-row gap-5 md:items-end justify-between min-h-[110px]">
              <div className="flex flex-col md:flex-row gap-5 md:items-end">
                <div className="relative shrink-0">
                  <Avatar className="h-28 w-28 ring-4 ring-white shadow-lg border border-slate-100">
                    <AvatarImage
                      src={freelancer.user?.profileImage}
                      alt={freelancer.fullName}
                    />
                    <AvatarFallback className="text-2xl font-black bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {isOnline && (
                    <span className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse z-10" />
                  )}
                </div>

                <div className="pb-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl md:text-[28px] font-black text-slate-900 tracking-tight leading-none">
                      {freelancer.fullName}
                    </h1>
                    {freelancer.user?.isIdVerified && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </div>
                    )}
                    {isTopRated && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3" /> Top Rated
                      </div>
                    )}
                    <LevelBadge
                      level={getFreelancerLevel({
                        totalEarnings: freelancer.totalEarnings ?? 0,
                        clientsCount: freelancer.totalReviews ?? 0,
                        projectsCount:
                          freelancer.completedContracts ??
                          freelancer.totalReviews ??
                          0,
                        averageRating: freelancer.averageRating ?? 0,
                      })}
                      size="xs"
                    />
                  </div>
                  <p className="text-base font-semibold text-slate-500 leading-snug max-w-lg break-words">
                    {freelancer.tagline}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            "w-4 h-4",
                            s <= Math.round(freelancer.averageRating || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-100 text-slate-200",
                          )}
                        />
                      ))}
                      <span className="fp-mono text-sm font-medium text-slate-800 ml-1">
                        {(freelancer.averageRating || 5).toFixed(1)}
                      </span>
                      <span className="text-slate-400 text-xs font-medium ml-0.5">
                        ({freelancer.totalReviews || 0} reviews)
                      </span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <AvailabilityDot status={freelancer.availability} />
                    {isOnline && (
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full ml-1">Online</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-400 pt-0.5">
                    {freelancer.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {freelancer.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Since {memberSince}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Zap className={cn("w-3.5 h-3.5", isOnline ? "text-emerald-500" : "text-slate-300")} />
                      <span className={isOnline ? "text-emerald-600 font-bold" : ""}>
                        Active {lastActive}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 md:pb-1 shrink-0">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="h-10 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 text-xs px-4"
                    onClick={handleMessage}
                    disabled={isMessaging}
                  >
                    {isMessaging ? (
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    ) : (
                      <MessageSquare className="w-4 h-4 mr-1.5" />
                    )}
                    {isMessaging ? "Connecting…" : "Message"}
                  </Button>
                  <Button
                    className="h-10 rounded-xl font-bold px-5 text-xs bg-slate-900 hover:bg-slate-800 shadow-sm"
                    onClick={() => setIsInviteModalOpen(true)}
                  >
                    <UserPlus className="w-4 h-4 mr-1.5" /> Invite to Project
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatPill
            icon={Star}
            label="Avg Rating"
            value={(freelancer.averageRating || 5).toFixed(1)}
            accent="bg-amber-400"
          />
          <StatPill
            icon={Briefcase}
            label="Projects"
            value={freelancer.totalReviews || 0}
            accent="bg-emerald-500"
          />
          <StatPill
            icon={TrendingUp}
            label="Hourly Rate"
            value={freelancer.hourlyRate ? `$${freelancer.hourlyRate}` : "—"}
            accent="bg-sky-500"
          />
          <StatPill
            icon={BarChart3}
            label="Profile Score"
            value={`${freelancer.profileCompletion || 0}%`}
            accent="bg-violet-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={cn("fp-tab", activeTab === tab && "active")}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "overview" && (
              <>
                <div className="fp-card p-6 overflow-hidden">
                  <SectionLabel>About</SectionLabel>
                  <p className="text-slate-600 leading-relaxed font-medium text-sm break-words whitespace-pre-wrap">
                    {freelancer.bio || "No bio provided yet."}
                  </p>
                </div>

                {freelancer.skills?.length > 0 && (
                  <div className="fp-card p-6">
                    <SectionLabel>Skills & Expertise</SectionLabel>
                    <div className="space-y-3.5">
                      {freelancer.skills.map((s) => (
                        <div key={s.id} className="flex items-center gap-4">
                          <span className="text-sm font-semibold text-slate-700 w-32 shrink-0">
                            {s.skill.name}
                          </span>
                          <div className="flex items-center gap-3 flex-1">
                            <ProficiencyBar level={s.proficiencyLevel || 3} />
                            <span className="fp-mono text-[10px] text-slate-400 font-medium whitespace-nowrap">
                              {
                                [
                                  "",
                                  "Beginner",
                                  "Basic",
                                  "Intermediate",
                                  "Advanced",
                                  "Expert",
                                ][s.proficiencyLevel || 3]
                              }
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {languages.length > 0 && (
                  <div className="fp-card p-6">
                    <SectionLabel>Languages</SectionLabel>
                    <div className="flex flex-wrap gap-2">
                      {languages.map((l, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2"
                        >
                          <span className="text-sm font-semibold text-slate-700">
                            {l.lang}
                          </span>
                          {l.level && (
                            <span className="fp-mono text-[10px] text-slate-400">
                              {l.level}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {freelancer.portfolioItems?.length > 0 && (
                  <div className="fp-card p-6">
                    <SectionLabel>Portfolio Showcase</SectionLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {freelancer.portfolioItems.slice(0, 2).map((item) => (
                        <div key={item.id} className="fp-portfolio-card">
                          <div className="aspect-video bg-slate-100 relative overflow-hidden">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Code2 className="w-10 h-10 text-slate-200" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="font-bold text-slate-900 text-sm leading-snug">
                              {item.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "gigs" && (
              <div className="fp-card p-6">
                <SectionLabel>
                  PACKAGED SERVICES (GIGS) ({freelancer.gigs?.length || 0})
                </SectionLabel>
                {freelancer.gigs?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {freelancer.gigs.map((gig) => (
                      <Link
                        key={gig.id}
                        to={`/client/gigs/${gig.id}`}
                        target="_blank"
                        className="group relative aspect-square rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                      >
                        <div className="absolute inset-0">
                          {gig.fileUrl ? (
                            <img
                              src={gig.fileUrl}
                              alt={gig.title}
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                              <Zap className="w-16 h-16 text-white/10" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                        </div>
                        <div className="absolute top-6 right-6 scale-90 origin-right transition-transform group-hover:scale-100">
                          <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-tighter">
                            PREMIUM SERVICE
                          </div>
                        </div>
                        <div className="absolute inset-0 p-8 flex flex-col justify-end text-left font-bold">
                          <h4 className="text-2xl font-black text-white tracking-tighter uppercase leading-none mb-2 transform transition-transform group-hover:-translate-y-1">
                            {gig.title}
                          </h4>
                          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                            <span className="flex items-center gap-2 text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">
                              <Sparkles className="w-3 h-3 text-emerald-400" />{" "}
                              Exclusive Offer
                            </span>
                            <Button className="h-9 px-5 bg-white text-slate-900 hover:bg-emerald-400 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <Zap className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                      No services listed yet
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="fp-card p-6">
                <div className="flex items-center gap-6 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-center shrink-0">
                    <div className="text-4xl font-black text-slate-900 tracking-tight fp-mono">
                      {(freelancer.averageRating || 5).toFixed(1)}
                    </div>
                    <div className="flex items-center gap-0.5 justify-center mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            "w-3.5 h-3.5",
                            s <= Math.round(freelancer.averageRating || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-200 text-slate-200",
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      {freelancer.totalReviews || 0} reviews
                    </p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count =
                        freelancer.reviews?.filter(
                          (r) => Math.round(r.rating) === star,
                        ).length || 0;
                      const pct = freelancer.totalReviews
                        ? (count / freelancer.totalReviews) * 100
                        : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="fp-mono text-[10px] text-slate-400 w-4 text-right">
                            {star}
                          </span>
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="fp-mono text-[10px] text-slate-400 w-4">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <SectionLabel>Client Feedback</SectionLabel>
                {freelancer.reviews?.length > 0 ? (
                  <div className="space-y-6">
                    {freelancer.reviews.map((review) => (
                      <div key={review.id} className="fp-review-card">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={review.giver?.profileImage} />
                              <AvatarFallback className="text-[10px] font-black bg-slate-100 text-slate-500">
                                {review.giver?.name?.charAt(0) || "C"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                {review.giver?.name || "Anonymous"}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {new Date(
                                  review.revealedAt || review.submittedAt,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={cn(
                                  "w-3.5 h-3.5",
                                  s <= review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-slate-100 text-slate-200",
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                          "{review.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    No public feedback yet
                  </div>
                )}
              </div>
            )}

            {activeTab === "credentials" && (
              <div className="space-y-5">
                <div className="fp-card p-6">
                  <SectionLabel>Education</SectionLabel>
                  {freelancer.educations?.length > 0 ? (
                    <div className="space-y-4">
                      {freelancer.educations.map((edu) => (
                        <div key={edu.id} className="flex gap-4">
                          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-4 h-4 text-sky-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {edu.degree}
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                              {edu.school}
                            </p>
                            {edu.year && (
                              <p className="fp-mono text-[10px] text-slate-300 mt-0.5">
                                {edu.year}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs italic">
                      No education history.
                    </p>
                  )}
                </div>

                <div className="fp-card p-6">
                  <SectionLabel>Certifications</SectionLabel>
                  {freelancer.certificates?.length > 0 ? (
                    <div className="space-y-4">
                      {freelancer.certificates.map((cert) => (
                        <div key={cert.id} className="flex gap-4">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                            <Award className="w-4 h-4 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-bold text-slate-900 truncate">
                                  {cert.title}
                                </p>
                                <p className="text-xs text-slate-500 font-medium truncate">
                                  {cert.issuingOrganization}
                                </p>
                              </div>
                              {cert.credentialUrl && (
                                <a
                                  href={cert.credentialUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="shrink-0 text-slate-300 hover:text-sky-500 transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs italic">
                      No certifications listed.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="fp-card p-6">
              <div className="text-center mb-5 pb-5 border-b border-slate-100">
                <div className="fp-mono text-3xl font-black text-slate-900">
                  {freelancer.hourlyRate ? `$${freelancer.hourlyRate}` : "TBD"}
                  <span className="text-sm font-medium text-slate-400">
                    /hr
                  </span>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                  Hourly Rate
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  className="w-full h-11 rounded-xl font-bold bg-slate-900 hover:bg-slate-800"
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  Invite to Project
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl font-bold border-slate-200"
                  onClick={handleMessage}
                  disabled={isMessaging}
                >
                  Message
                </Button>
              </div>
            </div>

            <div className="fp-card p-5">
              <SectionLabel>Verifications</SectionLabel>
              <div className="space-y-3">
                {[
                  {
                    label: "Email Verified",
                    ok: freelancer.user?.isEmailVerified,
                  },
                  { label: "ID Verified", ok: freelancer.user?.isIdVerified },
                  {
                    label: "Payment Verified",
                    ok: freelancer.user?.isPaymentVerified,
                  },
                ].map(({ label, ok }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs font-semibold text-slate-600">
                      {label}
                    </span>
                    <div
                      className={cn(
                        "flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5",
                        ok
                          ? "text-emerald-600 bg-emerald-50 border-emerald-100 border"
                          : "text-slate-400 bg-slate-50 border-slate-100 border",
                      )}
                    >
                      <CheckCircle2 className="w-3 h-3" />{" "}
                      {ok ? "Verified" : "Pending"}
                    </div>
                  </div>
                ))}
              </div>
           
            */}
            </div>
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
