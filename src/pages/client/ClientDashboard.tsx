import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/common/StatsCard';
import { FreelancerCard } from '@/components/common/FreelancerCard';
import { ProjectCard } from '@/components/common/ProjectCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FolderOpen,
  DollarSign,
  FileText,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import {
  clientDashboardStats,
  mockFreelancers,
  mockProjects
} from '@/lib/mockData';

export default function ClientDashboard() {
  const recentProjects = mockProjects.filter(p => p.status === 'open').slice(0, 2);
  const recommendedFreelancers = mockFreelancers.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back! 👋</h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your projects
            </p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/client/projects/create">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create New Project
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Active Projects"
            value={clientDashboardStats.activeProjects}
            change="+2 this month"
            changeType="positive"
            icon={FolderOpen}
          />
          <StatsCard
            title="Total Spent"
            value={`$${clientDashboardStats.totalSpent.toLocaleString()}`}
            change="On budget"
            changeType="neutral"
            icon={DollarSign}
          />
          <StatsCard
            title="Pending Proposals"
            value={clientDashboardStats.pendingProposals}
            change="5 new today"
            changeType="positive"
            icon={FileText}
          />
          <StatsCard
            title="Completed Projects"
            value={clientDashboardStats.completedProjects}
            change="98% success rate"
            changeType="positive"
            icon={CheckCircle}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Open Projects</h2>
              <Button variant="ghost" asChild>
                <Link to="/client/projects">
                  View all <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} viewAs="client" />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <Card>
              <CardContent className="p-4 space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/client/projects/create">
                    <PlusCircle className="mr-3 h-4 w-4" />
                    Post a New Project
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/client/projects">
                    <FolderOpen className="mr-3 h-4 w-4" />
                    Manage Projects
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/client/messages">
                    <FileText className="mr-3 h-4 w-4" />
                    View Messages
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* AI Tip */}
            <Card variant="gradient">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-white mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white">Pro Tip</h3>
                    <p className="text-sm text-white/80 mt-1">
                      Use our AI Scoping Assistant to get accurate budget estimates for your next project.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Recommended Freelancers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Freelancers I’ve Worked With</h2>
              <p className="text-sm text-muted-foreground">
                Based on your project history and requirements
              </p>
            </div>
            <Button variant="outline">Browse All</Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedFreelancers.map((freelancer) => (
              <FreelancerCard key={freelancer.id} freelancer={freelancer} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
