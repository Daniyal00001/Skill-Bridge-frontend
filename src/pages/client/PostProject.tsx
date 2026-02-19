import { useState } from "react";
import { format } from "date-fns";
import {
    Calendar as CalendarIcon,
    Check,
    Plus,
    X,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    Layout,
    Target,
    Clock,
    Code2,
    AlertCircle,
    Gem,
    Briefcase,
    Link as LinkIcon,
    MessageSquare,
    FileText,
    MousePointer2,
    Zap
} from "lucide-react";

import { cn } from "@/lib/utils";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const CATEGORIES = [
    { id: "web", name: "Web Development", icon: Layout },
    { id: "mobile", name: "Mobile Development", icon: Target },
    { id: "ai", name: "AI & Data Science", icon: Sparkles },
    { id: "design", name: "UI/UX Design", icon: Gem },
    { id: "other", name: "Other Tech", icon: Code2 },
];

const SKILL_SUGGESTIONS = [
    "React", "TypeScript", "Node.js", "Python", "UI/UX", "MongoDB", "AWS", "Tailwind CSS", "Next.js", "Solidity"
];

const PostProjectPage = () => {
    const [step, setStep] = useState(1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<null | {
        requirements: string[];
        techStack: string[];
    }>(null);

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        shortDesc: "",
        fullDesc: "",
        functionalReq: "",
        referenceLinks: "",
        budget: [5000],
        budgetType: "fixed", // fixed, hourly
        projectSize: "medium", // small, medium, large
        skills: [] as string[],
        experienceLevel: "intermediate", // entry, intermediate, expert
        hiringMethod: "bidding", // bidding, direct
        deadline: undefined as Date | undefined,
    });

    const updateFormData = (updates: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 5));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));
    const goToStep = (s: number) => setStep(s);

    const handleGetAISuggestions = () => {
        if (!formData.fullDesc || formData.fullDesc.length < 20) {
            toast.error("Please provide a vision description first for AI to suggest.");
            return;
        }

        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
            setAiSuggestions({
                requirements: [
                    "User Authentication & Role Management",
                    "Real-time Dashboard Analytics",
                    "Responsive Mobile-First UI",
                    "API Integration with Payment Gateway"
                ],
                techStack: ["React", "TypeScript", "Tailwind CSS", "Node.js"]
            });
            toast.success("AI Suggestions Generated!");
        }, 2000);
    };

    const steps = [
        { id: 1, name: "Basics" },
        { id: 2, name: "Description" },
        { id: 3, name: "Budget" },
        { id: 4, name: "Skills" },
        { id: 5, name: "Review" },
    ];

    return (
        <DashboardLayout>
            <div className="min-h-[calc(100vh-4rem)] bg-background/50 p-4 md:p-10">
                <div className="mx-auto max-w-4xl space-y-8 animate-fade-in">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center space-y-2">
                        <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary">
                            SkillBridge Project Builder
                        </Badge>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Post a New Project
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-lg">
                            Find the best talent by defining your project clearly.
                        </p>
                    </div>

                    {/* Progress Stepper */}
                    <div className="relative pt-4 px-4 pb-8">
                        <div className="flex justify-between items-center relative z-10">
                            {steps.map((s) => (
                                <div key={s.id} className="flex flex-col items-center gap-2">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 border-2",
                                        step >= s.id
                                            ? "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                                            : "bg-background border-muted text-muted-foreground"
                                    )}>
                                        {step > s.id ? <Check className="w-5 h-5" /> : s.id}
                                    </div>
                                    <span className={cn(
                                        "text-xs font-semibold uppercase tracking-wider",
                                        step >= s.id ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {s.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="absolute top-9 left-10 right-10 h-0.5 bg-muted -z-0" />
                        <div
                            className="absolute top-9 left-10 h-0.5 bg-primary transition-all duration-500 ease-in-out -z-0"
                            style={{ width: `${((step - 1) / (steps.length - 1)) * 95}%` }}
                        />
                    </div>

                    {/* Step 1: Basics */}
                    <div className="animate-fade-up">
                        {step === 1 && (
                            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Project Basics</CardTitle>
                                    <CardDescription>Start with a clear title and category.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Project Title</label>
                                        <Input
                                            placeholder="e.g., E-commerce App Redesign"
                                            value={formData.title}
                                            onChange={(e) => updateFormData({ title: e.target.value })}
                                            className="h-12 text-lg focus-visible:ring-primary/30"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-sm font-semibold">Category</label>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                            {CATEGORIES.map((cat) => {
                                                const Icon = cat.icon;
                                                return (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => updateFormData({ category: cat.id })}
                                                        className={cn(
                                                            "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 group",
                                                            formData.category === cat.id
                                                                ? "bg-primary/10 border-primary shadow-sm"
                                                                : "bg-background border-transparent hover:border-muted hover:bg-muted/30"
                                                        )}
                                                    >
                                                        <Icon className={cn(
                                                            "w-6 h-6 transition-colors",
                                                            formData.category === cat.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                                        )} />
                                                        <span className={cn(
                                                            "text-xs font-medium text-center",
                                                            formData.category === cat.id ? "text-primary font-bold" : "text-muted-foreground"
                                                        )}>{cat.name}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">One-line Summary</label>
                                        <Input
                                            placeholder="Capture attention in one sentence"
                                            value={formData.shortDesc}
                                            onChange={(e) => updateFormData({ shortDesc: e.target.value })}
                                            className="h-12"
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end pt-6 border-t">
                                    <Button onClick={nextStep} disabled={!formData.title || !formData.category} className="gap-2 px-8 h-12">
                                        Next: Description <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {/* Step 2: Description */}
                        {step === 2 && (
                            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Project Description</CardTitle>
                                    <CardDescription>Tell us your vision and requirements.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Describe your vision</label>
                                        <Textarea
                                            placeholder="What's the big picture? Why are you building this?"
                                            className="min-h-[120px] p-4"
                                            value={formData.fullDesc}
                                            onChange={(e) => updateFormData({ fullDesc: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Functional Requirements</label>
                                        <Textarea
                                            placeholder="List specific features or modules you need..."
                                            className="min-h-[120px] p-4"
                                            value={formData.functionalReq}
                                            onChange={(e) => updateFormData({ functionalReq: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold flex items-center gap-2">
                                            Reference Links <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                                        </label>
                                        <div className="relative">
                                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                placeholder="e.g., Figma links, competitors, inspiration..."
                                                className="pl-10"
                                                value={formData.referenceLinks}
                                                onChange={(e) => updateFormData({ referenceLinks: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Optional AI Suggestions Helper */}
                                    <div className="pt-4 border-t border-dashed">
                                        <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <Sparkles className="w-5 h-5 text-primary" />
                                                    <div>
                                                        <h4 className="text-sm font-bold">Need help with requirements?</h4>
                                                        <p className="text-xs text-muted-foreground">Our AI can suggest typical features based on your vision.</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-10 border-primary/20 hover:bg-primary/10 hover:text-primary transition-all"
                                                    onClick={handleGetAISuggestions}
                                                    disabled={isAnalyzing}
                                                >
                                                    {isAnalyzing ? "AI Thinking..." : "Get AI Suggestions"}
                                                </Button>
                                            </div>

                                            {aiSuggestions && (
                                                <div className="mt-4 grid md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                                                    <div className="bg-background/80 rounded-lg p-3 text-[11px] border border-primary/10 space-y-2">
                                                        <span className="font-bold text-primary block uppercase tracking-wider">Suggested Features:</span>
                                                        <ul className="space-y-1">
                                                            {aiSuggestions.requirements.map((req, i) => (
                                                                <li key={i} className="flex items-center gap-2">
                                                                    <div className="w-1 h-1 rounded-full bg-primary" /> {req}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div className="bg-background/80 rounded-lg p-3 text-[11px] border border-primary/10 space-y-2">
                                                        <span className="font-bold text-primary block uppercase tracking-wider">Tech Recommendations:</span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {aiSuggestions.techStack.map((tech, i) => (
                                                                <Badge key={i} variant="skill" className="text-[9px] py-0 px-2">{tech}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between pt-6 border-t">
                                    <Button variant="ghost" onClick={prevStep} className="gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </Button>
                                    <Button onClick={nextStep} disabled={!formData.fullDesc || !formData.functionalReq} className="gap-2 px-8">
                                        Next: Budget <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {/* Step 3: Budget & Timeline */}
                        {step === 3 && (
                            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Budget & Timeline</CardTitle>
                                    <CardDescription>Define your budget expectations and target deadline.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-10">
                                    {/* Budget Type Toggle */}
                                    <div className="space-y-4">
                                        <label className="text-sm font-semibold block text-center">How do you want to pay?</label>
                                        <div className="flex justify-center p-1 bg-muted rounded-xl max-w-xs mx-auto">
                                            <button
                                                className={cn(
                                                    "flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all",
                                                    formData.budgetType === "fixed" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                                                )}
                                                onClick={() => updateFormData({ budgetType: "fixed" })}
                                            >
                                                Fixed Price
                                            </button>
                                            <button
                                                className={cn(
                                                    "flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all",
                                                    formData.budgetType === "hourly" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                                                )}
                                                onClick={() => updateFormData({ budgetType: "hourly" })}
                                            >
                                                Hourly Rate
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-semibold">Budget Amount (US$)</label>
                                            <Input
                                                type="number"
                                                value={formData.budget[0]}
                                                onChange={(e) => updateFormData({ budget: [Number(e.target.value)] })}
                                                className="w-32 h-10 font-mono text-right"
                                            />
                                        </div>
                                        <Slider
                                            value={formData.budget}
                                            onValueChange={(val) => updateFormData({ budget: val })}
                                            max={20000}
                                            step={100}
                                            className="py-4"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold">Project Size</label>
                                            <div className="flex flex-col gap-2">
                                                {[
                                                    { id: 'small', label: 'Small', desc: '1-2 weeks, clear tasks' },
                                                    { id: 'medium', label: 'Medium', desc: '1-2 months, feature set' },
                                                    { id: 'large', label: 'Large', desc: '3+ months, complex app' }
                                                ].map((size) => (
                                                    <button
                                                        key={size.id}
                                                        onClick={() => updateFormData({ projectSize: size.id })}
                                                        className={cn(
                                                            "flex items-center justify-between p-3 rounded-xl border-2 transition-all",
                                                            formData.projectSize === size.id ? "border-primary bg-primary/5 shadow-sm" : "border-muted/50 hover:bg-muted/30"
                                                        )}
                                                    >
                                                        <div className="text-left">
                                                            <span className={cn("text-xs font-bold block", formData.projectSize === size.id ? "text-primary" : "text-foreground")}>{size.label}</span>
                                                            <span className="text-[10px] text-muted-foreground">{size.desc}</span>
                                                        </div>
                                                        {formData.projectSize === size.id && <Check className="w-4 h-4 text-primary" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold">Target Completion</label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full h-12 justify-start text-left font-normal",
                                                            !formData.deadline && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-3 h-4 w-4 opacity-50" />
                                                        {formData.deadline ? format(formData.deadline, "PPP") : "Select a date"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={formData.deadline}
                                                        onSelect={(d) => updateFormData({ deadline: d })}
                                                        initialFocus
                                                        disabled={(date) => date < new Date()}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <div className="bg-amber-500/5 p-3 rounded-lg border border-amber-500/10 flex gap-2">
                                                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                                                <p className="text-[10px] text-amber-700 leading-tight">Setting a realistic deadline ensures higher quality proposals.</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between pt-6 border-t">
                                    <Button variant="ghost" onClick={prevStep} className="gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </Button>
                                    <Button onClick={nextStep} disabled={!formData.deadline} className="gap-2 px-8">
                                        Next: Skills <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {/* Step 4: Skills & Preferences */}
                        {step === 4 && (
                            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Skills & Preferences</CardTitle>
                                    <CardDescription>Specify the level of expertise you are looking for.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-sm font-semibold">Required Tech Stack</label>
                                        <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-muted/20 rounded-xl border border-dashed border-muted">
                                            {formData.skills.map((skill) => (
                                                <Badge key={skill} variant="skill" className="pl-3 pr-1 py-1 h-8 text-sm gap-2">
                                                    {skill}
                                                    <button
                                                        onClick={() => updateFormData({ skills: formData.skills.filter(s => s !== skill) })}
                                                        className="hover:bg-white/20 rounded-full p-0.5"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                            {formData.skills.length === 0 && <span className="text-xs text-muted-foreground italic">Add skills below...</span>}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            {SKILL_SUGGESTIONS.filter(s => !formData.skills.includes(s)).map(skill => (
                                                <button
                                                    key={skill}
                                                    onClick={() => updateFormData({ skills: [...formData.skills, skill] })}
                                                    className="text-[11px] bg-background hover:bg-muted py-1.5 px-3 rounded-full transition-colors border border-border/40"
                                                >
                                                    + {skill}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-sm font-semibold">Experience Level</label>
                                            <div className="flex flex-col gap-2">
                                                {[
                                                    { id: 'entry', label: 'Entry Level', desc: 'Great for simple tasks' },
                                                    { id: 'intermediate', label: 'Intermediate', desc: 'Standard industrial quality' },
                                                    { id: 'expert', label: 'Expert', desc: 'Premium architectural work' }
                                                ].map((exp) => (
                                                    <button
                                                        key={exp.id}
                                                        onClick={() => updateFormData({ experienceLevel: exp.id })}
                                                        className={cn(
                                                            "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                                                            formData.experienceLevel === exp.id ? "border-primary bg-primary/5" : "border-muted/50 hover:bg-muted/30"
                                                        )}
                                                    >
                                                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0", formData.experienceLevel === exp.id ? "border-primary" : "border-muted")}>
                                                            {formData.experienceLevel === exp.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                                        </div>
                                                        <div className="text-left">
                                                            <span className="text-xs font-bold block">{exp.label}</span>
                                                            <span className="text-[10px] text-muted-foreground">{exp.desc}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-semibold">Hiring Method</label>
                                            <Card className="bg-muted/20 border-border/40 overflow-hidden">
                                                <button
                                                    className={cn(
                                                        "w-full flex items-center gap-4 p-4 text-left transition-all border-b border-border/40",
                                                        formData.hiringMethod === "bidding" ? "bg-background" : "opacity-60"
                                                    )}
                                                    onClick={() => updateFormData({ hiringMethod: "bidding" })}
                                                >
                                                    <MousePointer2 className={cn("w-5 h-5", formData.hiringMethod === "bidding" ? "text-primary" : "text-muted-foreground")} />
                                                    <div>
                                                        <span className="text-xs font-bold block">Open Bidding</span>
                                                        <span className="text-[10px] text-muted-foreground">Receive proposals from anyone</span>
                                                    </div>
                                                    {formData.hiringMethod === "bidding" && <Check className="ml-auto w-4 h-4 text-primary" />}
                                                </button>
                                                <button
                                                    className={cn(
                                                        "w-full flex items-center gap-4 p-4 text-left transition-all",
                                                        formData.hiringMethod === "direct" ? "bg-background" : "opacity-60"
                                                    )}
                                                    onClick={() => updateFormData({ hiringMethod: "direct" })}
                                                >
                                                    <Zap className={cn("w-5 h-5", formData.hiringMethod === "direct" ? "text-primary" : "text-muted-foreground")} />
                                                    <div>
                                                        <span className="text-xs font-bold block">Direct Invite</span>
                                                        <span className="text-[10px] text-muted-foreground">Invite specific developers only</span>
                                                    </div>
                                                    {formData.hiringMethod === "direct" && <Check className="ml-auto w-4 h-4 text-primary" />}
                                                </button>
                                            </Card>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between pt-6 border-t font-semibold">
                                    <Button variant="ghost" onClick={prevStep} className="gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </Button>
                                    <Button onClick={nextStep} disabled={formData.skills.length === 0} className="gap-2 px-8">
                                        Final Review <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {/* Step 5: Review & Post */}
                        {step === 5 && (
                            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl relative overflow-hidden">
                                <CardHeader className="text-center pb-2">
                                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <Check className="w-8 h-8 text-primary" />
                                    </div>
                                    <CardTitle className="text-3xl">Review Your Project</CardTitle>
                                    <CardDescription>Everything looks set to launch.</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    {/* Summary Grid */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* Basics Section */}
                                        <div className="p-5 rounded-xl bg-muted/30 border border-border/40 relative group">
                                            <button
                                                onClick={() => goToStep(1)}
                                                className="absolute right-4 top-4 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                EDIT
                                            </button>
                                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Basics</h4>
                                            <h2 className="text-xl font-bold mb-1">{formData.title}</h2>
                                            <Badge variant="outline" className="mb-3">{CATEGORIES.find(c => c.id === formData.category)?.name}</Badge>
                                            <p className="text-xs text-muted-foreground italic">"{formData.shortDesc}"</p>
                                        </div>

                                        {/* Budget/Time Section */}
                                        <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 relative group">
                                            <button
                                                onClick={() => goToStep(3)}
                                                className="absolute right-4 top-4 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                EDIT
                                            </button>
                                            <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Budget & Timeline</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-[10px] text-muted-foreground block">ESTIMATED BUDGET</span>
                                                    <span className="text-sm font-bold">${formData.budget[0].toLocaleString()}</span>
                                                    <span className="text-[9px] block uppercase font-bold text-primary">{formData.budgetType}</span>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] text-muted-foreground block">DEADLINE</span>
                                                    <span className="text-sm font-bold">{formData.deadline ? format(formData.deadline, "MMM d, yyyy") : "N/A"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Requirements Section */}
                                        <div className="p-5 rounded-xl bg-muted/30 border border-border/40 md:col-span-2 relative group">
                                            <button
                                                onClick={() => goToStep(2)}
                                                className="absolute right-4 top-4 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                EDIT
                                            </button>
                                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <FileText className="w-3 h-3" /> Description & Requirements
                                            </h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <span className="text-[10px] font-bold block mb-1">VISION:</span>
                                                    <p className="text-xs line-clamp-2 text-foreground/80 leading-relaxed">{formData.fullDesc}</p>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold block mb-1">FUNCTIONAL NEEDS:</span>
                                                    <p className="text-xs line-clamp-2 text-foreground/80 leading-relaxed">{formData.functionalReq}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Skills Section */}
                                        <div className="p-5 rounded-xl bg-muted/30 border border-border/40 md:col-span-2 relative group">
                                            <button
                                                onClick={() => goToStep(4)}
                                                className="absolute right-4 top-4 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                EDIT
                                            </button>
                                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Code2 className="w-3 h-3" /> Tech Stack & Experience
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.skills.map(s => <Badge key={s} variant="skill" className="bg-background">{s}</Badge>)}
                                                <Badge variant="secondary" className="uppercase text-[9px] ml-auto">{formData.experienceLevel} Level</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="flex flex-col md:flex-row gap-3 pt-6 border-t bg-muted/20 p-8">
                                    <div className="flex-1 flex items-center gap-2 text-xs text-muted-foreground pr-4">
                                        <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                                        <span>Launching this project will notify matching developers immediately.</span>
                                    </div>
                                    <Button
                                        className="w-full md:w-auto min-w-[200px] h-12 text-lg font-black gap-3 shadow-[0_10px_30px_-10px_rgba(var(--primary-rgb),0.5)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        onClick={() => {
                                            toast.success("Success! Project is now live on SkillBridge.");
                                        }}
                                    >
                                        Post Project <MousePointer2 className="w-5 h-5" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PostProjectPage;
