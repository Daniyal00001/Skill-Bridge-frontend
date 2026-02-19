import { useState, useEffect } from "react";
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
    Briefcase
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
    const [aiResults, setAiResults] = useState<null | {
        scope: string;
        complexity: string;
        budgetRange: string;
        skills: string[];
    }>(null);

    const [formData, setFormData] = useState({
        title: "",
        category: "",
        shortDesc: "",
        fullDesc: "",
        budget: [5000],
        type: "fixed",
        skills: [] as string[],
        deadline: undefined as Date | undefined,
    });

    const updateFormData = (updates: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleAnalyzeAI = () => {
        if (!formData.fullDesc || formData.fullDesc.length < 50) {
            toast.error("Please provide a more detailed description for better AI analysis (at least 50 characters).");
            return;
        }

        setIsAnalyzing(true);
        setTimeout(() => {
            setIsAnalyzing(false);
            const mockAi = {
                scope: "Full-stack development of a feature-rich application including user authentication, real-time updates, and an intuitive dashboard interface.",
                complexity: "Advanced / High Complexity",
                budgetRange: "$4,500 - $7,200",
                skills: ["React", "TypeScript", "Node.js", "Tailwind CSS"]
            };
            setAiResults(mockAi);
            updateFormData({
                skills: Array.from(new Set([...formData.skills, ...mockAi.skills])),
                budget: [5000]
            });
            toast.success("AI Scope Analysis Complete!");
        }, 2500);
    };

    const steps = [
        { id: 1, name: "Basics" },
        { id: 2, name: "AI Scoping" },
        { id: 3, name: "Details" },
        { id: 4, name: "Review" },
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
                            Post your masterpiece
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-lg">
                            Follow our AI-guided process to find the perfect developers for your vision.
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
                        {/* Connecting LineBackground */}
                        <div className="absolute top-9 left-10 right-10 h-0.5 bg-muted -z-0" />
                        {/* Active Line Progress */}
                        <div
                            className="absolute top-9 left-10 h-0.5 bg-primary transition-all duration-500 ease-in-out -z-0"
                            style={{ width: `${((step - 1) / (steps.length - 1)) * 92}%` }}
                        />
                    </div>

                    {/* Content Section */}
                    <div className="animate-fade-up">
                        {step === 1 && (
                            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Project Basics</CardTitle>
                                    <CardDescription>Start with the high-level details of your project.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Project Title</label>
                                        <Input
                                            placeholder="e.g., Build a modern SaaS Analytics Dashboard"
                                            value={formData.title}
                                            onChange={(e) => updateFormData({ title: e.target.value })}
                                            className="h-12 text-lg focus-visible:ring-primary/30"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-sm font-semibold">Project Category</label>
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
                                            placeholder="A brief hook for developers"
                                            value={formData.shortDesc}
                                            onChange={(e) => updateFormData({ shortDesc: e.target.value })}
                                            className="h-12"
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end pt-6 border-t">
                                    <Button onClick={nextStep} disabled={!formData.title || !formData.category} className="gap-2 px-8 h-12">
                                        Continue to AI Scoping <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {step === 2 && (
                            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm shadow-xl relative overflow-hidden">
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
                                <CardHeader>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="w-5 h-5 text-primary" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-primary">AI Powered Assistant</span>
                                    </div>
                                    <CardTitle className="text-2xl">Describe your vision</CardTitle>
                                    <CardDescription>Our AI will analyze your description to generate target scoping, skills, and budget estimates.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="space-y-2">
                                        <Textarea
                                            placeholder="Tell us exactly what you want to build. What are the core features? What problem does it solve? What's the tech vision?"
                                            className="min-h-[220px] text-base leading-relaxed p-6 focus-visible:ring-primary/30"
                                            value={formData.fullDesc}
                                            onChange={(e) => updateFormData({ fullDesc: e.target.value })}
                                        />
                                        <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                                            <span>Minimum 50 characters for AI analysis</span>
                                            <span>{formData.fullDesc.length} characters</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-center">
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "relative overflow-hidden group px-8 h-12 border-primary/50 text-foreground transition-all hover:bg-primary hover:text-primary-foreground",
                                                isAnalyzing && "bg-primary/5"
                                            )}
                                            onClick={handleAnalyzeAI}
                                            disabled={isAnalyzing}
                                        >
                                            {isAnalyzing ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-4 h-4 border-2 border-t-transparent border-primary-foreground animate-spin rounded-full" />
                                                    <span>AI is thinking...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4 mr-2 transition-transform group-hover:rotate-12" />
                                                    {aiResults ? "Re-analyze Project" : "Analyze with AI"}
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {aiResults && (
                                        <div className="grid md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-700">
                                            <Card className="bg-primary/5 border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.05)]">
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-center gap-2 text-primary">
                                                        <Briefcase className="w-4 h-4" />
                                                        <span className="text-xs font-bold uppercase tracking-widest">Suggested Scope</span>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm leading-relaxed">{aiResults.scope}</p>
                                                </CardContent>
                                            </Card>
                                            <Card className="bg-primary/5 border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.05)]">
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-center gap-2 text-primary">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="text-xs font-bold uppercase tracking-widest">Estimation</span>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-muted-foreground">Complexity:</span>
                                                        <span className="text-sm font-semibold">{aiResults.complexity}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-muted-foreground">Budget Range:</span>
                                                        <span className="text-sm font-semibold text-primary">{aiResults.budgetRange}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex justify-between pt-6 border-t bg-muted/20">
                                    <Button variant="ghost" onClick={prevStep} className="gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </Button>
                                    <Button onClick={nextStep} disabled={!aiResults} className="gap-2 px-8">
                                        Next: Finalize Details <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {step === 3 && (
                            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Project Details</CardTitle>
                                    <CardDescription>Fine-tune the specifics for your project.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-semibold">Budget (US$)</label>
                                            <Badge variant="secondary" className="text-lg font-mono">
                                                ${formData.budget[0].toLocaleString()}
                                            </Badge>
                                        </div>
                                        <Slider
                                            value={formData.budget}
                                            onValueChange={(val) => updateFormData({ budget: val })}
                                            max={20000}
                                            step={100}
                                            className="py-4 cursor-pointer"
                                        />
                                        <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold px-1">
                                            <span>$100 (Minimal)</span>
                                            <span>$10,000 (Standard)</span>
                                            <span>$20,000+ (Premium)</span>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold">Target Deadline</label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full h-12 justify-start text-left font-normal",
                                                            !formData.deadline && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-3 h-4 w-4 opacity-50" />
                                                        {formData.deadline ? format(formData.deadline, "PPP") : "Pick a completion date"}
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
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold">Project Type</label>
                                            <div className="grid grid-cols-2 gap-2 h-12">
                                                <button
                                                    onClick={() => updateFormData({ type: "fixed" })}
                                                    className={cn(
                                                        "rounded-lg border-2 text-xs font-bold transition-all",
                                                        formData.type === "fixed" ? "bg-primary text-primary-foreground border-primary" : "bg-background border-muted text-muted-foreground"
                                                    )}
                                                >
                                                    Fixed Price
                                                </button>
                                                <button
                                                    onClick={() => updateFormData({ type: "hourly" })}
                                                    className={cn(
                                                        "rounded-lg border-2 text-xs font-bold transition-all",
                                                        formData.type === "hourly" ? "bg-primary text-primary-foreground border-primary" : "bg-background border-muted text-muted-foreground"
                                                    )}
                                                >
                                                    Hourly Rate
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold">Required Tech Stack</label>
                                        <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-4 bg-muted/20 rounded-xl border border-dashed border-muted">
                                            {formData.skills.length === 0 && <span className="text-muted-foreground text-xs italic">No skills selected yet...</span>}
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
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-widest">Quick Add Skills</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {SKILL_SUGGESTIONS.filter(s => !formData.skills.includes(s)).slice(0, 8).map(skill => (
                                                    <button
                                                        key={skill}
                                                        onClick={() => updateFormData({ skills: [...formData.skills, skill] })}
                                                        className="text-xs bg-muted/40 hover:bg-muted py-1.5 px-3 rounded-full transition-colors border border-border/40"
                                                    >
                                                        + {skill}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between pt-6 border-t font-semibold">
                                    <Button variant="ghost" onClick={prevStep} className="gap-2">
                                        <ArrowLeft className="w-4 h-4" /> Back
                                    </Button>
                                    <Button onClick={nextStep} disabled={formData.skills.length === 0 || !formData.deadline} className="gap-2 px-8">
                                        Final Review <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {step === 4 && (
                            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl relative overflow-hidden">
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />

                                <CardHeader className="text-center">
                                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                        <Sparkles className="w-8 h-8 text-primary" />
                                    </div>
                                    <CardTitle className="text-3xl">Ready for Launch</CardTitle>
                                    <CardDescription>Everything looks set. Launching this project will make it visible to top-tier developers.</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="p-6 rounded-xl bg-muted/30 border border-border/40 md:col-span-2">
                                            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Project Overview</h4>
                                            <h2 className="text-2xl font-extrabold mb-3">{formData.title}</h2>
                                            <Badge variant="secondary" className="mb-6 px-3 py-1">
                                                {CATEGORIES.find(c => c.id === formData.category)?.name}
                                            </Badge>
                                            <p className="text-sm text-foreground/80 leading-relaxed italic border-l-2 border-primary/30 pl-4 py-1">
                                                "{formData.shortDesc}"
                                            </p>
                                        </div>
                                        <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 flex flex-col justify-center space-y-6">
                                            <div>
                                                <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Total Budget</h4>
                                                <p className="text-2xl font-black">${formData.budget[0].toLocaleString()}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold">{formData.type} CONTRACT</p>
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1">Deadline</h4>
                                                <p className="text-sm font-bold">{formData.deadline ? format(formData.deadline, "MMM d, yyyy") : "N/A"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-6 rounded-xl border border-dashed border-muted bg-background/30">
                                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Code2 className="w-4 h-4 text-primary" />
                                            Confirmed Tech Stack
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.skills.map(s => (
                                                <Badge key={s} variant="skill" className="bg-background border-primary/30">{s}</Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-5 rounded-xl bg-primary/5 border border-primary/10 text-primary">
                                        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                                        <div className="text-xs space-y-1">
                                            <p className="font-bold uppercase tracking-wider">SkillBridge Strategy:</p>
                                            <p className="opacity-80">This project matches current trends. Following the AI suggestions for tech stack increases conversion by up to 40%.</p>
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="flex flex-col md:flex-row gap-3 pt-6 border-t bg-muted/20 p-8">
                                    <Button variant="ghost" onClick={prevStep} className="w-full md:w-auto h-12 px-8 font-bold">
                                        Edit Details
                                    </Button>
                                    <Button
                                        className="w-full md:flex-1 h-12 text-lg font-black gap-3 shadow-[0_10px_30px_-10px_rgba(var(--primary-rgb),0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        onClick={() => {
                                            toast.success("Project posted to SkillBridge marketplace!");
                                            // Redirect or reset logic here
                                        }}
                                    >
                                        POST PROJECT NOW <Sparkles className="w-5 h-5" />
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
