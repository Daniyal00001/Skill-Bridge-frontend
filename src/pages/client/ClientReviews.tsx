import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
import { Star, ThumbsUp, MessageSquare, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Review } from "@/types/client";

// Extended Review Type for UI with mock relations
interface ReviewWithDetails extends Review {
    developer: {
        name: string;
        avatar: string;
        role: string;
    };
    projectTitle: string;
}

// Mock Data
const MOCK_REVIEWS: ReviewWithDetails[] = [
    {
        id: "r1",
        projectId: "p1",
        reviewerId: "me",
        revieweeId: "dev-1",
        rating: 5,
        comment: "Alex did an exceptional job on the React Native conversion. His communication was top-notch, and he delivered ahead of schedule. Highly recommended!",
        isBlind: false,
        createdAt: new Date("2024-02-15"),
        developer: {
            name: "Alex Chen",
            avatar: "https://i.pravatar.cc/150?u=alex",
            role: "Senior Mobile Dev"
        },
        projectTitle: "E-Commerce Mobile App Redesign"
    },
    {
        id: "r2",
        projectId: "p2",
        reviewerId: "me",
        revieweeId: "dev-2",
        rating: 4,
        comment: "Sarah is a great designer. The UI concepts were modern and user-friendly. There were a few minor delays, but the quality of work made up for it.",
        isBlind: false,
        createdAt: new Date("2024-01-20"),
        developer: {
            name: "Sarah Jones",
            avatar: "https://i.pravatar.cc/150?u=sarah",
            role: "UI/UX Specialist"
        },
        projectTitle: "Dashboard UX Overhaul"
    },
    {
        id: "r3",
        projectId: "p3",
        reviewerId: "me",
        revieweeId: "dev-3",
        rating: 5,
        comment: "Perfect execution on the backend API. The code is clean, well-documented, and scalable. Will definitely hire again.",
        isBlind: false,
        createdAt: new Date("2023-12-05"),
        developer: {
            name: "Michael Brown",
            avatar: "https://i.pravatar.cc/150?u=mike",
            role: "Backend Architect"
        },
        projectTitle: "Legacy System Migration"
    }
];

const ClientReviewsPage = () => {
    return (
        <DashboardLayout>
            <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reviews Given</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage reviews and feedback provided to developers.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select defaultValue="newest">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="oldest">Oldest First</SelectItem>
                                <SelectItem value="highest">Highest Rating</SelectItem>
                                <SelectItem value="lowest">Lowest Rating</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="grid gap-6">
                    {MOCK_REVIEWS.map((review) => (
                        <Card key={review.id} className="transition-all hover:shadow-md">
                            <CardHeader className="flex flex-row items-start gap-4 pb-2">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarImage src={review.developer.avatar} />
                                    <AvatarFallback>{review.developer.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1">
                                        <div>
                                            <CardTitle className="text-lg">{review.developer.name}</CardTitle>
                                            <CardDescription className="text-xs">{review.developer.role}</CardDescription>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                                            <span className="font-medium text-foreground">Project:</span>
                                            {review.projectTitle}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300'}`}
                                        />
                                    ))}
                                    <span className="ml-2 text-sm font-medium">{review.rating}.0</span>
                                    <span className="mx-2 text-gray-300">•</span>
                                    <span className="text-sm text-muted-foreground">
                                        {review.createdAt.toLocaleDateString()}
                                    </span>
                                </div>

                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    "{review.comment}"
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ClientReviewsPage;
