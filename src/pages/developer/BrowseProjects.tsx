import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectCard } from '@/components/common/ProjectCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { mockProjects } from '@/lib/mockData';

export default function BrowseProjects() {
    const [searchTerm, setSearchTerm] = useState('');
    const [complexityFilter, setComplexityFilter] = useState<string>('all');
    const [minBudget, setMinBudget] = useState<string>('');

    const filteredProjects = mockProjects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesComplexity = complexityFilter === 'all' || project.complexity === complexityFilter;

        const matchesBudget = !minBudget || project.budget.min >= parseInt(minBudget);

        return project.status === 'open' && matchesSearch && matchesComplexity && matchesBudget;
    });

    const clearFilters = () => {
        setSearchTerm('');
        setComplexityFilter('all');
        setMinBudget('');
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold">Browse Projects</h1>
                    <p className="text-muted-foreground mt-1">
                        Find the perfect project for your skills
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title, description, or skills..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={complexityFilter} onValueChange={setComplexityFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Complexity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Any Complexity</SelectItem>
                                <SelectItem value="simple">Simple</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="complex">Complex</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={minBudget} onValueChange={setMinBudget}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Min Budget" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Any Budget</SelectItem>
                                <SelectItem value="1000">$1,000+</SelectItem>
                                <SelectItem value="5000">$5,000+</SelectItem>
                                <SelectItem value="10000">$10,000+</SelectItem>
                            </SelectContent>
                        </Select>

                        {(searchTerm || complexityFilter !== 'all' || minBudget) && (
                            <Button variant="ghost" size="icon" onClick={clearFilters}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-muted-foreground">
                        {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <ProjectCard key={project.id} project={project} viewAs="developer" />
                        ))}
                    </div>
                    {filteredProjects.length === 0 && (
                        <div className="text-center py-12">
                            <div className="bg-muted h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <SlidersHorizontal className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium">No projects found</h3>
                            <p className="text-muted-foreground mt-1">
                                Try adjusting your filters or search terms
                            </p>
                            <Button variant="link" onClick={clearFilters} className="mt-2">
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
