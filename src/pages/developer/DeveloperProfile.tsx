import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { mockDevelopers } from '@/lib/mockData';
import { MapPin, Mail, Globe, Github, Linkedin, Camera } from 'lucide-react';

export default function DeveloperProfile() {
    // Using Alex Chen (dev-1) as the mock logged-in developer
    const developer = mockDevelopers[0];

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-5xl mx-auto">
                {/* Header / Cover */}
                <div className="relative h-48 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                        <div className="relative group">
                            <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                                <AvatarImage src={developer.avatar} />
                                <AvatarFallback>{developer.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mb-4">
                            <h1 className="text-3xl font-bold text-white">{developer.name}</h1>
                            <p className="text-blue-100">{developer.title}</p>
                        </div>
                    </div>

                    <div className="absolute bottom-4 right-8 flex gap-2">
                        <Button variant="secondary">View Public Profile</Button>
                    </div>
                </div>

                <div className="pt-16 grid gap-8 md:grid-cols-3">
                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span>{developer.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Mail className="w-4 h-4" />
                                    <span>alex@example.com</span>
                                </div>
                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <Globe className="w-4 h-4" />
                                    <a href="#" className="hover:text-primary">alexchen.dev</a>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Socials</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Github className="w-5 h-5" />
                                    <Input defaultValue="github.com/alexchen" className="h-8" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Linkedin className="w-5 h-5 text-blue-600" />
                                    <Input defaultValue="linkedin.com/in/alexchen" className="h-8" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Edit Form */}
                    <div className="md:col-span-2 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>About Me</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Bio</label>
                                    <Textarea
                                        className="min-h-[120px]"
                                        defaultValue={developer.bio}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Hourly Rate ($)</label>
                                        <Input type="number" defaultValue={developer.hourlyRate} />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Years of Exp.</label>
                                        <Input type="number" defaultValue="8" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Skills</CardTitle>
                                <Button variant="outline" size="sm">Add Skill</Button>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {developer.skills.map(skill => (
                                        <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm bg-muted hover:bg-muted-foreground/20">
                                            {skill}
                                            <button className="ml-2 text-muted-foreground hover:text-foreground">×</button>
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-4">
                            <Button variant="outline">Cancel</Button>
                            <Button>Save Changes</Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
