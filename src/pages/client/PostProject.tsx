import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Check, Plus, X, Sparkles } from "lucide-react";

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
import { toast } from "sonner"; // Assuming sonner is set up as per package.json

const AVAILABLE_SKILLS = [
    "React",
    "Node.js",
    "MongoDB",
    "Python",
    "TypeScript",
    "UI/UX Design",
    "AWS",
    "Docker",
    "Firebase",
    "GraphQL",
];

const PostProjectPage = () => {
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        description: "",
        minBudget: "",
        maxBudget: "",
        complexity: "",
    });

    const [date, setDate] = useState<Date>();
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSkillToggle = (skill: string) => {
        setSelectedSkills((prev) =>
            prev.includes(skill)
                ? prev.filter((s) => s !== skill)
                : [...prev, skill]
        );
    };

    const handleGenerateScope = () => {
        if (!formData.description) {
            toast.error("Please enter a project description first");
            return;
        }

        setIsGenerating(true);
        // Simulate AI generation
        setTimeout(() => {
            setIsGenerating(false);
            toast.success("AI Scope Analysis Complete! (Mock)");
        }, 2000);
    };

    const handleSubmit = () => {
        console.log({
            ...formData,
            deadline: date,
            skills: selectedSkills,
        });
        toast.success("Project Posted Successfully!");
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-background p-4 md:p-8 animate-fade-in">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-8 text-center md:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Post a New Project
                        </h1>
                        <p className="mt-2 text-lg text-muted-foreground">
                            Describe your vision and let us help you build it.
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {/* Main Form Card */}
                        <Card className="border-border/40 shadow-soft">
                            <CardHeader>
                                <CardTitle>Project Details</CardTitle>
                                <CardDescription>
                                    Provide the basic information about your software needs.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* Section 1: Basic Information */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="md:col-span-2 space-y-2">
                                        <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Project Title
                                        </label>
                                        <Input
                                            id="title"
                                            name="title"
                                            placeholder="e.g., E-commerce Mobile App Redesign"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className="transition-all focus-visible:ring-primary/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Category</label>
                                        <Select
                                            onValueChange={(value) =>
                                                setFormData((prev) => ({ ...prev, category: value }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="web">Web Development</SelectItem>
                                                <SelectItem value="mobile">Mobile App</SelectItem>
                                                <SelectItem value="ai">AI / Machine Learning</SelectItem>
                                                <SelectItem value="uiux">UI/UX Design</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Complexity</label>
                                        <Select
                                            onValueChange={(value) =>
                                                setFormData((prev) => ({ ...prev, complexity: value }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Complexity" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="simple">Simple (MVP)</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="complex">Complex (Enterprise)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label htmlFor="description" className="text-sm font-medium leading-none">
                                            Project Description
                                        </label>
                                        <div className="relative">
                                            <Textarea
                                                id="description"
                                                name="description"
                                                placeholder="Describe your project in detail. What are the key features? Who is the target audience?"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                className="min-h-[150px] resize-y transition-all focus-visible:ring-primary/20 pr-12"
                                            />
                                            <Sparkles className="absolute right-3 top-3 h-5 w-5 text-muted-foreground/50" />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Budget */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label htmlFor="minBudget" className="text-sm font-medium leading-none">
                                            Min Budget ($)
                                        </label>
                                        <Input
                                            id="minBudget"
                                            name="minBudget"
                                            type="number"
                                            placeholder="1000"
                                            value={formData.minBudget}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="maxBudget" className="text-sm font-medium leading-none">
                                            Max Budget ($)
                                        </label>
                                        <Input
                                            id="maxBudget"
                                            name="maxBudget"
                                            type="number"
                                            placeholder="5000"
                                            value={formData.maxBudget}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                {/* Section 3: Skills */}
                                <div className="space-y-3">
                                    <label className="text-sm font-medium leading-none">Required Skills</label>
                                    <div className="n-wrap flex flex-wrap gap-2 rounded-lg border bg-muted/20 p-4">
                                        {AVAILABLE_SKILLS.map((skill) => (
                                            <Badge
                                                key={skill}
                                                variant={selectedSkills.includes(skill) ? "default" : "outline"}
                                                className={cn(
                                                    "cursor-pointer transition-all hover:scale-105 active:scale-95",
                                                    selectedSkills.includes(skill) ? "shadow-sm" : "bg-background hover:bg-muted"
                                                )}
                                                onClick={() => handleSkillToggle(skill)}
                                            >
                                                {skill}
                                                {selectedSkills.includes(skill) ? (
                                                    <Check className="ml-1 h-3 w-3" />
                                                ) : (
                                                    <Plus className="ml-1 h-3 w-3 opacity-50" />
                                                )}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Section 4: Timeline */}
                                <div className="space-y-2 flex flex-col">
                                    <label className="text-sm font-medium leading-none">Target Deadline</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-[240px] pl-3 text-left font-normal",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                            </CardContent>

                            <CardFooter className="flex flex-col gap-4 border-t bg-muted/50 px-6 py-6 md:flex-row md:items-center md:justify-between">
                                <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-900 dark:bg-blue-900/20 dark:text-blue-200 md:max-w-md">
                                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                                    <p>
                                        <strong>AI Assistant:</strong> I'll analyze your description to specific technical requirements and suggest a fair price range.
                                    </p>
                                </div>

                                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                                    <Button
                                        variant="outline"
                                        className="w-full md:w-auto"
                                        onClick={() => console.log('Draft saved')}
                                    >
                                        Save Draft
                                    </Button>

                                    <Button
                                        variant="gradient"
                                        className="w-full gap-2 md:w-auto relative overflow-hidden group"
                                        onClick={handleGenerateScope}
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? (
                                            <>Analyzing...</>
                                        ) : (
                                            <>
                                                Generate Scope with AI
                                                <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
                                            </>
                                        )}
                                    </Button>

                                    {/* 
                       Real submit button would go here or be part of the flow after generation.
                       For now, "Generate Scope" acts as the primary action as requested.
                    */}
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PostProjectPage;
