import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, DollarSign, Calendar, Clock, Send } from "lucide-react";
import { mockProjects } from "@/lib/mockData";
import { toast } from "sonner"; 

export default function DeveloperProjectDetails() {
  // Grab the ID from the URL (e.g., 'proj-1')
  const { projectId } = useParams();
  
  // Find the exact project in our mock data
  const project = mockProjects.find((p) => p.id === projectId);

  const [coverLetter, setCoverLetter] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If the user types a random URL that doesn't exist, show an error
  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">Project not found</h2>
          <Button asChild><Link to="/developer/browse">Back to Browse</Link></Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate a network request to the backend
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Proposal submitted successfully!");
      setCoverLetter("");
      setBidAmount("");
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" className="pl-0 gap-2 text-muted-foreground hover:text-foreground" asChild>
          <Link to="/developer/browse">
            <ArrowLeft className="h-4 w-4" /> Back to Browse
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column: Project Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Posted recently
                      </span>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600">
                        {project.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {project.description}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Apply Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" /> Budget
                  </div>
                  <span className="font-medium">
                    ${project.budget.min.toLocaleString()} - ${project.budget.max.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" /> Deadline
                  </div>
                  <span className="font-medium">
                    {new Date(project.deadline).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle>Submit Proposal</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitProposal} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bid">Your Bid Amount ($)</Label>
                    <Input
                      id="bid"
                      type="number"
                      placeholder={`e.g. ${project.budget.min}`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                      min={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Cover Letter</Label>
                    <Textarea
                      id="coverLetter"
                      placeholder="Why are you the best fit for this project? Outline your approach here..."
                      className="min-h-[150px]"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : (
                      <>
                        <Send className="h-4 w-4" /> Submit Proposal
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}