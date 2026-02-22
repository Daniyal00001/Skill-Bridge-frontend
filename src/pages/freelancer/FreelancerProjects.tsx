import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectCard } from '@/components/common/ProjectCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockProjects } from '@/lib/mockData';
import { Briefcase, CheckCircle } from 'lucide-react';

export default function DeveloperProjects() {
    // Filter for projects where the current developer ID matches
    // Using mocked 'dev-1' for demonstration
    const myProjects = mockProjects.filter(p => p.developerId === 'dev-1');

    const activeProjects = myProjects.filter(p => p.status === 'in_progress');
    const completedProjects = myProjects.filter(p => p.status === 'completed');

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">My Projects</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your ongoing and completed work
                    </p>
                </div>

                <Tabs defaultValue="active" className="w-full">
                    <TabsList>
                        <TabsTrigger value="active" className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4" /> Active ({activeProjects.length})
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Completed ({completedProjects.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="mt-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeProjects.length > 0 ? (
                                activeProjects.map((project) => (
                                    <ProjectCard key={project.id} project={project} viewAs="developer" />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No active projects at the moment.
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="completed" className="mt-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {completedProjects.length > 0 ? (
                                completedProjects.map((project) => (
                                    <ProjectCard key={project.id} project={project} viewAs="developer" />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    No completed projects yet.
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
