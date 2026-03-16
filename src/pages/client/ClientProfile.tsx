import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Building,
  MapPin,
  Calendar,
  Star,
  Pencil,
  CheckCircle2,
  XCircle,
  DollarSign,
  Briefcase,
  Clock,
  TrendingUp,
  Users,
  BarChart3,
  ShieldCheck,
  Repeat2,
  Globe,
  MessageSquare,
  Eye,
  ArrowRight,
  Award,
  Mail,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_CLIENT = {
  name: "John Smith",
  company: "TechCorp Inc.",
  location: "New York, USA",
  memberSince: "Jan 2024",
  industry: "E-Commerce & Retail",
  avatar: "https://github.com/shadcn.png",
  bio: "Visionary entrepreneur focused on scaling AI-driven SaaS platforms and e-commerce ecosystems. I look for top-tier developers who value code quality, clear communication, and long-term collaboration. My projects range from MVP builds to full-scale enterprise solutions.",
  hiringPreferences: {
    budget: "Medium ($1k–$10k)",
    paymentType: "Fixed Price",
    experienceNeeded: "Expert Level",
    communication: "Slack / Messages",
  },
  trustScore: 4.8,
  totalReviews: 23,
  topPercentile: 10,
  stats: {
    totalPosted: 14,
    completed: 12,
    hireRate: 78,
    avgResponseTime: "< 2 hours",
    totalPaidOut: "$48,200",
    repeatHireRate: "65%",
  },
  verification: {
    email: true,
    payment: true,
    phone: false,
    id: false,
  },
  monthlyStats: {
    projectsPosted: 3,
    freelancersHired: 2,
    spent: "$12,400",
    completed: 2,
  },
  timezone: {
    time: "2:30 PM",
    zone: "UTC+5 (PKT)",
    availability: "Part-time (20hrs/week)",
  },
};

const MOCK_PROJECTS = [
  {
    id: 1,
    title: "E-Commerce Mobile App Redesign",
    status: "active",
    budget: "$4,500",
  },
  {
    id: 2,
    title: "AI-Powered Analytics Dashboard",
    status: "completed",
    budget: "$8,200",
  },
  {
    id: 3,
    title: "Multi-Vendor Marketplace API",
    status: "open",
    budget: "$6,000",
  },
];

const MOCK_REVIEWS = [
  {
    id: 1,
    name: "Alex Martinez",
    avatar: "",
    initials: "AM",
    rating: 5,
    comment:
      "John is an absolute pleasure to work with. Clear requirements, fast feedback, and always pays on time. Highly recommended!",
    date: "Feb 2025",
  },
  {
    id: 2,
    name: "Priya Sharma",
    avatar: "",
    initials: "PS",
    rating: 5,
    comment:
      "One of the best clients I've had on the platform. He knows exactly what he wants and communicates it perfectly.",
    date: "Jan 2025",
  },
];

const RATING_BARS = [
  { stars: 5, pct: 75 },
  { stars: 4, pct: 20 },
  { stars: 3, pct: 5 },
];

// ─── Sub‑Components ──────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; className: string }> = {
    active: {
      label: "Active",
      className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    completed: {
      label: "Completed",
      className: "bg-green-500/15 text-green-400 border-green-500/30",
    },
    open: {
      label: "Open",
      className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
  };
  const cfg = map[status] ?? { label: status, className: "" };
  return (
    <Badge
      variant="outline"
      className={cn("capitalize text-xs font-semibold border", cfg.className)}
    >
      {cfg.label}
    </Badge>
  );
};

const StarRow = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3.5 w-3.5",
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-muted text-muted-foreground/30",
        )}
      />
    ))}
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

const ClientProfilePage = () => {
  const [client] = useState(MOCK_CLIENT);
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
        {/* Two-column grid */}
        <div className="grid lg:grid-cols-[65%_35%] gap-6 items-start">
          {/* ══════════════════ LEFT COLUMN ══════════════════ */}
          <div className="space-y-6">
            {/* ── 1. Profile Hero Card ─────────────────────── */}
            <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
              {/* Gradient Cover */}
              <div className="relative h-32 bg-gradient-to-br from-primary/80 via-primary to-purple-600">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent)]" />
                {/* Edit Profile Button */}
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                  className="absolute top-3 right-3 gap-1.5 text-xs font-semibold shadow-lg"
                >
                  <Link to="/settings">
                    <Pencil className="h-3 w-3" />
                    Edit Profile
                  </Link>
                </Button>
              </div>

              <CardContent className="px-6 pb-6">
                {/* Avatar overlapping cover */}
                <div className="-mt-12 mb-4">
                  <Avatar className="h-24 w-24 border-4 border-card shadow-xl ring-2 ring-primary/20">
                    <AvatarImage src={client.avatar} alt={client.name} />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10">
                      {client.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Name & Meta */}
                <div className="space-y-3">
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">
                      {user?.name || client.name}
                    </h1>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-primary" />
                        {client.company}
                      </span>
                      {user?.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-primary" />
                          {user.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {client.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        Member since {client.memberSince}
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border border-primary/20 font-semibold">
                    {client.industry}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* ── 2. About Card ────────────────────────────── */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-bold">About Me</CardTitle>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                >
                  <Link to="/settings">
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {client.bio}
                </p>
              </CardContent>
            </Card>

            {/* ── 3. Hiring Preferences Card ───────────────── */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-bold">
                  Hiring Preferences
                </CardTitle>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                >
                  <Link to="/settings">
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      icon: DollarSign,
                      label: "Preferred Budget",
                      value: client.hiringPreferences.budget,
                    },
                    {
                      icon: Briefcase,
                      label: "Payment Type",
                      value: client.hiringPreferences.paymentType,
                    },
                    {
                      icon: Award,
                      label: "Experience Needed",
                      value: client.hiringPreferences.experienceNeeded,
                    },
                    {
                      icon: MessageSquare,
                      label: "Communication",
                      value: client.hiringPreferences.communication,
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/40"
                    >
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {label}
                        </p>
                        <p className="text-sm font-semibold mt-0.5 truncate">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ── 4. Posted Projects Card ───────────────────── */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold">
                    My Projects
                  </CardTitle>
                  <Badge className="bg-primary/15 text-primary border-primary/20 text-xs font-bold h-5 px-2">
                    {MOCK_PROJECTS.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {MOCK_PROJECTS.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Briefcase className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {project.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {project.budget}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={project.status} />
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                      >
                        <Link to="/client/projects">
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="pt-1">
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full text-primary hover:bg-primary/10 text-sm font-semibold gap-1"
                  >
                    <Link to="/client/projects">
                      View All Projects
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* ── 5. Reviews Received Card ──────────────────── */}
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">
                  Reviews from Freelancers
                </CardTitle>
                {/* Overall score */}
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-4xl font-black text-yellow-400">
                    {client.trustScore}
                  </span>
                  <div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < Math.floor(client.trustScore)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground/30 fill-muted",
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {client.totalReviews} reviews
                    </p>
                  </div>
                </div>

                {/* Rating bars */}
                <div className="space-y-2 mt-4">
                  {RATING_BARS.map(({ stars, pct }) => (
                    <div
                      key={stars}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span className="w-6 text-right text-muted-foreground font-medium">
                        {stars}★
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-yellow-400 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-muted-foreground">{pct}%</span>
                    </div>
                  ))}
                </div>
              </CardHeader>

              <Separator className="mx-6 opacity-40" />

              <CardContent className="pt-4 space-y-4">
                {MOCK_REVIEWS.map((review) => (
                  <div
                    key={review.id}
                    className="flex gap-3 p-4 rounded-xl bg-muted/20 border border-border/40"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={review.avatar} />
                      <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                        {review.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold">{review.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {review.date}
                        </span>
                      </div>
                      <StarRow rating={review.rating} />
                      <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                        "{review.comment}"
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* ══════════════════ RIGHT SIDEBAR ══════════════════ */}
          <div className="space-y-5">
            {/* ── 1. Trust Score Card ───────────────────────── */}
            <Card className="overflow-hidden border-primary/20 shadow-lg">
              <div className="bg-gradient-to-br from-primary via-primary to-purple-600 p-6 text-white text-center">
                {/* Progress ring visual */}
                <div className="relative mx-auto w-24 h-24 mb-4">
                  <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="white"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(client.trustScore / 5) * 251.2} 251.2`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black leading-none">
                      {client.trustScore}
                    </span>
                    <Star className="h-4 w-4 fill-yellow-300 text-yellow-300 mt-0.5" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-white/80">
                  Based on {client.totalReviews} reviews
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 text-xs font-bold">
                  <Award className="h-3.5 w-3.5" />
                  Top {client.topPercentile}% Client on SkillBridge
                </div>
              </div>
            </Card>

            {/* ── 2. Quick Stats Card ───────────────────────── */}
            <Card className="border-border/40 bg-card/50 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    icon: Briefcase,
                    label: "Total Projects Posted",
                    value: client.stats.totalPosted,
                  },
                  {
                    icon: CheckCircle2,
                    label: "Projects Completed",
                    value: client.stats.completed,
                    valueClass: "text-green-400",
                  },
                  {
                    icon: TrendingUp,
                    label: "Hire Rate",
                    value: `${client.stats.hireRate}%`,
                    valueClass: "text-blue-400",
                  },
                  {
                    icon: Clock,
                    label: "Avg Response Time",
                    value: client.stats.avgResponseTime,
                    valueClass: "text-yellow-400",
                  },
                  {
                    icon: DollarSign,
                    label: "Total Paid Out",
                    value: client.stats.totalPaidOut,
                    valueClass: "text-green-400",
                  },
                  {
                    icon: Repeat2,
                    label: "Repeat Hire Rate",
                    value: client.stats.repeatHireRate,
                    valueClass: "text-purple-400",
                  },
                ].map(({ icon: Icon, label, value, valueClass }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      {label}
                    </div>
                    <span
                      className={cn(
                        "text-sm font-bold tabular-nums",
                        valueClass,
                      )}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ── 3. Verification Card ──────────────────────── */}
            <Card className="border-border/40 bg-card/50 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Trust & Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    key: "email",
                    label: "Email Verified",
                    verified: client.verification.email,
                  },
                  {
                    key: "payment",
                    label: "Payment Verified",
                    verified: client.verification.payment,
                  },
                  {
                    key: "phone",
                    label: "Phone Not Verified",
                    verified: client.verification.phone,
                  },
                  {
                    key: "id",
                    label: "ID Not Verified",
                    verified: client.verification.id,
                  },
                ].map(({ key, label, verified }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      {verified ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                      )}
                      <span
                        className={cn(
                          "font-medium",
                          verified
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {label}
                      </span>
                    </div>
                    {!verified && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-[10px] font-bold border-primary/30 text-primary hover:bg-primary/10 shrink-0"
                      >
                        Verify Now
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* ── 4. Hiring Stats Card ──────────────────────── */}
            <Card className="border-border/40 bg-card/50 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: client.monthlyStats.projectsPosted,
                      label: "Projects Posted",
                      color: "text-blue-400",
                    },
                    {
                      value: client.monthlyStats.freelancersHired,
                      label: "Freelancers Hired",
                      color: "text-green-400",
                    },
                    {
                      value: client.monthlyStats.spent,
                      label: "Total Spent",
                      color: "text-purple-400",
                    },
                    {
                      value: client.monthlyStats.completed,
                      label: "Completed",
                      color: "text-amber-400",
                    },
                  ].map(({ value, label, color }) => (
                    <div
                      key={label}
                      className="rounded-xl bg-muted/30 border border-border/40 p-3 text-center"
                    >
                      <p
                        className={cn("text-xl font-black tabular-nums", color)}
                      >
                        {value}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-medium leading-tight">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ── 5. Timezone Card ──────────────────────────── */}
            <Card className="border-border/40 bg-card/50 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Timezone & Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Current Time
                  </span>
                  <span className="text-lg font-black tabular-nums text-primary">
                    {client.timezone.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Timezone
                  </span>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {client.timezone.zone}
                  </Badge>
                </div>
                <Separator className="opacity-40" />
                <div className="flex items-center gap-2 pt-0.5">
                  <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-xs font-semibold">
                    {client.timezone.availability}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientProfilePage;
