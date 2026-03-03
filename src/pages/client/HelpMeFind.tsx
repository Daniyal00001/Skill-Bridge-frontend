import { useState, useEffect } from "react";
import {
    Sparkles,
    Search,
    Star,
    MessageSquare,
    BrainCircuit,
    AlertCircle,
    Trophy,
    Activity,
    ChevronRight,
    MapPin,
    Clock,
    DollarSign,
    Filter,
    SlidersHorizontal,
    User,
    Briefcase,
    Code2,
    Palette,
    Camera,
    PenTool,
    BarChart3,
    Music,
    Globe,
    Video,
    CheckCircle2,
    ArrowRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

// ─── Mock Freelancers Data ─────────────────────────────────────────────────────
const MOCK_FREELANCERS = [
    {
        id: "fl-1",
        name: "Alex Rivera",
        avatar: "https://i.pravatar.cc/150?u=alex",
        skills: ["React", "Node.js", "TypeScript"],
        experience: "expert",
        yearsExp: "5+",
        rate: 85,
        rating: 4.9,
        completedProjects: 124,
        specialty: "Full Stack Development",
        category: "development",
        availability: "Available now",
        location: "Remote",
    },
    {
        id: "fl-2",
        name: "Sarah Chen",
        avatar: "https://i.pravatar.cc/150?u=sarah",
        skills: ["Figma", "Adobe XD", "Prototyping"],
        experience: "expert",
        yearsExp: "4+",
        rate: 75,
        rating: 5.0,
        completedProjects: 89,
        specialty: "UI/UX Design",
        category: "design",
        availability: "Available now",
        location: "Remote",
    },
    {
        id: "fl-3",
        name: "Jordan Smith",
        avatar: "https://i.pravatar.cc/150?u=jordan",
        skills: ["Copywriting", "SEO", "Content Strategy"],
        experience: "intermediate",
        yearsExp: "2-5",
        rate: 55,
        rating: 4.8,
        completedProjects: 45,
        specialty: "Content Writing",
        category: "writing",
        availability: "Available in 2 weeks",
        location: "Remote",
    },
    {
        id: "fl-4",
        name: "Maria Garcia",
        avatar: "https://i.pravatar.cc/150?u=maria",
        skills: ["Python", "TensorFlow", "Data Analysis"],
        experience: "expert",
        yearsExp: "6+",
        rate: 110,
        rating: 4.7,
        completedProjects: 67,
        specialty: "Data Science & AI",
        category: "development",
        availability: "Available now",
        location: "Remote",
    },
    {
        id: "fl-5",
        name: "Tom Wilson",
        avatar: "https://i.pravatar.cc/150?u=tom",
        skills: ["After Effects", "Premiere Pro", "Motion"],
        experience: "intermediate",
        yearsExp: "3+",
        rate: 65,
        rating: 4.6,
        completedProjects: 112,
        specialty: "Video Editing & Motion",
        category: "video",
        availability: "Available now",
        location: "Remote",
    },
];

// ─── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = [
    { value: "development", label: "Development & Tech", icon: Code2 },
    { value: "design", label: "Design & Creative", icon: Palette },
    { value: "writing", label: "Writing & Content", icon: PenTool },
    { value: "marketing", label: "Marketing & SEO", icon: BarChart3 },
    { value: "video", label: "Video & Animation", icon: Video },
    { value: "music", label: "Music & Audio", icon: Music },
    { value: "photography", label: "Photography", icon: Camera },
    { value: "other", label: "Other", icon: Briefcase },
];

const TECH_STACK_OPTIONS = [
    "React", "Node.js", "Python", "Flutter", "Firebase",
    "AWS", "Figma", "WordPress", "Shopify", "Vue.js",
];

const TIMELINE_OPTIONS = [
    { value: "1week", label: "1 Week" },
    { value: "2-4weeks", label: "2 - 4 Weeks" },
    { value: "1-3months", label: "1 - 3 Months" },
    { value: "flexible", label: "Flexible" },
];

// ─── Component ─────────────────────────────────────────────────────────────────
const HelpMeFindPage = () => {
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [matches, setMatches] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // AI Matching form state
    const [form, setForm] = useState({
        projectTitle: "",
        projectDescription: "",
        category: "",
        budgetRange: [200, 800] as [number, number],
        timeline: "",
        experienceLevel: [] as string[],
        minRating: "",
        location: "",
        techStack: [] as string[],
    });

    // ── Quick search filter ──────────────────────────────────────────────────
    const filteredFreelancers = MOCK_FREELANCERS.filter((f) => {
        const q = searchTerm.toLowerCase();
        return (
            f.name.toLowerCase().includes(q) ||
            f.skills.some((s) => s.toLowerCase().includes(q)) ||
            f.specialty.toLowerCase().includes(q) ||
            f.category.toLowerCase().includes(q)
        );
    });

    // ── Loading animation ────────────────────────────────────────────────────
    useEffect(() => {
        if (!loading) return;
        setLoadingProgress(0);
        const interval = setInterval(() => {
            setLoadingProgress((p) => {
                if (p >= 90) { clearInterval(interval); return 90; }
                return p + Math.floor(Math.random() * 12) + 3;
            });
        }, 400);
        return () => clearInterval(interval);
    }, [loading]);

    // ── Toggle helpers ───────────────────────────────────────────────────────
    const toggleExperience = (val: string) => {
        setForm((prev) => ({
            ...prev,
            experienceLevel: prev.experienceLevel.includes(val)
                ? prev.experienceLevel.filter((v) => v !== val)
                : [...prev.experienceLevel, val],
        }));
    };

    const toggleTechStack = (val: string) => {
        setForm((prev) => ({
            ...prev,
            techStack: prev.techStack.includes(val)
                ? prev.techStack.filter((v) => v !== val)
                : [...prev.techStack, val],
        }));
    };

    // ── Handle AI Match ──────────────────────────────────────────────────────
    const handleMatch = () => {
        if (!form.projectTitle || !form.category) {
            toast.error("Please fill in the project title and category.");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            const results = MOCK_FREELANCERS
                .filter((f) => !form.category || f.category === form.category)
                .map((f) => {
                    let score = 70 + Math.floor(Math.random() * 20);
                    if (form.experienceLevel.includes(f.experience)) score += 8;
                    if (form.techStack.some((t) => f.skills.includes(t))) score += 7;
                    if (f.rate >= form.budgetRange[0] && f.rate <= form.budgetRange[1] * 0.12) score += 5;
                    return {
                        ...f,
                        matchPercentage: Math.min(score, 99),
                        reason: `Strong match for your ${form.category} project — ${f.yearsExp} years in ${f.specialty} with ${f.completedProjects} completed projects.`,
                    };
                })
                .sort((a, b) => b.matchPercentage - a.matchPercentage);

            // If filtered category gives too few, fallback to top all
            const top = results.length >= 2 ? results : MOCK_FREELANCERS.map((f) => ({
                ...f,
                matchPercentage: 75 + Math.floor(Math.random() * 20),
                reason: `Recommended based on your project scope and budget range.`,
            })).sort((a, b) => b.matchPercentage - a.matchPercentage);

            setLoadingProgress(100);
            setTimeout(() => {
                setMatches(top.slice(0, 4));
                setLoading(false);
                setStep(2);
                toast.success("AI Matching Complete! Top freelancers found.");
            }, 500);
        }, 3200);
    };

    // ────────────────────────────────────────────────────────────────────────
    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in py-8 px-4">

                {/* ── Page Header ── */}
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a6bff] via-[#1557e0] to-[#0d3fa3] p-8 text-white shadow-2xl">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
                    <div className="relative flex items-center justify-between">
                        <div className="space-y-2">
                            <Badge className="bg-white/20 text-white border-0 text-xs font-semibold mb-2">
                                SkillBridge AI
                            </Badge>
                            <h1 className="text-4xl font-extrabold tracking-tight">AI Talent Matcher</h1>
                            <p className="text-blue-100 text-base max-w-md">
                                Find the perfect freelancer for your project — any category, any skill.
                            </p>
                        </div>
                        <div className="hidden md:flex items-center justify-center w-36 h-36 relative">
                            {/* Robot illustration placeholder */}
                            <div className="w-28 h-28 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center backdrop-blur-sm">
                                <BrainCircuit className="w-14 h-14 text-white/80" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                                <Sparkles className="w-4 h-4 text-yellow-900" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <Tabs defaultValue="ai" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto h-11 bg-muted/60">
                        <TabsTrigger value="search" className="gap-2 text-sm font-semibold">
                            <Search className="w-4 h-4" /> Quick Search
                        </TabsTrigger>
                        <TabsTrigger value="ai" className="gap-2 text-sm font-semibold">
                            <Sparkles className="w-4 h-4" /> AI Matching
                        </TabsTrigger>
                    </TabsList>

                    {/* ════════════════ QUICK SEARCH TAB ════════════════ */}
                    <TabsContent value="search" className="space-y-5 animate-fade-up">
                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, skill (React, Figma, SEO), or specialty..."
                                className="h-13 pl-12 text-base border-border/60 bg-card/60 focus-visible:ring-blue-500/30 rounded-xl shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-4">
                            {filteredFreelancers.map((f) => (
                                <Card key={f.id} className="border-border/40 bg-card/60 overflow-hidden transition-all hover:shadow-lg hover:border-blue-500/30 rounded-2xl">
                                    <div className="flex flex-col md:flex-row items-center gap-5 p-5">
                                        <Avatar className="h-16 w-16 border-2 border-background shadow-md shrink-0">
                                            <AvatarImage src={f.avatar} />
                                            <AvatarFallback>{f.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 text-center md:text-left space-y-1.5">
                                            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                                                <h3 className="text-lg font-bold">{f.name}</h3>
                                                <Badge variant="secondary" className="text-[10px] capitalize px-2">{f.experience}</Badge>
                                            </div>
                                            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{f.specialty}</p>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mt-1">
                                                {f.skills.map((s) => (
                                                    <Badge key={s} variant="outline" className="text-[10px] px-2 bg-background/50">{s}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center md:items-end gap-2.5 min-w-[140px]">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                <span className="text-sm font-bold">{f.rating}</span>
                                            </div>
                                            <div className="text-lg font-black">${f.rate}<span className="text-xs text-muted-foreground font-normal">/hr</span></div>
                                            <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                {f.availability}
                                            </div>
                                            <Button size="sm" className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                                                <MessageSquare className="w-3.5 h-3.5" /> Contact
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {filteredFreelancers.length === 0 && (
                                <div className="text-center py-16 space-y-3">
                                    <div className="bg-muted w-14 h-14 rounded-full flex items-center justify-center mx-auto">
                                        <Search className="w-7 h-7 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground text-sm">No freelancers match your search. Try AI Matching for smarter results!</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* ════════════════ AI MATCHING TAB ════════════════ */}
                    <TabsContent value="ai" className="space-y-6">

                        {/* ── Step 1: Form ── */}
                        {step === 1 && !loading && (
                            <div className="space-y-5">

                                {/* Project Overview Card */}
                                <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
                                    <CardContent className="p-6 space-y-5">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-foreground">Project Overview</label>
                                            <Input
                                                placeholder="e.g. Food Delivery Mobile App"
                                                className="h-11 bg-background/60 border-border/60 focus-visible:ring-blue-500/30 rounded-xl"
                                                value={form.projectTitle}
                                                onChange={(e) => setForm({ ...form, projectTitle: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-foreground">Project Description</label>
                                            <Textarea
                                                placeholder="Describe your project in detail — requirements, features, goals..."
                                                className="min-h-[100px] bg-background/60 border-border/60 focus-visible:ring-blue-500/30 rounded-xl resize-none text-sm"
                                                value={form.projectDescription}
                                                onChange={(e) => setForm({ ...form, projectDescription: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-foreground">Category</label>
                                            <Select onValueChange={(v) => setForm({ ...form, category: v })}>
                                                <SelectTrigger className="h-11 bg-background/60 border-border/60 rounded-xl">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CATEGORIES.map((c) => (
                                                        <SelectItem key={c.value} value={c.value}>
                                                            <div className="flex items-center gap-2">
                                                                <c.icon className="w-4 h-4 text-muted-foreground" />
                                                                {c.label}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Smart Filters Card */}
                                <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
                                    <CardHeader className="pb-3 pt-5 px-6">
                                        <CardTitle className="text-base font-bold flex items-center gap-2">
                                            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                                            Smart Filters
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="px-6 pb-6 space-y-6">

                                        {/* Budget Range Slider */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm font-bold">Budget Range</label>
                                                <span className="text-sm font-semibold text-blue-600">
                                                    ${form.budgetRange[0].toLocaleString()} – ${form.budgetRange[1].toLocaleString()}
                                                </span>
                                            </div>
                                            <Slider
                                                min={50}
                                                max={10000}
                                                step={50}
                                                value={form.budgetRange}
                                                onValueChange={(v) => setForm({ ...form, budgetRange: v as [number, number] })}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between text-[11px] text-muted-foreground">
                                                <span>$50</span>
                                                <span>$10,000+</span>
                                            </div>
                                        </div>

                                        {/* Timeline */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold">Timeline</label>
                                            <div className="flex flex-wrap gap-2">
                                                {TIMELINE_OPTIONS.map((t) => (
                                                    <button
                                                        key={t.value}
                                                        onClick={() => setForm({ ...form, timeline: t.value })}
                                                        className={cn(
                                                            "px-4 py-2 rounded-lg text-xs font-semibold border-2 transition-all",
                                                            form.timeline === t.value
                                                                ? "bg-blue-600 border-blue-600 text-white shadow-md"
                                                                : "border-border/60 text-muted-foreground hover:border-blue-400 hover:text-foreground"
                                                        )}
                                                    >
                                                        {t.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Experience Level + Minimum Rating */}
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold">Experience Level</label>
                                                <div className="space-y-2">
                                                    {[
                                                        { value: "entry", label: "Junior (0 - 2 years)" },
                                                        { value: "intermediate", label: "Mid-Level (2 - 5 years)" },
                                                        { value: "expert", label: "Expert (5+ years)" },
                                                    ].map((exp) => (
                                                        <label key={exp.value} className="flex items-center gap-2.5 cursor-pointer group">
                                                            <Checkbox
                                                                id={exp.value}
                                                                checked={form.experienceLevel.includes(exp.value)}
                                                                onCheckedChange={() => toggleExperience(exp.value)}
                                                                className="border-border/60 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                            />
                                                            <span className={cn(
                                                                "text-sm transition-colors",
                                                                form.experienceLevel.includes(exp.value) ? "font-semibold text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                                            )}>{exp.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-bold">Minimum Rating</label>
                                                <Select onValueChange={(v) => setForm({ ...form, minRating: v })}>
                                                    <SelectTrigger className="h-11 bg-background/60 border-border/60 rounded-xl">
                                                        <SelectValue placeholder="Any rating" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="3">3+ Stars</SelectItem>
                                                        <SelectItem value="4">4+ Stars</SelectItem>
                                                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                                                        <SelectItem value="5">5 Stars Only</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                {/* Location */}
                                                <div className="pt-2 space-y-1.5">
                                                    <label className="text-sm font-bold">Location</label>
                                                    <Select onValueChange={(v) => setForm({ ...form, location: v })}>
                                                        <SelectTrigger className="h-11 bg-background/60 border-border/60 rounded-xl">
                                                            <SelectValue placeholder="Anywhere" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="remote">Remote (Worldwide)</SelectItem>
                                                            <SelectItem value="pk">Pakistan</SelectItem>
                                                            <SelectItem value="us">United States</SelectItem>
                                                            <SelectItem value="uk">United Kingdom</SelectItem>
                                                            <SelectItem value="in">India</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tech Stack / Skills */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold">Required Skills / Tech Stack</label>
                                            <div className="flex flex-wrap gap-2">
                                                {TECH_STACK_OPTIONS.map((tech) => {
                                                    const active = form.techStack.includes(tech);
                                                    return (
                                                        <button
                                                            key={tech}
                                                            onClick={() => toggleTechStack(tech)}
                                                            className={cn(
                                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all",
                                                                active
                                                                    ? "bg-blue-600/10 border-blue-600 text-blue-600 shadow-sm"
                                                                    : "border-border/50 text-muted-foreground hover:border-blue-400 hover:text-foreground"
                                                            )}
                                                        >
                                                            {active && <CheckCircle2 className="w-3 h-3" />}
                                                            {tech}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Run Button */}
                                <Button
                                    onClick={handleMatch}
                                    className="w-full h-14 text-base font-black gap-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/30 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Run AI Matching
                                    <ArrowRight className="w-5 h-5 ml-auto" />
                                </Button>
                            </div>
                        )}

                        {/* ── Loading State ── */}
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-24 space-y-8 animate-in fade-in zoom-in duration-500">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-4 border-blue-200 animate-spin border-t-blue-600" />
                                    <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-blue-600" />
                                </div>
                                <div className="text-center space-y-2 w-full max-w-sm">
                                    <h3 className="text-2xl font-bold">Analyzing your project...</h3>
                                    <p className="text-muted-foreground text-sm animate-pulse">
                                        SkillBridge AI is finding your perfect match
                                    </p>
                                    <Progress value={loadingProgress} className="h-2 mt-4" />
                                    <p className="text-xs text-muted-foreground">{loadingProgress}% complete</p>
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Results ── */}
                        {step === 2 && !loading && (
                            <div className="space-y-5 animate-fade-up">
                                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="w-5 h-5 text-yellow-500" />
                                        <div>
                                            <h2 className="text-base font-bold">Top Matched Freelancers</h2>
                                            <p className="text-xs text-muted-foreground">{matches.length} experts matched to your project</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setStep(1)} className="text-xs gap-1.5 border-blue-300 hover:bg-blue-50">
                                        <SlidersHorizontal className="w-3 h-3" /> Modify Filters
                                    </Button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {matches.map((f, index) => (
                                        <Card
                                            key={f.id}
                                            className={cn(
                                                "rounded-2xl border-border/40 bg-card/60 overflow-hidden transition-all hover:shadow-xl hover:border-blue-400/40",
                                                index === 0 && "md:col-span-2 ring-2 ring-blue-500 ring-offset-2 ring-offset-background"
                                            )}
                                        >
                                            <CardContent className="p-5">
                                                <div className="flex items-start gap-4">
                                                    <div className="relative shrink-0">
                                                        <Avatar className={cn(
                                                            "border-2 border-background shadow-md",
                                                            index === 0 ? "h-16 w-16" : "h-14 w-14"
                                                        )}>
                                                            <AvatarImage src={f.avatar} />
                                                            <AvatarFallback>{f.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div className={cn(
                                                            "absolute -bottom-1.5 -right-1.5 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow",
                                                            f.matchPercentage >= 90 ? "bg-green-600" : f.matchPercentage >= 80 ? "bg-blue-600" : "bg-slate-500"
                                                        )}>
                                                            {f.matchPercentage}%
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div>
                                                                <h3 className="font-bold text-base leading-tight">{f.name}</h3>
                                                                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{f.specialty}</p>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <div className="font-black text-lg leading-none">${f.rate}<span className="text-[10px] font-normal text-muted-foreground">/hr</span></div>
                                                                <div className="flex items-center justify-end gap-1 mt-1">
                                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                                                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{f.yearsExp} years exp</span>
                                                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${f.rate}/hr</span>
                                                        </div>

                                                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                                                            {f.skills.map((s: string) => (
                                                                <Badge key={s} variant="secondary" className="text-[10px] px-2 py-0.5">{s}</Badge>
                                                            ))}
                                                        </div>

                                                        {index === 0 && (
                                                            <div className="mt-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg p-3 border border-blue-200/40">
                                                                <p className="text-xs text-foreground/80 leading-relaxed">
                                                                    <span className="font-bold text-blue-600">AI Insight: </span>
                                                                    {f.reason}
                                                                </p>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                                                            <span className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />{f.availability}
                                                            </span>
                                                            <div className="flex gap-2">
                                                                <Button variant="ghost" size="sm" className="h-8 text-xs px-3">Profile</Button>
                                                                <Button size="sm" className="h-8 px-4 text-xs bg-blue-600 hover:bg-blue-700 gap-1.5">
                                                                    <MessageSquare className="w-3 h-3" /> Message
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* ── Disclaimer ── */}
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 rounded-xl p-4 flex gap-3 items-start">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                        All profiles are verified SkillBridge members. Match scores are dynamic and updated based on freelancer availability, ratings, and project history.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HelpMeFindPage;