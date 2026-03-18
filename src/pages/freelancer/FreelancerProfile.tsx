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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { freelancerService } from "@/lib/freelancer.service";
import { FreelancerOnboardingModal } from "./Onboarding/FreelancerOnboardingModal";
import { EditFreelancerProfileModal } from "./EditProfile/EditFreelancerProfileModal";
import { useEffect } from "react";

// Mock Data
const MOCK_PROFILE = {
  name: "Alex Chen",
  title: "Senior Full Stack Developer",
  location: "Dallas, TX",
  timezone: "UTC-6",
  memberSince: "Jan 2023",
  lastActive: "Today",
  bio: "Passionate full-stack developer with over 8 years of experience building scalable web applications. I specialize in React, Node.js, and cloud architecture. My goal is to deliver clean, maintainable code and exceptional user experiences. I've helped numerous startups launch their MVPs and scale to thousands of users. Always eager to tackle complex technical challenges and learn new technologies.",
  availability: "Available for Work",
  rate: 85,
  availabilityType: "Full-time (40hrs/week)",
  preferredContract: "Fixed + Hourly",
  jobSuccess: 94,
  projectsCompleted: 52,
  repeatClientRate: 78,
  responseTime: "< 1 hour",
  languages: [
    { name: "English", level: "Native" },
    { name: "Urdu", level: "Native" },
  ],
  education: [
    { school: "FAST NUCES", degree: "BS in Computer Science", year: "2022" },
  ],
  certifications: [
    { name: "AWS Certified Developer", issuer: "Amazon Web Services" },
    { name: "Meta Front-End Certificate", issuer: "Meta" },
  ],
  skills: {
    frontend: [
      { name: "React", level: 5 },
      { name: "TypeScript", level: 4 },
      { name: "Next.js", level: 5 },
      { name: "Tailwind", level: 5 },
    ],
    backend: [
      { name: "Node.js", level: 4 },
      { name: "Python", level: 3 },
      { name: "PostgreSQL", level: 4 },
    ],
    tools: [
      { name: "AWS", level: 3 },
      { name: "Docker", level: 3 },
      { name: "Git", level: 5 },
    ],
  },
  portfolio: [
    {
      id: "p1",
      name: "SaaS Analytics Dashboard",
      tech: ["Next.js", "Tailwind", "Recharts"],
      image: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: "p2",
      name: "E-commerce Mobile App",
      tech: ["React Native", "Firebase"],
      image: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
    },
    {
      id: "p3",
      name: "Real-time Chat Platform",
      tech: ["Socket.io", "Node.js", "Redis"],
      image: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
    },
    {
      id: "p4",
      name: "Crypto Trading Bot",
      tech: ["Python", "FastAPI", "PostgreSQL"],
      image: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
  ],
  workHistory: [
    {
      id: "w1",
      title: "Full Stack Dashboard Development",
      client: "TechCorp",
      rating: 5.0,
      date: "March 2024",
      amount: 4500,
      comment:
        "Alex is an exceptional developer. He delivered the project ahead of schedule and the quality of code was top-notch. Highly recommended!",
    },
    {
      id: "w2",
      title: "React Components Library",
      client: "DesignMasters",
      rating: 4.8,
      date: "Jan 2024",
      amount: 2800,
      comment:
        "Great work on the UI components. Very responsive and easy to work with.",
    },
    {
      id: "w3",
      title: "Backend API Optimization",
      client: "DataFlow",
      rating: 5.0,
      date: "Nov 2023",
      amount: 3500,
      comment:
        "Significantly improved our system performance. Alex knows his way around databases and caching.",
    },
  ],
  reviews_stats: {
    average: 4.9,
    total: 47,
    breakdown: [
      { stars: 5, count: 38, percentage: 81 },
      { stars: 4, count: 7, percentage: 15 },
      { stars: 3, count: 2, percentage: 4 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 },
    ],
  },
  completion: {
    percentage: 85,
    missing: [
      "Add phone verification",
      "Add 2 more portfolio items",
      "Complete work history",
    ],
  },
};

export default function FreelancerProfile() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user } = useAuth();

  const fetchProfile = async () => {
    try {
      const res = await freelancerService.getMyProfile();
      setProfile(res.data);
      if (res.data.profileCompletion < 100) {
        setIsModalOpen(true);
      }
    } catch (e) {
      console.error("Failed to fetch profile", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const displayProfile = profile || MOCK_PROFILE;
  const completion = displayProfile.profileCompletion ?? 0;

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
      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* HEADER SECTION - NO CARD ENCLOSURE FOR A LIGHTER FEEL */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 border-b pb-10 border-border/50">
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
              <div className="absolute bottom-4 right-4 w-8 h-8 bg-background rounded-xl flex items-center justify-center shadow-lg border border-border">
                {displayProfile?.user?.isIdVerified ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                    {displayProfile.fullName || MOCK_PROFILE.name}
                  </h1>
                  <Badge className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-colors px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg">
                    Top Rated
                  </Badge>
                </div>
                <p className="text-xl font-medium text-muted-foreground italic">
                  {displayProfile.tagline || MOCK_PROFILE.title}
                </p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  {displayProfile.location || MOCK_PROFILE.location}{" "}
                  {displayProfile.region && `· ${displayProfile.region}`}
                </div>
                {displayProfile?.user?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    {displayProfile.user.email}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Verified className="w-4 h-4 text-emerald-500" />
                  Payment Verified
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {MOCK_PROFILE.reviews_stats.average} (
                  {MOCK_PROFILE.reviews_stats.total} reviews)
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                <Button className="rounded-xl h-12 px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all">
                  Contact for Project
                </Button>
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
                  ${displayProfile.hourlyRate || MOCK_PROFILE.rate}{" "}
                  <span className="text-base text-muted-foreground font-medium">
                    / hr
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-green-500 bg-green-500/5 px-4 py-2 rounded-full border border-green-500/10">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Available Now
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* MAIN CONTENT AREA */}
            <div className="lg:col-span-8 space-y-12">
              {/* DESCRIPTION SECTION */}
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">
                  Overview
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                  {displayProfile.bio || MOCK_PROFILE.bio}
                </p>
              </section>

              {/* STATS ROW */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Job Success",
                    value: `${MOCK_PROFILE.jobSuccess}%`,
                    icon: ShieldCheck,
                    color: "text-blue-500",
                  },
                  {
                    label: "Completed",
                    value: MOCK_PROFILE.projectsCompleted,
                    icon: CheckCircle2,
                    color: "text-emerald-500",
                  },
                  {
                    label: "Repeat Hires",
                    value: `${MOCK_PROFILE.repeatClientRate}%`,
                    icon: Zap,
                    color: "text-amber-500",
                  },
                  {
                    label: "Level",
                    value: "Expert",
                    icon: TrendingUp,
                    color: "text-purple-500",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-6 rounded-3xl bg-card border border-border/40 space-y-3 hover:bg-accent/50 transition-colors"
                  >
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                    <div>
                      <p className="text-2xl font-black">{stat.value}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* PORTFOLIO SECTION */}
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">
                    Portfolio
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-bold gap-2 text-primary hover:bg-primary/5"
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(displayProfile.gigs?.length > 0
                    ? displayProfile.gigs
                    : displayProfile.portfolioItems?.length > 0
                      ? displayProfile.portfolioItems
                      : MOCK_PROFILE.portfolio
                  )
                    .slice(0, 4)
                    .map((item: any) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ y: -5 }}
                        className="group cursor-pointer rounded-3xl overflow-hidden border border-border/40 bg-card/40 hover:bg-card hover:shadow-2xl hover:shadow-foreground/5 transition-all duration-500"
                      >
                        <div
                          className="aspect-[16/10] w-full"
                          style={{
                            background:
                              item.image ||
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          }}
                        />
                        <div className="p-6 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-black">
                              {item.name || item.title}
                            </h4>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(item.tech || item.techStack || []).map(
                              (t: string) => (
                                <span
                                  key={t}
                                  className="text-[10px] font-bold text-muted-foreground uppercase bg-accent/50 px-2.5 py-1 rounded-md"
                                >
                                  {t}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </section>

              {/* REVIEWS SECTION */}
              <section className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">
                  Work History & Reviews
                </h3>
                <div className="space-y-6">
                  {MOCK_PROFILE.workHistory.map((work) => (
                    <div
                      key={work.id}
                      className="p-8 rounded-[2.5rem] bg-card border border-border/40 hover:border-primary/20 transition-all space-y-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <h4 className="text-xl font-black group-hover:text-primary transition-colors">
                            {work.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground/60 tracking-wider uppercase">
                            <span className="flex items-center gap-2">
                              {work.rating.toFixed(1)}{" "}
                              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                            </span>
                            <span>{work.date}</span>
                          </div>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="text-2xl font-black text-foreground">
                            ${work.amount.toLocaleString()}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Fixed Price
                          </p>
                        </div>
                      </div>

                      <div className="bg-accent/30 p-6 rounded-2xl md:ml-4 border-l-4 border-primary/40 italic">
                        <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                          "{work.comment}"
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-black uppercase text-foreground">
                          <div className="h-px w-6 bg-border" />
                          {work.client}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-primary/5 hover:border-primary/40 shadow-sm transition-all active:scale-[0.98]"
                  >
                    Load More Projects
                  </Button>
                </div>
              </section>
            </div>

            {/* SIDEBAR AREA */}
            <aside className="lg:col-span-4 space-y-10 lg:pl-4">
              {/* SKILLS SECTION */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">
                  Technical Expertise
                </h3>
                <div className="space-y-8">
                  <CompactSkillGroup
                    title="Skills & Technologies"
                    skills={(displayProfile.skills?.length > 0
                      ? displayProfile.skills
                      : MOCK_PROFILE.skills.frontend
                    ).map((s: any) => ({
                      name: s.skill?.name || s.name,
                      level: s.proficiencyLevel || s.level,
                    }))}
                  />
                </div>
              </div>

              <Separator className="bg-border/40" />

              {/* DETAILS SECTION */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">
                  Education & Certs
                </h3>
                <div className="space-y-6">
                  {(displayProfile.educations?.length > 0
                    ? displayProfile.educations
                    : MOCK_PROFILE.education
                  ).map((edu: any) => (
                    <div key={edu.school} className="flex gap-4">
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

                  {(displayProfile.certificates?.length > 0
                    ? displayProfile.certificates
                    : MOCK_PROFILE.certifications
                  ).map((cert: any) => (
                    <div key={cert.title || cert.name} className="flex gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center shrink-0">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1 text-sm font-semibold">
                        <p className="font-bold text-sm leading-tight">
                          {cert.title || cert.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {cert.issuingOrganization || cert.issuer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LANGUAGES */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">
                  Languages
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(displayProfile.languages?.length > 0
                    ? displayProfile.languages
                    : MOCK_PROFILE.languages
                  ).map((lang: any) => (
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
                </div>
              </div>

              <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-background flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-widest">
                    Availability
                  </h4>
                </div>
                <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed">
                  {displayProfile.availability === "AVAILABLE"
                    ? "Open for new contracts."
                    : "Less than 30hrs/wk."}{" "}
                  Typical response time is{" "}
                  <b>{displayProfile.responseTime || "< 1 hour"}</b>.
                </p>
                <Button className="w-full rounded-xl font-bold active:scale-[0.98] transition-transform">
                  Check Calendar
                </Button>
              </div>
            </aside>
          </div>
        </motion.div>
      </div>

      {!isLoading && profile && (
        <FreelancerOnboardingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onComplete={() => fetchProfile()} // refresh profile after onboarding completion
          profile={profile}
        />
      )}
      {profile && (
        <EditFreelancerProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onComplete={() => fetchProfile()} // refresh profile after editing
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
