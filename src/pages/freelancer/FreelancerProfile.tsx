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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-8">
            {/* PROFILE HERO CARD */}
            <Card className="overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-md">
              <div className="h-40 bg-gradient-to-r from-primary/80 to-purple-600/80 relative" />
              <CardContent className="relative pt-0 pb-8 px-8">
                <div className="flex flex-col md:flex-row md:items-end -mt-16 gap-6">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-2xl">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>AC</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-background rounded-full animate-pulse" />
                  </div>

                  <div className="flex-1 space-y-2 pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-extrabold tracking-tight">
                          {MOCK_PROFILE.name}
                        </h1>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                          {MOCK_PROFILE.title}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="gap-2 rounded-full border-primary/20 hover:bg-primary/5"
                        >
                          <Link to="/freelancer/settings">
                            <Pencil className="w-4 h-4" /> Edit Profile
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="w-4 h-4" /> Preview Public View
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mt-4">
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-4 h-4 text-primary/60" />{" "}
                        {MOCK_PROFILE.location} · {MOCK_PROFILE.timezone}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-primary/60" /> Member
                        since {MOCK_PROFILE.memberSince}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-4 h-4 text-primary/60" /> Last
                        active {MOCK_PROFILE.lastActive}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ABOUT CARD */}
            <Card className="border-none shadow-lg bg-card/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold">About Me</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-base italic">
                  "{MOCK_PROFILE.bio}"
                </p>
              </CardContent>
            </Card>

            {/* SKILLS CARD */}
            <Card className="border-none shadow-lg bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SkillGroup
                  title="Frontend"
                  skills={MOCK_PROFILE.skills.frontend}
                />
                <Separator className="bg-border/50" />
                <SkillGroup
                  title="Backend"
                  skills={MOCK_PROFILE.skills.backend}
                />
                <Separator className="bg-border/50" />
                <SkillGroup title="Tools" skills={MOCK_PROFILE.skills.tools} />

                <div className="pt-4">
                  <button className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold">Add New Skill</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* PORTFOLIO CARD */}
            <Card className="border-none shadow-lg bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {MOCK_PROFILE.portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="group relative rounded-2xl overflow-hidden bg-accent/30 border border-border hover:border-primary/50 transition-all duration-300 shadow-sm"
                    >
                      <div
                        className="h-44 w-full"
                        style={{ background: item.image }}
                      />
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-lg">{item.name}</h4>
                          <ExternalLink className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.tech.map((t) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="text-[10px] uppercase font-bold px-2 py-0 bg-primary/10 text-primary border-none"
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="h-full min-h-[250px] border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-all duration-300 bg-accent/10">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                      <Plus className="w-7 h-7" />
                    </div>
                    <span className="font-bold">Add Portfolio Item</span>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* WORK HISTORY CARD */}
            <Card className="border-none shadow-lg bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">
                  Work History on SkillBridge
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {MOCK_PROFILE.workHistory.map((work, idx) => (
                  <div
                    key={work.id}
                    className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-border last:before:hidden"
                  >
                    <div className="absolute left-[-4px] top-1 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <h4 className="text-lg font-bold hover:text-primary transition-colors cursor-pointer">
                          {work.title}
                        </h4>
                        <span className="text-sm font-bold text-primary">
                          ${work.amount.toLocaleString()} earned
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />{" "}
                          Completed
                        </span>
                        <span>•</span>
                        <span>
                          Client:{" "}
                          <span className="text-foreground">{work.client}</span>
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <span className="text-foreground">
                            {work.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground/80 leading-relaxed italic">
                        "{work.comment}"
                      </p>
                      <p className="text-xs text-muted-foreground/60 uppercase font-bold tracking-widest">
                        {work.date}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* REVIEWS CARD */}
            <Card className="border-none shadow-lg bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">
                  Client Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex flex-col md:flex-row gap-10 items-center">
                  <div className="text-center md:text-left space-y-1">
                    <div className="text-5xl font-black text-primary">
                      {MOCK_PROFILE.reviews_stats.average}
                    </div>
                    <div className="flex justify-center md:justify-start gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-5 h-5",
                            i <= 5
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted",
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">
                      ({MOCK_PROFILE.reviews_stats.total} reviews)
                    </p>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    {MOCK_PROFILE.reviews_stats.breakdown
                      .filter((b) => b.stars >= 3)
                      .map((item) => (
                        <div
                          key={item.stars}
                          className="flex items-center gap-4"
                        >
                          <span className="text-sm font-bold w-4">
                            {item.stars}
                          </span>
                          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                          <div className="flex-1 h-2.5 bg-accent/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.3)] transition-all duration-1000"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-muted-foreground w-12 text-right">
                            {item.percentage}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Reuse some data from workHistory for review cards */}
                  {MOCK_PROFILE.workHistory.map((review) => (
                    <div
                      key={review.id}
                      className="p-5 rounded-2xl bg-accent/20 border border-border/50 space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                            {review.client.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold">{review.client}</p>
                          <div className="flex gap-0.5 mt-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-3 h-3",
                                  i <= review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-muted",
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider">
                          {review.date}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                        "{review.comment}"
                      </p>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-primary/20 hover:bg-primary/5 font-bold transition-all"
                  >
                    Load More Reviews
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            {/* AVAILABILITY CARD */}
            <Card className="border-none shadow-lg bg-card/60 backdrop-blur-xl ring-1 ring-primary/20 sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-bold text-green-600 dark:text-green-400 uppercase tracking-tight text-xs">
                      {MOCK_PROFILE.availability}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant={isAvailable ? "default" : "outline"}
                    className={cn(
                      "rounded-full h-8 text-xs font-bold",
                      isAvailable ? "bg-green-600 hover:bg-green-700" : "",
                    )}
                    onClick={() => setIsAvailable(!isAvailable)}
                  >
                    {isAvailable ? "Active" : "Away"}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-4xl font-black text-foreground">
                        ${MOCK_PROFILE.rate}
                        <span className="text-lg font-medium text-muted-foreground/60">
                          {" "}
                          / hr
                        </span>
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full border-border"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-xs uppercase tracking-tighter text-muted-foreground/70">
                          Availability
                        </p>
                        <p className="font-semibold">
                          {MOCK_PROFILE.availabilityType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-xs uppercase tracking-tighter text-muted-foreground/70">
                          Preferred
                        </p>
                        <p className="font-semibold">
                          {MOCK_PROFILE.preferredContract}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="w-full rounded-2xl h-12 bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all font-bold text-lg">
                  Hire Now
                </Button>
              </CardContent>
            </Card>

            {/* PERFORMANCE STATS CARD */}
            <Card className="border-none shadow-lg bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span>Job Success</span>
                    <span className="text-primary">
                      {MOCK_PROFILE.jobSuccess}%
                    </span>
                  </div>
                  <Progress
                    value={MOCK_PROFILE.jobSuccess}
                    className="h-2 bg-accent shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-accent/30 rounded-xl border border-border/50">
                    <p className="text-xl font-black">
                      {MOCK_PROFILE.projectsCompleted}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Projects
                    </p>
                  </div>
                  <div className="p-3 bg-accent/30 rounded-xl border border-border/50">
                    <p className="text-xl font-black">
                      {MOCK_PROFILE.repeatClientRate}%
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Repeat
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Response
                    </span>
                  </div>
                  <span className="text-sm font-black">
                    {MOCK_PROFILE.responseTime}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* TOP SKILLS CHART */}
            <Card className="border-none shadow-lg bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold">
                  Top Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <TopSkillRow name="React" projects={32} percentage={85} />
                <TopSkillRow name="Node.js" projects={28} percentage={75} />
                <TopSkillRow name="AWS" projects={20} percentage={55} />
                <TopSkillRow name="Python" projects={15} percentage={45} />
                <TopSkillRow name="Docker" projects={12} percentage={35} />
              </CardContent>
            </Card>

            {/* INFO CARD */}
            <Card className="border-none shadow-lg bg-card/40 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Languages className="w-5 h-5 text-primary mt-1" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Languages
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {MOCK_PROFILE.languages.map((lang) => (
                          <span
                            key={lang.name}
                            className="text-sm font-semibold"
                          >
                            {lang.name}{" "}
                            <span className="text-muted-foreground font-medium">
                              ({lang.level})
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <GraduationCap className="w-5 h-5 text-primary mt-1" />
                    <div className="space-y-1 text-sm font-semibold">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Education
                      </p>
                      {MOCK_PROFILE.education.map((edu) => (
                        <div key={edu.school}>
                          <p>{edu.school}</p>
                          <p className="text-muted-foreground font-medium text-xs">
                            {edu.degree} · {edu.year}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Award className="w-5 h-5 text-primary mt-1" />
                    <div className="space-y-2 text-sm font-semibold flex-1">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Certifications
                      </p>
                      {MOCK_PROFILE.certifications.map((cert) => (
                        <div
                          key={cert.name}
                          className="p-2 bg-accent/30 rounded-lg border border-border/50 flex items-center justify-between group"
                        >
                          <span>{cert.name}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PROFILE COMPLETION CARD */}
            <Card className="border-none shadow-lg bg-primary/5 ring-1 ring-primary/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">
                    Boost Your Profile
                  </CardTitle>
                  <span className="text-lg font-black text-primary">
                    {MOCK_PROFILE.completion.percentage}%
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress
                  value={MOCK_PROFILE.completion.percentage}
                  className="h-3 bg-accent"
                />

                <div className="space-y-3 pt-2">
                  {MOCK_PROFILE.completion.missing.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 group cursor-pointer"
                    >
                      <div className="w-5 h-5 rounded-md border-2 border-primary/30 flex items-center justify-center transition-all group-hover:border-primary">
                        <div className="w-2.5 h-2.5 rounded-sm bg-primary scale-0 group-hover:scale-100 transition-transform" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-muted-foreground italic mt-4 text-center">
                  "Complete your profile to rank higher in search results and
                  attract more clients."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
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
          className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.3)] transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
