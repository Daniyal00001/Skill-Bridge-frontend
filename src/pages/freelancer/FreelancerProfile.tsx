import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Pencil,
  MapPin,
  Calendar,
  Clock,
  Star,
  ExternalLink,
  Plus,
  CheckCircle2,
  ChevronRight,
  Languages,
  GraduationCap,
  Award,
  Zap,
  Eye,
  Briefcase,
  TrendingUp,
  MessageSquare,
  Globe,
  Verified,
  ShieldCheck,
  Mail,
  FileText,
  DollarSign,
} from "lucide-react";
import { getFreelancerLevel } from "@/lib/levelUtils";
import { LevelBadge } from "@/components/common/LevelBadge";
import { LevelInfoPopover } from "@/components/common/LevelInfoPopover";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { freelancerService } from "@/lib/freelancer.service";
import { FreelancerOnboardingModal } from "./Onboarding/FreelancerOnboardingModal";
import { useEffect } from "react";

// Statistics calculation helpers moved to backend

export default function FreelancerProfile() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const fetchProfile = async (shouldAutoOpen = false) => {
    try {
      const res = await freelancerService.getMyProfile();
      setProfile(res.data);
      if (shouldAutoOpen && res.data.profileCompletion < 100) {
        setIsModalOpen(true);
      }
    } catch (e) {
      console.error("Failed to fetch profile", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(true);
  }, []);

  const displayProfile = profile;
  const completion = displayProfile?.profileCompletion ?? 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!displayProfile) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <p className="text-muted-foreground font-medium">
            Profile not found.
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            Complete Onboarding
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* HEADER SECTION - NO CARD ENCLOSURE FOR A LIGHTER FEEL */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b pb-6 border-border/50">
            <div className="relative group">
              {/* Circular Progress SVG */}
              <svg className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="46%"
                  fill="none"
                  stroke="currentColor"
                  className="text-muted/30"
                  strokeWidth="6"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="46%"
                  fill="none"
                  stroke="currentColor"
                  className="text-primary transition-all duration-1000 ease-out"
                  strokeWidth="6"
                  pathLength="100"
                  strokeDasharray="100"
                  strokeDashoffset={100 - completion}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-background border px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm z-10">
                {completion}% Profile
              </div>

              <Avatar className="h-40 w-40 ring-4 ring-primary/10 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                <AvatarImage
                  src={
                    displayProfile?.user?.profileImage ||
                    "https://github.com/shadcn.png"
                  }
                />
                <AvatarFallback className="text-4xl font-black">
                  {displayProfile.fullName
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2) || "AC"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-background rounded-xl flex items-center justify-center shadow-lg border border-border">
                {displayProfile?.user?.isIdVerified ? (
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-muted-foreground opacity-50" />
                )}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                    {displayProfile.fullName ||
                      displayProfile.user?.name ||
                      "Unnamed Freelancer"}
                  </h1>
                  <LevelInfoPopover
                    stats={{
                      type: "freelancer",
                      totalEarnings: displayProfile.totalEarningsNum ?? displayProfile.totalEarnings ?? 0,
                      clientsCount: displayProfile.reviewsTotal ?? displayProfile.totalReviews ?? 0,
                      projectsCount: displayProfile.projectsCompleted ?? displayProfile.completedContracts ?? 0,
                      averageRating: displayProfile.reviewsAvg ?? displayProfile.averageRating ?? 0,
                    }}
                    badgeSize="sm"
                  />
                </div>
                <p className="text-xl font-medium text-muted-foreground italic">
                  {displayProfile.tagline ||
                    (displayProfile.experienceLevel
                      ? `${displayProfile.experienceLevel} Professional`
                      : "No tagline set")}
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  {displayProfile.location || "Location not set"}{" "}
                  {displayProfile.region && `· ${displayProfile.region}`}
                </div>
                {displayProfile?.user?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    {displayProfile.user.email} ·{" "}
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                      Email Verified{" "}
                    </span>
                  </div>
                )}
                {displayProfile?.user?.isPaymentVerified && (
                  <div className="flex items-center gap-2">
                    <Verified className="w-4 h-4 text-emerald-500" />
                    Payment Verified
                  </div>
                )}
                {displayProfile?.user?.isIdVerified && (
                  <div className="flex items-center gap-2 border border-blue-500/20 bg-blue-500/10 text-blue-600 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold tracking-tight">
                      Identity Verified
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {displayProfile.reviewsAvg || "5.0"} (
                  {displayProfile.reviewsTotal || 0} reviews)
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                {/* <Button className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all">
                  Contact for Project
                </Button> */}
                <Button
                  variant="outline"
                  className="rounded-xl h-12 px-6 font-bold hover:bg-accent active:scale-95 transition-all"
                  onClick={() => setIsModalOpen(true)}
                >
                  <div className="flex items-center gap-2">
                    <Pencil className="w-4 h-4" /> Edit Profile
                  </div>
                </Button>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-end gap-3">
              <div className="text-right">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                  Hourly Rate
                </p>
                <p className="text-4xl font-black text-foreground">
                  ${displayProfile.hourlyRate || "0"}{" "}
                  <span className="text-base text-muted-foreground font-medium">
                    / hr
                  </span>
                </p>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border transition-all",
                  displayProfile.availability === "AVAILABLE"
                    ? "text-green-500 bg-green-500/5 border-green-500/10"
                    : "text-amber-500 bg-amber-500/5 border-amber-500/10",
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    displayProfile.availability === "AVAILABLE"
                      ? "bg-green-500"
                      : "bg-amber-500",
                  )}
                />
                {displayProfile.availability === "AVAILABLE"
                  ? "Available Now"
                  : "Limited Availability"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* MAIN CONTENT AREA */}
            <div className="lg:col-span-8 space-y-6">
              {/* DESCRIPTION SECTION */}
              <section className="space-y-4 max-w-full overflow-hidden">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">
                  Overview
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed font-medium break-words whitespace-pre-wrap max-w-full">
                  {displayProfile.bio || "No overview provided."}
                </p>
              </section>

              {/* STATS ROW */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Job Success",
                    value: displayProfile.jobSuccess || "100%",
                    icon: ShieldCheck,
                    color: "text-blue-500",
                  },
                  {
                    label: "Completed",
                    value: displayProfile.projectsCompleted || 0,
                    icon: CheckCircle2,
                    color: "text-emerald-500",
                  },
                  {
                    label: "Total Earnings",
                    value: displayProfile.totalEarnings || "$0",
                    icon: DollarSign,
                    color: "text-amber-500",
                  },
                  // {
                  //   label: "Level",
                  //   value: displayProfile.experienceLevel || "Expert",
                  //   icon: TrendingUp,
                  //   color: "text-purple-500",
                  // },
                  {
                    label: "Platform Level",
                    value: null,
                    icon: Award,
                    color: "text-primary",
                    _level: getFreelancerLevel({
                      totalEarnings:
                        displayProfile.totalEarningsNum ??
                        displayProfile.totalEarnings,
                      clientsCount:
                        displayProfile.reviewsTotal ??
                        displayProfile.totalReviews ??
                        0,
                      projectsCount:
                        displayProfile.projectsCompleted ??
                        displayProfile.completedContracts ??
                        0,
                      averageRating:
                        displayProfile.reviewsAvg ??
                        displayProfile.averageRating ??
                        0,
                    }),
                  },
                ].map((stat: any) => (
                  <div
                    key={stat.label}
                    className="p-3 rounded-2xl bg-card border border-border/40 space-y-1.5 hover:bg-primary/5 transition-colors"
                  >
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                    <div>
                      {stat._level ? (
                        <LevelInfoPopover
                          stats={{
                            type: "freelancer",
                            totalEarnings: displayProfile.totalEarningsNum ?? displayProfile.totalEarnings ?? 0,
                            clientsCount: displayProfile.reviewsTotal ?? displayProfile.totalReviews ?? 0,
                            projectsCount: displayProfile.projectsCompleted ?? displayProfile.completedContracts ?? 0,
                            averageRating: displayProfile.reviewsAvg ?? displayProfile.averageRating ?? 0,
                          }}
                          badgeSize="sm"
                        />
                      ) : (
                        <p className="text-2xl font-black">{stat.value}</p>
                      )}
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* PORTFOLIO SECTION */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">
                    Portfolio & External Links
                  </h3>
                </div>

                <div className="flex flex-wrap gap-4">
                  {displayProfile.portfolio && (
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-2xl h-14 px-6 font-bold hover:bg-primary/5 hover:border-primary/40 transition-all group"
                    >
                      <a
                        href={displayProfile.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3"
                      >
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Globe className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">
                            Main Portfolio
                          </p>
                          <p className="text-sm truncate max-w-[150px]">
                            {displayProfile.portfolio.replace(
                              /^https?:\/\//,
                              "",
                            )}
                          </p>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted-foreground ml-2" />
                      </a>
                    </Button>
                  )}
                  {displayProfile.website && (
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-2xl h-14 px-6 font-bold hover:bg-primary/5 hover:border-primary/40 transition-all group"
                    >
                      <a
                        href={displayProfile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3"
                      >
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Globe className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">
                            Website
                          </p>
                          <p className="text-sm truncate max-w-[150px]">
                            {displayProfile.website.replace(/^https?:\/\//, "")}
                          </p>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted-foreground ml-2" />
                      </a>
                    </Button>
                  )}
                  {displayProfile.github && (
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-2xl h-14 px-6 font-bold hover:bg-primary/5 hover:border-primary/40 transition-all group"
                    >
                      <a
                        href={displayProfile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3"
                      >
                        <div className="h-8 w-8 rounded-lg bg-slate-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Globe className="w-4 h-4 text-slate-700" />
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">
                            GitHub
                          </p>
                          <p className="text-sm truncate max-w-[150px]">
                            View Profile
                          </p>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted-foreground ml-2" />
                      </a>
                    </Button>
                  )}
                </div>

                <div className="pt-4 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                    Packaged Services (Gigs)
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(displayProfile.gigs || []).map((gig: any) => {
                      const isPdf = gig.fileUrl?.toLowerCase().endsWith(".pdf");
                      const isImage = gig.fileUrl
                        ?.toLowerCase()
                        .match(/\.(jpg|jpeg|png|gif|webp)$/i);

                      return (
                        <a
                          key={gig.id}
                          href={gig.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-square rounded-2xl overflow-hidden border border-border/50 bg-accent/10 hover:border-primary/30 transition-all flex flex-col hover:shadow-lg"
                        >
                          {isImage ? (
                            <div className="w-full h-full shimmer">
                              <img
                                src={gig.fileUrl}
                                alt={gig.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onLoad={(e) => (e.currentTarget.parentElement?.classList.remove("shimmer"))}
                              />
                            </div>
                          ) : (
                            <div className="flex-1 flex items-center justify-center bg-primary/5">
                              {isPdf ? (
                                <div className="flex flex-col items-center gap-2">
                                  <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-red-500" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase text-red-500/60">
                                    PDF
                                  </span>
                                </div>
                              ) : (
                                <Briefcase className="h-8 w-8 text-primary/40" />
                              )}
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/80 to-transparent p-3 translate-y-2 group-hover:translate-y-0 transition-transform">
                            <p className="text-[10px] font-black uppercase tracking-tight text-foreground truncate">
                              {gig.title}
                            </p>
                            <div className="flex items-center justify-between mt-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-[8px] font-bold text-primary uppercase tracking-widest">
                                View Gig
                              </p>
                              <ExternalLink className="w-3 h-3 text-muted-foreground" />
                            </div>
                          </div>
                        </a>
                      );
                    })}
                    {(displayProfile.gigs || []).length === 0 && (
                      <div className="col-span-4 p-8 border border-dashed rounded-3xl text-center bg-accent/5">
                        <p className="text-xs text-muted-foreground font-medium">
                          No active gigs. Contact to discuss custom projects and
                          capabilities.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* REVIEWS SECTION */}
              <section className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">
                  Work History & Reviews
                </h3>

                <div className="space-y-4">
                  {/* Scrollable container for work history logs */}
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/10">
                    {(displayProfile.workHistory || []).map((work: any) => (
                      <div
                        key={work.id}
                        className="p-4 rounded-2xl bg-card border border-border/40 hover:border-primary/20 transition-all space-y-3 group"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <h4 className="text-lg font-black group-hover:text-primary transition-colors">
                              {work.title}
                            </h4>
                            <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground/60 tracking-wider uppercase">
                              {work.rating ? (
                                <span className="flex items-center gap-2">
                                  {Number(work.rating).toFixed(1)}{" "}
                                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                </span>
                              ) : (
                                <span className="text-[10px] font-black opacity-40">
                                  No Rating Provided
                                </span>
                              )}
                              <span>{work.date}</span>
                            </div>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-xl font-black text-foreground">
                              ${work.amount.toLocaleString()}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                              Fixed Price
                            </p>
                          </div>
                        </div>

                        {work.comment ? (
                          <div className="bg-accent/30 p-4 rounded-xl md:ml-4 border-l-4 border-primary/40 italic">
                            <p className="text-muted-foreground font-medium text-xs leading-relaxed">
                              "{work.comment}"
                            </p>
                            <div className="mt-4 flex items-center gap-2 text-xs font-black uppercase text-foreground">
                              <div className="h-px w-6 bg-border" />
                              {work.client}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-muted/30 p-4 rounded-2xl md:ml-4 border border-border/40">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Project Successfully Settled
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {(displayProfile.workHistory || []).length === 0 && (
                    <div className="p-12 border border-dashed rounded-[3rem] text-center space-y-2 bg-primary/5">
                      <p className="font-bold">No work history yet</p>
                      <p className="text-xs text-muted-foreground tracking-widest uppercase">
                        Verified projects will appear here
                      </p>
                    </div>
                  )}

                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-primary/5 hover:border-primary/40 shadow-sm transition-all active:scale-[0.98]"
                  >
                    <Link to="/freelancer/reviews">View All Feedback</Link>
                  </Button>
                </div>
              </section>
            </div>

            {/* SIDEBAR AREA */}
            <aside className="lg:col-span-4 space-y-6 lg:pl-4">
              {/* SKILLS SECTION */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">
                  Technical Expertise
                </h3>
                <div className="space-y-8">
                  <CompactSkillGroup
                    title="Skills & Technologies"
                    skills={(displayProfile.skills || []).map((s: any) => ({
                      name: s.skill?.name || s.name,
                      level: s.proficiencyLevel || s.level || 3,
                    }))}
                  />
                  {(displayProfile.skills || []).length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      No skills added yet.
                    </p>
                  )}
                </div>
              </div>

              <Separator className="bg-border/40" />

              {/* PREFERRED CATEGORIES */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-purple-500">
                  Preferred Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(displayProfile.preferredCategories || []).map(
                    (cat: string) => (
                      <Badge
                        key={cat}
                        variant="secondary"
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-500/10 text-purple-700 border-none hover:bg-purple-500/20"
                      >
                        {cat.replace(/-/g, " ")}
                      </Badge>
                    ),
                  )}
                  {(displayProfile.preferredCategories || []).length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      No category preferences set.
                    </p>
                  )}
                </div>
              </div>

              <Separator className="bg-border/40" />

              {/* DETAILS SECTION */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">
                  Education & Certs
                </h3>
                <div className="space-y-6">
                  {(displayProfile.educations || []).map((edu: any) => (
                    <div key={edu.school + edu.degree} className="flex gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center shrink-0">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-sm leading-tight">
                          {edu.school}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {edu.degree}
                        </p>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
                          {edu.year}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(displayProfile.educations || []).length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      No education history added.
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    {(displayProfile.certificates || []).map((cert: any) => {
                      const isPdf = cert.credentialUrl
                        ?.toLowerCase()
                        .endsWith(".pdf");
                      const isImage = cert.credentialUrl
                        ?.toLowerCase()
                        .match(/\.(jpg|jpeg|png|gif|webp)$/i);

                      return (
                        <a
                          key={cert.id}
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative aspect-square rounded-2xl overflow-hidden border border-border/50 bg-accent/10 hover:border-primary/30 transition-all flex flex-col"
                        >
                          {isImage ? (
                            <div className="w-full h-full shimmer">
                              <img
                                src={cert.credentialUrl}
                                alt={cert.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onLoad={(e) => (e.currentTarget.parentElement?.classList.remove("shimmer"))}
                              />
                            </div>
                          ) : (
                            <div className="flex-1 flex items-center justify-center bg-accent/20">
                              {isPdf ? (
                                <div className="flex flex-col items-center gap-2">
                                  <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-red-500" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase text-red-500/60">
                                    PDF
                                  </span>
                                </div>
                              ) : (
                                <Award className="h-8 w-8 text-primary/40" />
                              )}
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                            <p className="text-[10px] font-bold truncate text-foreground leading-tight">
                              {cert.title || cert.name}
                            </p>
                            <p className="text-[8px] text-muted-foreground truncate opacity-80">
                              {cert.issuingOrganization || "Verified"}
                            </p>
                          </div>
                          {!isImage && (
                            <div className="p-2 mt-auto border-t border-border/20 bg-background/50 group-hover:hidden transition-all">
                              <p className="text-[10px] font-bold truncate text-foreground/80">
                                {cert.title || cert.name}
                              </p>
                            </div>
                          )}
                        </a>
                      );
                    })}
                  </div>
                  {(displayProfile.certificates || []).length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      No certifications added.
                    </p>
                  )}
                </div>
              </div>

              {/* LANGUAGES */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(displayProfile.languages || []).map((lang: any) => (
                    <Badge
                      key={lang.name || lang}
                      variant="secondary"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-accent/50 hover:bg-accent border-none"
                    >
                      {typeof lang === "string" ? lang : lang.name || lang} ·{" "}
                      <span className="text-muted-foreground">
                        {lang.level || "Fluent"}
                      </span>
                    </Badge>
                  ))}
                  {(displayProfile.languages || []).length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      No languages added.
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </motion.div>
      </div>

      {!isLoading && profile && (
        <FreelancerOnboardingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            fetchProfile(false);
          }}
          onComplete={() => fetchProfile(false)} // refresh profile after onboarding completion
          profile={profile}
        />
      )}
    </DashboardLayout>
  );
}

function CompactSkillGroup({
  title,
  skills,
}: {
  title: string;
  skills: { name: string; level: number }[];
}) {
  return (
    <div className="space-y-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
        {title}
      </p>
      <div className="space-y-3">
        {skills.map((skill) => (
          <div key={skill.name} className="group">
            <div className="flex justify-between items-center mb-1.5 px-1">
              <span className="text-sm font-bold text-foreground/80 group-hover:text-primary transition-colors">
                {skill.name}
              </span>
              <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-tighter">
                {skill.level === 5
                  ? "Expert"
                  : skill.level === 4
                    ? "Advanced"
                    : "Proficient"}
              </span>
            </div>
            <div className="h-2 w-full bg-accent/30 rounded-full overflow-hidden border border-border/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(skill.level / 5) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-primary relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillGroup({
  title,
  skills,
}: {
  title: string;
  skills: { name: string; level: number }[];
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
        {title}
      </h3>
      <div className="flex flex-wrap gap-4">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="flex flex-col gap-1.5 p-3 rounded-xl bg-accent/20 border border-border/50 hover:bg-accent/40 transition-colors cursor-default"
          >
            <span className="text-sm font-bold">{skill.name}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    i <= skill.level
                      ? "bg-primary shadow-[0_0_5px_rgba(var(--primary),0.5)]"
                      : "bg-muted",
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopSkillRow({
  name,
  projects,
  percentage,
}: {
  name: string;
  projects: number;
  percentage: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end text-sm">
        <span className="font-bold">{name}</span>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
          {projects} projects
        </span>
      </div>
      <div className="h-2 bg-accent/50 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
