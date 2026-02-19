import { useState, useEffect } from "react";
import {
    Sparkles,
    ArrowRight,
    Search,
    Check,
    User,
    Star,
    DollarSign,
    Clock,
    ChevronRight,
    BrainCircuit,
    AlertCircle,
    Trophy,
    Activity,
    MessageSquare
} from "lucide-react";

import { cn } from "@/lib/utils";
import { DashboardLayout } from '@/components/layout/DashboardLayout';
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

// Mock Developers Data
const MOCK_DEVELOPERS = [
    {
        id: "dev-1",
        name: "Alex River",
        avatar: "https://i.pravatar.cc/150?u=alex",
        skills: ["React", "Node.js", "TypeScript"],
        experience: "expert",
        rate: 85,
        rating: 4.9,
        completedProjects: 124,
        specialty: "Full Stack Architecture",
    },
    {
        id: "dev-2",
        name: "Sarah Chen",
        avatar: "https://i.pravatar.cc/150?u=sarah",
        skills: ["Python", "TensorFlow", "PyTorch"],
        experience: "expert",
        rate: 95,
        rating: 5.0,
        completedProjects: 89,
        specialty: "AI & Machine Learning",
    },
    {
        id: "dev-3",
        name: "Jordan Smith",
        avatar: "https://i.pravatar.cc/150?u=jordan",
        skills: ["Figma", "React", "Tailwind"],
        experience: "intermediate",
        rate: 55,
        rating: 4.8,
        completedProjects: 45,
        specialty: "UI/UX & Frontend",
    },
    {
        id: "dev-4",
        name: "Maria Garcia",
        avatar: "https://i.pravatar.cc/150?u=maria",
        skills: ["Solidity", "Node.js", "Ethereum"],
        experience: "expert",
        rate: 110,
        rating: 4.7,
        completedProjects: 67,
        specialty: "Blockchain Development",
    },
    {
        id: "dev-5",
        name: "Tom Wilson",
        avatar: "https://i.pravatar.cc/150?u=tom",
        skills: ["PHP", "Laravel", "MySQL"],
        experience: "intermediate",
        rate: 45,
        rating: 4.6,
        completedProjects: 112,
        specialty: "Backend Systems",
    },
];

const HelpMeFindPage = () => {
    const [step, setStep] = useState(1); // 1 = Survey, 2 = AI Matches
    const [loading, setLoading] = useState(false);
    const [matches, setMatches] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [form, setForm] = useState({
        workType: "",
        projectSize: "",
        budgetRange: "",
        experience: "",
        urgency: "",
    });

    const filteredDevelopers = MOCK_DEVELOPERS.filter(dev =>
        dev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dev.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        dev.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleMatch = () => {
        if (!form.workType || !form.projectSize || !form.budgetRange || !form.experience || !form.urgency) {
            toast.error("Please answer all questions first.");
            return;
        }

        setLoading(true);
        // Simulate AI Analysis
        setTimeout(() => {
            const results = MOCK_DEVELOPERS.map(dev => {
                let matchScore = 70 + Math.floor(Math.random() * 25); // Baseline 70-95%

                // Deterministic weighting based on inputs
                if (form.experience === dev.experience) matchScore += 5;
                if (form.workType === "ai" && dev.specialty.includes("AI")) matchScore += 10;
                if (form.workType === "web" && dev.specialty.includes("Architecture")) matchScore += 5;
                if (form.budgetRange === "high" && dev.rate > 80) matchScore += 5;

                return {
                    ...dev,
                    matchPercentage: Math.min(matchScore, 99),
                    reason: `Matches your requirement for ${form.experience} ${form.workType} expertise with proven ${dev.specialty} skills.`
                };
            }).sort((a, b) => b.matchPercentage - a.matchPercentage);

            setMatches(results.slice(0, 3));
            setLoading(false);
            setStep(2);
            toast.success("AI Matching Complete!");
        }, 3000);
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-6">
                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg">
                        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight">Help Me Find a Developer</h1>
                        <p className="text-muted-foreground mt-2 max-w-xl">
                            Search our elite talent pool or use our AI matching engine to find your perfect technical partner.
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="search" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                        <TabsTrigger value="search" className="gap-2">
                            <Search className="w-4 h-4" /> Quick Search
                        </TabsTrigger>
                        <TabsTrigger value="ai" className="gap-2">
                            <Sparkles className="w-4 h-4" /> AI Specialist Matching
                        </TabsTrigger>
                    </TabsList>

                    {/* Quick Search Tab */}
                    <TabsContent value="search" className="space-y-6 animate-fade-up">
                        <div className="relative max-w-2xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, skills (e.g. React, Python), or specialty..."
                                className="h-14 pl-12 text-lg border-primary/10 bg-card/50 backdrop-blur-sm focus-visible:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-6 mt-8">
                            {filteredDevelopers.map((dev) => (
                                <Card key={dev.id} className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden transition-all hover:shadow-xl hover:border-primary/20">
                                    <div className="flex flex-col md:flex-row items-center gap-6 p-6">
                                        <Avatar className="h-20 w-20 border-2 border-background shadow-md">
                                            <AvatarImage src={dev.avatar} />
                                            <AvatarFallback>{dev.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 text-center md:text-left space-y-1">
                                            <div className="flex items-center justify-center md:justify-start gap-2">
                                                <h3 className="text-xl font-bold">{dev.name}</h3>
                                                <Badge variant="skill" className="text-[10px] py-0">{dev.experience}</Badge>
                                            </div>
                                            <p className="text-sm font-medium text-primary">{dev.specialty}</p>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                                                {dev.skills.map(s => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center md:items-end gap-3 min-w-[150px]">
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <Star className="w-4 h-4 fill-current" />
                                                <span className="text-sm font-bold text-foreground">{dev.rating}</span>
                                            </div>
                                            <div className="text-xl font-black">${dev.rate}<span className="text-xs text-muted-foreground font-normal">/hr</span></div>
                                            <Button size="sm" className="w-full gap-2">
                                                <MessageSquare className="w-4 h-4" /> Contact
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {filteredDevelopers.length === 0 && (
                                <div className="text-center py-20 space-y-4">
                                    <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                        <Search className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground">No developers found matching your search. Try different keywords or use AI matching!</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* AI Specialist Matching Tab */}
                    <TabsContent value="ai" className="space-y-6">
                        {step === 1 && !loading && (
                            <Card className="border-border/40 bg-card/50 backdrop-blur-md shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                    <BrainCircuit className="w-64 h-64 -mr-20 -mt-20" />
                                </div>

                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-primary" />
                                        AI Matching Algorithm
                                    </CardTitle>
                                    <CardDescription>Guided matching to find technical specialist tailored to your specific scope.</CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Q1: Type of work */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold flex items-center gap-2">1. Work Specialization</label>
                                            <Select onValueChange={(v) => setForm({ ...form, workType: v })}>
                                                <SelectTrigger className="h-12 bg-background/50 border-primary/10 transition-all hover:border-primary/30">
                                                    <SelectValue placeholder="Select Area" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="web">Web App Architecture</SelectItem>
                                                    <SelectItem value="mobile">Native Mobile Apps</SelectItem>
                                                    <SelectItem value="ai">AI/ML Engineering</SelectItem>
                                                    <SelectItem value="design">UI/UX Strategy</SelectItem>
                                                    <SelectItem value="blockchain">Smart Contract Dev</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Q2: Project Size */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold flex items-center gap-2">2. Scope & Scale</label>
                                            <Select onValueChange={(v) => setForm({ ...form, projectSize: v })}>
                                                <SelectTrigger className="h-12 bg-background/50 border-primary/10 transition-all hover:border-primary/30">
                                                    <SelectValue placeholder="Scale" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="small">Small MVP (Quick Latency)</SelectItem>
                                                    <SelectItem value="medium">Standard Product (Balanced)</SelectItem>
                                                    <SelectItem value="large">Enterprise Custom (Complex)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Q3: Budget Range */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold flex items-center gap-2">3. Financial Allocation</label>
                                            <Select onValueChange={(v) => setForm({ ...form, budgetRange: v })}>
                                                <SelectTrigger className="h-12 bg-background/50 border-primary/10 transition-all hover:border-primary/30">
                                                    <SelectValue placeholder="Select Range" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">$500 - $2,000</SelectItem>
                                                    <SelectItem value="mid">$2,000 - $10,000</SelectItem>
                                                    <SelectItem value="high">$10,000 +</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Q4: Experience */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold flex items-center gap-2">4. Technical Oversight</label>
                                            <Select onValueChange={(v) => setForm({ ...form, experience: v })}>
                                                <SelectTrigger className="h-12 bg-background/50 border-primary/10 transition-all hover:border-primary/30">
                                                    <SelectValue placeholder="Seniority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="entry">Entry (Tasks Only)</SelectItem>
                                                    <SelectItem value="intermediate">Mid-Level (Feature Dev)</SelectItem>
                                                    <SelectItem value="expert">Expert (Platform Logic)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3 md:col-span-2">
                                            <label className="text-sm font-bold flex items-center gap-2">5. Deployment Urgency</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {['low', 'mid', 'high'].map(id => (
                                                    <button key={id} onClick={() => setForm({ ...form, urgency: id })}
                                                        className={cn("h-12 rounded-lg border-2 text-xs font-bold transition-all capitalize",
                                                            form.urgency === id ? "bg-primary/10 border-primary text-primary" : "border-muted hover:border-muted/50")}>
                                                        {id === 'low' ? 'Planning' : id === 'mid' ? 'Active' : 'Critical'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-6 border-t bg-primary/5">
                                    <Button onClick={handleMatch} className="w-full h-14 text-lg font-black gap-3 shadow-xl shadow-primary/20">
                                        Run AI Analysis <Sparkles className="w-5 h-5" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {loading && (
                            <div className="flex flex-col items-center justify-center py-20 space-y-8 animate-in fade-in zoom-in duration-500">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-4 border-primary/20 animate-spin border-t-primary" />
                                    <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-primary" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-bold">Matching Project Nuance...</h3>
                                    <p className="text-muted-foreground animate-pulse italic">Leveraging SkillBridge heuristics for elite pairing...</p>
                                </div>
                                <Progress value={undefined} className="h-2 w-full max-w-md" />
                            </div>
                        )}

                        {step === 2 && !loading && (
                            <div className="space-y-6 animate-fade-up">
                                <div className="flex items-center justify-between bg-muted/30 p-4 rounded-xl border border-border/40">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="w-6 h-6 text-yellow-500" />
                                        <h2 className="text-xl font-bold">AI Recommended Technical Partners</h2>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setStep(1)} className="text-xs h-8">Modify Inputs</Button>
                                </div>

                                <div className="grid gap-6">
                                    {matches.map((dev, index) => (
                                        <Card key={dev.id} className={cn(
                                            "border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden transition-all hover:shadow-xl hover:border-primary/20",
                                            index === 0 && "ring-2 ring-primary ring-offset-4 ring-offset-background"
                                        )}>
                                            <div className="grid md:grid-cols-[1fr_2.5fr] gap-0">
                                                <div className="p-6 bg-muted/40 border-r border-border/40 flex flex-col items-center text-center space-y-4">
                                                    <div className="relative">
                                                        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                                            <AvatarImage src={dev.avatar} />
                                                            <AvatarFallback>{dev.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="absolute -bottom-2 -left-2 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                                                            {dev.matchPercentage}% MATCH
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-bold">{dev.name}</h3>
                                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{dev.specialty}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-yellow-500">
                                                        <Star className="w-3.5 h-3.5 fill-current" />
                                                        <span className="text-sm font-bold text-foreground">{dev.rating}</span>
                                                    </div>
                                                </div>

                                                <div className="p-8 space-y-6 flex flex-col justify-between">
                                                    <div className="space-y-4 text-left">
                                                        <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-xl border border-primary/20">
                                                            <BrainCircuit className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                            <p className="text-xs text-foreground/80 leading-relaxed">
                                                                <span className="font-bold text-primary italic">Match Rational: </span>
                                                                {dev.reason}
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {dev.skills.map(s => <Badge key={s} variant="outline" className="text-[9px] bg-background/50">{s}</Badge>)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                                                        <div className="text-2xl font-black text-primary">${dev.rate}<span className="text-xs text-muted-foreground font-normal">/hr</span></div>
                                                        <div className="flex gap-2">
                                                            <Button variant="ghost" size="sm" className="h-10 text-xs">Profile</Button>
                                                            <Button size="sm" className="h-10 px-6 gap-2">Message</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 flex gap-3 items-center">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700 leading-tight">All profiles are verified SkillBridge members. Match scores are dynamic and subject to developer availability.</p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default HelpMeFindPage;
