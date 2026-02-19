import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building, Mail, MapPin, Calendar, Edit } from "lucide-react";

// Mock User Data for Profile View
const MOCK_PROFILE = {
    name: "John Client",
    title: "Product Manager",
    email: "john@techcorp.com",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    joinedDate: "January 2023",
    avatar: "https://github.com/shadcn.png",
    about: "Experienced Product Manager with a demonstrated history of working in the tech industry. Skilled in Agile Methodologies, Product Strategy, and User Experience Design. Currently leading the mobile transformation initiative at TechCorp.",
    projectsPosted: 12,
    totalSpent: 45000,
    activeProjects: 3
};

const ClientProfilePage = () => {
    return (
        <DashboardLayout>
            <div className="container max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">

                {/* Header / Cover Area */}
                <div className="relative mb-12">
                    <div className="h-48 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border"></div>
                    <div className="absolute -bottom-10 left-8 flex items-end gap-6">
                        <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                            <AvatarImage src={MOCK_PROFILE.avatar} />
                            <AvatarFallback>JC</AvatarFallback>
                        </Avatar>
                        <div className="mb-4 space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight">{MOCK_PROFILE.name}</h1>
                            <p className="text-muted-foreground">{MOCK_PROFILE.title} at {MOCK_PROFILE.company}</p>
                        </div>
                    </div>
                    <div className="absolute -bottom-10 right-8 mb-4">
                        <Button asChild>
                            <Link to="/settings">
                                <Edit className="mr-2 h-4 w-4" /> Edit Profile
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid gap-6 md:grid-cols-3 pt-10">

                    {/* Left Column: Stats & Contact */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground text-sm">Projects Posted</span>
                                    <span className="font-semibold">{MOCK_PROFILE.projectsPosted}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground text-sm">Active Projects</span>
                                    <span className="font-semibold">{MOCK_PROFILE.activeProjects}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground text-sm">Total Spent</span>
                                    <span className="font-semibold">${MOCK_PROFILE.totalSpent.toLocaleString()}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Contact Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span className="text-foreground">{MOCK_PROFILE.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Building className="h-4 w-4" />
                                    <span className="text-foreground">{MOCK_PROFILE.company}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-foreground">{MOCK_PROFILE.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-foreground">Joined {MOCK_PROFILE.joinedDate}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: About & Activity */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>About</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="leading-relaxed text-muted-foreground">
                                    {MOCK_PROFILE.about}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Placeholder for Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Latest actions and updates.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                                            <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">Posted a new project "Mobile App Redesign"</p>
                                                <p className="text-xs text-muted-foreground">2 days ago</p>
                                            </div>
                                        </div>
                                    ))}
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
