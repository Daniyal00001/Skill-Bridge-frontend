import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/common/StatsCard';
import { ProjectCard } from '@/components/common/ProjectCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Briefcase,
  DollarSign,
  Star,
  CheckCircle,
  Search,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import {
  freelancerDashboardStats,
  mockProjects,
  mockProposals
} from '@/lib/mockData';

export default function FreelancerDashboard() {
  const openProjects = mockProjects.filter(p => p.status === 'open').slice(0, 3);
  const pendingProposals = mockProposals.filter(p => p.status === 'pending');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back! 🚀</h1>
            <p className="text-muted-foreground mt-1">
              Let's find your next great project
            </p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/freelancer/browse">
              <Search className="mr-2 h-5 w-5" />
              Browse Projects
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Active Bids"
            value={freelancerDashboardStats.activeBids}
            change="3 pending responses"
            changeType="neutral"
            icon={Briefcase}
          />
          <StatsCard
            title="Total Earnings"
            value={`$${freelancerDashboardStats.totalEarnings.toLocaleString()}`}
            change="+$3,200 this month"
            changeType="positive"
            icon={DollarSign}
          />
          <StatsCard
            title="Completed Projects"
            value={freelancerDashboardStats.completedProjects}
            change="+4 this month"
            changeType="positive"
            icon={CheckCircle}
          />
          <StatsCard
            title="Average Rating"
            value={freelancerDashboardStats.averageRating}
            change="Top 5% freelancer"
            changeType="positive"
            icon={Star}
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recommended Projects */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recommended for You</h2>
              <Button variant="ghost" asChild>
                <Link to="/freelancer/browse">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="space-y-4">
              {openProjects.map((project) => (
                <ProjectCard key={project.id} project={project} viewAs="freelancer" />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Proposals */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Proposals</h2>
              <Card>
                <CardContent className="p-4 space-y-4">
                  {pendingProposals.length > 0 ? (
                    pendingProposals.map((proposal) => {
                      const project = mockProjects.find(p => p.id === proposal.projectId);
                      return (
                        <div key={proposal.id} className="flex items-start justify-between gap-3 pb-4 border-b last:border-0 last:pb-0">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{project?.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="warning" className="text-xs">Pending</Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                2 days ago
                              </span>
                            </div>
                          </div>
                          <p className="font-medium">${proposal.proposedBudget}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      No pending proposals
                    </p>
                  )}
                  <Button variant="outline" className="w-full mt-2" asChild>
                    <Link to="/freelancer/proposals">View All Proposals</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Profile Completion */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Profile Completion</h3>
                  <span className="text-sm text-muted-foreground">85%</span>
                </div>
                <Progress value={85} className="h-2 mb-3" />
                <p className="text-xs text-muted-foreground mb-3">
                  Complete your profile to get more visibility
                </p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/freelancer/profile">Complete Profile</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Earnings Card */}
            <Card variant="gradient">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-white mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white">Earnings This Week</h3>
                    <p className="text-2xl font-bold text-white mt-1">$1,240</p>
                    <p className="text-sm text-white/80 mt-1">
                      +12% from last week
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
