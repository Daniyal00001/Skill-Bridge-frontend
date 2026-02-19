import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, Briefcase, PlusCircle, ArrowUpRight } from "lucide-react";
import { ProjectCard } from "@/components/common/ProjectCard";
import { Project } from "@/lib/mockData"; // Reusing existing mock types

// Additional Mock Data for Browse Projects
const MOCK_BROWSE_PROJECTS: any[] = [
    {
        id: "bp-1",
        title: "SaaS Landing Page Template",
        description: "A modern, high-converting landing page template built with React and Tailwind CSS. Perfect for SaaS startups.",
        status: "open",
        budget: { min: 500, max: 1000 },
        complexity: "simple",
        proposalCount: 0,
        deadline: new Date("2024-05-20").toISOString(),
        skills: ["React", "Tailwind CSS", "Framer Motion"],
        createdAt: new Date("2024-02-10").toISOString(),
        author: "TemplateMaster"
    },
    {
        id: "bp-2",
        title: "E-Commerce Mobile App UI Kit",
        description: "Complete UI kit for an e-commerce mobile application. Includes 50+ screens and components.",
        status: "open",
        budget: { min: 1200, max: 2000 },
        complexity: "moderate",
        proposalCount: 2,
        deadline: new Date("2024-06-15").toISOString(),
        skills: ["Figma", "UI Design", "Mobile Design"],
        createdAt: new Date("2024-02-08").toISOString(),
        author: "DesignPro"
    },
    {
        id: "bp-3",
        title: "Full Stack Dashboard Boilerplate",
        description: "Production-ready dashboard boilerplate with authentication, RBAC, and dark mode.",
        status: "open",
        budget: { min: 2000, max: 4000 },
        complexity: "complex",
        proposalCount: 5,
        deadline: new Date("2024-04-01").toISOString(),
        skills: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
        createdAt: new Date("2024-01-25").toISOString(),
        author: "CodeNinja"
    },
    {
        id: "bp-4",
        title: "AI Chatbot Integration Service",
        description: "Service to integrate a custom AI chatbot into your existing website using OpenAI Assistant API.",
        status: "open",
        budget: { min: 1500, max: 3000 },
        complexity: "moderate",
        proposalCount: 8,
        deadline: new Date("2024-05-10").toISOString(),
        skills: ["Python", "OpenAI", "React"],
        createdAt: new Date("2024-02-12").toISOString(),
        author: "AI_Expert"
    }
];

const BrowseProjectsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [complexityFilter, setComplexityFilter] = useState("all");

    // Logic to filter projects 
    const filteredProjects = MOCK_BROWSE_PROJECTS.filter((project) => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || true; // Mock category check 
        const matchesComplexity = complexityFilter === "all" || project.complexity === complexityFilter;

        return matchesSearch && matchesCategory && matchesComplexity;
    });

    return (
        <DashboardLayout>
            <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Browse Projects</h1>
                        <p className="text-muted-foreground mt-1">
                            Explore popular project templates and services to kickstart your next idea.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 bg-card p-4 rounded-lg border shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search for templates, services, or skills..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 lg:gap-4">
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[160px]">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <SelectValue placeholder="Category" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="web">Web Development</SelectItem>
                                <SelectItem value="mobile">Mobile Apps</SelectItem>
                                <SelectItem value="design">Design & Creative</SelectItem>
                                <SelectItem value="ai">AI & ML</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={complexityFilter} onValueChange={setComplexityFilter}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Complexity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Any Complexity</SelectItem>
                                <SelectItem value="simple">Simple</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="complex">Complex</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredProjects.map((project) => (
                        // Adapting the mock data to match ProjectCardProps structure since ProjectCard expects specific fields
                        <ProjectCard
                            key={project.id}
                            project={project}
                            viewAs="client"
                        />
                    ))}

                    {/* Call to Action Card */}
                    <Link to="/client/post-project" className="group">
                        <Card className="flex flex-col items-center justify-center h-full min-h-[300px] border-dashed border-2 bg-muted/20 hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer">
                            <div className="h-16 w-16 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
                                <PlusCircle className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="font-bold text-xl text-foreground">Can't find what you need?</h3>
                            <p className="text-muted-foreground text-center mt-2 px-6">
                                Post a custom project request and get proposals from top developers.
                            </p>
                            <Button variant="link" className="mt-4 gap-1">
                                Post a Custom Project <ArrowUpRight className="h-4 w-4" />
                            </Button>
                        </Card>
                    </Link>
                </div>

                {filteredProjects.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">
                            No projects found matching your criteria.
                        </p>
                        <Button variant="link" onClick={() => { setSearchTerm(""); setCategoryFilter("all"); setComplexityFilter("all"); }}>
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default BrowseProjectsPage;
