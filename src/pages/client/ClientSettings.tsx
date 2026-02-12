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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { User, Lock, Building, Mail, Camera, Loader2 } from "lucide-react";

// Mock User Data
const MOCK_USER = {
    name: "John Client",
    email: "john@techcorp.com",
    company: "TechCorp Inc.",
    avatar: "https://github.com/shadcn.png",
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
            <div className="container max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your account settings and preferences.
                    </p>
                </div>

                <Tabs defaultValue="profile" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="profile" className="gap-2">
                            <User className="h-4 w-4" /> Profile
                        </TabsTrigger>
                        <TabsTrigger value="password" className="gap-2">
                            <Lock className="h-4 w-4" /> Password
                        </TabsTrigger>
                        <TabsTrigger value="notifications" disabled className="gap-2">
                            Notifications
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>
                                    Update your photo and personal details.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-6">

                                    {/* Avatar Section */}
                                    <div className="flex flex-col sm:flex-row items-center gap-6">
                                        <div className="relative group">
                                            <Avatar className="h-24 w-24 cursor-pointer border-2 border-muted hover:border-primary transition-colors">
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback>JC</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <Camera className="h-8 w-8 text-white" />
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-center sm:text-left">
                                            <h3 className="font-medium">Profile Picture</h3>
                                            <p className="text-sm text-muted-foreground">
                                                JPG, GIF or PNG. Max size of 800K.
                                            </p>
                                            <Button type="button" variant="outline" size="sm">
                                                Change Photo
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="name"
                                                    placeholder="Your name"
                                                    className="pl-9"
                                                    defaultValue={user.name}
                                                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company">Company Name</Label>
                                            <div className="relative">
                                                <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="company"
                                                    placeholder="Company name"
                                                    className="pl-9"
                                                    defaultValue={user.company}
                                                    onChange={(e) => setUser({ ...user, company: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="Email address"
                                                    className="pl-9"
                                                    defaultValue={user.email}
                                                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t p-6">
                                <Button type="submit" form="profile-form" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Running
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* Password Tab */}
                    <TabsContent value="password">
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>
                                    Ensure your account is secure by using a strong password.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form id="password-form" onSubmit={handleChangePassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Current Password</Label>
                                        <Input id="current-password" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">New Password</Label>
                                        <Input id="new-password" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                                        <Input id="confirm-password" type="password" />
                                    </div>
                                </form>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t p-6">
                                <Button type="submit" form="password-form" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Password
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
