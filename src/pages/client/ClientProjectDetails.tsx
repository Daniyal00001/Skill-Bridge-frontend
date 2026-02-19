import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    CheckCircle,
    MessageSquare,
    Clock,
    MapPin,
    Star,
    MoreVertical,
    Share2,
    AlertCircle,
    FileText,
    Download,
    RefreshCw,
    ShieldCheck,
    CreditCard,
    Users
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock Data for the specific project
const MOCK_PROJECT_DETAILS = {
    id: "1",
    title: "E-Commerce Mobile App Redesign",
    description: `Complete UI/UX overhaul based on provided Figma designs. Performance optimization and integration with REST API.`,
    status: "under_review", // Current status for demo
    budget: { min: 5000, max: 8000 },
    deadline: "2024-04-15",
    createdAt: "2024-01-10",
    skills: ["React Native", "TypeScript", "UI/UX"],
    hiredDeveloper: {
        id: "dev-1",
        name: "Alex Chen",
        title: "Senior Full Stack Developer",
        rating: 4.9,
        reviewCount: 47,
        avatar: "https://i.pravatar.cc/150?u=alex",
    },
    lastSubmission: {
        version: "1.2",
        submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
        notes: "I've completed the login flow and product listing animations. Please check the checkout page logic.",
        files: ["Design_Specs.pdf", "Main_App_Bundle.zip"]
    }
};

const ClientProjectDetailsPage = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(MOCK_PROJECT_DETAILS);
    const [timeLeft, setTimeLeft] = useState("23:59:59"); // Mock 48h limit (24h left)
    const [showPayment, setShowPayment] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Mock Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            // Just a visual simulation
            setTimeLeft(prev => {
                const parts = prev.split(':').map(Number);
                if (parts[2] > 0) parts[2]--;
                else if (parts[1] > 0) { parts[1]--; parts[2] = 59; }
                else if (parts[0] > 0) { parts[0]--; parts[1] = 59; parts[2] = 59; }
                return parts.map(v => v.toString().padStart(2, '0')).join(':');
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleAcceptAndPay = () => {
        setProcessing(true);
        setTimeout(() => {
            setProject(prev => ({ ...prev, status: 'completed' }));
            setShowPayment(false);
            setProcessing(false);
            toast.success("Payment successful! Project marked as completed.");
        }, 2000);
    };

    const handleRequestRevision = () => {
        toast.info("Opening revision request dialog...");
        setProject(prev => ({ ...prev, status: 'needs_revision' }));
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "open": return "bg-green-500/10 text-green-600 border-green-500/20";
            case "in_progress": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            case "under_review": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
            case "needs_revision": return "bg-rose-500/10 text-rose-600 border-rose-500/20";
            case "completed": return "bg-gray-500/10 text-gray-600 border-gray-500/20";
            default: return "";
        }
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in relative">

                {/* Payment Mockup Overlay */}
                {showPayment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                        <Card className="w-full max-w-md shadow-2xl border-primary/20 bg-card overflow-hidden">
                            <CardHeader className="bg-primary/5 pb-6">
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldCheck className="w-6 h-6 text-primary" />
                                    Secure Release Payment
                                </CardTitle>
                                <CardDescription>Confirm and transfer funds to the freelancer.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-3">
                                    <div className="flex justify-between font-medium">
                                        <span className="text-muted-foreground">Contract Amount</span>
                                        <span>$7,500.00</span>
                                    </div>
                                    <div className="flex justify-between font-medium text-green-600">
                                        <span>Service Fee</span>
                                        <span>$0.00 (SkillBridge Promo)</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total Release</span>
                                        <span className="text-primary">$7,500.00</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fund Source</Label>
                                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-background/50">
                                        <div className="h-10 w-12 bg-muted rounded flex items-center justify-center">
                                            <CreditCard className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-bold">SkillBridge Escrow</p>
                                            <p className="text-xs text-muted-foreground">Funds currently held securely</p>
                                        </div>
                                        <CheckCircle className="ml-auto w-5 h-5 text-primary" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3 pb-8 px-6">
                                <Button
                                    className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                                    onClick={handleAcceptAndPay}
                                    disabled={processing}
                                >
                                    {processing ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : "Confirm & Release Funds"}
                                </Button>
                                <Button variant="ghost" className="w-full" onClick={() => setShowPayment(false)} disabled={processing}>Cancel</Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                {/* Back Link */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" className="pl-0 gap-2 text-muted-foreground" asChild>
                        <Link to="/client/projects"><ArrowLeft className="h-4 w-4" /> Management Dashboard</Link>
                    </Button>
                </div>

                <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                    <div className="space-y-8">
                        {/* Status Alert for Reviews */}
                        {project.status === 'under_review' && (
                            <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-pulse-subtle">
                                <div className="h-14 w-14 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-600 shadow-inner">
                                    <Clock className="w-8 h-8" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-lg font-bold text-orange-900 dark:text-orange-100">Pending Verification</h3>
                                    <p className="text-sm text-orange-800/70 dark:text-orange-400">
                                        A freelancer has submitted work. You have **48 hours** to verify or request revisions before auto-acceptance.
                                    </p>
                                </div>
                                <div className="bg-orange-500 text-white px-6 py-2 rounded-xl font-mono font-bold text-xl shadow-lg border-b-2 border-orange-700">
                                    {timeLeft}
                                </div>
                            </div>
                        )}

                        <Card className="overflow-hidden border-border/40 shadow-xl bg-card/50 backdrop-blur-sm">
                            <CardHeader className="bg-muted/30 border-b p-8">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="space-y-3">
                                        <Badge variant="outline" className={cn("px-4 py-1 text-xs font-black uppercase tracking-widest", getStatusBadgeClass(project.status))}>
                                            {project.status.replace("_", " ")}
                                        </Badge>
                                        <h1 className="text-4xl font-extrabold tracking-tight">{project.title}</h1>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Jan 10</span>
                                            <span className="flex items-center gap-1 font-bold text-foreground underline underline-offset-4 decoration-primary/30">
                                                <Users className="w-4 h-4" /> {project.hiredDeveloper.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 self-start md:self-center">
                                        <Button variant="outline" size="icon" className="rounded-full"><Share2 className="w-4 h-4" /></Button>
                                        <Button variant="outline" size="icon" className="rounded-full"><MoreVertical className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-primary uppercase tracking-widest">Total Budget</p>
                                            <p className="text-2xl font-black">${project.budget.max}</p>
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-muted/50 border border-border/40 flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shadow-sm">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Deadline</p>
                                            <p className="text-2xl font-black">Apr 15</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-primary" /> Project Overview
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed text-lg italic">
                                        "{project.description}"
                                    </p>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {project.skills.map(s => (
                                            <Badge key={s} variant="secondary" className="bg-primary/5 hover:bg-primary/10 transition-colors uppercase text-[10px] font-bold tracking-tighter">
                                                {s}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {project.lastSubmission && (
                                    <div className="p-6 rounded-2xl border-2 border-primary/20 bg-primary/5 space-y-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                            <CheckCircle className="w-24 h-24" />
                                        </div>
                                        <div className="flex justify-between items-start relative z-10">
                                            <h3 className="text-xl font-black text-primary flex items-center gap-2 uppercase tracking-tight">
                                                <RefreshCw className="w-5 h-5" /> Submission v{project.lastSubmission.version}
                                            </h3>
                                            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">Recently Submitted</Badge>
                                        </div>
                                        <p className="text-muted-foreground bg-background/50 p-4 rounded-xl border border-border/40 italic">
                                            "{project.lastSubmission.notes}"
                                        </p>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {project.lastSubmission.files.map(f => (
                                                <Button key={f} variant="outline" className="justify-between bg-background/50 border-border/60 hover:bg-background">
                                                    <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> {f}</span>
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Quick Actions Side Card */}
                        <Card className="bg-primary text-primary-foreground shadow-2xl overflow-hidden relative">
                            <div className="absolute -right-8 -bottom-8 opacity-20 pointer-events-none">
                                <ShieldCheck className="w-48 h-48" />
                            </div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">Contract Controls</CardTitle>
                                <CardDescription className="text-primary-foreground/70">Review and finalize work</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <Button
                                    className="w-full bg-white text-primary hover:bg-white/90 h-14 text-lg font-black shadow-xl"
                                    onClick={() => setShowPayment(true)}
                                    disabled={project.status !== 'under_review'}
                                >
                                    Approve & Release Funds
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full border-white/40 hover:bg-white/10 h-14 font-bold"
                                    onClick={handleRequestRevision}
                                    disabled={project.status !== 'under_review'}
                                >
                                    Request Revision
                                </Button>
                            </CardContent>
                            <CardFooter className="bg-black/10 p-4 flex justify-between items-center text-xs font-bold uppercase tracking-widest border-t border-white/10">
                                <span>Status Guarantee active</span>
                                <ShieldCheck className="w-4 h-4" />
                            </CardFooter>
                        </Card>

                        {/* Professional Contact */}
                        <Card className="border-border/40">
                            <CardContent className="pt-8">
                                <div className="flex flex-col items-center text-center space-y-6">
                                    <div className="relative">
                                        <Avatar className="h-24 w-24 border-4 border-background ring-4 ring-primary/10">
                                            <AvatarImage src={project.hiredDeveloper.avatar} />
                                            <AvatarFallback>AC</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-background" title="Developer is online"></div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-black text-xl">{project.hiredDeveloper.name}</h3>
                                        <p className="text-muted-foreground font-medium">{project.hiredDeveloper.title}</p>
                                    </div>
                                    <Button className="w-full gap-2 rounded-xl h-12 font-bold" variant="secondary">
                                        <MessageSquare className="w-5 h-5" /> Instant Message
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ClientProjectDetailsPage;
