import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    User,
    Lock,
    Building,
    Mail,
    Camera,
    Loader2,
    Briefcase,
    Globe,
    Info,
    CreditCard,
    CheckCircle2,
    MapPin,
    Clock,
    Calendar,
    Award,
    ShieldCheck,
    Activity,
    Trophy,
    Star
} from "lucide-react";

// Mock User Data
const MOCK_USER = {
    name: "John Client",
    email: "john@techcorp.com",
    company: "TechCorp Inc.",
    avatar: "https://github.com/shadcn.png",
    bio: "Visionary entrepreneur focused on scaling AI-driven SaaS platforms. Looking for top-tier developers who value code quality and long-term collaboration.",
    companyType: "Startup",
    industry: "e-commerce",
    hiringPreference: "Hourly",
    budgetRange: "Medium",
    experienceLevel: "Expert",
    commMethod: "Slack/Messages",
    timezone: "UTC+5",
    availability: "Part-time (20hrs/week)",
    totalProjects: 14,
    completedProjects: 12,
    avgRating: 4.8,
    memberSince: "Jan 2024",
    emailVerified: true,
    paymentVerified: true,
    profileCompletion: 85
};

const ClientSettingsPage = () => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(MOCK_USER);

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success("Profile updated successfully");
        }, 1000);
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success("Password updated successfully");
            // Reset form logic here
        }, 1500);
    };

    return (
        <DashboardLayout>
            <div className="container max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight">Settings</h1>
                        <p className="text-muted-foreground mt-1 text-lg">
                            Manage your client identity and platform preferences.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <span className="text-sm font-bold text-primary">Trust Level: High</span>
                    </div>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList className="bg-muted/50 p-1">
                        <TabsTrigger value="profile" className="gap-2">
                            <User className="h-4 w-4" /> Public Profile
                        </TabsTrigger>
                        <TabsTrigger value="password" className="gap-2">
                            <Lock className="h-4 w-4" /> Security
                        </TabsTrigger>
                    </TabsList>

                    {/* Unified Profile Tab */}
                    <TabsContent value="profile" className="animate-in fade-in-50 duration-500">
                        <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
                            <div className="space-y-6">
                                <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl">
                                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                                        <CardTitle className="flex items-center gap-2">
                                            <Briefcase className="h-5 w-5 text-primary" />
                                            Professional Identity
                                        </CardTitle>
                                        <CardDescription>This information will be visible to other members on the platform.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 space-y-8">
                                        {/* Section 1: Basic Identity */}
                                        <div className="space-y-6">
                                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                                <div className="relative group">
                                                    <Avatar className="h-28 w-28 cursor-pointer border-4 border-background shadow-xl hover:border-primary/50 transition-all duration-300">
                                                        <AvatarImage src={user.avatar} />
                                                        <AvatarFallback>JC</AvatarFallback>
                                                    </Avatar>
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                        <Camera className="h-8 w-8 text-white" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-center sm:text-left text-balance">
                                                    <h3 className="text-lg font-bold">Profile Display</h3>
                                                    <p className="text-sm text-muted-foreground max-w-xs">
                                                        Use a professional photo to build trust with developers and collaborators.
                                                    </p>
                                                    <Button type="button" variant="outline" size="sm" className="h-8">
                                                        Update Photo
                                                    </Button>
                                                </div>
                                            </div>

                                            <Separator className="opacity-50" />

                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name" className="text-sm font-bold">Full Name</Label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="name"
                                                            className="pl-10 h-11 bg-background/50"
                                                            defaultValue={user.name}
                                                            onChange={(e) => setUser({ ...user, name: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-left">
                                                    <Label htmlFor="company" className="text-sm font-bold">Organization / Company</Label>
                                                    <div className="relative">
                                                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="company"
                                                            className="pl-10 h-11 bg-background/50"
                                                            defaultValue={user.company}
                                                            onChange={(e) => setUser({ ...user, company: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2 md:col-span-2 text-left">
                                                    <Label htmlFor="email" className="text-sm font-bold">Professional Email</Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            className="pl-10 h-11 bg-background/50 cursor-not-allowed opacity-70"
                                                            defaultValue={user.email}
                                                            disabled
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground italic mt-1">Direct contact email for platform notifications.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator className="opacity-50" />

                                        {/* Section 2: Bio & Domain */}
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Professional Overview</Label>
                                                    <span className="text-[10px] font-medium text-muted-foreground">About you & your mission</span>
                                                </div>
                                                <Textarea
                                                    placeholder="Tell the community about your goals, typical projects, and what you value in a partnership..."
                                                    className="min-h-[120px] bg-background/50 resize-none leading-relaxed"
                                                    defaultValue={user.bio}
                                                    onChange={(e) => setUser({ ...user, bio: e.target.value })}
                                                />
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <Label className="text-sm font-bold">Profile Type</Label>
                                                    <Select onValueChange={(v) => setUser({ ...user, companyType: v })} defaultValue={user.companyType}>
                                                        <SelectTrigger className="h-11 bg-background/50">
                                                            <SelectValue placeholder="Select Type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Individual">Individual Freelancer / Client</SelectItem>
                                                            <SelectItem value="Startup">Startup / Lean Team</SelectItem>
                                                            <SelectItem value="Small Business">Small Business</SelectItem>
                                                            <SelectItem value="Enterprise">Enterprise Entity</SelectItem>
                                                            <SelectItem value="Agency">Agency / Studio</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-3">
                                                    <Label className="text-sm font-bold">Primary Domain</Label>
                                                    <Select onValueChange={(v) => setUser({ ...user, industry: v })} defaultValue={user.industry}>
                                                        <SelectTrigger className="h-11 bg-background/50">
                                                            <SelectValue placeholder="Select Industry" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="e-commerce">E-Commerce & Retail</SelectItem>
                                                            <SelectItem value="fintech">Financial Tech</SelectItem>
                                                            <SelectItem value="healthtech">Healthcare</SelectItem>
                                                            <SelectItem value="ai-saas">AI & Software</SelectItem>
                                                            <SelectItem value="blockchain">Web3 & Blockchain</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                    </CardContent>
                                    <CardFooter className="bg-muted/30 border-t p-6 flex justify-end gap-3">
                                        <Button variant="outline" className="px-6">Cancel</Button>
                                        <Button onClick={handleSaveProfile} className="px-8 font-bold shadow-lg shadow-primary/20">
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save All Changes
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>

                            <aside className="space-y-6">
                                {/* Activity Stats */}
                                <Card className="border-border/40 bg-card/80 shadow-md">
                                    <CardHeader className="pb-3 text-left">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-primary" /> Activity Pulse
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Platform Role</span>
                                            <Badge variant="outline" className="capitalize text-primary border-primary/20 bg-primary/5">{user.companyType}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Success Rate</span>
                                            <span className="font-black text-green-500">92%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Rating Score</span>
                                            <div className="flex items-center gap-1">
                                                <span className="font-black">{user.avgRating}</span>
                                                <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                                            </div>
                                        </div>
                                        <Separator className="bg-border/40" />
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase py-2">
                                            <Calendar className="w-3 h-3" /> Member Since: {user.memberSince}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Verification Status */}
                                <Card className="border-border/40 bg-card/80 shadow-md overflow-hidden">
                                    <div className="p-4 bg-muted/20 border-b border-border/40 flex items-center justify-between">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trust Center</h4>
                                        <ShieldCheck className="w-4 h-4 text-primary" />
                                    </div>
                                    <CardContent className="p-4 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", user.emailVerified ? "bg-green-500/10 border-green-500/20" : "bg-muted border-border")}>
                                                <Mail className={cn("w-4 h-4", user.emailVerified ? "text-green-500" : "text-muted-foreground")} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold">Email Secure</p>
                                                <p className="text-[10px] text-muted-foreground">john@techcorp.com</p>
                                            </div>
                                            {user.emailVerified && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto" />}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", user.paymentVerified ? "bg-green-500/10 border-green-500/20" : "bg-muted border-border")}>
                                                <CreditCard className={cn("w-4 h-4", user.paymentVerified ? "text-green-500" : "text-muted-foreground")} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold">Billing Active</p>
                                                <p className="text-[10px] text-muted-foreground">Verified Gateway</p>
                                            </div>
                                            {user.paymentVerified && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto" />}
                                        </div>

                                        <Separator className="bg-border/40" />

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-tight">
                                                <span>Profile Strength</span>
                                                <span className="text-primary">{user.profileCompletion}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${user.profileCompletion}%` }} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </aside>
                        </div>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="password" className="animate-in fade-in-50 duration-500">
                        <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-xl max-w-2xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    Security Dashboard
                                </CardTitle>
                                <CardDescription>
                                    Manage your credential and login security settings.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form id="password-form" onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="space-y-2 text-left">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <Input id="current-password" type="password" className="bg-background/50" />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input id="new-password" type="password" className="bg-background/50" />
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                                        <Input id="confirm-password" type="password" className="bg-background/50" />
                                    </div>
                                </form>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t p-6 bg-muted/20">
                                <Button type="submit" form="password-form" disabled={loading} variant="secondary">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Security Key
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default ClientSettingsPage;
